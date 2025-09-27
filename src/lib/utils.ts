import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { RiskAssessment, WeatherData, DailyLog } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Enhanced risk calculation utilities
export function calculateRiskScore(
  weatherData: WeatherData,
  userTriggers: string[],
  recentSymptoms?: DailyLog[]
): number {
  let riskScore = 0;
  const riskFactors: { factor: string; impact: number; description: string }[] = [];
  
  // Enhanced environmental factors with weighted scoring
  
  // Humidity (major skin factor)
  if (weatherData.humidity > 80) {
    const impact = 25;
    riskScore += impact;
    riskFactors.push({ factor: "High Humidity", impact, description: `${weatherData.humidity}% humidity can increase sweating and bacterial growth` });
  } else if (weatherData.humidity > 70) {
    const impact = 15;
    riskScore += impact;
    riskFactors.push({ factor: "Elevated Humidity", impact, description: `${weatherData.humidity}% humidity may increase skin moisture retention` });
  } else if (weatherData.humidity < 20) {
    const impact = 30;
    riskScore += impact;
    riskFactors.push({ factor: "Very Low Humidity", impact, description: `${weatherData.humidity}% humidity can cause severe skin dryness` });
  } else if (weatherData.humidity < 30) {
    const impact = 20;
    riskScore += impact;
    riskFactors.push({ factor: "Low Humidity", impact, description: `${weatherData.humidity}% humidity may dry out your skin` });
  }
  
  // Temperature extremes
  if (weatherData.temperature > 90) {
    const impact = 20;
    riskScore += impact;
    riskFactors.push({ factor: "Extreme Heat", impact, description: `${Math.round(weatherData.temperature)}°C can cause excessive sweating` });
  } else if (weatherData.temperature > 85) {
    const impact = 12;
    riskScore += impact;
    riskFactors.push({ factor: "High Temperature", impact, description: `${Math.round(weatherData.temperature)}°C may increase skin irritation` });
  } else if (weatherData.temperature < 0) {
    const impact = 25;
    riskScore += impact;
    riskFactors.push({ factor: "Freezing Temperature", impact, description: `${Math.round(weatherData.temperature)}°C can damage skin barrier` });
  } else if (weatherData.temperature < 5) {
    const impact = 15;
    riskScore += impact;
    riskFactors.push({ factor: "Very Cold", impact, description: `${Math.round(weatherData.temperature)}°C can dry and crack skin` });
  }
  
  // UV Index (enhanced)
  if (weatherData.uv_index > 9) {
    const impact = 25;
    riskScore += impact;
    riskFactors.push({ factor: "Extreme UV", impact, description: `UV Index ${weatherData.uv_index}: Very high sun exposure risk` });
  } else if (weatherData.uv_index > 7) {
    const impact = 18;
    riskScore += impact;
    riskFactors.push({ factor: "High UV", impact, description: `UV Index ${weatherData.uv_index}: High sun exposure risk` });
  } else if (weatherData.uv_index > 5) {
    const impact = 10;
    riskScore += impact;
    riskFactors.push({ factor: "Moderate UV", impact, description: `UV Index ${weatherData.uv_index}: Moderate sun protection needed` });
  }
  
  // Air Quality (enhanced with AQI categories)
  if (weatherData.air_quality_index > 200) {
    const impact = 35;
    riskScore += impact;
    riskFactors.push({ factor: "Very Unhealthy Air", impact, description: `AQI ${weatherData.air_quality_index}: Air quality may trigger severe reactions` });
  } else if (weatherData.air_quality_index > 150) {
    const impact = 25;
    riskScore += impact;
    riskFactors.push({ factor: "Unhealthy Air", impact, description: `AQI ${weatherData.air_quality_index}: Poor air quality may worsen symptoms` });
  } else if (weatherData.air_quality_index > 100) {
    const impact = 15;
    riskScore += impact;
    riskFactors.push({ factor: "Moderate Air Quality", impact, description: `AQI ${weatherData.air_quality_index}: Air quality may affect sensitive individuals` });
  }
  
  // Enhanced pollen analysis
  const totalPollen = weatherData.pollen_count.overall;
  if (totalPollen > 9) {
    const impact = 25;
    riskScore += impact;
    riskFactors.push({ factor: "Very High Pollen", impact, description: `Pollen level ${totalPollen}/10: Peak allergy season` });
  } else if (totalPollen > 6) {
    const impact = 18;
    riskScore += impact;
    riskFactors.push({ factor: "High Pollen", impact, description: `Pollen level ${totalPollen}/10: High allergen exposure` });
  } else if (totalPollen > 3) {
    const impact = 10;
    riskScore += impact;
    riskFactors.push({ factor: "Moderate Pollen", impact, description: `Pollen level ${totalPollen}/10: Moderate allergen levels` });
  }
  
  // Wind factor (can dry skin and spread allergens)
  if (weatherData.wind_speed > 25) { // ~40+ km/h
    const impact = 12;
    riskScore += impact;
    riskFactors.push({ factor: "Strong Winds", impact, description: `${Math.round(weatherData.wind_speed)} km/h winds can dry skin and spread allergens` });
  }
  
  // User-specific trigger multipliers (more sophisticated)
  userTriggers.forEach(trigger => {
    switch (trigger.toLowerCase()) {
      case 'pollen':
        if (weatherData.pollen_count.overall > 2) {
          const multiplier = 1.5;
          const additionalRisk = Math.round((weatherData.pollen_count.overall - 2) * 3 * multiplier);
          riskScore += additionalRisk;
          riskFactors.push({ factor: "Personal Pollen Sensitivity", impact: additionalRisk, description: "Your pollen sensitivity increases risk" });
        }
        break;
      case 'humidity':
        if (weatherData.humidity > 60 || weatherData.humidity < 40) {
          const additionalRisk = 15;
          riskScore += additionalRisk;
          riskFactors.push({ factor: "Personal Humidity Sensitivity", impact: additionalRisk, description: "Your humidity sensitivity increases risk" });
        }
        break;
      case 'heat':
        if (weatherData.temperature > 75) {
          const additionalRisk = Math.round((weatherData.temperature - 75) * 0.8);
          riskScore += additionalRisk;
          riskFactors.push({ factor: "Personal Heat Sensitivity", impact: additionalRisk, description: "Your heat sensitivity increases risk" });
        }
        break;
      case 'cold':
        if (weatherData.temperature < 15) {
          const additionalRisk = Math.round((15 - weatherData.temperature) * 1.2);
          riskScore += additionalRisk;
          riskFactors.push({ factor: "Personal Cold Sensitivity", impact: additionalRisk, description: "Your cold sensitivity increases risk" });
        }
        break;
      case 'dust':
      case 'pollution':
        if (weatherData.air_quality_index > 50) {
          const multiplier = 1.4;
          const additionalRisk = Math.round((weatherData.air_quality_index - 50) * 0.3 * multiplier);
          riskScore += additionalRisk;
          riskFactors.push({ factor: "Personal Air Quality Sensitivity", impact: additionalRisk, description: "Your air quality sensitivity increases risk" });
        }
        break;
      case 'wind':
        if (weatherData.wind_speed > 15) {
          const additionalRisk = Math.round((weatherData.wind_speed - 15) * 0.6);
          riskScore += additionalRisk;
          riskFactors.push({ factor: "Personal Wind Sensitivity", impact: additionalRisk, description: "Your wind sensitivity increases risk" });
        }
        break;
    }
  });
  
  // Recent symptom pattern analysis (enhanced)
  if (recentSymptoms && recentSymptoms.length > 0) {
    const last3Days = recentSymptoms.slice(0, 3);
    const avgItch = last3Days.reduce((acc, log) => acc + log.itch_score, 0) / last3Days.length;
    const avgRedness = last3Days.reduce((acc, log) => acc + log.redness_score, 0) / last3Days.length;
    const totalAvg = (avgItch + avgRedness) / 2;
    
    // If symptoms are escalating, increase risk
    if (totalAvg > 3) {
      const impact = Math.round(totalAvg * 5);
      riskScore += impact;
      riskFactors.push({ factor: "Recent Symptom Pattern", impact, description: `High symptom average (${totalAvg.toFixed(1)}) indicates vulnerable skin` });
    }
    
    // Check for trend (getting worse)
    if (last3Days.length >= 2) {
      const trend = (last3Days[0].itch_score + last3Days[0].redness_score) - 
                   (last3Days[last3Days.length - 1].itch_score + last3Days[last3Days.length - 1].redness_score);
      if (trend > 2) { // Symptoms getting worse
        const impact = 10;
        riskScore += impact;
        riskFactors.push({ factor: "Worsening Trend", impact, description: "Symptoms appear to be escalating" });
      }
    }
  }
  
  return Math.min(100, Math.max(0, riskScore));
}

