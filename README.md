# 🌤️ DermAlr - Smart Skin Health Companion

**AI-powered weather insights for eczema and dermatitis management**

DermAlr helps you understand how environmental conditions affect your skin health and provides personalized recommendations to prevent flare-ups before they happen.

---

## 📱 What is DermAlr?

DermAlr is an intelligent health companion that combines real-time weather data with AI analysis to help people managing their skin condition more effectively. The app tracks your symptoms, identifies triggers, and provides predictive insights based on environmental factors.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.5.4, React 19, TypeScript 5
- **Styling**: Tailwind CSS 3, shadcn/ui components
- **AI Engine**: Groq Llama 3.3 70B for advanced pattern analysis
- **Database**: Firebase (Firestore + Realtime Database)
- **Weather API**: WeatherAPI.com for real-time environmental data
- **Authentication**: PIN-based secure access (SHA-256 hashing)
- **PWA**: Progressive Web App with offline support

---

## ✨ Key Features

### 🌡️ Smart Risk Assessment

- Real-time risk scoring based on weather conditions (humidity, temperature, UV, pollen)
- Color-coded risk levels: Low (green), Moderate (yellow), High (orange), Severe (red)
- Personalized alerts when conditions match your triggers

### 🤖 AI-Powered Insights

- Advanced pattern recognition in your symptom history
- Predictive analysis to forecast potential flare-ups
- Personalized recommendations based on your unique profile

### 📊 Health Tracking

- Daily check-ins to log symptoms and severity
- Track known triggers (humidity, stress, allergens, etc.)
- Visual analytics with trend charts and correlations

### 📱 Progressive Web App

- Install on any device (mobile, tablet, desktop)
- Works offline - data syncs when back online
- Native app-like experience

### 🔒 Privacy & Security

- PIN-protected accounts (no email required)
- Secure data encryption
- Your health data stays private

---

## 👤 User Onboarding

DermAlr features a **2-minute personalized setup** that collects essential information:

1. **Account Creation**

   - Choose a unique username
   - Set a secure 4-6 digit PIN
   - Optional email for recovery
2. **Location Setup**

   - Enter your zipcode or use auto-detection
   - Enables accurate weather-based insights
3. **Health Profile**

   - Current skin condition (Mild, Moderate, Severe)
   - Recent severity trends
   - Alert preferences (when to notify you)
4. **Trigger Identification**

   - Select common triggers (humidity, temperature, stress, etc.)
   - Add custom triggers specific to your condition

Once complete, you're taken to your personalized dashboard with real-time insights!

---

## 🧠 How Insights Are Generated

### Data Collection

- **Environmental Data**: Real-time weather, humidity, temperature, UV index, pollen counts, air quality
- **User Data**: Daily symptom logs, severity ratings, trigger exposures, medication usage
- **Historical Patterns**: Past flare-ups, symptom trends, weather correlations

### AI Analysis Process

1. **Pattern Recognition**: AI analyzes your symptom history alongside weather patterns
2. **Risk Calculation**: Multi-factor scoring algorithm weighs current conditions against your triggers
3. **Predictive Modeling**: Machine learning identifies conditions likely to cause flare-ups
4. **Personalized Recommendations**: Context-aware advice tailored to your profile and current risk level

### Risk Assessment Factors

- **Humidity levels** (major trigger for most users)
- **Temperature fluctuations**
- **UV radiation exposure**
- **Pollen counts** (tree, grass, weed)
- **Air quality index**
- **Personal trigger exposure**
- **Historical flare-up patterns**

The AI engine combines these factors to provide a **confidence-scored risk assessment** with actionable insights.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project set up
- WeatherAPI key

### Installation

```bash
# Clone the repository
git clone https://github.com/puniat/DermAir.git

# Navigate to project directory
cd DermAir

# Install dependencies
npm install

# Set up environment variables (see .env.example)
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📧 Contact & Feedback

Have questions, suggestions, or feedback? I'd love to hear from you!

**Email**: [puniatulika@gmail.com](mailto:puniatulika@gmail.com)

---

## 📄 License & Disclaimer

This application is for informational purposes only and is not a substitute for professional medical advice. Always consult with a healthcare provider for medical concerns.

---

**Built with ❤️ to help people manage their skin health better**
