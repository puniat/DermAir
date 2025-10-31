"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedRiskDashboard } from "@/components/EnhancedRiskDashboard";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { NotificationSettings } from "@/components/NotificationSettings";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AILoadingProgress } from "@/components/AILoadingProgress";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserSession } from "@/hooks/useUserSession";
import { useWeather } from "@/hooks/useWeather";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useRiskAssessment } from "@/hooks/useRiskAssessment";
import { useAIModeStore } from "@/lib/stores/ai-mode";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import type { UserProfile, DailyCheckInFormData, DailyLog, WeatherData } from "@/types";
import { getUserProfile } from '@/lib/services/firestore-data';
import { Header } from "@/components/Header";

function DashboardContent() {
  const router = useRouter();
  const { session, loading: sessionLoading, updateProfile } = useUserSession();
  
  // State management
  const [profile, setProfile] = useState<UserProfile | null>(session?.profile || null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiLoadingProgress, setAiLoadingProgress] = useState(0);
  const [showAiLoading, setShowAiLoading] = useState(true); // Start with true to show on first load

  // AI Mode store - use global state instead of local state
  const { isAIModeEnabled: useAdvancedAI, toggleAIMode, enableAIMode } = useAIModeStore();
  const [aiProcessing, setAiProcessing] = useState(false);

  // AI Mode store
  const { isAIModeEnabled } = useAIModeStore();

  // Hooks - now safe to call since auth is guaranteed by wrapper
  const { data: weather, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useWeather(profile);
  const { checkIns, loading: checkInsLoading, addCheckIn, loadCheckInsFromFirestore } = useCheckIns();
  
  useEffect(() => {
    if (profile?.id) {
      loadCheckInsFromFirestore(profile.id);
    }
  }, [profile?.id]);
  
  // Memoize the recent check-ins to prevent infinite re-renders
  const recentCheckIns = useMemo(() => checkIns.slice(0, 14), [checkIns]);
  
  // Enhanced risk assessment with AI
  const riskAssessment = useRiskAssessment(
    weather, 
    profile, 
    recentCheckIns, // Use memoized array
    useAdvancedAI
  );

  useEffect(() => {
    const loadProfile = async () => {
      if (!sessionLoading) {
        if (!session) {
          router.push('/landing');
          return;
        }
        
        if (!session.profile && session.userId) {
          const firebaseProfile = await getUserProfile(session.userId);
          if (firebaseProfile) {
            setProfile(firebaseProfile);
            updateProfile(firebaseProfile);
          } else {
            router.push('/landing');
            return;
          }
        } else if (session.profile) {
          setProfile(session.profile);
        } else {
          router.push('/landing');
          return;
        }
        
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [session, sessionLoading, router, updateProfile]);

  // Track AI loading progress - Keep loading screen visible until everything is ready
  useEffect(() => {
    // Show loading if session is loading OR if we're waiting for initial data
    const isInitialLoad = loading || sessionLoading || !weather || !profile;
    const isAiLoading = riskAssessment.loading && useAdvancedAI;
    
    // Check if risk assessment has actual data (not just default values)
    const hasRiskData = riskAssessment.riskScore > 0 || 
                        (riskAssessment.recommendations && riskAssessment.recommendations.length > 0) ||
                        (riskAssessment.advancedAssessment !== null);
    
    if (isInitialLoad || isAiLoading) {
      setShowAiLoading(true);
      
      // Simulate progress (since we don't have real progress events from the API)
      const progressInterval = setInterval(() => {
        setAiLoadingProgress(prev => {
          if (prev >= 90) return 90; // Stop at 90% until actual completion
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    } else if (!isAiLoading && !isInitialLoad && showAiLoading && hasRiskData) {
      // Only hide loading screen when we have actual risk assessment data
      setAiLoadingProgress(100);
      setTimeout(() => {
        setShowAiLoading(false);
      }, 500); // Slightly longer delay to ensure smooth transition
    }
  }, [riskAssessment.loading, riskAssessment.riskScore, riskAssessment.recommendations, riskAssessment.advancedAssessment, useAdvancedAI, showAiLoading, loading, sessionLoading, weather, profile]);

  // Handlers
  const handleCheckInSubmit = async (data: DailyCheckInFormData) => {
    try {
      // Convert form data to DailyLog format
      const dailyLog: DailyLog = {
        id: `checkin_${Date.now()}`,
        user_id: profile?.id || 'anonymous',
        date: new Date(),
        itch_score: data.itch_score,
        redness_score: data.redness_score,
        medication_used: data.medication_used,
        notes: data.notes,
        photo_url: undefined, // Photo handling would be implemented separately
        weather_data: weather || {
          temperature: 20,
          humidity: 50,
          pressure: 1013,
          uv_index: 3,
          air_quality_index: 50,
          pollen_count: { tree: 0, grass: 0, weed: 0, overall: 0 },
          weather_condition: 'unknown',
          wind_speed: 0,
          timestamp: new Date()
        },
        created_at: new Date()
      };
      
      await addCheckIn(dailyLog);
      setShowCheckIn(false);
      toast.success("Check-in recorded successfully!");
      
      if (weather) {
        await refetchWeather();
      }
    } catch (error) {
      toast.error("Failed to record check-in. Please try again.");
    }
  };

  const handleRefreshData = async () => {
    try {
      toast.loading("Refreshing data...");
      await refetchWeather();
      toast.dismiss();
      toast.success("Data refreshed successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to refresh data");
    }
  };

  // Loading state - Show AI progress for all loading states
  if (loading || sessionLoading || showAiLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <AILoadingProgress isLoading={true} progress={aiLoadingProgress} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Profile Setup Required</h2>
              <p className="text-muted-foreground mb-4">
                Please complete your profile to access the AI-powered dashboard.
              </p>
              <Button onClick={() => router.push('/onboarding')}>
                Complete Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header 
        profile={profile}
        shouldShowAlert={(riskAssessment.riskLevel === 'high' || riskAssessment.riskLevel === 'severe')}
        onRefresh={handleRefreshData}
        onShowNotificationSettings={() => setShowNotificationSettings(true)}
        onShowAnalytics={() => setShowAnalytics(true)}
        onShowAccountSettings={() => router.push('/onboarding')}
        onShowCheckIn={() => setShowCheckIn(true)}
        hasTodaysCheckIn={false} // TODO: implement this check if needed
        riskAssessment={{
          confidence: riskAssessment.confidence || 0.79,
          processingTime: riskAssessment.processingTime || 18,
          isAdvancedMode: riskAssessment.isAdvancedMode || true
        }}
      />
      <div className="container mx-auto p-4 space-y-4">
        <Toaster />

        {/* Enhanced Risk Dashboard - Always Visible */}
        <EnhancedRiskDashboard 
          userProfile={profile}
          riskAssessment={riskAssessment}
          weather={weather}
          checkIns={checkIns}
          className="w-full"
          defaultTab={dashboardTab}
          onTabChange={setDashboardTab}
        />
      </div>

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <NotificationSettings
          onClose={() => setShowNotificationSettings(false)}
        />
      )}

      {/* Analytics Dashboard Modal */}
      {showAnalytics && profile && (
        <AnalyticsDashboard
          profile={profile}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Toaster for notifications */}
      <Toaster />

      {/* Daily Check-in Dialog */}
      {showCheckIn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <DailyCheckIn
              onSubmit={handleCheckInSubmit}
              onClose={() => setShowCheckIn(false)}
              weather={weather}
            />
          </div>
        </div>
      )}
    </div>
  );
}
// Wrap with authentication protection
export default function EnhancedDashboardPage() {
  return (
    <ProtectedRoute requireAuth={true} redirectTo="/landing">
      <DashboardContent />
    </ProtectedRoute>
  );
}
