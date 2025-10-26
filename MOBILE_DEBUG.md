# Mobile Zipcode Validation Debugging Guide

## Issue
Zipcode validation works on desktop Chrome but fails on mobile browsers with "Invalid zipcode" error.

## Changes Made

### 1. Enhanced Logging in `src/lib/api/weather.ts`
Added detailed console logs to `getLocationByZipcode()`:
- Input parameters (zipcode, countryCode)
- API request URL (with hidden API key)
- Response status
- Error responses with details
- Success data
- Exception catching

### 2. Improved Error Handling in `src/app/onboarding/page.tsx`
- Added specific error messages for different failure scenarios:
  - API key not configured
  - Invalid zipcode format
  - API authentication failure (401)
  - Network errors
  - Other errors with full error message
- Added logging before and after validation
- Shows exact error message to help diagnose

### 3. Environment Checking
Added `useEffect` on component mount to log:
- Whether API key is loaded
- API key length (should be 32)
- User agent (to identify device)
- Platform info

## How to Debug on Mobile

1. **Enable Remote Debugging:**
   - Android Chrome: Use Chrome DevTools Remote Debugging
   - iOS Safari: Use Safari Web Inspector
   - Or use Eruda for in-browser console:
     ```bash
     npm install eruda
     ```

2. **Check Console Logs:**
   Look for these log sequences when entering a zipcode:
   ```
   [Onboarding] Component mounted
   [Onboarding] Environment check: { hasApiKey: true, apiKeyLength: 32, ... }
   [Onboarding] Validating zipcode: 90210 US
   [getLocationByZipcode] Input: { zipcode: '90210', countryCode: 'US' }
   [getLocationByZipcode] Request URL: https://api.openweathermap.org/geo/1.0/zip?zip=90210,US&appid=HIDDEN
   [getLocationByZipcode] Response status: 200
   [getLocationByZipcode] Success: { name: 'Beverly Hills', country: 'US' }
   ```

3. **Common Issues to Check:**

   **API Key Missing:**
   ```
   [getLocationByZipcode] API key not configured
   ```
   → Verify Vercel environment variable is set

   **Network Timeout:**
   ```
   [getLocationByZipcode] Exception: TypeError: Failed to fetch
   ```
   → Check mobile network, try different network, add retry logic

   **Invalid Zipcode:**
   ```
   [getLocationByZipcode] Response status: 404
   ```
   → Zipcode format or country code mismatch

   **API Key Invalid:**
   ```
   [getLocationByZipcode] Response status: 401
   ```
   → API key incorrect or expired

## Vercel Environment Variables

Ensure these are set in Vercel dashboard:
```
NEXT_PUBLIC_OPENWEATHER_API_KEY=b0c2a5434a16d07df5d829f1edbe0738
```

**Important:** After changing environment variables:
1. Redeploy the app
2. Hard refresh on mobile (clear cache)
3. Or use incognito/private browsing mode

## Test Commands

Build locally to check for errors:
```powershell
npm run build
```

Test on mobile:
1. Deploy to Vercel
2. Open in mobile browser
3. Open browser console (if available)
4. Try entering zipcode
5. Check console logs

## Next Steps if Issue Persists

If the error still occurs after checking logs:

1. **Add Retry Logic:** Mobile networks can be slow/flaky
   ```typescript
   const maxRetries = 3;
   let attempt = 0;
   while (attempt < maxRetries) {
     try {
       const result = await getLocationByZipcode(...);
       return result;
     } catch (error) {
       attempt++;
       if (attempt >= maxRetries) throw error;
       await new Promise(resolve => setTimeout(resolve, 1000));
     }
   }
   ```

2. **Add Request Timeout:** Prevent hanging on slow networks
   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 10000);
   const response = await fetch(url, { signal: controller.signal });
   ```

3. **Make Zipcode Optional:** Allow "Use Current Location" as alternative
4. **Add Loading Spinner:** Show user that request is in progress

## Deploy and Test

After making changes:
```powershell
git add .
git commit -m "Add detailed logging for mobile zipcode debugging"
git push
```

Then test on mobile and check console logs to identify the exact failure point.
