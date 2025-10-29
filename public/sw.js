const CACHE_NAME = 'dermair-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/onboarding',
  '/offline',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache GET requests (POST, PUT, DELETE can't be cached)
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME + '-api')
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if available (only for GET requests)
          if (request.method === 'GET') {
            return caches.match(request)
              .then((cachedResponse) => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                // Return offline indicator for failed API calls
                return new Response(
                  JSON.stringify({ 
                    error: 'Offline mode', 
                    offline: true 
                  }), 
                  {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                  }
                );
              });
          }
          // For POST/PUT/DELETE requests, just return error
          return new Response(
            JSON.stringify({ 
              error: 'Network error', 
              offline: true 
            }), 
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }
  
  // Handle page requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page loads
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Return cached page or offline page
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page
              return caches.match('/offline');
            });
        })
    );
    return;
  }
  
  // Handle static asset requests
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            // Cache static assets
            if (response.ok && (
              request.destination === 'script' ||
              request.destination === 'style' ||
              request.destination === 'image' ||
              request.url.includes('/_next/static/')
            )) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          });
      })
  );
});

// Background sync for offline check-ins
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-checkin') {
    event.waitUntil(
      // Process queued check-ins when back online
      processOfflineCheckIns()
    );
  }
});

async function processOfflineCheckIns() {
  try {
    // This would process any queued offline check-ins
    console.log('🔄 Processing offline check-ins...');
    
    // Get offline check-ins from IndexedDB
    const offlineCheckIns = await getOfflineCheckIns();
    
    for (const checkIn of offlineCheckIns) {
      try {
        await fetch('/api/checkins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkIn)
        });
        
        // Remove from offline storage after successful sync
        await removeOfflineCheckIn(checkIn.id);
        console.log('✅ Synced offline check-in:', checkIn.id);
      } catch (error) {
        console.error('❌ Failed to sync check-in:', checkIn.id, error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Helper functions (would be implemented with IndexedDB)
async function getOfflineCheckIns() {
  // Implementation would use IndexedDB to get queued check-ins
  return [];
}

async function removeOfflineCheckIn(id) {
  // Implementation would remove check-in from IndexedDB
  console.log('Removing offline check-in:', id);
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  let url = '/dashboard';

  // Handle different notification types
  if (data.type === 'daily-reminder') {
    url = '/dashboard?action=checkin';
  } else if (data.type === 'risk-alert') {
    url = '/dashboard?action=risk-details';
  } else if (data.type === 'weather-briefing') {
    url = '/dashboard';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(url.split('?')[0]) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

console.log('🚀 DermAIr Service Worker registered successfully');