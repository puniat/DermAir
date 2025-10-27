"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/types";

export interface UserSession {
  userId: string;
  username: string;
  profile: UserProfile | null;
  isNewUser: boolean;
  lastActive: string;
}

export function useUserSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const generateUserId = (): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const initializeSession = (username?: string, existingUserId?: string) => {
    try {
      setLoading(true);
      
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.log('[useUserSession] SSR environment, skipping initialization');
        setLoading(false);
        return;
      }
      
      // Try to get stored userId from localStorage
      const storedUserId = existingUserId || localStorage.getItem('dermair_userId');
      const userId = storedUserId || generateUserId();
      
      console.log('[useUserSession] Initializing session:', { 
        storedUserId: !!storedUserId, 
        userId, 
        username,
        existingUserId 
      });
      
      // Store userId in localStorage for persistence
      if (!storedUserId) {
        localStorage.setItem('dermair_userId', userId);
        console.log('[useUserSession] Stored new userId in localStorage:', userId);
      } else {
        console.log('[useUserSession] Using existing userId from localStorage:', userId);
      }
      
      const newSession: UserSession = {
        userId,
        username: username || '',
        profile: null,
        isNewUser: !storedUserId,
        lastActive: new Date().toISOString(),
      };
      
      setSession(newSession);
      console.log(`${storedUserId ? '👋 Welcome back' : '🆕 New user'}! User ID: ${userId}, Username: ${username || 'not set'}`);
    } catch (error) {
      console.error("Failed to initialize user session:", error);
      // Create fallback session
      const fallbackSession: UserSession = {
        userId: generateUserId(),
        username: username || '',
        profile: null,
        isNewUser: true,
        lastActive: new Date().toISOString(),
      };
      setSession(fallbackSession);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (profile: UserProfile) => {
    if (!session) return;

    try {
      // Update session with profile
      const updatedSession: UserSession = {
        ...session,
        profile,
        isNewUser: false,
        lastActive: new Date().toISOString()
      };
      
      setSession(updatedSession);
      console.log(`✅ Profile updated for user ${session.userId}`);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const clearSession = () => {
    try {
      setSession(null);
      // Clear userId from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dermair_userId');
      }
      console.log("🗑️ User session cleared");
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  };

  useEffect(() => {
    initializeSession();
  }, []);

  return {
    session,
    loading,
    updateProfile,
    clearSession,
    initializeSession,
    refresh: initializeSession
  };
}