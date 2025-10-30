import { NextRequest, NextResponse } from 'next/server';
import { getUserSummary } from '@/lib/services/firestore-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📊 [API] Fetching user summary for:', userId);

    const summary = await getUserSummary(userId);
    
    if (!summary) {
      console.log('❌ [API] User summary not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ [API] User summary generated:', summary);

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('❌ [API] Error fetching user summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
