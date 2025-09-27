"use client";

import { useState, useEffect } from "react";
import { notificationService } from "@/lib/notifications";

export interface NotificationPreferences {
  enabled: boolean;
  riskAlerts: boolean;
  dailyReminders: boolean;
  weatherBriefings: boolean;
  medicationReminders: boolean;
  reminderTime: string; // HH:MM format
  riskThreshold: "medium" | "high"; // Only alert for this level and above
}

const defaultPreferences: NotificationPreferences = {
  enabled: false,
  riskAlerts: true,
  dailyReminders: true,
  weatherBriefings: true,
  medicationReminders: false,
  reminderTime: "09:00",
  riskThreshold: "medium"
};

export function useNotifications() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("dermair-notifications");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      } catch (error) {
        console.error("Error parsing notification preferences:", error);
      }
    }
    
    // Check current permission status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      
      // Listen for permission changes
      const checkPermission = () => {
        setPermission(Notification.permission);
      };
      
      // Check permission every second to detect manual changes
      const interval = setInterval(checkPermission, 1000);
      
      setLoading(false);
      return () => clearInterval(interval);
    }
    
    setLoading(false);
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem("dermair-notifications", JSON.stringify(newPreferences));
  };

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    const granted = await notificationService.requestPermission();
    
    // Update permission state immediately
    const currentPermission = typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'default';
    setPermission(currentPermission);
    
    if (granted) {
      // Enable notifications in preferences
      const newPreferences = { ...preferences, enabled: true };
      savePreferences(newPreferences);
    }
    
    return granted;
  };

  // Send risk alert if conditions are met
  const checkAndSendRiskAlert = async (
    riskLevel: "low" | "medium" | "high", 
    riskScore: number, 
    factors: string[]
  ) => {
    if (!preferences.enabled || !preferences.riskAlerts || permission !== 'granted') {
      return;
    }

    // Only send if risk level meets threshold
    if (
      (preferences.riskThreshold === "high" && riskLevel !== "high") ||
      (preferences.riskThreshold === "medium" && riskLevel === "low")
    ) {
      return;
    }

    // Don't send for low risk
    if (riskLevel === "low") {
      return;
    }

    await notificationService.sendRiskAlert(riskLevel as 'medium' | 'high', riskScore, factors);
  };

  // Schedule daily reminder
  const scheduleDailyReminder = () => {
    if (!preferences.enabled || !preferences.dailyReminders || permission !== 'granted') {
      return;
    }

    // Clear any existing reminder
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      const existingReminder = localStorage.getItem('dermair-daily-reminder-timeout');
      if (existingReminder) {
        clearTimeout(parseInt(existingReminder));
      }
    }

    // Calculate time until next reminder
    const now = new Date();
    const [hours, minutes] = preferences.reminderTime.split(':').map(Number);
    
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    // If reminder time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    const timeoutId = setTimeout(async () => {
      await notificationService.sendDailyReminder();
      // Schedule next day's reminder
      scheduleDailyReminder();
    }, timeUntilReminder);

    // Store timeout ID for cleanup
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      localStorage.setItem('dermair-daily-reminder-timeout', timeoutId.toString());
    }
  };

  // Send morning weather briefing
  const sendWeatherBriefing = async (weather: { 
    temperature: number; 
    condition: string; 
    riskLevel: string; 
  }) => {
    if (!preferences.enabled || !preferences.weatherBriefings || permission !== 'granted') {
      return;
    }

    await notificationService.sendWeatherBriefing(weather);
  };

  // Send medication reminder
  const sendMedicationReminder = async (medicationName?: string) => {
    if (!preferences.enabled || !preferences.medicationReminders || permission !== 'granted') {
      return;
    }

    await notificationService.sendMedicationReminder(medicationName);
  };

  // Initialize daily reminders when preferences change
  useEffect(() => {
    if (preferences.enabled && preferences.dailyReminders && permission === 'granted') {
      scheduleDailyReminder();
    }
    
    return () => {
      // Cleanup timeout on unmount
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const existingReminder = localStorage.getItem('dermair-daily-reminder-timeout');
        if (existingReminder) {
          clearTimeout(parseInt(existingReminder));
          localStorage.removeItem('dermair-daily-reminder-timeout');
        }
      }
    };
  }, [preferences.enabled, preferences.dailyReminders, preferences.reminderTime, permission]);

  return {
    preferences,
    permission,
    loading,
    savePreferences,
    requestPermission,
    checkAndSendRiskAlert,
    sendWeatherBriefing,
    sendMedicationReminder,
    isAvailable: permission === 'granted' && preferences.enabled
  };
}