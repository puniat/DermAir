# DermAIr Weather API Setup

## OpenWeatherMap API Setup

To get real weather data, you need to set up the OpenWeatherMap API:

### 1. Get API Key
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Create a free account
3. Go to your API keys section
4. Copy your API key

### 2. Configure Environment
1. Open `.env.local` file in the project root
2. Replace `your_api_key_here` with your actual API key:
   ```
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

### 3. Features Available

**Current Weather Data:**
- Temperature
- Humidity  
- Air pressure
- Wind speed
- Weather conditions

**Air Quality:**
- Air Quality Index (1-5 scale)
- Pollutant levels

**UV Index:**
- Current UV radiation level

**Fallback Mode:**
- If no API key is provided, the app uses mock data
- All features work normally with sample data

### 4. API Limits

**Free Tier:**
- 1,000 calls per day
- 60 calls per minute
- Sufficient for typical usage

**Data Updates:**
- Weather data refreshes every 30 minutes automatically
- Manual refresh available via dashboard button

### 5. Privacy & Data

**What's Sent:**
- Only coordinates (lat/lon) or city name
- No personal information

**What's Stored:**
- Weather data cached locally in browser
- No server-side storage of user location

### 6. Troubleshooting

**Common Issues:**
- API key not working: Check if it's activated (can take 10-15 minutes)
- Location errors: Ensure browser location permissions are enabled
- No weather data: Check browser console for error messages

**Fallback Behavior:**
- Failed API calls automatically use mock data
- User experience remains consistent