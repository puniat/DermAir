// Firestore data functions for DermAir
import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import type { UserProfile, DailyLog } from '@/types';

// --- Helper function to check if a value is a Firestore Timestamp ---
function isFirestoreTimestamp(val: any): val is Timestamp {
  return val && typeof val === 'object' && typeof val.toDate === 'function';
}

// --- User Profile ---
export async function saveUserProfile(profile: UserProfile) {
  const ref = doc(db, 'profiles', profile.id);
  
  // Convert severityHistory.date to Firestore Timestamp
  const severityHistory = (profile.severityHistory || []).map(entry => ({
    severity: entry.severity,
    date: isFirestoreTimestamp(entry.date)
      ? entry.date
      : Timestamp.fromDate(new Date(entry.date ?? Date.now()))
  }));

  const data: Record<string, any> = {
    id: profile.id,
    email: profile.email || '',
    known_triggers: profile.known_triggers || [],
    triggers: profile.triggers || [],
    severityHistory,
    preferences: profile.preferences || { notifications: true, riskThreshold: 'moderate' },
    location: profile.location || null,
    created_at: isFirestoreTimestamp(profile.created_at)
      ? profile.created_at
      : Timestamp.fromDate(new Date(profile.created_at ?? Date.now())),
    research_opt_in: profile.research_opt_in || false,
    updated_at: Timestamp.now(),
  };
  
  // Add optional fields only if defined
  if (profile.age_range) data.age_range = profile.age_range;
  if (profile.skin_type) data.skin_type = profile.skin_type;

  try {
    console.log('🔄 Attempting to save profile to Firestore...', {
      profileId: profile.id,
      collection: 'profiles',
      dataKeys: Object.keys(data)
    });
    await setDoc(ref, data, { merge: true });
    console.log('✅ Profile saved to Firestore:', profile.id);
  } catch (error: any) {
    console.error('❌ Firestore save error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      details: error.details,
      stack: error.stack,
      profileId: profile.id,
      dataKeys: Object.keys(data),
      fullError: error
    });
    throw error;
  }
}

export async function loadUserProfile(profileId: string): Promise<UserProfile | null> {
  const ref = doc(db, 'profiles', profileId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  
  // Convert severityHistory Timestamps back to ISO strings
  const severityHistory = (data.severityHistory || []).map((entry: any) => ({
    severity: entry.severity,
    date: entry.date?.toDate ? entry.date.toDate().toISOString() : entry.date
  }));
  
  return {
    id: data.id || profileId,
    email: data.email || '',
    age_range: data.age_range,
    skin_type: data.skin_type,
    known_triggers: data.known_triggers || [],
    triggers: data.triggers || [],
    severityHistory,
    preferences: data.preferences || { notifications: true, riskThreshold: 'moderate' },
    location: data.location || undefined,
    created_at: data.created_at?.toDate?.() || new Date(),
    research_opt_in: data.research_opt_in || false,
  } as UserProfile;
}

// --- Daily Check-Ins ---
export async function saveCheckIn(profileId: string, checkIn: DailyLog) {
  const ref = collection(db, 'profiles', profileId, 'checkins');
  
  // Prepare data for Firestore - remove undefined values
  const checkInData: Record<string, any> = {
    id: checkIn.id,
    user_id: checkIn.user_id,
    date: checkIn.date instanceof Date ? Timestamp.fromDate(checkIn.date) : Timestamp.fromDate(new Date(checkIn.date)),
    itch_score: checkIn.itch_score,
    redness_score: checkIn.redness_score,
    medication_used: checkIn.medication_used,
    weather_data: checkIn.weather_data || {},
    created_at: Timestamp.now(),
  };
  
  // Only add optional fields if they exist
  if (checkIn.notes) checkInData.notes = checkIn.notes;
  if (checkIn.photo_url) checkInData.photo_url = checkIn.photo_url;
  
  await addDoc(ref, checkInData);
}

export async function loadCheckIns(profileId: string, max: number = 30): Promise<DailyLog[]> {
  const ref = collection(db, 'profiles', profileId, 'checkins');
  const q = query(ref, orderBy('date', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: data.id || docSnap.id,
      user_id: data.user_id,
      date: data.date?.toDate?.() || new Date(),
      itch_score: data.itch_score || 0,
      redness_score: data.redness_score || 0,
      medication_used: data.medication_used || false,
      notes: data.notes,
      photo_url: data.photo_url,
      weather_data: data.weather_data || {},
      created_at: data.created_at?.toDate?.() || new Date(),
    } as DailyLog;
  });
}
