"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/types";

export interface UserSession {
  userId: string;
  profile: UserProfile | null;
  isNewUser: boolean;
  lastActive: string;
  sessionId: string;
}

export function useUserSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const generateUserId = (): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const initializeSession = () => {
    try {
      setLoading(true);
      
      // Check for existing user session
      const existingSession = localStorage.getItem("dermair-user-session");
      const existingProfile = localStorage.getItem("dermair-profile");
      
      if (existingSession) {
        // Existing user returning
        const parsedSession = JSON.parse(existingSession);
        const profile = existingProfile ? JSON.parse(existingProfile) : null;
        
        const updatedSession: UserSession = {
          ...parsedSession,
          profile,
          lastActive: new Date().toISOString(),
          sessionId: generateSessionId(), // New session ID for this browser session
          isNewUser: false
        };
        
        // Update session in localStorage
        localStorage.setItem("dermair-user-session", JSON.stringify(updatedSession));
        setSession(updatedSession);
        
        console.log(`👋 Welcome back! User ID: ${updatedSession.userId}`);
      } else {
        // New user
        const newUserId = generateUserId();
        const newSession: UserSession = {
          userId: newUserId,
          profile: null,
          isNewUser: true,
          lastActive: new Date().toISOString(),
          sessionId: generateSessionId()
        };
        
        localStorage.setItem("dermair-user-session", JSON.stringify(newSession));
        setSession(newSession);
        
        console.log(`🆕 New user created! User ID: ${newUserId}`);
      }
    } catch (error) {
      console.error("Failed to initialize user session:", error);
      // Create fallback session
      const fallbackSession: UserSession = {
        userId: generateUserId(),
        profile: null,
        isNewUser: true,
        lastActive: new Date().toISOString(),
        sessionId: generateSessionId()
      };
      setSession(fallbackSession);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (profile: UserProfile) => {
    if (!session) return;

    try {
      // Update profile in localStorage
      localStorage.setItem("dermair-profile", JSON.stringify(profile));
      
      // Update session
      const updatedSession: UserSession = {
        ...session,
        profile,
        isNewUser: false,
        lastActive: new Date().toISOString()
      };
      
      localStorage.setItem("dermair-user-session", JSON.stringify(updatedSession));
      setSession(updatedSession);
      
      console.log(`✅ Profile updated for user ${session.userId}`);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const clearSession = () => {
    try {
      localStorage.removeItem("dermair-user-session");
      localStorage.removeItem("dermair-profile");
      localStorage.removeItem("dermair-checkins");
      localStorage.removeItem("dermair-notifications");
      localStorage.removeItem("dermair-training-data");
      localStorage.removeItem("dermair-training-data-timestamp");
      
      console.log("🗑️ User session cleared");
      
      // Create new session
      initializeSession();
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  };

  const getUserDataSummary = () => {
    if (!session) return null;

    try {
      const checkIns = localStorage.getItem("dermair-checkins");
      const notifications = localStorage.getItem("dermair-notifications");
      const trainingData = localStorage.getItem("dermair-training-data");
      
      return {
        userId: session.userId,
        hasProfile: !!session.profile,
        checkInsCount: checkIns ? JSON.parse(checkIns).length : 0,
        hasNotifications: !!notifications,
        hasTrainingData: !!trainingData,
        lastActive: session.lastActive,
        sessionId: session.sessionId
      };
    } catch (error) {
      console.error("Failed to get user data summary:", error);
      return null;
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
    getUserDataSummary,
    refresh: initializeSession
  };
}