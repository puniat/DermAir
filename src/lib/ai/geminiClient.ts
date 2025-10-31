/**
 * Google Gemini AI Client for DermAir
 * 
 * Uses Gemini 1.5 Flash for medical-grade risk assessment and personalized recommendations.
 * Free tier: 1500 requests/day, 15 RPM, 1M tokens context window
 * 
 * Get your free API key: https://aistudio.google.com/app/apikey
 */

import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { WeatherData, UserProfile, DailyLog } from '@/types';

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Safety settings for medical content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Model configuration
const modelConfig = {
  temperature: 0.7, // Balanced creativity/consistency for medical advice
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
};

interface GeminiRiskAnalysis {
  riskScore: number; // 0-100
  riskLevel: 'minimal' | 'low' | 'moderate' | 'high' | 'severe';
  confidence: number; // 0-1
  reasoning: string;
  keyFactors: Array<{
    name: string;
    category: 'environmental' | 'physiological' | 'behavioral' | 'clinical';
    impact: number;
    description: string;
  }>;
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: 'immediate' | 'preventive' | 'lifestyle' | 'medical';
    recommendation: string;
    rationale: string;
  }>;
  predictions: {
    next24h: number;
    next7days: number;
    trajectory: 'improving' | 'stable' | 'worsening';
  };
}

export class GeminiAIService {
  private model: GenerativeModel | null;

  constructor() {
    this.model = genAI ? genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-latest',
      safetySettings,
      generationConfig: modelConfig
    }) : null;
  }

  /**
   * Generate comprehensive risk assessment using Gemini AI
   */
  async analyzeRisk(
    weather: WeatherData,
    profile: UserProfile,
    recentLogs: DailyLog[]
  ): Promise<GeminiRiskAnalysis | null> {
    if (!this.model) {
      console.warn('Gemini API key not configured. Using fallback algorithm.');
      return null;
    }

    try {
      const prompt = this.buildRiskAnalysisPrompt(weather, profile, recentLogs);
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error(' [Gemini] Invalid JSON response. Full text:', text);
        throw new Error('Invalid JSON response from Gemini');
      }

      const analysis: GeminiRiskAnalysis = JSON.parse(jsonMatch[0]);
      
      return analysis;

    } catch (error) {
      console.error(' [Gemini] Error calling Gemini AI:', error);
      if (error instanceof Error) {
        console.error(' [Gemini] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      return null;
    }
  }

  /**
   * Generate personalized treatment recommendations
   */
  async generateTreatmentPlan(
    riskAnalysis: GeminiRiskAnalysis,
    profile: UserProfile,
    recentLogs: DailyLog[]
  ): Promise<string | null> {
    if (!this.model) {
      return null;
    }

    try {
      const prompt = this.buildTreatmentPrompt(riskAnalysis, profile, recentLogs);
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      
      return response.text();

    } catch (error) {
      console.error('Error generating treatment plan:', error);
      return null;
    }
  }

  /**
   * Build comprehensive risk analysis prompt
   */
  private buildRiskAnalysisPrompt(
    weather: WeatherData,
    profile: UserProfile,
    recentLogs: DailyLog[]
  ): string {
    // Calculate symptom trends
    const recentScores = recentLogs.slice(0, 7).map(log => ({
      date: log.date,
      itch: log.itch_score,
      redness: log.redness_score,
      total: log.itch_score + log.redness_score
    }));

    const avgSymptoms = recentScores.length > 0
      ? recentScores.reduce((sum, s) => sum + s.total, 0) / recentScores.length
      : 0;

    const prompt = `You are a medical AI assistant specializing in dermatology and eczema/atopic dermatitis management.

PATIENT PROFILE:
- Skin Type: ${profile.skin_type || 'unknown'}
- Known Triggers: ${(profile.triggers || []).join(', ') || 'none specified'}
- Location: ${profile.location?.city || 'unknown'}
- Age Range: ${profile.age_range || 'unknown'}

CURRENT ENVIRONMENTAL CONDITIONS:
- Temperature: ${weather.temperature}°C
- Humidity: ${weather.humidity}%
- Air Quality Index: ${weather.air_quality_index}
- UV Index: ${weather.uv_index}
- Pollen Count: Tree ${weather.pollen_count.tree}, Grass ${weather.pollen_count.grass}, Weed ${weather.pollen_count.weed}
- Weather: ${weather.weather_condition}

RECENT SYMPTOM HISTORY (Last 7 Days):
${recentScores.length > 0 ? recentScores.map(s => 
  `- ${s.date instanceof Date ? s.date.toLocaleDateString() : new Date(s.date).toLocaleDateString()}: Itch ${s.itch}/10, Redness ${s.redness}/10`
).join('\n') : '- No recent check-ins recorded'}
- Average Symptom Score: ${avgSymptoms.toFixed(1)}/20

MEDICATION USE (Recent):
${recentLogs.slice(0, 7).filter(log => log.medication_used).length} days with medication in last week

TASK:
Analyze the patient's eczema/dermatitis risk level considering:
1. Environmental factors (weather, air quality, allergens)
2. Physiological factors (symptom trends, skin barrier function)
3. Behavioral factors (medication compliance, trigger exposure)
4. Clinical factors (skin type, known triggers, history)

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no other text):

{
  "riskScore": <number 0-100>,
  "riskLevel": "<minimal|low|moderate|high|severe>",
  "confidence": <number 0-1>,
  "reasoning": "<2-3 sentence explanation of the risk assessment>",
  "keyFactors": [
    {
      "name": "<factor name>",
      "category": "<environmental|physiological|behavioral|clinical>",
      "impact": <number 0-100>,
      "description": "<brief explanation>"
    }
  ],
  "recommendations": [
    {
      "priority": "<critical|high|medium|low>",
      "category": "<immediate|preventive|lifestyle|medical>",
      "recommendation": "<specific actionable recommendation>",
      "rationale": "<why this recommendation is important>"
    }
  ],
  "predictions": {
    "next24h": <predicted risk score 0-100>,
    "next7days": <predicted risk score 0-100>,
    "trajectory": "<improving|stable|worsening>"
  }
}

Provide 5-8 key factors and 5-10 recommendations. Be specific, actionable, and evidence-based.`;

    return prompt;
  }

  /**
   * Build treatment plan prompt
   */
  private buildTreatmentPrompt(
    riskAnalysis: GeminiRiskAnalysis,
    profile: UserProfile,
    recentLogs: DailyLog[]
  ): string {
    const prompt = `Based on the following eczema risk assessment, create a personalized treatment plan:

RISK ASSESSMENT:
- Risk Level: ${riskAnalysis.riskLevel} (${riskAnalysis.riskScore}/100)
- Key Factors: ${riskAnalysis.keyFactors.map(f => f.name).join(', ')}
- Trajectory: ${riskAnalysis.predictions.trajectory}

PATIENT PROFILE:
- Skin Type: ${profile.skin_type}
- Known Triggers: ${(profile.triggers || []).join(', ')}

Create a comprehensive treatment plan including:
1. **Immediate Actions** (next 24-48 hours)
2. **Daily Skincare Routine**
3. **Lifestyle Modifications**
4. **When to Seek Medical Attention**
5. **Monitoring Guidelines**

Format the response as clear, actionable markdown with bullet points. Be specific and evidence-based.`;

    return prompt;
  }
}

// Export singleton instance
export const geminiAI = new GeminiAIService();
