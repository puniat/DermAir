/**
 * Groq AI Client for DermAir
 * 
 * Uses Llama 3.1 70B for fast, intelligent risk assessment and personalized recommendations.
 * Free tier: 30 requests/minute, no credit card required
 * 
 * Get your free API key: https://console.groq.com/
 */

import Groq from 'groq-sdk';

interface RiskAnalysis {
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  factors: Array<{
    category: 'environmental' | 'physiological' | 'behavioral' | 'clinical';
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
  aiInsights: string;
  predictions: {
    nextHourRisk: number;
    next24HourRisk: number;
    peakRiskTime: string;
  };
}

interface AnalyzeRiskInput {
  weather: {
    temp: number;
    humidity: number;
    uv: number;
    aqi?: number;
    pollen?: number;
    conditions?: string;
  };
  userProfile: {
    skinType: string;
    severity: string;
    triggers: string[];
    location: string;
  };
  recentCheckIns: Array<{
    severity: number;
    symptoms: string[];
    triggers: string[];
    timestamp: string;
  }>;
  timeOfDay: string;
  season: string;
}

class GroqAIService {
  private groq: Groq | null = null;
  private model = 'llama-3.3-70b-versatile'; // Updated to current model

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GROQ_API_KEY || '';
    if (key) {
      this.groq = new Groq({ apiKey: key });
    }
  }

  /**
   * Analyze eczema risk using Groq's Llama 3.1 70B model
   */
  async analyzeRisk(input: AnalyzeRiskInput): Promise<RiskAnalysis> {
    if (!this.groq) {
      throw new Error('Groq API key not configured');
    }

    console.log('[Groq AI] Starting risk analysis...');
    console.log('[Groq AI] Weather:', input.weather);
    console.log('[Groq AI] User profile:', input.userProfile);
    console.log('[Groq AI] Recent check-ins:', input.recentCheckIns.length);

    const prompt = this.buildPrompt(input);

    try {
      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert dermatology AI assistant specializing in eczema (atopic dermatitis) risk assessment. 
Analyze environmental, physiological, behavioral, and clinical factors to provide personalized risk predictions and recommendations.
Always respond with valid JSON only, no markdown or explanations.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' }
      });

      const responseText = completion.choices[0]?.message?.content;
      console.log('[Groq AI] Raw response:', responseText);

      if (!responseText) {
        throw new Error('Empty response from Groq');
      }

      // Parse and validate response
      const analysis = JSON.parse(responseText);
      
      // Validate and normalize the response
      const validated = this.validateAndNormalizeResponse(analysis);
      
      console.log('[Groq AI] ✅ Analysis complete:', {
        riskScore: validated.riskScore,
        riskLevel: validated.riskLevel,
        factorsCount: validated.factors.length,
        recommendationsCount: validated.recommendations.length
      });

