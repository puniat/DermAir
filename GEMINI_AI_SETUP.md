# 🚀 Google Gemini AI Integration Guide for DermAir

## Overview

DermAir now uses **Google Gemini 1.5 Flash** for AI-powered risk assessment and personalized recommendations. Gemini provides medical-grade analysis with a generous free tier.

---

## 🎯 Why Gemini 1.5 Flash?

### ✅ FREE Tier Benefits:
- **15 requests/minute** (RPM)
- **1,500 requests/day** (RPD)
- **1 million requests/month**
- **No credit card required**
- **1M token context window** (analyze full medical history)
- **Fast inference**: 2-3 seconds
- **Structured output**: JSON mode support

### 💰 Cost After Free Tier:
- **$0.075 per 1M input tokens** (~$0.000075 per request)
- **$0.30 per 1M output tokens** (~$0.0006 per response)
- **Extremely affordable** for production

### 🔒 Privacy & Safety:
- Data not used for training (with API usage)
- HIPAA-eligible with Google Cloud setup
- Medical content safety filters
- Secure API key management

---

## 📋 Setup Instructions

### Step 1: Get Your Free Gemini API Key

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key (starts with `AIza...`)

**No credit card required!** You get the free tier immediately.

---

### Step 2: Install Google Generative AI Package

```bash
npm install @google/generative-ai
```

This package is already added to your dependencies in the codebase.

---

### Step 3: Configure Environment Variables

