# Google Cloud Setup Guide for DermAir

This guide will help you set up Google OAuth and Google Sheets API for DermAir.

## Prerequisites
- Google Account
- 10 minutes of time

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown (top left)
3. Click "NEW PROJECT"
4. Enter project name: `DermAir`
5. Click "CREATE"

---

## Step 2: Enable Required APIs

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for and enable the following APIs:
   
   ### Google Sheets API
   - Search "Google Sheets API"
   - Click on it
   - Click "ENABLE"
   
   ### Google Drive API
   - Search "Google Drive API"
   - Click on it
   - Click "ENABLE"

---

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for testing with any Google account)
3. Click "CREATE"

4. Fill in required information:
   - **App name**: `DermAir`
   - **User support email**: Your email
   - **Developer contact email**: Your email
   - Click "SAVE AND CONTINUE"

5. **Scopes** page:
   - Click "ADD OR REMOVE SCOPES"
   - Add these scopes:
     - `userinfo.email`
     - `userinfo.profile`
     - `drive.file` (only files created by this app)
     - `spreadsheets` (create and manage spreadsheets)
   - Click "UPDATE"
   - Click "SAVE AND CONTINUE"

6. **Test users** page:
   - Click "ADD USERS"
   - Add your email address (and any testers)
   - Click "SAVE AND CONTINUE"

7. Click "BACK TO DASHBOARD"

---

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Choose **Web application**
4. Fill in:
   - **Name**: `DermAir Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production, when deployed)
   - **Authorized redirect URIs**:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
5. Click "CREATE"

6. **IMPORTANT**: Copy your Client ID
   - It looks like: `123456789-abc123.apps.googleusercontent.com`
   - Save this, you'll need it next

---

## Step 5: Configure DermAir

1. In your DermAir project, create `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Client ID:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

3. Save the file

---

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Click "Continue with Google"

4. You should see the Google sign-in popup

5. After signing in, check:
   - ✅ Your Google Drive for "DermAir - My Health Data" spreadsheet
   - ✅ The spreadsheet should have 3 tabs: Profile, CheckIns, WeatherHistory

---

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Make sure you added your email to **Test users** in OAuth consent screen
- Check that all required scopes are added

### "redirect_uri_mismatch"
- Verify that `http://localhost:3000` is in **Authorized redirect URIs**
- Make sure there are no trailing slashes

### Can't see the spreadsheet
- Check browser console for errors
- Verify Google Sheets API and Drive API are enabled
- Make sure scopes include `drive.file`

### "Failed to load Google Identity Services"
- Check internet connection
- Try clearing browser cache
- Make sure you're not blocking third-party cookies

---

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Go back to Google Cloud Console → **Credentials**
2. Edit your OAuth client
3. Add your production URLs:
   - **Authorized JavaScript origins**: `https://your-domain.com`
   - **Authorized redirect URIs**: `https://your-domain.com`
4. Update `.env.local` on your hosting platform with the same `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

---

## Free Tier Limits

Google provides generous free limits:

- **Google Drive**: 15 GB free storage
- **Google Sheets API**: 500 requests per minute
- **OAuth**: Unlimited sign-ins

For a personal health app, these limits are more than sufficient!

---

## Security Notes

✅ **What DermAir can access:**
- Only spreadsheets it creates (not other files in Drive)
- User's email and basic profile info

❌ **What DermAir CANNOT access:**
- Your other Google Drive files
- Your Gmail
- Your Calendar
- Any other Google services

✅ **Data Privacy:**
- All health data stays in YOUR Google Drive
- DermAir doesn't have a backend database
- You can revoke access anytime at: [Google Account Permissions](https://myaccount.google.com/permissions)

---

## Need Help?

- Check the [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- Visit [Google Sheets API Docs](https://developers.google.com/sheets/api)
- Create an issue in the DermAir GitHub repository
