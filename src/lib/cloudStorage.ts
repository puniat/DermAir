// Cloud Storage Service using Supabase
// Supabase provides free PostgreSQL database + file storage
// Free tier: 500MB database + 1GB file storage + 5GB bandwidth

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseKey;
const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseKey!) : null;

interface CloudStorageConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

interface CloudUser {
  id: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

interface CloudProfile {
  id: string;
  user_id: string;
  skin_type?: string;
  age_range?: string;
  known_triggers?: string[];
  triggers: string[];
  severity_history: Array<{ date: string; severity: number; notes?: string }>;
  preferences: Record<string, unknown>;
  location?: { latitude: number; longitude: number; city?: string; country?: string };
  created_at: string;
  updated_at: string;
}

interface CloudCheckIn {
  id: string;
  user_id: string;
  date: string;
  itch_score: number;
  redness_score: number;
  triggers_today: string[];
  notes?: string;
  weather_data?: Record<string, unknown>;
  created_at: string;
}

interface CloudTrainingData {
  id: string;
  user_id: string;
  image_url: string;
  condition: string;
  metadata: Record<string, unknown>;
  is_verified: boolean;
  source: string;
  created_at: string;
}

class CloudStorageService {
  private supabase: SupabaseClient | null = null;
  private config: CloudStorageConfig | null = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    try {
      if (!isSupabaseConfigured) {
        console.warn(' Supabase not configured. Please set environment variables:');
        return false;
      }

      if (!supabase) {
        console.error(' Failed to create Supabase client');
        return false;
      }

      this.supabase = supabase;
      this.config = { 
        supabaseUrl: supabaseUrl!, 
        supabaseKey: supabaseKey! 
      };
      this.isInitialized = true;

      return true;
    } catch (error) {
      console.error('Failed to initialize cloud storage:', error);
      return false;
    }
  }

  private ensureInitialized(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Cloud storage not initialized. Call initialize() first.');
    }
    return this.supabase;
  }

  // User Management
  async createOrUpdateUser(userData: {
    id: string;
    email?: string;
  }): Promise<CloudUser | null> {
    try {
      const supabase = this.ensureInitialized();
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userData.id,
          email: userData.email,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to create/update user:', error);
      return null;
    }
  }

  // Profile Management  
  async saveProfile(profile: Record<string, unknown>): Promise<boolean> {
    try {
      const supabase = this.ensureInitialized();
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          user_id: profile.id, // Same as user ID in our case
          skin_type: profile.skin_type,
          age_range: profile.age_range,
          known_triggers: profile.known_triggers || [],
          triggers: profile.triggers || [],
          severity_history: profile.severityHistory || [],
          preferences: profile.preferences || {},
          location: profile.location || null,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to save profile:', error);
      return false;
    }
  }

  async getProfile(userId: string): Promise<Record<string, unknown> | null> {
    try {
      const supabase = this.ensureInitialized();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting profile:', error);
        return null;
      }

      // Transform cloud format back to local format
      return {
        id: data.id,
        email: data.email,
        skin_type: data.skin_type,
        age_range: data.age_range,
        known_triggers: data.known_triggers || [],
        triggers: data.triggers || [],
        severityHistory: data.severity_history || [],
        preferences: data.preferences || {},
        location: data.location || null,
        created_at: new Date(data.created_at),
        research_opt_in: data.research_opt_in || false
      };
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  }

  // Check-in Management
  async saveCheckIn(checkIn: Record<string, unknown>): Promise<boolean> {
    try {
      const supabase = this.ensureInitialized();
      const { error } = await supabase
        .from('checkins')
        .insert({
          id: checkIn.id,
          user_id: checkIn.user_id,
          date: checkIn.date,
          itch_score: checkIn.itch_score,
          redness_score: checkIn.redness_score,
          triggers_today: checkIn.triggers_today || [],
          notes: checkIn.notes || '',
          weather_data: checkIn.weather_data || {},
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving check-in:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to save check-in:', error);
      return false;
    }
  }

  async getCheckIns(userId: string): Promise<Record<string, unknown>[]> {
    try {
      const supabase = this.ensureInitialized();
      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error getting check-ins:', error);
        return [];
      }

      // Transform cloud format back to local format
      return data.map((checkIn: Record<string, unknown>) => ({
        id: checkIn.id,
        user_id: checkIn.user_id,
        date: new Date(checkIn.date as string),
        itch_score: checkIn.itch_score,
        redness_score: checkIn.redness_score,
        medication_used: false, // Legacy field
        notes: checkIn.notes,
        photo_url: undefined, // Legacy field
        weather_data: checkIn.weather_data,
        created_at: new Date(checkIn.created_at as string)
      }));
    } catch (error) {
      console.error('Failed to get check-ins:', error);
      return [];
    }
  }

  // Training Data Management  
  async saveTrainingData(trainingData: Record<string, unknown>): Promise<boolean> {
    try {
      const supabase = this.ensureInitialized();
      const { error } = await supabase
        .from('training_data')
        .insert({
          id: trainingData.id,
          user_id: trainingData.user_id || 'system',
          image_url: trainingData.image_url,
          condition: trainingData.condition,
          metadata: trainingData.metadata || {},
          is_verified: trainingData.is_verified || false,
          source: trainingData.source || 'user',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving training data:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to save training data:', error);
      return false;
    }
  }

  async getTrainingData(): Promise<Record<string, unknown>[]> {
    try {
      const supabase = this.ensureInitialized();
      const { data, error } = await supabase
        .from('training_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Limit for performance

      if (error) {
        console.error('Error getting training data:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Failed to get training data:', error);
      return [];
    }
  }

  // Data Migration Helpers
  async migrateLocalDataToCloud(localData: {
    profile?: Record<string, unknown>;
    checkIns?: Record<string, unknown>[];
    trainingData?: Record<string, unknown>[];
  }): Promise<boolean> {
    try {
      const supabase = this.ensureInitialized();
      let success = true;

      // Create/update user first
      if (localData.profile) {
        await this.createOrUpdateUser({
          id: localData.profile.id as string,
          email: localData.profile.email as string
        });

        // Migrate profile
        const profileSuccess = await this.saveProfile(localData.profile);
        if (!profileSuccess) success = false;
      }

      // Migrate check-ins
      if (localData.checkIns && localData.checkIns.length > 0) {
        for (const checkIn of localData.checkIns) {
          const checkInSuccess = await this.saveCheckIn(checkIn);
          if (!checkInSuccess) success = false;
        }
      }

      // Migrate training data
      if (localData.trainingData && localData.trainingData.length > 0) {
        for (const trainingItem of localData.trainingData) {
          const trainingSuccess = await this.saveTrainingData(trainingItem);
          if (!trainingSuccess) success = false;
        }
      }

      if (success) {
      } else {
        console.warn('Local data migration completed with some errors');
      }

      return success;
    } catch (error) {
      console.error('Failed to migrate local data:', error);
      return false;
    }
  }

  // Utility Methods
  isAvailable(): boolean {
    return !!isSupabaseConfigured && this.isInitialized;
  }

  async getStorageStats(): Promise<{ profiles: number; checkIns: number; totalImages: number } | null> {
    try {
      const supabase = this.ensureInitialized();
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        console.error('Error getting storage stats:', error);
        return null;
      }

      // This is a simplified version - you'd want more detailed stats
      return {
        profiles: 1,
        checkIns: 0,
        totalImages: 0
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const cloudStorageService = new CloudStorageService();
export default CloudStorageService;