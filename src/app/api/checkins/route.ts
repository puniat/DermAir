import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
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

    if (date) {
      // Get specific date
      const specificDate = new Date(date);
      const log = await db.getDailyLogByDate(userId, specificDate);
      return NextResponse.json({ success: true, data: log });
    } else {
      // Get recent logs
      const logs = await db.getDailyLogs(userId, days);
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
    const dailyLog: Omit<DailyLog, 'created_at'> = {
      id: `checkin_${userId}_${Date.now()}`,
      user_id: userId,
      date: new Date(),
      itch_score: checkInData.itch_score,
      redness_score: checkInData.redness_score,
      medication_used: checkInData.medication_used,
      notes: checkInData.notes || '',
      photo_url: checkInData.photo_url || undefined,
      weather_data: weatherData || {}
    };

    const createdLog = await db.createDailyLog(dailyLog);
    return NextResponse.json({ success: true, data: createdLog }, { status: 201 });
  } catch (error) {
    console.error('Error creating daily log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { logId, updates } = body;

    if (!logId || !updates) {
      return NextResponse.json({ error: 'Log ID and updates are required' }, { status: 400 });
    }

    await db.updateDailyLog(logId, updates);
    return NextResponse.json({ success: true, message: 'Daily log updated successfully' });
  } catch (error) {
    console.error('Error updating daily log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}