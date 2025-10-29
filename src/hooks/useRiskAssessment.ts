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
  if (!checkIns || checkIns.length === 0) return '';
  
  try {
    return checkIns
      .filter(c => c && c.id && c.date)
      .map(c => {
        try {
          let dateValue: number;
          if (c.date instanceof Date) {
            dateValue = c.date.getTime();
          } else if (typeof c.date === 'string') {
            dateValue = new Date(c.date).getTime();
          } else if (c.date && typeof c.date === 'object' && 'seconds' in c.date) {
            // Firestore Timestamp
            dateValue = (c.date as any).seconds * 1000;
          } else {
            dateValue = Date.now();
          }
          return `${c.id}-${dateValue}`;
        } catch {
          return `${c.id}-${Date.now()}`;
        }
      })
      .join('|');
  } catch {
    return '';
  }
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
  loading: boolean; // Add loading state
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
  const [loading, setLoading] = useState<boolean>(false);
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

  // Advanced AI assessment with Gemini
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
      setLoading(true); // Set loading to true when starting
      
      try {
        // Add a small delay to prevent blocking the main thread
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // TRY AI ANALYSIS FIRST (Groq if API key configured)
        let aiAnalysis = null;
        try {
          console.log('🔍 [Risk Assessment] Attempting AI analysis...');
          const aiResponse = await fetch('/api/ai/analyze-risk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              weather,
              profile,
              recentLogs: recentCheckIns.slice(0, 14)
            })
          });

          console.log('🔍 [Risk Assessment] AI API response status:', aiResponse.status);

          if (aiResponse.ok) {
            const data = await aiResponse.json();
            aiAnalysis = data.analysis;
            
            // Validate that aiAnalysis is not null/undefined
            if (aiAnalysis) {
              console.log('✅ [Risk Assessment] Using AI for risk assessment');
              console.log('🤖 [Risk Assessment] AI Analysis:', {
                riskLevel: aiAnalysis.riskLevel,
                riskScore: aiAnalysis.riskScore,
                confidence: aiAnalysis.confidence,
                factorsCount: (aiAnalysis.factors || aiAnalysis.keyFactors || []).length
              });
            } else {
              console.warn('⚠️ [Risk Assessment] AI returned null analysis');
            }
          } else {
            const errorData = await aiResponse.json();
            console.warn('⚠️ [Risk Assessment] AI API failed:', errorData);
          }
        } catch (aiError) {
          console.log('⚠️ [Risk Assessment] AI not available:', aiError);
          console.log('🔄 [Risk Assessment] Falling back to rule-based algorithm');
        }

        if (isCancelled) return;

        // FALLBACK: Use rule-based algorithm (always run for backup)
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

        // If AI provided analysis, merge it with rule-based assessment
        let finalAssessment = assessment;
        let finalConfidence = 0.85;
        let finalReasoning = '';

        if (aiAnalysis && typeof aiAnalysis === 'object') {
          console.log('🔍 [Risk Assessment] Full AI Analysis:', JSON.stringify(aiAnalysis, null, 2));
          
          // Use AI's analysis but keep the structure
          // Handle both 'factors' (Groq) and 'keyFactors' (Gemini) properties
          const aiFactors = Array.isArray(aiAnalysis.factors) 
            ? aiAnalysis.factors 
            : Array.isArray(aiAnalysis.keyFactors)
              ? aiAnalysis.keyFactors
              : [];
          
          console.log('🔍 [Risk Assessment] AI Factors:', aiFactors.length, 'factors found');
          
          finalAssessment = {
            ...assessment,
            overallRisk: aiAnalysis.riskScore || assessment.overallRisk,
            riskLevel: aiAnalysis.riskLevel || assessment.riskLevel,
            confidence: aiAnalysis.confidence || 0.85,
            // Merge factors from both AI and rule-based
            factors: [
              ...(aiFactors.length > 0 ? aiFactors.map((f: any) => ({
                name: f.factor || f.name || 'Unknown Factor',
                category: f.category || 'environmental',
                impact: f.impact || 5,
                confidence: aiAnalysis.confidence || 0.85,
                evidence: 'high' as const,
                clinicalSource: 'AI Analysis',
                description: f.description || '',
                interventions: []
              })) : []),
              ...assessment.factors
            ].slice(0, 10), // Top 10 factors
            predictions: {
              next24h: aiAnalysis.predictions?.next24HourRisk || aiAnalysis.predictions?.next24h || assessment.predictions.next24h,
              next7days: aiAnalysis.predictions?.next7days || assessment.predictions.next7days,
              nextMonth: assessment.predictions.nextMonth
            },
            severity: {
              current: aiAnalysis.riskScore || assessment.severity.current,
              predicted: aiAnalysis.predictions?.next24HourRisk || aiAnalysis.predictions?.next7days || assessment.severity.predicted,
              trajectory: aiAnalysis.predictions?.trajectory || assessment.severity.trajectory
            }
          };
          finalConfidence = aiAnalysis.confidence || 0.85;
          finalReasoning = aiAnalysis.aiInsights || aiAnalysis.reasoning || 'AI-powered analysis';
        } else {
          console.log('🔄 [Risk Assessment] Using rule-based algorithm only');
        }

        // Generate AI-powered recommendations
        const aiContext = {
          riskAssessment: finalAssessment,
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

        // If AI provided recommendations, use those instead
        let finalRecommendations = aiResults.recommendations;
        if (aiAnalysis && aiAnalysis.recommendations && Array.isArray(aiAnalysis.recommendations)) {
          finalRecommendations = aiAnalysis.recommendations.map((rec: any, idx: number) => ({
            id: `ai_${Date.now()}_${idx}`,
            recommendation: typeof rec === 'string' ? rec : rec.recommendation,
            rationale: typeof rec === 'string' ? 'Based on AI analysis of your health data and environmental factors' : (rec.rationale || 'Based on current risk factors'),
            priority: typeof rec === 'string' ? 'medium' : (rec.priority || 'medium'),
            category: rec.category,
            evidence: 'grade_a' as const,
            confidence: aiAnalysis.confidence || 0.85,
            timeframe: 'immediate',
            contraindications: [],
            monitoring: []
          }));
        }

        if (isCancelled) return;

        const endTime = performance.now();

        // Update state
        setAdvancedAssessment(finalAssessment);
        setAiRecommendations(finalRecommendations);
        setTreatmentPlan(aiResults.treatmentPlan);
        setConfidence(finalConfidence);
        setReasoning(finalReasoning || aiResults.reasoning);
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
      } finally {
        setLoading(false); // Set loading to false when done
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
      lastUpdated: lastUpdatedRef.current,
      loading // Add loading state to return
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
    processingTime,
    loading
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