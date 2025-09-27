import { useEffect } from 'react';
import { UserProfile, WeatherData } from '@/types';

interface NotificationService {
  checkAndSendRiskAlert: (riskLevel: "low" | "medium" | "high", riskScore: number, factors: string[]) => Promise<void>;
}

export function useRiskAlerts(
  weather: WeatherData | null,
  profile: UserProfile | null,
  riskLevel: "low" | "medium" | "high",
  riskScore: number,
  weatherLoading: boolean,
  notifications: NotificationService
) {
  useEffect(() => {
    if (weather && profile && !weatherLoading) {
      try {
        // Send risk alert if conditions are met
        const mainFactors = [
          weather.humidity > 70 ? "High humidity" : weather.humidity < 30 ? "Low humidity" : "",
          weather.temperature > 85 ? "High temperature" : weather.temperature < 5 ? "Cold weather" : "",
          weather.uv_index > 7 ? "High UV" : "",
          weather.air_quality_index > 100 ? "Poor air quality" : "",
          weather.pollen_count.overall > 6 ? "High pollen" : ""
        ].filter(Boolean);
        
        notifications.checkAndSendRiskAlert(riskLevel, riskScore, mainFactors);
      } catch (error) {
        console.error('Error sending risk alert:', error);
      }
    }
  }, [weather, profile, riskLevel, riskScore, weatherLoading, notifications]);
}