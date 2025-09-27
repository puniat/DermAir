"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/types";

export function useDatabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User operations
  const createUser = async (profile: UserProfile): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUser = async (userId: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users?id=${userId}`);
      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // User not found
        }
        throw new Error(result.error || 'Failed to fetch user');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check-in operations
  const createCheckIn = async (userId: string, checkInData: any, weatherData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, checkInData, weatherData })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save check-in');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCheckIns = async (userId: string, days: number = 30) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/checkins?userId=${userId}&days=${days}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch check-ins');
      }

      return result.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTodaysCheckIn = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/checkins?userId=${userId}&date=${today}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch today\'s check-in');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Analytics operations
  const getAnalytics = async (userId: string, days: number = 30) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics?userId=${userId}&days=${days}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch analytics');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Migration helper - moves localStorage data to database
  const migrateFromLocalStorage = async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get profile from localStorage
      const profileData = localStorage.getItem('dermair-profile');
      if (profileData) {
        const profile = JSON.parse(profileData);
        profile.id = userId;
        
        // Try to create user (will fail if already exists, which is fine)
        await createUser(profile);
      }

      // Get check-ins from localStorage
      const checkInsData = localStorage.getItem('dermair-checkins');
      if (checkInsData) {
        const checkIns = JSON.parse(checkInsData);
        
        // Upload each check-in
        for (const checkIn of checkIns) {
          await createCheckIn(userId, {
            itch_score: checkIn.itch_score,
            redness_score: checkIn.redness_score,
            medication_used: checkIn.medication_used,
            notes: checkIn.notes || ''
          }, checkIn.weather_data);
        }
        
        // Clear localStorage after successful migration
        localStorage.removeItem('dermair-checkins');
        localStorage.removeItem('dermair-profile');
      }

      return true;
    } catch (err) {
      console.error('Migration error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createUser,
    getUser,
    updateUser,
    createCheckIn,
    getCheckIns,
    getTodaysCheckIn,
    getAnalytics,
    migrateFromLocalStorage
  };
}