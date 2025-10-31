// Firestore data functions for DermAir
import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import type { UserProfile, DailyLog } from '@/types';

// --- Helper function to check if a value is a Firestore Timestamp ---
function isFirestoreTimestamp(val: any): val is Timestamp {
  return val && typeof val === 'object' && typeof val.toDate === 'function';
}

// --- Username Management ---
export async function checkUsernameExists(username: string): Promise<boolean> {
  try {
    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, where('username', '==', username.toLowerCase()));
    const snapshot = await getDocs(q);
    

    return !snapshot.empty;
  } catch (error: any) {
    console.error('Error checking username:', error);
    return false;
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);
    

    return !snapshot.empty;
  } catch (error: any) {
    console.error('Error checking email:', error);
    return false;
  }
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  try {
    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, where('username', '==', username.toLowerCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {

      return null;
    }
    
    const data = snapshot.docs[0].data();

    
    // Convert Firestore data back to UserProfile type
    const profile: UserProfile = {
      id: data.id,
      username: data.username || '',
      email: data.email || '',
      pin: data.pin || null,
      age_range: data.age_range,
      skin_type: data.skin_type,
      location: data.location,
      known_triggers: data.known_triggers || [],
      triggers: data.triggers || [],
      severityHistory: (data.severityHistory || []).map((entry: any) => ({
        severity: entry.severity,
        date: isFirestoreTimestamp(entry.date) ? entry.date.toDate() : new Date(entry.date)
      })),
      preferences: data.preferences || { notifications: true, riskThreshold: 'moderate' },
      research_opt_in: data.research_opt_in || false,
      created_at: isFirestoreTimestamp(data.created_at) ? data.created_at.toDate() : new Date(data.created_at),
    };
    
    return profile;
  } catch (error: any) {
    console.error(' Error getting user by username:', error);
    return null;
  }
}

// --- User Summary (for returning users) ---
export async function getUserSummary(userId: string): Promise<{
  username: string;
  displayName: string;
  lastActive: Date;
  checkInsCount: number;
  currentRiskLevel: 'low' | 'medium' | 'high' | 'severe';
  streakDays: number;
} | null> {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {

      return null;
    }

    let checkInsCount = 0;
    let streakDays = 0;

    try {
      // Get check-ins count (may not exist for new users)
      const checkInsRef = collection(db, 'profiles', userId, 'checkins');
      
      const checkInsSnapshot = await getDocs(checkInsRef);
      checkInsCount = checkInsSnapshot.size;

      // Calculate streak days (consecutive days with check-ins)
      if (checkInsCount > 0) {
        const checkInDates = checkInsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            return data.date?.toDate?.() || new Date(data.date);
          })
          .sort((a, b) => b.getTime() - a.getTime());


        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const currentDate = new Date(today);
        for (const checkInDate of checkInDates) {
          const checkDate = new Date(checkInDate);
          checkDate.setHours(0, 0, 0, 0);
          
          if (checkDate.getTime() === currentDate.getTime()) {
            streakDays++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    } catch (checkInsError) {
      console.error('Error loading check-ins:', checkInsError);
      // Continue with checkInsCount = 0 and streakDays = 0
    }

    // Get most recent severity (simplified risk level)
    let currentRiskLevel: 'low' | 'medium' | 'high' | 'severe' = 'low';
    if (profile.severityHistory && profile.severityHistory.length > 0) {
      const latestSeverity = profile.severityHistory[profile.severityHistory.length - 1];
      currentRiskLevel = latestSeverity.severity === 'severe' ? 'severe' :
                        latestSeverity.severity === 'moderate' ? 'medium' : 'low';
    }

    const summary = {
      username: profile.username || '',
      displayName: profile.username || 'User',
      lastActive: profile.created_at || new Date(),
      checkInsCount,
      currentRiskLevel,
      streakDays
    };

    return summary;
  } catch (error: any) {
    console.error('Error getting user summary:', error);
    // Return null to indicate failure
    return null;
  }
}

// --- User Profile ---
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const ref = doc(db, 'profiles', userId);
    const snapshot = await getDoc(ref);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    
    // Convert Firestore data back to UserProfile type
    const profile: UserProfile = {
      id: data.id,
      username: data.username || '',
      email: data.email || '',
      age_range: data.age_range,
      skin_type: data.skin_type,
      location: data.location,
      known_triggers: data.known_triggers || [],
      triggers: data.triggers || [],
      severityHistory: (data.severityHistory || []).map((entry: any) => ({
        severity: entry.severity,
        date: isFirestoreTimestamp(entry.date) ? entry.date.toDate() : new Date(entry.date)
      })),
      preferences: data.preferences || { notifications: true, riskThreshold: 'moderate' },
      research_opt_in: data.research_opt_in || false,
      created_at: isFirestoreTimestamp(data.created_at) ? data.created_at.toDate() : new Date(data.created_at),
    };
    
    return profile;
  } catch (error: any) {
    console.error('Error loading profile from Firestore:', {
      userId,
      message: error.message,
      code: error.code
    });
    return null;
  }
}

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
    username: (profile.username || '').toLowerCase(), // Store username in lowercase for consistency
    email: profile.email ? profile.email.toLowerCase() : null, // Store email in lowercase, null if not provided
    pin: profile.pin || null, // Store hashed PIN for authentication
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

    await setDoc(ref, data, { merge: true });

  } catch (error: any) {
    console.error('Firestore save error:', {
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

export async function updateCheckIn(profileId: string, checkInId: string, updates: Partial<DailyLog>) {
  const checkInsRef = collection(db, 'profiles', profileId, 'checkins');
  const q = query(checkInsRef, where('id', '==', checkInId), limit(1));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    throw new Error('Check-in not found');
  }
  
  const docRef = snap.docs[0].ref;
  
  // Prepare update data
  const updateData: Record<string, any> = {};
  if (updates.itch_score !== undefined) updateData.itch_score = updates.itch_score;
  if (updates.redness_score !== undefined) updateData.redness_score = updates.redness_score;
  if (updates.medication_used !== undefined) updateData.medication_used = updates.medication_used;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.photo_url !== undefined) updateData.photo_url = updates.photo_url;
  if (updates.weather_data !== undefined) updateData.weather_data = updates.weather_data;
  
  await updateDoc(docRef, updateData);
}

