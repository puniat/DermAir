import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const trends = await db.getSymptomTrends(userId, days);
    
    // Get recent daily logs for more detailed analysis
    const recentLogs = await db.getDailyLogs(userId, days);
    
    // Calculate additional insights
    const weeklyData = [];
    const now = new Date();
    
    for (let i = 0; i < Math.min(4, Math.ceil(days / 7)); i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      
      const weekLogs = recentLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate < weekEnd;
      });
      
      if (weekLogs.length > 0) {
        const avgItch = weekLogs.reduce((sum, log) => sum + log.itch_score, 0) / weekLogs.length;
        const avgRedness = weekLogs.reduce((sum, log) => sum + log.redness_score, 0) / weekLogs.length;
        
        weeklyData.push({
          week: i + 1,
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          avgItch: Math.round(avgItch * 10) / 10,
          avgRedness: Math.round(avgRedness * 10) / 10,
          logCount: weekLogs.length,
          medicationUsed: weekLogs.filter(log => log.medication_used).length
        });
      }
    }
    
    // Calculate correlations with weather
    const weatherCorrelations = {
      temperature: { high_symptom_days: 0, total_high_temp_days: 0 },
      humidity: { high_symptom_days: 0, total_high_humidity_days: 0 },
      uv: { high_symptom_days: 0, total_high_uv_days: 0 },
      pollen: { high_symptom_days: 0, total_high_pollen_days: 0 }
    };
    
    recentLogs.forEach(log => {
      const totalSymptomScore = log.itch_score + log.redness_score;
      const isHighSymptomDay = totalSymptomScore >= 5; // Threshold for "high symptom day"
      
      if (log.weather_data) {
        // Temperature correlation (>25°C considered high)
        if (log.weather_data.temperature > 25) {
          weatherCorrelations.temperature.total_high_temp_days++;
          if (isHighSymptomDay) {
            weatherCorrelations.temperature.high_symptom_days++;
          }
        }
        
        // Humidity correlation (>70% considered high)
        if (log.weather_data.humidity > 70) {
          weatherCorrelations.humidity.total_high_humidity_days++;
          if (isHighSymptomDay) {
            weatherCorrelations.humidity.high_symptom_days++;
          }
        }
        
        // UV correlation (>6 considered high)
        if (log.weather_data.uv_index > 6) {
          weatherCorrelations.uv.total_high_uv_days++;
          if (isHighSymptomDay) {
            weatherCorrelations.uv.high_symptom_days++;
          }
        }
        
        // Pollen correlation (>6 considered high)
        if (log.weather_data.pollen_count?.overall > 6) {
          weatherCorrelations.pollen.total_high_pollen_days++;
          if (isHighSymptomDay) {
            weatherCorrelations.pollen.high_symptom_days++;
          }
        }
      }
    });
    
    // Calculate correlation percentages
    const correlationPercentages = {
      temperature: weatherCorrelations.temperature.total_high_temp_days > 0 
        ? Math.round((weatherCorrelations.temperature.high_symptom_days / weatherCorrelations.temperature.total_high_temp_days) * 100)
        : 0,
      humidity: weatherCorrelations.humidity.total_high_humidity_days > 0
        ? Math.round((weatherCorrelations.humidity.high_symptom_days / weatherCorrelations.humidity.total_high_humidity_days) * 100)
        : 0,
      uv: weatherCorrelations.uv.total_high_uv_days > 0
        ? Math.round((weatherCorrelations.uv.high_symptom_days / weatherCorrelations.uv.total_high_uv_days) * 100)
        : 0,
      pollen: weatherCorrelations.pollen.total_high_pollen_days > 0
        ? Math.round((weatherCorrelations.pollen.high_symptom_days / weatherCorrelations.pollen.total_high_pollen_days) * 100)
        : 0
    };

    const analytics = {
      overview: {
        ...trends,
        medicationUsageRate: trends.totalDays > 0 ? Math.round((trends.medicationDays / trends.totalDays) * 100) : 0
      },
      weeklyTrends: weeklyData.reverse(), // Show most recent first
      weatherCorrelations: correlationPercentages,
      recentActivity: recentLogs.slice(0, 10) // Last 10 entries
    };

    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    
    // Return empty analytics data if database is unavailable
    const emptyAnalytics = {
      trends: {
        avgItchScore: 0,
        avgRednessScore: 0,
        totalDays: 0,
        improvementRate: 0,
        triggerFrequency: {},
        medicationDays: 0,
        medicationUsageRate: 0
      },
      weeklyTrends: [],
      weatherCorrelations: {},
      recentActivity: []
    };
    
    return NextResponse.json({ success: true, data: emptyAnalytics });
  }
}