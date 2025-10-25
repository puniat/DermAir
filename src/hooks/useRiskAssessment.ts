import { useMemo, useState, useEffect, useRef } from 'react';
import { UserProfile, WeatherData, DailyLog } from '@/types';
import { calculateRiskScore, getRiskLevel, generateRecommendations } from '@/lib/utils';
import { advancedRiskEngine, AdvancedRiskAssessment } from '@/lib/ai/advancedRiskAssessment';
import { aiRecommendationEngine, MedicalRecommendation, TreatmentPlan } from '@/lib/ai/aiRecommendationEngine';

// Helper function to determine current season
function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

// Helper function to create a stable dependency from array
function createStableDependency(checkIns: DailyLog[]): string {
  return checkIns.map(c => `${c.id}-${c.date.getTime()}`).join('|');
}

export interface EnhancedRiskAssessment {
  // Legacy compatibility
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'severe';
  recommendations: string[];
  
  // Advanced AI-powered assessments
  advancedAssessment: AdvancedRiskAssessment | null;
  aiRecommendations: MedicalRecommendation[];
  treatmentPlan: TreatmentPlan | null;
  confidence: number;
  reasoning: string;
  
  // System metadata
  isAdvancedMode: boolean;
  processingTime: number;
  lastUpdated: Date;
}

export function useRiskAssessment(
  weather: WeatherData | null,
  profile: UserProfile | null,
  recentCheckIns: DailyLog[],
  useAdvancedAI: boolean = true
): EnhancedRiskAssessment {
  const [advancedAssessment, setAdvancedAssessment] = useState<AdvancedRiskAssessment | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<MedicalRecommendation[]>([]);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [reasoning, setReasoning] = useState<string>('');
  const [processingTime, setProcessingTime] = useState<number>(0);
  const lastUpdatedRef = useRef<Date>(new Date());

  // Create stable dependencies
  const checkInsHash = useMemo(() => createStableDependency(recentCheckIns), [recentCheckIns]);
  const weatherHash = useMemo(() => weather ? `${weather.temperature}-${weather.humidity}-${weather.timestamp.getTime()}` : null, [weather]);
  const profileHash = useMemo(() => profile ? `${profile.id}-${JSON.stringify(profile.triggers || [])}` : null, [profile]);

  // Legacy risk calculation for backward compatibility
  const riskScore = useMemo(() => {
    if (!weather || !profile) return 0;
    try {
      return calculateRiskScore(weather, profile.triggers || [], recentCheckIns);
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return 0;
    }
  }, [weatherHash, profileHash, checkInsHash]); // Use stable hash dependencies

  const riskLevel = useMemo(() => {
    try {
      return getRiskLevel(riskScore);
    } catch (error) {
      console.error('Error getting risk level:', error);
      return 'low' as const;
    }
  }, [riskScore]);

  const legacyRecommendations = useMemo(() => {
    if (!weather || !profile) return [];
    try {
      return generateRecommendations(riskLevel, weather, profile.triggers || []);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }, [riskLevel, weatherHash, profileHash]); // Use stable hash dependencies

  // Advanced AI assessment
  useEffect(() => {
    if (!useAdvancedAI || !weather || !profile) {
      // Clear advanced data when AI mode is disabled
      setAdvancedAssessment(null);
      setAiRecommendations([]);
      setTreatmentPlan(null);
      setConfidence(0.7);
      setReasoning('Using basic risk assessment based on weather data and user triggers.');
      // Don't update lastUpdated when just clearing data to prevent infinite loop
      return;
    }

    let isCancelled = false;

    const performAdvancedAssessment = async () => {
      const startTime = performance.now();
      
      try {
        // Add a small delay to prevent blocking the main thread
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Generate advanced risk assessment
        const assessment = await advancedRiskEngine.assessRisk({
          weather: weather,
          userProfile: profile,
          recentLogs: recentCheckIns.slice(0, 14), // Last 2 weeks
          timeOfDay: new Date().getHours(),
          season: getCurrentSeason(),
          location: {
            latitude: profile.location?.latitude || 0,
            longitude: profile.location?.longitude || 0,
            elevation: 0,
            urbanIndex: 0.5
          }
        });

        if (isCancelled) return;

        // Generate AI-powered recommendations
        const aiContext = {
          riskAssessment: assessment,
          userProfile: profile,
          weatherData: weather,
          recentLogs: recentCheckIns.slice(0, 7), // Last week
          medicalHistory: {
            allergies: [], // Would come from extended profile
            medications: [],
            comorbidities: [],
            previousTreatments: []
          },
          preferences: {
            treatmentApproach: 'moderate' as const,
            naturalPreference: false,
            timeConstraints: []
          }
        };

        const aiResults = await aiRecommendationEngine.generateRecommendations(aiContext);

        if (isCancelled) return;

        const endTime = performance.now();

        // Update state
        setAdvancedAssessment(assessment);
        setAiRecommendations(aiResults.recommendations);
        setTreatmentPlan(aiResults.treatmentPlan);
        setConfidence(aiResults.confidence);
        setReasoning(aiResults.reasoning);
        setProcessingTime(endTime - startTime);
        lastUpdatedRef.current = new Date();

      } catch (error) {
        console.error('Error in advanced risk assessment:', error);
        // Fallback to legacy mode
        setAdvancedAssessment(null);
        setAiRecommendations([]);
        setTreatmentPlan(null);
        setConfidence(0.7); // Basic confidence for legacy mode
        setReasoning('Using basic risk assessment due to processing error.');
      }
    };

    performAdvancedAssessment();

    return () => {
      isCancelled = true;
    };
  }, [weatherHash, profileHash, checkInsHash, useAdvancedAI]); // Use stable hash dependencies

  // Combine legacy and advanced results
  return useMemo(() => {
    const result: EnhancedRiskAssessment = {
      // Legacy compatibility - use advanced data only when AI mode is on and available
      riskScore: useAdvancedAI && advancedAssessment ? 
        advancedAssessment.severity.current : riskScore,
      riskLevel: useAdvancedAI && advancedAssessment ? 
        (advancedAssessment.riskLevel as any) : riskLevel,
      recommendations: legacyRecommendations,
      
      // Advanced AI features - only when AI mode is enabled
      advancedAssessment: useAdvancedAI ? advancedAssessment : null,
      aiRecommendations: useAdvancedAI ? aiRecommendations : [],
      treatmentPlan: useAdvancedAI ? treatmentPlan : null,
      confidence: useAdvancedAI ? confidence : 0.7, // Basic confidence for legacy mode
      reasoning: useAdvancedAI ? reasoning : 'Using basic risk assessment based on weather data and user triggers.',
      
      // System metadata
      isAdvancedMode: useAdvancedAI && !!advancedAssessment,
      processingTime,
      lastUpdated: lastUpdatedRef.current
    };

    return result;
  }, [
    riskScore, 
    riskLevel, 
    legacyRecommendations,
    advancedAssessment,
    aiRecommendations,
    treatmentPlan,
    confidence,
    reasoning,
    useAdvancedAI,
    processingTime
    // Note: lastUpdated is intentionally excluded to prevent infinite loops
  ]);
}

/**
 * Legacy hook for backward compatibility
 */
export function useBasicRiskAssessment(
  weather: WeatherData | null,
  profile: UserProfile | null,
  recentCheckIns: DailyLog[]
) {
  const result = useRiskAssessment(weather, profile, recentCheckIns, false);
  
  return {
    riskScore: result.riskScore,
    riskLevel: result.riskLevel,
    recommendations: result.recommendations
  };
}