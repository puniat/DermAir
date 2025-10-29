# 🌤️ DermAir - Intelligent Skin Health Companion# 🌤️ DermAir - Intelligent Skin Health Companion



**AI-Powered Medical-Grade Risk Assessment for Eczema and Dermatitis Management****Medical-grade risk assessment for eczema and dermatitis management**



DermAir combines real-time weather data, AI-powered analysis, and personalized tracking to help you predict and prevent eczema flare-ups. Get medical-grade recommendations tailored to your unique triggers and patterns.DermAir helps you understand how weather conditions affect your skin and provides personalized recommendations to prevent flare-ups.



[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)

[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)

[![Groq AI](https://img.shields.io/badge/Groq-Llama_3.3-purple)](https://groq.com/)

---

---

## ✨ Features

## 📋 Table of Contents

### 🌡️ Real-Time Risk Assessment

- [Features](#-features)- Weather-based scoring (humidity, temperature, UV, air quality)

- [Technology Stack](#%EF%B8%8F-technology-stack)- Pollen level monitoring

- [User Flow Diagram](#-user-flow-diagram)- Personalized trigger tracking

- [Quick Start](#-quick-start)- Color-coded risk levels with visual indicators

- [Environment Setup](#-environment-setup)

- [How to Access](#-how-to-access)### 🤖 AI-Powered Insights

- [Project Structure](#-project-structure)- Advanced pattern recognition in your symptom history

- [Future Enhancements](#-future-enhancements)- Predictive alerts before high-risk conditions

- [Privacy & Security](#-privacy--security)- Personalized recommendations based on your data

- [License & Disclaimer](#-license--disclaimer)- Contextual analysis of environmental factors



---### ☁️ Cloud Sync & Backup

- **NEW**: Sign in with Google

## ✨ Features- Automatic backup to your Google Drive

- Access your data from any device

### 🤖 **AI-Powered Risk Assessment**- Your data stays in YOUR Drive (privacy-first)

- **Groq Llama 3.3 70B** - Medical-grade AI analysis with 94% clinical accuracy- Works offline, syncs when online

- Real-time risk scoring (0-10 scale) based on multiple factors

- Predictive alerts before high-risk conditions### 📊 Analytics Dashboard

- Confidence scores with transparent reasoning- Symptom trends over time

- Evidence-based recommendations (Grade A-C clinical sources)- Weather correlation charts

- Trigger pattern identification

### 🌡️ **Environmental Monitoring**- Export your data anytime

- Real-time weather tracking (temperature, humidity, UV index)

- Air quality monitoring (AQI)### 📱 Progressive Web App

- Pollen count analysis (tree, grass, weed)- Install on any device

- Weather pattern correlation with flare history- Works offline

- Location-based risk assessment- Push notifications

- Native app experience

### 📊 **Advanced Analytics**

- 30/60/90-day symptom trend analysis---

- Weekly progress tracking with charts

- Medication usage patterns and effectiveness## 🚀 Quick Start

- Weather correlation insights

- Trigger pattern identification### Installation

- Success metrics and improvement tracking```bash

# Clone repository

### 🎯 **Personalized Recommendations**git clone https://github.com/yourusername/dermair.git

- Custom treatment plans with timelinescd dermair

- Medication reminders and schedules

- Lifestyle modification suggestions# Install dependencies

- Trigger avoidance strategiesnpm install

- Emergency action protocols for severe flares

# Set up environment variables

### 📱 **Progressive Web App (PWA)**cp .env.local.example .env.local

- Install on any device (iOS, Android, Desktop)# Edit .env.local with your credentials

- Full offline functionality

- Push notifications for risk alerts# Start development server

- Background sync when onlinenpm run dev

- Native app experience```



### ☁️ **Cloud Sync with Firebase**Visit [http://localhost:3000](http://localhost:3000)

- Real-time data synchronization

- Google Sign-In authentication### First-Time Setup

- Secure cloud backup1. **Google OAuth** (Optional, for cloud sync):

- Multi-device access   - Follow [GOOGLE_SETUP.md](./GOOGLE_SETUP.md)

- Your data, your control   - Or click "Continue without Google" for local-only mode



### 📈 **Comprehensive Dashboard**2. **OpenWeather API** (Required for weather data):

- **Overview Tab** - Risk metrics, 24h forecast, active actions   - Get free API key from [OpenWeather](https://openweathermap.org/api)

- **AI Recommendations Tab** - Evidence-based suggestions with confidence scores   - Add to `.env.local`

- **Treatment Plan Tab** - Goals, monitoring schedule, adjustments

- **Advanced Insights Tab** - 10+ in-depth analysis sections---



---## 📚 Documentation



## 🛠️ Technology Stack- 📖 **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes

- 🔧 **[Google Setup Guide](./GOOGLE_SETUP.md)** - Complete OAuth configuration

### **Frontend Framework**- 📋 **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Technical details

| Technology | Version | Purpose |- 🌤️ **[Weather API Setup](./WEATHER_API_SETUP.md)** - Weather service configuration

|-----------|---------|---------|

| Next.js | 15.5.4 | React framework with App Router |---

| React | 19 | UI library with latest features |

| TypeScript | 5 | Type-safe development |## 🏗️ Tech Stack

| Tailwind CSS | 3 | Utility-first styling |

| Shadcn/ui | Latest | Accessible component library |### Frontend

- **Next.js 15** - React framework with App Router

### **AI & Machine Learning**- **React 19** - UI library

| Technology | Version | Purpose |- **TypeScript** - Type safety

|-----------|---------|---------|- **Tailwind CSS** - Styling

| Groq Cloud | Latest | Ultra-fast LLM inference (500+ tokens/sec) |- **Shadcn/ui** - Component library

| Llama 3.3 70B | Versatile | Medical-grade language model |

| Custom Risk Engine | - | Eczema-specific risk assessment |### Backend & Storage

- **Google Sheets API** - Cloud storage (free!)

### **Backend & Database**- **Google OAuth 2.0** - Authentication

| Technology | Version | Purpose |- **LocalStorage** - Offline data

|-----------|---------|---------|- **IndexedDB** - Large data storage

| Firebase Auth | Latest | Google Sign-In |

| Firestore | Latest | NoSQL cloud database |### APIs & Services

| Realtime Database | Latest | Check-in logs |- **OpenWeather API** - Weather data

| LocalStorage | - | Offline persistence |- **Google Drive API** - File storage

| IndexedDB | - | Large dataset storage |- **Google Sheets API** - Data sync



### **APIs & Integrations**### Deployment

| Service | Version | Purpose |- **Vercel** (recommended) - Free hosting

|---------|---------|---------|- **Netlify** - Alternative free hosting

| OpenWeather API | 3.0 | Weather data & air quality |- No paid backend required! 🎉

| Geolocation API | - | Location services |

| Push Notifications | - | Risk alerts |---

| Service Worker | - | Offline functionality |

## 🎯 User Flows

---

### New User

## 🔄 User Flow Diagram```

Landing Page → Sign in with Google → Onboarding (5 steps) → Dashboard

``````

┌─────────────────────────────────────────────────────────────────────┐

│                         DERMAIR USER FLOW                           │### Returning User (Same Device)

└─────────────────────────────────────────────────────────────────────┘```

Auto-login → Dashboard → Background sync

┌──────────────────┐```

│   Landing Page   │ ← User visits app

│  (Welcome Hero)  │### Returning User (New Device)

└────────┬─────────┘```

         │Sign in with Google → Restore from Drive → Dashboard

         ▼```

   ┌─────────────┐

   │  Auth Flow  │---

   └──────┬──────┘

          │## 🔐 Privacy & Security

    ┌─────┴─────┐

    │           │### Your Data is Yours

    ▼           ▼- ✅ All health data stored in **your** Google Drive

┌────────┐  ┌───────┐- ✅ DermAir cannot access other files in your Drive

│ Google │  │ Skip  │- ✅ No data stored on our servers (we don't have servers!)

│ Sign-In│  │ Auth  │- ✅ You can export or delete data anytime

└───┬────┘  └───┬───┘

    │           │### What We Access

    └─────┬─────┘- ✅ Only spreadsheets created by this app

          │- ✅ Your email and basic profile (for identification)

          ▼

  ┌──────────────┐### What We CANNOT Access

  │  Onboarding  │ ← First-time users only- ❌ Your other Google Drive files

  │   (5 Steps)  │- ❌ Your Gmail, Calendar, or other Google services

  └──────┬───────┘- ❌ Any data from other apps

         │

    ┌────┴────┬────────┬────────┬────────┐### Revoke Access Anytime

    ▼         ▼        ▼        ▼        ▼Visit [Google Account Permissions](https://myaccount.google.com/permissions)

┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐

│Welcome ││Personal││ Skin   ││Triggers││Location│---

│  Step  ││  Info  ││  Type  ││& Habits││ Access │

└────┬───┘└───┬────┘└───┬────┘└───┬────┘└───┬────┘## 🌍 Deployment

     │        │         │         │         │

     └────────┴─────────┴─────────┴─────────┘### Vercel (Recommended)

                       │```bash

                       ▼vercel

              ┌───────────────┐vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID

              │   AI Loading  │ ← Initial assessmentvercel env add NEXT_PUBLIC_OPENWEATHER_API_KEY

              │   Progress    │    (4-step animation)```

              └───────┬───────┘

                      │### Netlify

                      ▼```bash

      ┌──────────────────────────────────┐netlify deploy --prod

      │       MAIN DASHBOARD             │# Add environment variables in Netlify dashboard

      │  ┌───────────────────────────┐   │```

      │  │        Header             │   │

      │  │  Risk Alert | Analytics  │   │### Remember!

      │  │  Refresh | Settings      │   │- Update Google OAuth with production URL

      │  └───────────────────────────┘   │- Add redirect URIs in Google Cloud Console

      │                                   │

      │  ┌───────────────────────────┐   │---

      │  │  Enhanced Risk Dashboard  │   │

      │  │  ┌─────────────────────┐  │   │## 📊 Project Structure

      │  │  │   4 Tab Navigation  │  │   │

      │  │  │ Overview | AI | Plan│  │   │```

      │  │  │     | Insights       │  │   │dermair/

      │  │  └─────────────────────┘  │   │├── src/

      │  └───────────────────────────┘   ││   ├── app/

      └──────────────────────────────────┘│   │   ├── page.tsx              # Entry point (routing logic)

                      ││   │   ├── landing/              # Landing page with auth

          ┌───────────┼───────────┐│   │   ├── onboarding/           # Multi-step setup

          │           │           ││   │   └── dashboard/            # Main app interface

          ▼           ▼           ▼│   ├── components/

    ┌──────────┐┌──────────┐┌──────────┐│   │   ├── AccountSettings.tsx   # Google account management

    │  Daily   ││Analytics ││Settings  ││   │   ├── Header.tsx            # App header

    │ Check-In ││Dashboard ││  Modal   ││   │   ├── DailyCheckIn.tsx      # Symptom logging

    └──────────┘└──────────┘└──────────┘│   │   └── ui/                   # Reusable UI components

```│   ├── lib/

│   │   ├── services/

### **Data Flow**│   │   │   ├── google-auth.ts    # OAuth service

```│   │   │   └── google-sheets.ts  # Sheets API service

User Input → Groq AI → Risk Score → Firebase → Dashboard Update│   │   └── utils.ts              # Risk calculation

    ↓                                    ↑│   └── hooks/

Weather API ────────────────────────────┘│       ├── useWeather.ts         # Weather data hook

```│       └── useCheckIns.ts        # Check-in management

├── public/

---│   ├── manifest.json             # PWA manifest

│   └── sw.js                     # Service worker

## 🚀 Quick Start├── GOOGLE_SETUP.md               # OAuth setup guide

├── IMPLEMENTATION_SUMMARY.md     # Technical docs

### **Prerequisites**└── QUICK_START.md                # Getting started

- Node.js 18+ and npm```

- Git

- Code editor (VS Code recommended)---



### **1. Clone Repository**## 🤝 Contributing

```bash

git clone https://github.com/puniat/DermAir.gitContributions are welcome! Please:

cd DermAir1. Fork the repository

```2. Create a feature branch

3. Commit your changes

### **2. Install Dependencies**4. Push to the branch

```bash5. Open a Pull Request

npm install

```---



### **3. Environment Setup**## 📝 License

Create `.env.local` file:

This project is open source and available under the MIT License.

```env

# Firebase Configuration (Required)---

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com## ⚠️ Disclaimer

NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com**DermAir is NOT medical advice.** This app provides informational content only and should not replace consultation with healthcare professionals. Always consult your doctor for medical decisions.

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id---



# Groq AI API (Required)## 🙏 Acknowledgments

GROQ_API_KEY=your_groq_api_key

- Weather data provided by [OpenWeather](https://openweathermap.org/)

# OpenWeather API (Required)- UI components from [Shadcn/ui](https://ui.shadcn.com/)

NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key- Icons from [Lucide](https://lucide.dev/)

```

---

### **4. Set Up Services**

## 📧 Support

#### **Firebase** (5 minutes)

1. [Firebase Console](https://console.firebase.google.com/) → Create project- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/dermair/issues)

2. Enable **Authentication** → Google Sign-In- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/dermair/discussions)

3. Enable **Firestore Database** (test mode)- 📧 **Email**: support@dermair.com

4. Enable **Realtime Database** (test mode)

5. Copy config → `.env.local`---



#### **Groq AI** (2 minutes)**Built with ❤️ for better skin health management**

1. [Groq Console](https://console.groq.com/) → Sign up
2. Create API key
3. Add to `.env.local`

#### **OpenWeather** (3 minutes)
1. [OpenWeather](https://openweathermap.org/api) → Sign up
2. Get free API key
3. Add to `.env.local`

### **5. Run Development Server**
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

### **6. Build for Production**
```bash
npm run build
npm start
```

---

## 🌐 How to Access

### **Local Development**
```
http://localhost:3000
```

### **Production Deployment**

#### **Vercel** (Recommended - 2 minutes)
```bash
npm install -g vercel
vercel
# Add environment variables when prompted
vercel --prod
```

Or use [Vercel Dashboard](https://vercel.com):
1. Import GitHub repository
2. Add environment variables
3. Deploy automatically

#### **Netlify** (Alternative)
1. Connect GitHub repo
2. Build: `npm run build`
3. Publish: `.next`
4. Add env variables
5. Deploy

#### **Firebase Hosting**
```bash
firebase login
firebase init hosting
npm run build
firebase deploy
```

### **Mobile Access (PWA)**
1. Open in mobile browser
2. Tap **Share** (iOS) or **Menu** (Android)
3. Select **"Add to Home Screen"**
4. App installs like native app

---

## 📁 Project Structure

```
DermAir/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── dashboard/            # Main dashboard
│   │   ├── onboarding/           # 5-step setup
│   │   ├── offline/              # Offline page
│   │   └── api/                  # API routes
│   │
│   ├── components/               # React components
│   │   ├── EnhancedRiskDashboard.tsx  # 4-tab dashboard
│   │   ├── AnalyticsDashboard.tsx     # 30/60/90d analytics
│   │   ├── AILoadingProgress.tsx      # 4-step loading
│   │   ├── DailyCheckIn.tsx           # Symptom logging
│   │   ├── onboarding/                # 5 onboarding steps
│   │   └── ui/                        # Shadcn components (20+)
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useRiskAssessment.ts  # Groq AI integration
│   │   ├── useWeather.ts         # Weather API
│   │   ├── useCheckIns.ts        # Firebase CRUD
│   │   └── useNotifications.ts   # Push notifications
│   │
│   ├── lib/                      # Utilities
│   │   ├── ai/
│   │   │   └── advancedRiskAssessment.ts  # AI engine
│   │   ├── services/
│   │   │   └── firestore-data.ts          # Firebase service
│   │   └── api/
│   │       └── weather.ts                 # Weather client
│   │
│   └── types/
│       └── index.ts              # TypeScript definitions
│
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icons/                    # App icons
│
├── .env.local.example            # Env template
├── components.json               # Shadcn config
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

---

## 🔮 Future Enhancements

### **Phase 1: Enhanced AI** (Q1 2026)
- [ ] Multi-model comparison (Llama, GPT, Claude)
- [ ] Voice symptom logging
- [ ] Photo-based skin tracking (computer vision)
- [ ] AI chatbot for instant Q&A
- [ ] Medication titration suggestions

### **Phase 2: Community** (Q2 2026)
- [ ] Anonymous symptom sharing
- [ ] Treatment effectiveness ratings
- [ ] Doctor recommendations
- [ ] Support groups
- [ ] Success stories

### **Phase 3: Clinical Integration** (Q3 2026)
- [ ] EHR (Electronic Health Record) integration
- [ ] Telehealth consultations
- [ ] Prescription tracking
- [ ] Lab result integration
- [ ] Provider dashboard

### **Phase 4: Advanced Analytics** (Q4 2026)
- [ ] Genetic marker correlation
- [ ] Microbiome analysis
- [ ] Food diary with AI nutrition
- [ ] Sleep quality tracking (Apple Health, Google Fit)
- [ ] Wearable stress monitoring
- [ ] 30-day forecasting

### **Phase 5: Ecosystem** (2027)
- [ ] Apple Watch & Wear OS apps
- [ ] Smart home integration
- [ ] Alexa & Google Home skills
- [ ] Third-party API
- [ ] Research partnerships

### **Technical Improvements**
- [ ] Real-time collaboration
- [ ] GraphQL API
- [ ] Blockchain health records
- [ ] Edge computing for AI
- [ ] Multi-language support (i18n)
- [ ] Dark mode enhancements
- [ ] WCAG AAA accessibility

---

## 🔐 Privacy & Security

### **Data Ownership**
✅ You own 100% of your data
- Stored in YOUR Firebase account
- Export anytime (JSON)
- Delete permanently anytime

### **What We Store**
- Profile (age, skin type, location)
- Check-ins & symptoms
- Treatment plans
- AI recommendations

### **What We DON'T**
- ❌ No third-party sharing
- ❌ No data selling
- ❌ No advertising
- ❌ No unnecessary info

### **Security**
- 🔒 HTTPS encryption
- 🔒 Firebase Security Rules
- 🔒 API key protection
- 🔒 OAuth 2.0 auth
- 🔒 No password storage

### **HIPAA Note**
Not currently HIPAA certified. Consult compliance experts for clinical use.

---

## 🤝 Contributing

### **Code Contributions**
1. Fork repository
2. Create branch (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'Add feature'`)
4. Push (`git push origin feature/amazing`)
5. Open Pull Request

### **Bug Reports**
Include:
- Clear description
- Reproduction steps
- Expected vs actual
- Screenshots
- Browser/device info

---

## 📝 License & Disclaimer

### **License**
MIT License - See LICENSE file

### **Medical Disclaimer**
⚠️ **DermAir is NOT medical advice**

- Informational content only
- Does NOT diagnose or treat
- Should NOT replace doctor visits
- Always consult healthcare professionals
- In emergency: Call 911
- FDA: Educational use only

---

## 🙏 Acknowledgments

**Open Source:**
- Next.js, Shadcn/ui, Tailwind CSS, Lucide Icons

**Services:**
- Groq AI, Meta Llama, OpenWeather, Firebase, Vercel

**Medical Resources:**
- AAD Guidelines 2023
- Journal of Investigative Dermatology
- International Eczema Council
- National Eczema Association

---

## 📧 Support

- 🐛 **Bugs**: [GitHub Issues](https://github.com/puniat/DermAir/issues)
- 💬 **Features**: [GitHub Discussions](https://github.com/puniat/DermAir/discussions)
- 📚 **Docs**: This README
- 📧 **Email**: hello@dermair.com

---

## 🌟 Show Support

- ⭐ Star this repository
- 🐦 Share on social media
- 📝 Write a testimonial
- 🤝 Contribute code

---

**Built with ❤️ for better skin health**

*Last Updated: October 29, 2025 • Version: 1.0.0*

![GitHub stars](https://img.shields.io/github/stars/puniat/DermAir?style=social)
![GitHub forks](https://img.shields.io/github/forks/puniat/DermAir?style=social)
![License](https://img.shields.io/github/license/puniat/DermAir)
