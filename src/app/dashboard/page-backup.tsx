"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { useWeatherWithRefresh } from "@/hooks/useWeather";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useNotifications } from "@/hooks/useNotifications";
import { useRiskAssessment } from "@/hooks/useRiskAssessment";
import { useRiskAlerts } from "@/hooks/useRiskAlerts";
import { testApiKey } from "@/lib/api/weather";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { NotificationSettings } from "@/components/NotificationSettings";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import type { UserProfile, DailyCheckInFormData } from "@/types";

export default function DashboardPage() {
  // 1. ALL ROUTER AND STATE HOOKS FIRST
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // 2. ALL CUSTOM HOOKS IN CONSISTENT ORDER
  const weather = useWeatherWithRefresh(profile);
  const checkIns = useCheckIns();
  const notifications = useNotifications();
  
  // 3. DEPENDENT CALCULATIONS THAT DON'T INVOLVE HOOKS
  const recentCheckIns = checkIns.loading ? [] : checkIns.getRecentCheckIns(7);
  
  // 4. MORE CUSTOM HOOKS THAT DEPEND ON THE ABOVE
  const { riskScore, riskLevel, recommendations } = useRiskAssessment(
    weather.data, 
    profile, 
    recentCheckIns
  );

  // 5. HOOKS THAT NEED THE RISK ASSESSMENT RESULTS
  useRiskAlerts(weather.data, profile, riskLevel, riskScore, weather.loading, notifications);

  // 6. ALL useEffect HOOKS
  useEffect(() => {
    const savedProfile = localStorage.getItem("dermair-profile");
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile({
          id: "user-1",
          ...parsedProfile,
          created_at: new Date()
        });
      } catch (error) {
        console.error("Error parsing profile:", error);
        router.push("/onboarding");
      }
    } else {
      router.push("/onboarding");
    }
    setLoading(false);
  }, [router]);

  // TEST - simplified component to isolate hook issues
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No profile found. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>DermAIr Dashboard - Hooks Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Profile: {profile.id}</p>
              <p>Weather Loading: {weather.loading ? 'Yes' : 'No'}</p>
              <p>CheckIns Loading: {checkIns.loading ? 'Yes' : 'No'}</p>
              <p>Notifications Loading: {notifications.loading ? 'Yes' : 'No'}</p>
              <p>Risk Level: {riskLevel}</p>
              <p>Risk Score: {riskScore}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}