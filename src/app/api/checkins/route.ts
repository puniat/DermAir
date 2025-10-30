import { NextRequest, NextResponse } from 'next/server';
import { loadCheckIns } from '@/lib/services/firestore-data';
import type { DailyLog, DailyCheckInFormData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30');
    const date = searchParams.get('date');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get recent logs from Firestore
    const logs = await loadCheckIns(userId, days);
    
    if (date) {
      // Filter for specific date
      const specificDate = new Date(date);
      specificDate.setHours(0, 0, 0, 0);
      
      const log = logs.find(l => {
        const logDate = new Date(l.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === specificDate.getTime();
      });
      
      return NextResponse.json({ success: true, data: log || null });
    } else {
      return NextResponse.json({ success: true, data: logs });
    }
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, checkInData, weatherData } = body;

    if (!userId || !checkInData) {
      return NextResponse.json({ error: 'User ID and check-in data are required' }, { status: 400 });
    }

    // Create daily log
    const dailyLog: DailyLog = {
      id: `checkin_${userId}_${Date.now()}`,
      user_id: userId,
      date: new Date(),
      itch_score: checkInData.itch_score,
      redness_score: checkInData.redness_score,
      medication_used: checkInData.medication_used,
      notes: checkInData.notes || '',
      photo_url: checkInData.photo_url || undefined,
      weather_data: weatherData || {},
      created_at: new Date()
    };

    const { saveCheckIn } = await import('@/lib/services/firestore-data');
    await saveCheckIn(userId, dailyLog);
    
    return NextResponse.json({ success: true, data: dailyLog }, { status: 201 });
  } catch (error) {
    console.error('Error creating daily log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, logId, updates } = body;

    if (!userId || !logId || !updates) {
      return NextResponse.json({ error: 'User ID, Log ID and updates are required' }, { status: 400 });
    }

    const { updateCheckIn } = await import('@/lib/services/firestore-data');
    await updateCheckIn(userId, logId, updates);
    
    return NextResponse.json({ success: true, message: 'Daily log updated successfully' });
  } catch (error) {
    console.error('Error updating daily log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}