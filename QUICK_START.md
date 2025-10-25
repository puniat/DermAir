# 🚀 DermAir - Quick Start Guide

## For First-Time Setup

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Set up Google OAuth (Required for Cloud Sync)

**Option A: Full Setup (5 minutes)**
Follow the detailed guide: [GOOGLE_SETUP.md](./GOOGLE_SETUP.md)

**Option B: Quick Test (Local Only)**
Skip Google setup and use local-only mode:
```bash
# Just start the app
npm run dev
# Click "Continue without Google" on landing page
```

### 3️⃣ Configure Environment
```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local with your credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-weather-api-key
```

### 4️⃣ Start Development Server
```bash
npm run dev
```

### 5️⃣ Open App
Visit [http://localhost:3000](http://localhost:3000)

---

## For Testing

### Test Google Integration
1. Go to landing page
2. Click "Continue with Google"
3. Sign in with your Google account
4. Complete onboarding
5. Check your Google Drive for "DermAir - My Health Data" spreadsheet

### Test Local-Only Mode
1. Go to landing page
2. Click "Continue without Google"
3. Complete onboarding
4. Data saved only to localStorage (no cloud backup)

### Test Account Settings
1. In dashboard, click "Account" button (top right)
2. Try:
   - Connect/Disconnect Google
   - Sync Now
   - View in Drive
   - Export Data

---

## Common Issues

### "Google Client ID not found"
**Solution**: Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env.local`

### "Access blocked" during Google sign-in
**Solution**: Add your email to Test users in Google Cloud Console

### Profile not syncing
**Solution**: Check if Google Sheets API and Drive API are enabled

---

## Production Deployment

### Vercel (Recommended)
```bash
vercel
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

### Netlify
```bash
netlify deploy
# Add env var in Netlify UI
```

### Remember!
Update Google OAuth redirect URIs with your production domain!

---

## Features Overview

- ✅ **Weather-based risk assessment**
- ✅ **AI-powered recommendations** (when AI mode enabled)
- ✅ **Daily symptom check-ins**
- ✅ **Google Drive backup** (optional)
- ✅ **Multi-device sync**
- ✅ **Offline support**
- ✅ **Analytics dashboard**
- ✅ **Export your data**

---

## Need Help?

- 📖 **Full Setup**: See [GOOGLE_SETUP.md](./GOOGLE_SETUP.md)
- 📋 **Implementation Details**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- 🐛 **Issues**: Check browser console and Google Cloud Console
