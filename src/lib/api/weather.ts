import type { WeatherData } from "@/types";

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const AIR_POLLUTION_URL = "https://api.openweathermap.org/data/2.5/air_pollution";

// Debug logging for API key
if (typeof window !== 'undefined') {
  console.log('API Key configured:', !!OPENWEATHER_API_KEY);
  console.log('API Key length:', OPENWEATHER_API_KEY?.length || 0);
}

export interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  dt: number;
}

export interface UVResponse {
  value: number;
}

export interface AirPollutionResponse {
  list: Array<{
    main: {
      aqi: number; // Air Quality Index 1-5
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
  }>;
}

/**
 * Fetch current weather data from OpenWeatherMap API
 */
export async function fetchWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  if (!OPENWEATHER_API_KEY) {
    console.warn("OpenWeatherMap API key not configured, using mock data");
    return getMockWeatherData();
  }

  try {
    // Fetch current weather
    const weatherResponse = await fetch(
      `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!weatherResponse.ok) {
      if (weatherResponse.status === 401) {
        console.error("OpenWeatherMap API key is invalid or not configured");
        console.warn("Falling back to mock weather data");
        return getMockWeatherData();
      }
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData: OpenWeatherResponse = await weatherResponse.json();

    // Fetch UV Index
    const uvResponse = await fetch(
      `${BASE_URL}/uvi?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`
    );

    let uvIndex = 0;
    if (uvResponse.ok) {
      const uvData: UVResponse = await uvResponse.json();
      uvIndex = Math.round(uvData.value);
    } else if (uvResponse.status === 401) {
      console.warn("UV API authentication failed, using default value");
    }

    // Fetch Air Pollution data
    const airResponse = await fetch(
      `${AIR_POLLUTION_URL}?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`
    );

    let airQualityIndex = 1;
    if (airResponse.ok) {
      const airData: AirPollutionResponse = await airResponse.json();
      airQualityIndex = airData.list[0]?.main.aqi || 1;
    } else if (airResponse.status === 401) {
      console.warn("Air pollution API authentication failed, using default value");
    }

    // Generate intelligent pollen estimate based on weather conditions
    const pollenEstimate = calculatePollenEstimate(weatherData, new Date());

    // Convert to our WeatherData format
    const result: WeatherData = {
      temperature: Math.round(weatherData.main.temp),
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      uv_index: uvIndex,
      air_quality_index: airQualityIndex * 20, // Convert 1-5 scale to 0-100
      pollen_count: pollenEstimate,
      weather_condition: weatherData.weather[0]?.description || "Unknown",
      wind_speed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
      timestamp: new Date(),
    };

    return result;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    console.warn("Falling back to mock weather data");
    // Return mock data as fallback
    return getMockWeatherData();
  }
}

/**
 * Fetch weather data by city name
 */
export async function fetchWeatherByCity(city: string): Promise<WeatherData> {
  if (!OPENWEATHER_API_KEY) {
    console.warn("OpenWeatherMap API key not configured, using mock data");
    return getMockWeatherData();
  }

  try {
    // First, get coordinates for the city
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );

    if (!geoResponse.ok) {
      if (geoResponse.status === 401) {
        console.error("OpenWeatherMap API key is invalid or not configured");
        console.warn("Falling back to mock weather data");
        return getMockWeatherData();
      }
      throw new Error(`Geocoding API error: ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();
    if (!geoData.length) {
      throw new Error(`City not found: ${city}`);
    }

    const { lat, lon } = geoData[0];
    return await fetchWeatherData(lat, lon);
  } catch (error) {
    console.error("Error fetching weather by city:", error);
    console.warn("Falling back to mock weather data");
    return getMockWeatherData();
  }
}

/**
 * Get user's current location using browser geolocation
 */
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  });
}

/**
 * Calculate intelligent pollen estimate based on weather conditions and seasonality
 */
