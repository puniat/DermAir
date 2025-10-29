# 🔧 Fixing Gemini API - Step-by-Step Guide

## ❌ Current Issue

Your Gemini API key is not working. Error: `models/gemini-1.5-flash is not found`

This means either:
1. The API key is invalid/expired
2. The API key doesn't have proper permissions
3. You need to generate a new key

---

## ✅ Solution: Get a NEW API Key

### Step 1: Visit Google AI Studio

Open this link in your browser:
**https://aistudio.google.com/app/apikey**

### Step 2: Sign In

- Sign in with your Google account
- You may need to agree to terms of service

### Step 3: Create NEW API Key

There are two options:

#### Option A: Create API Key in New Project (Recommended)
1. Click **"Create API key"**
2. Select **"Create API key in new project"**
3. Wait for project creation (takes ~30 seconds)
4. Copy the new API key (starts with `AIza...`)

#### Option B: Use Existing Project
1. Click **"Create API key"**
2. Select an existing Google Cloud project
3. Copy the new API key

### Step 4: Update Your .env.local File

1. Open `d:\Personal\Development\DermAir\.env.local`
2. Find this line:
   ```
   GEMINI_API_KEY=AIzaSyBis285IsJi456kJuF3KlueyuuWah82tlQ
   ```
3. Replace with your NEW API key:
   ```
   GEMINI_API_KEY=AIza...your_new_key_here
   ```
4. Save the file

### Step 5: Test the New API Key

Run this command in PowerShell:

```powershell
$env:GEMINI_API_KEY=(Get-Content .env.local | Select-String 'GEMINI_API_KEY' | ForEach-Object { $_.ToString().Split('=')[1] }); node scripts/list-models.mjs
```

You should see at least one model marked as ✅ WORKS!

---

## 🎯 Expected Output (When Working)

```
📋 Listing Available Gemini Models

================================================
API Key configured: ✅ Yes
================================================

🔍 Testing model availability...

✅ gemini-pro - WORKS! Response: Hello!
✅ gemini-1.5-pro - WORKS! Response: Hello! How can I help...
✅ gemini-1.5-flash - WORKS! Response: Hello!

💡 Use the model name that works in your geminiClient.ts file
```

---

## 🔍 Troubleshooting

### Issue: "API key not found"
**Solution**: Make sure you saved the .env.local file after adding the new key

### Issue: Still getting 404 errors
**Solution**: 
1. Double-check the API key was copied correctly (no extra spaces)
2. Try creating a brand new project in Google AI Studio
3. Make sure you're using Google AI Studio (not Google Cloud Console)

### Issue: "Quota exceeded"
**Solution**: You've hit the free tier limit (1,500 requests/day). Wait 24 hours or upgrade.

---

## ⚡ Quick Start After Fixing

Once your API key works:

1. **Restart dev server**:
   ```powershell
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Navigate to dashboard**

4. **Look for these messages**:
   ```
   🔍 [Risk Assessment] Attempting Gemini AI analysis...
   ✅ [Risk Assessment] Using Gemini AI for risk assessment
   🤖 [Risk Assessment] AI Analysis: {...}
   ```

---

## 📝 Common API Key Mistakes

❌ **Wrong**: `NEXT_PUBLIC_GEMINI_API_KEY=...` (public prefix)
✅ **Correct**: `GEMINI_API_KEY=...` (server-side only)

❌ **Wrong**: Key with quotes: `GEMINI_API_KEY="AIza..."`
✅ **Correct**: No quotes: `GEMINI_API_KEY=AIza...`

❌ **Wrong**: Spaces: `GEMINI_API_KEY = AIza...`
✅ **Correct**: No spaces: `GEMINI_API_KEY=AIza...`

---

## 🆘 Still Not Working?

### Alternative: Use Free Groq API Instead

Groq offers FREE access to Llama 3.1 with faster inference:

1. Get API key: https://console.groq.com/keys
2. Add to .env.local:
   ```
   GROQ_API_KEY=gsk_...your_key_here
   ```
3. We can modify the code to use Groq instead

### Alternative: Use OpenAI with Free Credits

OpenAI gives $5 free credits:

1. Get API key: https://platform.openai.com/api-keys
2. Add to .env.local:
   ```
   OPENAI_API_KEY=sk-...your_key_here
   ```
3. We can modify the code to use OpenAI GPT-4o-mini

---

## 📚 Resources

- **Google AI Studio**: https://aistudio.google.com
- **API Documentation**: https://ai.google.dev/docs
- **Quota Limits**: https://ai.google.dev/pricing
- **Support Forum**: https://discuss.ai.google.dev

---

## ✅ Checklist

- [ ] Visited https://aistudio.google.com/app/apikey
- [ ] Created NEW API key in new project
- [ ] Copied the full API key
- [ ] Updated .env.local file
- [ ] Saved the file
- [ ] Ran test script (list-models.mjs)
- [ ] Confirmed at least one model works
- [ ] Restarted dev server
- [ ] Checked browser console for AI messages

---

**Once you have a working API key, the app will automatically use Gemini AI for enhanced risk assessments!** 🎉
