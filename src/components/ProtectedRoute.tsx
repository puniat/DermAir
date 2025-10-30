"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  redirectTo = '/landing' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication synchronously
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('dermair_userId');
      
      if (requireAuth && !storedUserId) {
        // No auth found, redirect immediately
        console.log('[ProtectedRoute] No authentication, redirecting to', redirectTo);
        router.replace(redirectTo);
        setIsChecking(false);
        return;
      }
      
      // Auth check passed
      setIsAuthorized(true);
      setIsChecking(false);
    }
  }, [requireAuth, redirectTo, router]);

  // Don't render anything while checking or if not authorized
  if (isChecking || !isAuthorized) {
    return null;
  }

  // Render children only if authorized
  return <>{children}</>;
}