export function getRiskLevel(score: number): "low" | "medium" | "high" {
  if (score < 30) return "low";
  if (score < 60) return "medium";
  return "high";
}

export function generateRecommendations(
  riskLevel: "low" | "medium" | "high",
  weatherData: WeatherData,
  userTriggers: string[]
): string[] {
  const recommendations: string[] = [];
  
  // Base recommendations by risk level
  switch (riskLevel) {
    case "low":
      recommendations.push("✅ Good day for your skin! Maintain your regular routine");
      recommendations.push("🧴 Apply your usual moisturizer morning and evening");
      break;
      
    case "medium":
      recommendations.push("⚠️ Take extra precautions today");
      recommendations.push("🧴 Apply moisturizer more frequently (every 4-6 hours)");
      recommendations.push("📝 Consider logging any symptoms that develop");
      break;
      
    case "high":
      recommendations.push("🚨 High risk day - take protective measures");
      recommendations.push("🛡️ Apply thick barrier cream or intensive moisturizer");
      recommendations.push("📱 Monitor symptoms closely and log any changes");
      recommendations.push("💊 Have your treatment medication easily accessible");
      break;
  }
  
  // Weather-specific recommendations
  if (weatherData.humidity > 80) {
    recommendations.push("💨 High humidity: Use lighter, non-comedogenic moisturizers");
    recommendations.push("🌬️ Ensure good ventilation and air circulation indoors");
  } else if (weatherData.humidity < 30) {
    recommendations.push("💧 Low humidity: Use a humidifier and apply heavy moisturizers");
    recommendations.push("🚿 Take shorter, cooler showers to prevent further drying");
  }
  
  if (weatherData.temperature > 85) {
    recommendations.push("🧊 Hot weather: Stay in air-conditioned spaces when possible");
    recommendations.push("👕 Wear loose, breathable clothing made from natural fibers");
    recommendations.push("💦 Stay hydrated and take cool showers");
  } else if (weatherData.temperature < 5) {
    recommendations.push("🧥 Cold weather: Protect exposed skin with barriers or coverings");
    recommendations.push("🏠 Limit time outdoors and warm up gradually when coming inside");
  }
  
  if (weatherData.uv_index > 7) {
    recommendations.push("☀️ High UV: Apply broad-spectrum SPF 30+ sunscreen");
    recommendations.push("🕶️ Wear protective clothing, hat, and sunglasses outdoors");
    recommendations.push("⏰ Avoid direct sun exposure between 10 AM - 4 PM");
  }
  
  if (weatherData.air_quality_index > 100) {
    recommendations.push("😷 Poor air quality: Limit outdoor activities");
    recommendations.push("🪟 Keep windows closed and use air purifiers if available");
    recommendations.push("🧼 Wash face and hands frequently to remove pollutants");
  }
  
  if (weatherData.pollen_count.overall > 6) {
    recommendations.push("🌸 High pollen: Keep windows closed during peak hours (morning/evening)");
    recommendations.push("👗 Change clothes after being outdoors");
    recommendations.push("🚿 Shower before bed to remove pollen from hair and skin");
  }
  
  if (weatherData.wind_speed > 25) {
    recommendations.push("💨 Strong winds: Apply extra moisturizer to prevent wind burn");
    recommendations.push("🧣 Cover exposed areas when outdoors");
  }
  
  // User trigger-specific recommendations
  userTriggers.forEach(trigger => {
    switch (trigger.toLowerCase()) {
      case 'pollen':
        if (weatherData.pollen_count.overall > 3) {
          recommendations.push("🌿 Pollen trigger: Consider antihistamines if recommended by your doctor");
          recommendations.push("🏠 Use HEPA filters and keep indoor plants to a minimum");
        }
        break;
      case 'dust':
      case 'pollution':
        if (weatherData.air_quality_index > 50) {
          recommendations.push("🏠 Air quality trigger: Vacuum regularly with HEPA filter");
          recommendations.push("🧹 Dust surfaces frequently and consider air purifiers");
        }
        break;
      case 'heat':
        if (weatherData.temperature > 75) {
          recommendations.push("❄️ Heat trigger: Use cooling techniques (cold compresses, fans)");
          recommendations.push("🧴 Switch to lighter, cooling moisturizers");
        }
        break;
      case 'cold':
        if (weatherData.temperature < 15) {
          recommendations.push("🔥 Cold trigger: Layer clothing and protect extremities");
          recommendations.push("🧴 Use heavier, occlusive moisturizers");
        }
        break;
      case 'humidity':
        if (weatherData.humidity > 60 || weatherData.humidity < 40) {
          recommendations.push("💧 Humidity trigger: Monitor indoor humidity levels (aim for 40-60%)");
          recommendations.push("🏠 Use humidifier or dehumidifier as needed");
        }
        break;
      case 'wind':
        if (weatherData.wind_speed > 15) {
          recommendations.push("🌪️ Wind trigger: Apply protective balm before going outdoors");
          recommendations.push("🧣 Use scarves or masks to shield face from wind");
        }
        break;
    }
  });
  
  // Remove duplicates and limit to most relevant recommendations
  const uniqueRecommendations = Array.from(new Set(recommendations));
  return uniqueRecommendations.slice(0, 8); // Limit to top 8 recommendations
}

// Date utilities
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

// Color utilities for risk levels
export function getRiskColor(riskLevel: "low" | "medium" | "high"): {
  bg: string;
  text: string;
  border: string;
} {
  switch (riskLevel) {
    case "low":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      };
    case "medium":
      return {
        bg: "bg-warning/10",
        text: "text-warning-foreground", 
        border: "border-warning/20",
      };
    case "high":
      return {
        bg: "bg-destructive/10",
        text: "text-destructive-foreground",
        border: "border-destructive/20",
      };
  }
}