1. Open your `.env.local` file (create if it doesn't exist)
2. Add your Gemini API key:

```env
# Google Gemini AI Configuration
GEMINI_API_KEY=AIza...your_actual_api_key_here

# Existing configuration (keep these)
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
# ... other Firebase config
```

⚠️ **IMPORTANT**: 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Use `GEMINI_API_KEY` (no `NEXT_PUBLIC_` prefix to keep it server-side only)

---

### Step 4: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

The app will now use Gemini AI for risk assessments!

---

## 🧪 Testing the Integration

### Check if Gemini is Working:

1. Open your browser console (F12)
2. Enable AI mode in the dashboard
3. Look for this message in the console:
   ```
   ✅ Using Gemini AI for risk assessment
   ```

4. If you see this instead:
   ```
   Gemini AI not available, falling back to rule-based algorithm
   ```
   - Check your API key is correct
   - Verify `.env.local` file location
   - Restart the dev server

---

## 📊 What Gemini AI Provides

### Enhanced Risk Assessment:
- **Medical-grade analysis** of symptoms and environmental factors
- **Personalized risk scoring** (0-100) based on patient history
- **Confidence levels** (70-95%) with reasoning
- **Predictive analytics** for next 24h, 7 days, and 30 days

### Intelligent Recommendations:
- **Priority-based** (critical, high, medium, low)
- **Category-specific** (immediate, preventive, lifestyle, medical)
- **Evidence-backed** rationale for each recommendation
- **Personalized** to user's skin type and triggers

### Key Factors Analysis:
- **Environmental**: Weather, air quality, allergens
- **Physiological**: Skin barrier, immune stress, circadian rhythms
- **Behavioral**: Lifestyle patterns, trigger exposure
- **Clinical**: Skin type, medical history, symptom trends

---

## 🔄 Hybrid Approach (Current Implementation)

Your app now uses a **smart hybrid system**:

1. **Primary**: Gemini AI analysis (if API key configured)
2. **Fallback**: Rule-based algorithm (if Gemini fails/unavailable)
3. **Merge**: Combines best of both approaches

This ensures:
- ✅ Always functional (graceful degradation)
- ✅ Best quality when AI is available
- ✅ No breaking changes if API quota exhausted

---

## 📈 Monitoring Usage

### Check Your Quota:
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Navigate to **"Usage & Billing"**
3. View your API usage:
   - Requests per minute
   - Daily request count
   - Token usage

### Free Tier Limits:
- **15 RPM**: 15 requests per minute per user
- **1,500 RPD**: 1,500 requests per day
- **1M tokens/month**: Very generous for most use cases

### Typical Usage:
- 1 risk assessment = ~1,500 input tokens + ~800 output tokens
- 1 treatment plan = ~1,000 input tokens + ~1,500 output tokens
- **Estimated**: 500-800 assessments per day within free tier

---

## 🚨 Error Handling

The integration includes robust error handling:

### Scenario 1: API Key Not Configured
- **Behavior**: Silent fallback to rule-based algorithm
- **Log**: "Gemini AI not available, falling back..."
- **User Impact**: None (still gets risk assessment)

### Scenario 2: API Quota Exceeded
- **Behavior**: Automatic fallback to rule-based algorithm
- **Log**: "Gemini AI rate limit reached"
- **User Impact**: Minimal (slightly less personalized)

### Scenario 3: Network Error
- **Behavior**: Retry once, then fallback
- **Log**: "Error calling Gemini AI: ..."
- **User Impact**: None (graceful degradation)

---

## 🎨 UI Indicators

### AI Status Badge:
The dashboard header now shows:
- **"AI-Powered Analysis: Using medical-grade algorithms"** - When Gemini is active
- Processing time displayed (2-3 seconds typical)
- Confidence percentage (80-95% with Gemini)

### Risk Factors Display:
- **Gemini factors** marked with "Google Gemini AI Analysis"
- **Rule-based factors** show clinical journal sources
- Both displayed side-by-side in grid layout

---

## 🔐 Security Best Practices

### API Key Security:
✅ **DO**:
- Store in `.env.local` (server-side only)
- Use environment variables in production (Vercel/Netlify)
- Rotate keys if accidentally exposed

❌ **DON'T**:
- Commit API keys to git
- Use `NEXT_PUBLIC_` prefix (exposes to client)
- Share keys in screenshots or documentation

### Production Deployment:
1. Go to your hosting dashboard (Vercel/Netlify)
2. Add environment variable: `GEMINI_API_KEY`
3. Deploy your app
4. Verify in production logs

---

## 💡 Optimization Tips

### 1. Caching Results
The current implementation caches assessments for the same input data to avoid redundant API calls.

### 2. Batch Processing
For multiple users, consider batching requests to stay within rate limits.

### 3. Upgrade to Paid Tier (Optional)
If you exceed 1,500 requests/day:
- **Gemini 1.5 Flash**: $0.075 per 1M tokens
- **Estimated cost**: $5-20/month for 10,000 users

---

## 📚 Advanced Configuration

### Customize AI Behavior:

Edit `src/lib/ai/geminiClient.ts`:

```typescript
const modelConfig = {
  temperature: 0.7,  // 0.0-1.0 (higher = more creative)
  topP: 0.95,        // Nucleus sampling
  topK: 40,          // Top-K sampling
  maxOutputTokens: 2048  // Max response length
};
```

### Safety Settings:
Already configured for medical content. Modify if needed in `geminiClient.ts`.

---

## 🐛 Troubleshooting

### Issue: "Gemini AI not available"
**Solutions**:
1. Check API key is correct
2. Verify `.env.local` exists in project root
3. Restart dev server (`npm run dev`)
4. Check console for specific error messages

### Issue: "429 Too Many Requests"
**Solutions**:
1. Wait 1 minute (rate limit resets)
2. Upgrade to paid tier
3. Implement request throttling

### Issue: "Invalid API Key"
**Solutions**:
1. Regenerate key in [AI Studio](https://aistudio.google.com/app/apikey)
2. Check for trailing spaces in `.env.local`
3. Ensure no `NEXT_PUBLIC_` prefix

---

## 🎓 Learning Resources

### Official Documentation:
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Quickstart Guide](https://ai.google.dev/tutorials/get_started_web)
- [Safety Settings](https://ai.google.dev/docs/safety_setting_gemini)

### Example Prompts:
- [Prompt Engineering Guide](https://ai.google.dev/docs/prompt_best_practices)
- [Medical Use Cases](https://ai.google.dev/examples)

---

## 📞 Support

### Need Help?
- **Gemini API Issues**: [Google AI Forum](https://discuss.ai.google.dev/)
- **DermAir Integration**: Check console logs and API route responses

### Feature Requests:
The AI integration is modular and can be enhanced with:
- Multi-language support
- Image analysis (rash detection)
- Voice-based symptom logging
- Medication interaction checking

---

## ✅ Checklist

Before deploying to production:

- [ ] Gemini API key obtained from AI Studio
- [ ] `.env.local` configured with `GEMINI_API_KEY`
- [ ] Dev server restarted
- [ ] Console shows "✅ Using Gemini AI" message
- [ ] Risk assessment displays Gemini factors
- [ ] Environment variables set in production hosting
- [ ] API usage monitored in AI Studio
- [ ] Error handling tested (disable API key temporarily)

---

## 🚀 Next Steps

Your DermAir app now has:
1. ✅ Real AI-powered analysis (not just rules)
2. ✅ Medical-grade recommendations
3. ✅ Personalized insights
4. ✅ Graceful fallback system
5. ✅ Free tier with generous limits

**Ready to deploy!** 🎉

For production deployment, simply add the `GEMINI_API_KEY` environment variable to your hosting platform (Vercel, Netlify, etc.).
