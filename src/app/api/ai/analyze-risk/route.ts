/**
 * API Route: AI Risk Analysis with Groq (Llama 3.1 70B)
 * 
 * POST /api/ai/analyze-risk
 */

import { NextRequest, NextResponse } from 'next/server';
import { groqAI } from '@/lib/ai/groqClient';
import type { WeatherData, UserProfile, DailyLog } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RequestBody {
  weather: WeatherData;
  profile: UserProfile;
  recentLogs: DailyLog[];
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { weather, profile, recentLogs } = body;

    // Validate request
    if (!weather || !profile) {
      return NextResponse.json(
        { 
          error: 'Missing required data',
          message: 'Weather and profile data are required'
        },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Groq API key not configured',
          message: 'Please set GROQ_API_KEY in .env.local'
        },
        { status: 503 }
      );
    }

    const input = {
      weather: {
        temp: weather.temperature,
        humidity: weather.humidity,
        uv: weather.uv_index,
        aqi: weather.air_quality_index,
        pollen: weather.pollen_count.overall,
        conditions: weather.weather_condition
      },
      userProfile: {
        skinType: profile.skin_type || 'Unknown',
        severity: profile.severityHistory?.[0]?.severity || 'moderate',
        triggers: profile.triggers || [],
        location: typeof profile.location === 'object' ? profile.location.city : 'Unknown'
      },
      recentCheckIns: (recentLogs || []).map(log => ({
        severity: log.itch_score,
        symptoms: [], // Not in DailyLog schema
        triggers: [], // Not in DailyLog schema
        timestamp: log.date.toString()
      })),
      timeOfDay: new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening',
      season: ['Winter', 'Spring', 'Summer', 'Fall'][Math.floor((new Date().getMonth() + 1) / 3) % 4]
    };

    const startTime = Date.now();
    const analysis = await groqAI.analyzeRisk(input);
    const processingTime = Date.now() - startTime;

    if (!analysis) {
      return NextResponse.json(
        { 
          error: 'AI analysis failed',
          message: 'Groq returned no analysis. Check server logs for details.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
      processingTime,
      model: 'llama-3.1-70b-versatile',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to generate AI analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'AI Risk Analysis API',
    method: 'POST',
    model: 'Groq Llama 3.1 70B',
    status: 'operational'
  });
}