      return validated;

    } catch (error: any) {
      console.error('[Groq AI] ❌ Error:', error);
      console.error('[Groq AI] Error details:', {
        message: error.message,
        status: error.status,
        type: error.type
      });
      throw error;
    }
  }

  /**
   * Build comprehensive medical prompt for Groq
   */
  private buildPrompt(input: AnalyzeRiskInput): string {
    const { weather, userProfile, recentCheckIns, timeOfDay, season } = input;

    // Calculate recent trend
    const recentSeverities = recentCheckIns.map(c => c.severity);
    const avgRecent = recentSeverities.length > 0 
      ? recentSeverities.reduce((a, b) => a + b, 0) / recentSeverities.length 
      : 5;

    return `Analyze eczema flare risk for a patient with the following data:

**PATIENT PROFILE:**
- Skin Type: ${userProfile.skinType}
- Current Severity: ${userProfile.severity}
- Known Triggers: ${userProfile.triggers.join(', ') || 'None reported'}
- Location: ${userProfile.location}

**CURRENT CONDITIONS:**
- Time: ${timeOfDay} (${season})
- Temperature: ${weather.temp}°C
- Humidity: ${weather.humidity}%
- UV Index: ${weather.uv}
- Air Quality (AQI): ${weather.aqi || 'Unknown'}
- Pollen Count: ${weather.pollen || 'Unknown'}
- Weather: ${weather.conditions || 'Unknown'}

**RECENT HISTORY (Last 7 Days):**
- Check-ins: ${recentCheckIns.length}
- Average Severity: ${avgRecent.toFixed(1)}/10
- Recent Symptoms: ${this.extractRecentSymptoms(recentCheckIns)}
- Recent Triggers: ${this.extractRecentTriggers(recentCheckIns)}

**REQUIRED OUTPUT (JSON format only):**
Provide a comprehensive risk assessment with:

1. **riskScore** (0-10): Overall eczema flare risk
2. **riskLevel**: "Low", "Moderate", "High", or "Severe"
3. **factors**: Array of 8-12 specific risk factors with:
   - category: "environmental", "physiological", "behavioral", or "clinical"
   - factor: Brief name (2-4 words)
   - impact: Score 1-10
   - description: One sentence explanation
4. **recommendations**: Array of 4-6 actionable, personalized recommendations
5. **aiInsights**: 2-3 sentences of personalized medical insights
6. **predictions**:
   - nextHourRisk: Risk score for next hour (0-10)
   - next24HourRisk: Risk score for next 24 hours (0-10)
   - peakRiskTime: When risk will be highest (e.g., "Evening", "Tomorrow morning")

**IMPORTANT ANALYSIS GUIDELINES:**
- Consider ALL categories: environmental, physiological, behavioral, clinical
- Factor in circadian rhythm (skin barrier weakest at night)
- Account for cumulative stress from multiple triggers
- Humidity <30% or >70% increases risk significantly
- UV >6 and inflammation create compound risk
- Consider seasonal factors (${season})
- Analyze recent trend (${avgRecent > 6 ? 'worsening' : avgRecent > 4 ? 'stable' : 'improving'})

Respond ONLY with valid JSON, no markdown formatting.`;
  }

  /**
   * Extract recent symptoms summary
   */
  private extractRecentSymptoms(checkIns: AnalyzeRiskInput['recentCheckIns']): string {
    const allSymptoms = checkIns.flatMap(c => c.symptoms);
    const uniqueSymptoms = [...new Set(allSymptoms)];
    return uniqueSymptoms.slice(0, 5).join(', ') || 'None reported';
  }

  /**
   * Extract recent triggers summary
   */
  private extractRecentTriggers(checkIns: AnalyzeRiskInput['recentCheckIns']): string {
    const allTriggers = checkIns.flatMap(c => c.triggers);
    const uniqueTriggers = [...new Set(allTriggers)];
    return uniqueTriggers.slice(0, 5).join(', ') || 'None reported';
  }

  /**
   * Validate and normalize AI response
   */
  private validateAndNormalizeResponse(response: any): RiskAnalysis {
    // Ensure required fields exist with defaults
    const riskScore = Math.min(10, Math.max(0, response.riskScore || 5));
    
    let riskLevel: RiskAnalysis['riskLevel'] = 'Moderate';
    if (riskScore < 3) riskLevel = 'Low';
    else if (riskScore < 6) riskLevel = 'Moderate';
    else if (riskScore < 8) riskLevel = 'High';
    else riskLevel = 'Severe';

    // Ensure factors is an array with proper structure
    const factors = (response.factors || []).map((f: any) => ({
      category: f.category || 'environmental',
      factor: f.factor || 'Unknown factor',
      impact: Math.min(10, Math.max(1, f.impact || 5)),
      description: f.description || 'No description available'
    }));

    // Ensure recommendations is an array
    const recommendations = Array.isArray(response.recommendations) 
      ? response.recommendations 
      : ['Monitor skin condition closely', 'Stay hydrated', 'Avoid known triggers'];

    // Ensure predictions exist
    const predictions = {
      nextHourRisk: Math.min(10, Math.max(0, response.predictions?.nextHourRisk || riskScore)),
      next24HourRisk: Math.min(10, Math.max(0, response.predictions?.next24HourRisk || riskScore)),
      peakRiskTime: response.predictions?.peakRiskTime || 'Evening'
    };

    return {
      riskScore,
      riskLevel,
      factors,
      recommendations,
      aiInsights: response.aiInsights || 'Analysis based on current environmental and physiological factors.',
      predictions
    };
  }
}

// Export singleton instance
export const groqAI = new GroqAIService();

// Export for testing
export { GroqAIService };
export type { RiskAnalysis, AnalyzeRiskInput };
