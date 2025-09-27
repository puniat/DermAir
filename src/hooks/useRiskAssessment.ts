import { useMemo } from 'react';
import { UserProfile, WeatherData, DailyLog } from '@/types';
import { calculateRiskScore, getRiskLevel, generateRecommendations } from '@/lib/utils';

export function useRiskAssessment(
  weather: WeatherData | null,
  profile: UserProfile | null,
  recentCheckIns: DailyLog[]
) {
  const riskScore = useMemo(() => {
    if (!weather || !profile) return 0;
    try {
      return calculateRiskScore(weather, profile.triggers || [], recentCheckIns);
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return 0;
    }
  }, [weather, profile, recentCheckIns]);

  const riskLevel = useMemo(() => {
    try {
      return getRiskLevel(riskScore);
    } catch (error) {
      console.error('Error getting risk level:', error);
      return 'low' as const;
    }
  }, [riskScore]);

  const recommendations = useMemo(() => {
    if (!weather || !profile) return [];
    try {
      return generateRecommendations(riskLevel, weather, profile.triggers || []);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }, [riskLevel, weather, profile]);

  return {
    riskScore,
    riskLevel,
    recommendations
  };
}