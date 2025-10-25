# 🌤️ DermAir - Intelligent Skin Health Companion

**Medical-grade risk assessment for eczema and dermatitis management**

DermAir helps you understand how weather conditions affect your skin and provides personalized recommendations to prevent flare-ups.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)

---

## ✨ Features

### 🌡️ Real-Time Risk Assessment
- Weather-based scoring (humidity, temperature, UV, air quality)
- Pollen level monitoring
- Personalized trigger tracking
- Color-coded risk levels with visual indicators

### 🤖 AI-Powered Insights
- Advanced pattern recognition in your symptom history
- Predictive alerts before high-risk conditions
- Personalized recommendations based on your data
- Contextual analysis of environmental factors

### ☁️ Cloud Sync & Backup
- **NEW**: Sign in with Google
- Automatic backup to your Google Drive
- Access your data from any device
- Your data stays in YOUR Drive (privacy-first)
- Works offline, syncs when online

### 📊 Analytics Dashboard
- Symptom trends over time
- Weather correlation charts
- Trigger pattern identification
- Export your data anytime

### 📱 Progressive Web App
- Install on any device
- Works offline
- Push notifications
- Native app experience

---

## 🚀 Quick Start

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/dermair.git
cd dermair

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### First-Time Setup
1. **Google OAuth** (Optional, for cloud sync):
   - Follow [GOOGLE_SETUP.md](./GOOGLE_SETUP.md)
   - Or click "Continue without Google" for local-only mode

2. **OpenWeather API** (Required for weather data):
   - Get free API key from [OpenWeather](https://openweathermap.org/api)
   - Add to `.env.local`

---

## 📚 Documentation

- 📖 **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- 🔧 **[Google Setup Guide](./GOOGLE_SETUP.md)** - Complete OAuth configuration
- 📋 **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Technical details
- 🌤️ **[Weather API Setup](./WEATHER_API_SETUP.md)** - Weather service configuration

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library

### Backend & Storage
- **Google Sheets API** - Cloud storage (free!)
- **Google OAuth 2.0** - Authentication
- **LocalStorage** - Offline data
- **IndexedDB** - Large data storage

### APIs & Services
- **OpenWeather API** - Weather data
- **Google Drive API** - File storage
- **Google Sheets API** - Data sync

### Deployment
- **Vercel** (recommended) - Free hosting
- **Netlify** - Alternative free hosting
- No paid backend required! 🎉

---

## 🎯 User Flows

### New User
```
Landing Page → Sign in with Google → Onboarding (5 steps) → Dashboard
```

### Returning User (Same Device)
```
Auto-login → Dashboard → Background sync
```

### Returning User (New Device)
```
Sign in with Google → Restore from Drive → Dashboard
```

---

## 🔐 Privacy & Security

### Your Data is Yours
- ✅ All health data stored in **your** Google Drive
- ✅ DermAir cannot access other files in your Drive
- ✅ No data stored on our servers (we don't have servers!)
- ✅ You can export or delete data anytime

### What We Access
- ✅ Only spreadsheets created by this app
- ✅ Your email and basic profile (for identification)

### What We CANNOT Access
- ❌ Your other Google Drive files
- ❌ Your Gmail, Calendar, or other Google services
- ❌ Any data from other apps

### Revoke Access Anytime
Visit [Google Account Permissions](https://myaccount.google.com/permissions)

---

## 🌍 Deployment

### Vercel (Recommended)
```bash
vercel
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
vercel env add NEXT_PUBLIC_OPENWEATHER_API_KEY
```

### Netlify
```bash
netlify deploy --prod
# Add environment variables in Netlify dashboard
```

### Remember!
- Update Google OAuth with production URL
- Add redirect URIs in Google Cloud Console

---

## 📊 Project Structure

```
dermair/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Entry point (routing logic)
│   │   ├── landing/              # Landing page with auth
│   │   ├── onboarding/           # Multi-step setup
│   │   └── dashboard/            # Main app interface
│   ├── components/
│   │   ├── AccountSettings.tsx   # Google account management
│   │   ├── Header.tsx            # App header
│   │   ├── DailyCheckIn.tsx      # Symptom logging
│   │   └── ui/                   # Reusable UI components
│   ├── lib/
│   │   ├── services/
│   │   │   ├── google-auth.ts    # OAuth service
│   │   │   └── google-sheets.ts  # Sheets API service
│   │   └── utils.ts              # Risk calculation
│   └── hooks/
│       ├── useWeather.ts         # Weather data hook
│       └── useCheckIns.ts        # Check-in management
├── public/
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
├── GOOGLE_SETUP.md               # OAuth setup guide
├── IMPLEMENTATION_SUMMARY.md     # Technical docs
└── QUICK_START.md                # Getting started
```

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## ⚠️ Disclaimer

**DermAir is NOT medical advice.** This app provides informational content only and should not replace consultation with healthcare professionals. Always consult your doctor for medical decisions.

---

## 🙏 Acknowledgments

- Weather data provided by [OpenWeather](https://openweathermap.org/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

## 📧 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/dermair/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/dermair/discussions)
- 📧 **Email**: support@dermair.com

---

**Built with ❤️ for better skin health management**
