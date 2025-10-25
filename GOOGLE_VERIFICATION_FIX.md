# 🔐 Fixing "Access Blocked" Google OAuth Error

## Problem
You're seeing: **"Access blocked: DermAlr has not completed the Google verification process"**

This happens because Google requires apps to be verified before allowing public access.

---

## ✅ Solution 1: Add Test Users (Quick Fix - Recommended)

For development and testing, add specific Google accounts as test users:

### Steps:

1. **Go to Google Cloud Console OAuth Consent Screen**
   - Visit: https://console.cloud.google.com/apis/credentials/consent
   - Select your project

2. **Add Test Users**
   - Scroll down to **"Test users"** section
   - Click **"+ ADD USERS"**
   - Enter email addresses (one per line):
     ```
     your-email@gmail.com
     friend-email@gmail.com
     tester-email@gmail.com
     ```
   - Click **SAVE**

3. **Test Again**
   - Sign out of your app
   - Try signing in with one of the test user emails
   - ✅ Should work now!

### Limits
- Up to **100 test users** allowed
- Only these users can sign in until app is verified
- Perfect for development, beta testing, and internal use

---

## ✅ Solution 2: Publish App & Get Verified (For Public Release)

If you want to allow **anyone** to sign in, you need to verify your app:

### Steps:

1. **Prepare OAuth Consent Screen**
   - Visit: https://console.cloud.google.com/apis/credentials/consent
   - Click **"EDIT APP"**

2. **Fill Required Information**
   
   **App Information:**
   - App name: `DermAir`
   - User support email: `your-email@gmail.com`
   - App logo: Upload a 120x120 PNG (optional but recommended)
   
   **App Domain:**
   - Application home page: `https://dermalr-8i5b6eijg-anils-projects-46588b6c.vercel.app`
   - Privacy policy: Create and host a privacy policy page
   - Terms of service: Create and host a terms of service page
   
   **Authorized Domains:**
   - Add: `vercel.app`
   
   **Developer Contact:**
   - Email: `your-email@gmail.com`

3. **Set Scopes**
   - Click **"ADD OR REMOVE SCOPES"**
   - Required scopes for DermAir:
     - `userinfo.email` - See your email address
     - `userinfo.profile` - See your personal info
     - `drive.file` - See, edit, create files created by this app
     - `spreadsheets` - Create, read, update spreadsheets

4. **Submit for Verification**
   - Click **"SUBMIT FOR VERIFICATION"**
   - Answer questionnaire about your app
   - Provide YouTube video demo (required)
   - Explain why you need sensitive scopes

5. **Wait for Approval**
   - Review takes **3-5 business days** (sometimes longer)
   - Google may request additional information
   - Once approved, anyone can sign in!

---

## 🎯 Recommended Approach

### For Now (Development/Testing):
✅ **Use Solution 1** - Add test users
- Fast (works immediately)
- Perfect for beta testing
- No verification needed
- Can add up to 100 users

### For Later (Public Launch):
✅ **Use Solution 2** - Get verified
- Required for public app
- Allows unlimited users
- Builds trust with users
- Takes 3-5+ days

---

## 📝 Required Documents for Verification

If you go with Solution 2, you'll need:

### 1. Privacy Policy
Create a page explaining:
- What data you collect (email, profile, health data)
- How you use it (risk assessment, weather correlation)
- Where it's stored (user's Google Drive)
- How users can delete it (export/delete in settings)

### 2. Terms of Service
Create a page explaining:
- App is not medical advice
- User responsibilities
- Disclaimer about health information
- Account termination policy

### 3. YouTube Video Demo
- 1-2 minute video showing:
  - Sign in with Google
  - Onboarding flow
  - Main features
  - How scopes are used
  - Where data is stored

---

## 🔍 Why Google Requires This

Google protects users by verifying apps that:
- Access sensitive data (Drive, Sheets)
- Use OAuth for authentication
- Are publicly available

Your app requests these **sensitive scopes**:
- ✅ `drive.file` - Access to Drive files
- ✅ `spreadsheets` - Access to Google Sheets

This triggers verification requirements.

---

## 💡 Alternative: Reduce Scope Requirements

If you don't want to go through verification, you could:

1. **Remove Google OAuth entirely**
   - Use local storage only
   - No cloud sync
   - Simpler but less features

2. **Use different backend**
   - Firebase (still needs verification)
   - Supabase (no Google verification)
   - Traditional database

But these defeat the purpose of your privacy-first, Google Drive-based architecture! 😊

---

## ✅ Immediate Action Items

1. **Add yourself as a test user** (takes 2 minutes)
   ```
   1. Visit: https://console.cloud.google.com/apis/credentials/consent
   2. Scroll to "Test users"
   3. Click "+ ADD USERS"
   4. Enter your email
   5. Click SAVE
   ```

2. **Test the app** with your email
   - Should work immediately!

3. **Add other testers** as needed
   - Friends, family, beta testers
   - Up to 100 users total

4. **Decide on verification timeline**
   - When ready for public launch
   - Prepare privacy policy & terms
   - Create demo video
   - Submit for verification

---

## 🆘 Common Issues

### "Email not found in test users"
- Make sure you added the exact email you're signing in with
- Check for typos in the email address

### "App is in testing mode"
- This is normal until verified
- Add users to test user list
- Or submit for verification

### "Invalid redirect URI"
- Make sure production URL is in authorized URIs
- Check for trailing slashes
- Must match exactly

---

## 📧 Need Help?

If you have questions about:
- Adding test users → Check Google Cloud Console
- Verification process → Google OAuth docs
- App setup → Review GOOGLE_SETUP.md

---

**Quick Links:**
- [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
- [Google Verification Guide](https://support.google.com/cloud/answer/9110914)
- [OAuth Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)

---

🎉 **You're almost there!** Just add test users and you'll be able to test your app immediately!