function calculatePollenEstimate(weatherData: OpenWeatherResponse, date: Date) {
  const month = date.getMonth(); // 0-11
  const temp = weatherData.main.temp;
  const humidity = weatherData.main.humidity;
  const windSpeed = weatherData.wind?.speed || 0;
  const isRaining = weatherData.weather[0]?.main.toLowerCase().includes('rain');
  
  let treePollen = 1;
  let grassPollen = 1;
  let weedPollen = 1;
  
  // Seasonal patterns (Northern Hemisphere)
  // Tree pollen: March-May (peak April)
  if (month >= 2 && month <= 4) { // Mar-May
    treePollen = month === 3 ? 8 : 6; // April is peak
  } else if (month >= 1 && month <= 5) {
    treePollen = 3;
  }
  
  // Grass pollen: May-July (peak June)
  if (month >= 4 && month <= 6) { // May-July
    grassPollen = month === 5 ? 8 : 6; // June is peak
  } else if (month >= 3 && month <= 7) {
    grassPollen = 3;
  }
  
  // Weed pollen: August-October (peak September)
  if (month >= 7 && month <= 9) { // Aug-Oct
    weedPollen = month === 8 ? 8 : 6; // September is peak
  } else if (month >= 6 && month <= 10) {
    weedPollen = 3;
  }
  
  // Weather adjustments
  if (temp < 10) { // Too cold for high pollen
    treePollen *= 0.3;
    grassPollen *= 0.3;
    weedPollen *= 0.3;
  } else if (temp > 20) { // Warm weather increases pollen
    treePollen *= 1.3;
    grassPollen *= 1.3;
    weedPollen *= 1.3;
  }
  
  if (humidity > 80 || isRaining) { // High humidity/rain reduces airborne pollen
    treePollen *= 0.5;
    grassPollen *= 0.5;
    weedPollen *= 0.5;
  }
  
  if (windSpeed > 5) { // Wind spreads pollen
    treePollen *= 1.4;
    grassPollen *= 1.4;
    weedPollen *= 1.4;
  } else if (windSpeed < 2) { // No wind means less spreading
    treePollen *= 0.8;
    grassPollen *= 0.8;
    weedPollen *= 0.8;
  }
  
  // Ensure values stay within 1-10 range
  treePollen = Math.min(10, Math.max(1, Math.round(treePollen)));
  grassPollen = Math.min(10, Math.max(1, Math.round(grassPollen)));
  weedPollen = Math.min(10, Math.max(1, Math.round(weedPollen)));
  
  const overall = Math.round((treePollen + grassPollen + weedPollen) / 3);
  
  return {
    tree: treePollen,
    grass: grassPollen,
    weed: weedPollen,
    overall: overall
  };
}

/**
 * Test the API key with a simple request
 */
export async function testApiKey(): Promise<{ success: boolean; error?: string }> {
  console.log('🔑 Testing API key...');
  console.log('🔑 API key loaded:', OPENWEATHER_API_KEY ? `${OPENWEATHER_API_KEY.substring(0, 8)}...` : 'NOT FOUND');
  
  if (!OPENWEATHER_API_KEY) {
    return { success: false, error: "No API key configured" };
  }

  try {
    const testUrl = `${BASE_URL}/weather?q=London&appid=${OPENWEATHER_API_KEY}&units=metric`;
    console.log('🌐 Making test request to:', testUrl.replace(OPENWEATHER_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(testUrl);
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.status === 401) {
      const errorText = await response.text();
      console.log('❌ 401 error response:', errorText);
      return { success: false, error: `Invalid API key - ${errorText}` };
    }

    if (response.status === 429) {
      return { success: false, error: "API rate limit exceeded" };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ ${response.status} error response:`, errorText);
      return { success: false, error: `API error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    console.log('✅ Success! Sample data:', { name: data.name, country: data.sys?.country });
    return { success: true };
  } catch (error) {
    console.log('❌ Network error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Network error" 
    };
  }
}
function getMockWeatherData(): WeatherData {
  // Generate somewhat realistic but varied mock data
  const baseTemp = 20;
  const tempVariation = Math.random() * 10 - 5; // ±5°C variation
  
  return {
    temperature: Math.round(baseTemp + tempVariation),
    humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa
    uv_index: Math.floor(Math.random() * 11), // 0-10
    air_quality_index: Math.floor(Math.random() * 80) + 20, // 20-100
    pollen_count: {
      tree: Math.floor(Math.random() * 10) + 1,
      grass: Math.floor(Math.random() * 10) + 1,
      weed: Math.floor(Math.random() * 10) + 1,
      overall: Math.floor(Math.random() * 10) + 1,
    },
    weather_condition: [
      "partly cloudy",
      "sunny",
      "overcast",
      "light rain",
      "clear sky"
    ][Math.floor(Math.random() * 5)],
    wind_speed: Math.floor(Math.random() * 25) + 5, // 5-30 km/h
    timestamp: new Date(),
  };
}

/**
 * Convert coordinates to city name using reverse geocoding
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ city: string; country: string }> {
  if (!OPENWEATHER_API_KEY) {
    console.warn("OpenWeatherMap API key not configured for reverse geocoding");
    return { city: "Unknown Location", country: "Unknown" };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error("OpenWeatherMap API key is invalid for reverse geocoding");
        return { city: "Unknown Location", country: "Unknown" };
      }
      throw new Error(`Reverse geocoding error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.length) {
      throw new Error("Location not found");
    }

    return {
      city: data[0].name || "Unknown Location",
      country: data[0].country || "Unknown",
    };
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return { city: "Unknown Location", country: "Unknown" };
  }
}