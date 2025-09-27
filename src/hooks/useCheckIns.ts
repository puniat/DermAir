"use client";

import { useState, useEffect } from "react";
import type { DailyLog } from "@/types";

export function useCheckIns() {
  const [checkIns, setCheckIns] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCheckIns = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem("dermair-checkins");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Sort by date, newest first
        const sorted = parsed.sort((a: DailyLog, b: DailyLog) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setCheckIns(sorted);
      } else {
        setCheckIns([]);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load check-ins");
      setCheckIns([]);
    } finally {
      setLoading(false);
    }
  };

  const addCheckIn = (checkIn: DailyLog) => {
    try {
      const existing = JSON.parse(localStorage.getItem("dermair-checkins") || "[]");
      const updated = [checkIn, ...existing];
      
      // Keep only last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recent = updated.filter(item => 
        new Date(item.created_at) > thirtyDaysAgo
      );
      
      localStorage.setItem("dermair-checkins", JSON.stringify(recent));
      loadCheckIns(); // Refresh the state
    } catch (err) {
      setError("Failed to save check-in");
    }
  };

  const getRecentCheckIns = (days: number = 7): DailyLog[] => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return checkIns.filter(checkIn => 
      new Date(checkIn.created_at) > cutoff
    );
  };

  const getTodaysCheckIn = (): DailyLog | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return checkIns.find(checkIn => {
      const checkInDate = new Date(checkIn.created_at);
      return checkInDate >= today && checkInDate < tomorrow;
    }) || null;
  };

  const getAverageScores = (days: number = 7) => {
    const recent = getRecentCheckIns(days);
    if (recent.length === 0) {
      return { avgItch: 0, avgRedness: 0 };
    }

    const totalItch = recent.reduce((sum, checkIn) => sum + checkIn.itch_score, 0);
    const totalRedness = recent.reduce((sum, checkIn) => sum + checkIn.redness_score, 0);

    return {
      avgItch: Math.round((totalItch / recent.length) * 10) / 10,
      avgRedness: Math.round((totalRedness / recent.length) * 10) / 10
    };
  };

  useEffect(() => {
    loadCheckIns();
  }, []);

  return {
    checkIns,
    loading,
    error,
    addCheckIn,
    getRecentCheckIns,
    getTodaysCheckIn,
    getAverageScores,
    refresh: loadCheckIns
  };
}