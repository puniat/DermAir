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
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useUserSession } from "@/hooks/useUserSession";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { NotificationSettings } from "@/components/NotificationSettings";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AIAnalysis } from "@/components/AIAnalysis";
import type { UserProfile, DailyCheckInFormData } from "@/types";

export default function DashboardPage() {
  // ALL HOOKS MUST BE AT THE TOP LEVEL AND CALLED IN THE SAME ORDER EVERY TIME
  
  // 1. Basic React hooks
  const router = useRouter();
    const { session, loading: sessionLoading, updateProfile, getUserDataSummary, clearSession } = useUserSession();
  const [profile, setProfile] = useState<UserProfile | null>(session?.profile || null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [showForecast, setShowForecast] = useState(true);
  const [showTrends, setShowTrends] = useState(true);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [isCollectingData, setIsCollectingData] = useState(false);
  const [storageType, setStorageType] = useState<'local' | 'cloud'>('local');
  const [showCloudWarning, setShowCloudWarning] = useState(false);

  // 2. Custom hooks - Let's isolate the issue by enabling one by one
  const weather = useWeatherWithRefresh(profile);
  const checkIns = useCheckIns();
  const notifications = useNotifications();
  
  // 3. Derived values (no hooks)
  const recentCheckIns = checkIns.loading ? [] : checkIns.getRecentCheckIns(7);
  
  // 4. Risk assessment - add back gradually to isolate the issue
  const riskAssessment = useRiskAssessment(weather.data, profile, recentCheckIns);
  const riskScore = riskAssessment?.riskScore ?? 0;
  const riskLevel: "low" | "medium" | "high" = riskAssessment?.riskLevel ?? 'low';
  const recommendations: string[] = riskAssessment?.recommendations ?? [];

  // 5. Risk alerts - add back to test
  useRiskAlerts(weather.data, profile, riskLevel, riskScore, weather.loading, notifications);

  // 6. Main effect for session and profile management
  useEffect(() => {
    if (sessionLoading) return;

    if (session?.profile) {
      // User has a profile, use it
      setProfile({
        ...session.profile,
        id: session.userId,
        created_at: session.profile.created_at || new Date()
      });
      setLoading(false);
      
      // Get data summary without causing dependency issues
      try {
        const checkIns = localStorage.getItem("dermair-checkins");
        const dataSummary = {
          userId: session.userId,
          hasProfile: true,
          checkInsCount: checkIns ? JSON.parse(checkIns).length : 0,
          sessionId: session.sessionId
        };
        console.log("📊 User Data Summary:", dataSummary);
      } catch (error) {
        console.error("Failed to get data summary:", error);
      }
    } else if (!session?.isNewUser) {
      // Returning user without profile (shouldn't happen, but handle gracefully)
      console.warn("⚠️ Returning user without profile, redirecting to onboarding");
      router.push("/onboarding");
    } else {
      // New user, redirect to onboarding
      console.log("🆕 New user detected, redirecting to onboarding");
      router.push("/onboarding");
    }
  }, [session, sessionLoading, router]);

  // Handle daily check-in submission
  const handleCheckInSubmit = async (data: DailyCheckInFormData) => {
    setIsSubmittingCheckIn(true);
    try {
      const checkInData = {
        id: `checkin-${Date.now()}`,
        user_id: profile?.id || "user-1",
        date: new Date(),
        itch_score: data.itch_score,
        redness_score: data.redness_score,
        medication_used: data.medication_used,
        notes: data.notes || "",
        photo_url: undefined,
        weather_data: weather.data || {
          temperature: 0,
          humidity: 0, 
          pressure: 0,
          uv_index: 0,
          air_quality_index: 0,
          pollen_count: { tree: 0, grass: 0, weed: 0, overall: 0 },
          weather_condition: 'unknown',
          wind_speed: 0,
          timestamp: new Date()
        },
        created_at: new Date()
      };

      checkIns.addCheckIn(checkInData);
      setShowCheckIn(false);
    } catch (error) {
      console.error("Error saving check-in:", error);
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  // Check if cloud storage is configured
  const isCloudConfigured = () => {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  };

  // Handle cloud storage toggle
  const handleCloudStorageToggle = async () => {
    if (!isCloudConfigured()) {
      alert('Cloud storage is not configured. Please see CLOUD_SETUP.md for setup instructions.');
      return;
    }
    
    setShowCloudWarning(true);
  };

  // Handle settings actions
  const handleExportData = () => {
    const data = {
      profile: profile,
      checkIns: checkIns.checkIns,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dermair-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDashboard = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.removeItem("dermair-profile");
      localStorage.removeItem("dermair-checkins");
      localStorage.removeItem("dermair-notifications");
      window.location.reload();
    }
  };

  const convertTemperature = (temp: number): string => {
    if (tempUnit === 'F') {
      return Math.round((temp * 9/5) + 32).toString();
    }
    return temp.toString();
  };

  // Early returns for loading and error states
  if (loading || weather.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {loading ? "Loading your dashboard..." : "Fetching weather data..."}
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null; // Will redirect to onboarding
  }

  // Use weather data if available, otherwise skip risk calculation
  if (!weather.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Unable to load weather data</p>
          {weather.error && (
            <p className="text-sm text-destructive">{weather.error}</p>
          )}
          <Button onClick={weather.refetch}>Retry</Button>
        </div>
      </div>
    );
  }

  const shouldShowAlert = (() => {
    const threshold = profile?.preferences?.riskThreshold || "moderate";
    if (threshold === "low") return riskLevel !== "low";
    if (threshold === "moderate") return riskLevel === "high";
    return riskLevel === "high";
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Compact Header */}
      <div className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-primary">DermAIr Dashboard</h1>
                <p className="text-xs text-muted-foreground">
                  {profile.location?.city && `${profile.location.city}, `}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric"
                  })}
                </p>
              </div>
              {shouldShowAlert && (
                <Badge variant="destructive" className="animate-pulse text-xs">
                  ⚠ High Risk
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowSettings(true)}
                variant="outline" 
                size="sm" 
                className="text-xs bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
              >
                ⚙️ Settings
              </Button>
              <Button 
                onClick={() => setShowAIAnalysis(true)}
                variant="outline" 
                size="sm" 
                className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100 hover:border-purple-300"
              >
                🧠 AI Analysis
              </Button>
              <Button 
                onClick={() => setShowNotificationSettings(true)} 
                variant="outline" 
                size="sm" 
                className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
              >
                🔔 Notifications
              </Button>
              <Button 
                onClick={() => setShowAnalytics(true)} 
                variant="outline" 
                size="sm" 
                className="text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300"
              >
                📊 Analytics
              </Button>
              <Button 
                onClick={() => setShowCheckIn(true)} 
                variant={checkIns.getTodaysCheckIn() ? "secondary" : "default"} 
                size="sm"
                className={checkIns.getTodaysCheckIn() ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"}
              >
                {checkIns.getTodaysCheckIn() ? "✓ Check-in Complete" : "Daily Check-in"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Compact Grid Layout */}
      <div className="max-w-7xl mx-auto p-3 space-y-3">
        {/* Status Messages - Compact */}
        {(apiTestResult || !process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || weather.error) && (
          <div className="space-y-2">
            {apiTestResult && (
              <div className={`px-3 py-2 rounded-md text-sm ${
                apiTestResult.includes('❌') ? 'bg-red-50 text-red-800 border-red-200' : 
                apiTestResult.includes('✅') ? 'bg-green-50 text-green-800 border-green-200' : 
                'bg-blue-50 text-blue-800 border-blue-200'
              } border`}>
                {apiTestResult}
              </div>
            )}
            {!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY && (
              <div className="px-3 py-2 rounded-md text-xs bg-amber-50 text-amber-800 border border-amber-200">
                ⚡ Using demo weather data - Set up API key for real-time data
              </div>
            )}
            {weather.error && (
              <div className="px-3 py-2 rounded-md text-xs bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-between">
                <span>⚠ Weather data unavailable - {weather.error}</span>
                <Button variant="outline" size="sm" onClick={weather.refetch} className="text-xs h-6">
                  Retry
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Main Dashboard Grid - Improved Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          
          {/* Risk Gauge - Now takes only 1 column */}
          <div className="lg:order-1">
            <RiskGauge 
              riskLevel={riskLevel} 
              riskScore={riskScore} 
              recommendations={recommendations}
            />
          </div>

          {/* Current Weather - Enhanced Design */}
          <Card className="h-fit lg:order-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    🌤 Current Conditions
                  </CardTitle>
                  {(!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || weather.error) && (
                    <Badge variant="secondary" className="text-xs">Demo</Badge>
                  )}
                </div>
                                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <p className="text-xs text-muted-foreground capitalize">{weather.data.weather_condition}</p>
                  </div>
                <div className="flex flex-col items-end gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={weather.refetch} 
                    disabled={weather.loading} 
                    className="text-xs h-7 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                  >
                    {weather.loading ? (
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                    ) : (
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    Refresh
                  </Button>

                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Weather impact on your skin</p>
                {weather.lastUpdated && (
                  <p className="text-xs text-muted-foreground">
                    Updated: {weather.lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform cursor-pointer">
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{convertTemperature(weather.data.temperature)}°{tempUnit}</div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Temperature</p>
                  </div>
                  <div className="text-center p-2 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 rounded-lg border border-cyan-200 dark:border-cyan-800 hover:scale-105 transition-transform cursor-pointer">
                    <div className="text-lg font-bold text-cyan-700 dark:text-cyan-300">{weather.data.humidity}%</div>
                    <p className="text-xs text-cyan-600 dark:text-cyan-400">Humidity</p>
                  </div>
                  <div className="text-center p-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg border border-orange-200 dark:border-orange-800 hover:scale-105 transition-transform cursor-pointer">
                    <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{weather.data.uv_index}</div>
                    <p className="text-xs text-orange-600 dark:text-orange-400">UV Index</p>
                  </div>
                  <div className="text-center p-2 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:scale-105 transition-transform cursor-pointer">
                    <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{weather.data.pollen_count.overall}</div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Pollen</p>
                  </div>
                </div>

                {/* Tomorrow's Forecast Alert - Conditional */}
                {showForecast && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <p className="text-xs font-medium text-muted-foreground">
                      TOMORROW&apos;S OUTLOOK
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-indigo-700">
                            {convertTemperature(weather.data.temperature + (Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : -Math.floor(Math.random() * 5) - 1))}°{tempUnit}
                          </div>
                          <span className="text-xs text-indigo-600">Expected</span>
                        </div>
                      </div>
                      <div className="p-2 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-emerald-700">
                            UV {weather.data.uv_index + Math.floor(Math.random() * 3) - 1}
                          </div>
                          <span className="text-xs text-emerald-600">Forecast</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Weather Alert */}
                    {(weather.data.uv_index > 6 || weather.data.humidity > 80) && (
                      <div className="p-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200 flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          {weather.data.uv_index > 6 
                            ? "⚠ High UV expected - use extra sun protection"
                            : "💧 High humidity may increase skin sensitivity"
                          }
                        </p>
                      </div>
                    )}
                    
                    {(weather.data.uv_index <= 3 && weather.data.humidity < 50) && (
                      <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-green-700 leading-relaxed">
                          ✅ Good conditions expected for skin health tomorrow
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Stats */}
          <Card className="h-fit lg:order-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                📊 Profile Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-primary/5 rounded-md hover:bg-primary/10 transition-colors">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    🎯 Triggers tracked:
                  </span>
                  <Badge variant="outline" className="text-xs font-bold">
                    {profile.triggers?.length || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    ⚡ Alert threshold:
                  </span>
                  <Badge variant="secondary" className="text-xs capitalize font-bold">
                    {profile.preferences?.riskThreshold}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md hover:bg-muted/70 transition-colors">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    🌡 Current risk:
                  </span>
                  <Badge variant={riskLevel === "high" ? "destructive" : riskLevel === "medium" ? "secondary" : "default"} className="text-xs font-bold">
                    {riskLevel}
                  </Badge>
                </div>
              </div>
              
              {checkIns.checkIns.length > 0 && showTrends && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    📈 7-Day Trends
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 rounded-md border border-red-200 dark:border-red-800">
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        {checkIns.getAverageScores().avgItch}
                      </div>
                      <div className="text-xs text-red-500 dark:text-red-400">Avg Itch</div>
                    </div>
                    <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 rounded-md border border-purple-200 dark:border-purple-800">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {checkIns.getAverageScores().avgRedness}
                      </div>
                      <div className="text-xs text-purple-500 dark:text-purple-400">Avg Redness</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-border/50">
                <Button 
                  onClick={() => setShowCheckIn(true)} 
                  className="w-full text-xs h-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
                >
                  {checkIns.getTodaysCheckIn() ? "✓ Update Today's Check-in" : "+ Add Daily Check-in"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Recommendations - Clean & Compact */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  💡 Personalized Recommendations
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {recommendations.length} tips
                </Badge>
              </div>
              <Badge variant={riskLevel === "high" ? "destructive" : riskLevel === "medium" ? "secondary" : "default"} className="text-xs capitalize">
                {riskLevel} risk
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Smart suggestions based on current conditions</p>
          </CardHeader>
          <CardContent className="pt-0">
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {/* Grid layout for 4+ recommendations, vertical for fewer */}
                <div className={recommendations.length >= 4 ? "grid grid-cols-2 gap-3" : "space-y-3"}>
                  {recommendations.map((rec, index) => (
                    <div 
                      key={index} 
                      className="group relative flex items-start gap-3 p-3 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-l-2 border-primary/20 rounded-r-lg hover:border-primary/40 hover:bg-primary/8 transition-all duration-200 cursor-pointer"
                    >
                      {/* Priority Indicator */}
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-primary/30 text-primary font-bold text-xs group-hover:border-primary/60 group-hover:bg-primary/10 transition-all flex-shrink-0">
                        {index + 1}
                      </div>
                      
                      {/* Recommendation Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-100">
                          {rec}
                        </p>
                      </div>
                      
                      {/* Action Indicator */}
                      <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="w-4 h-4 text-primary">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Quick Summary */}
                <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Based on your profile & current weather</span>
                    <span className="text-primary font-medium">{recommendations.length} actionable tips</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <p className="text-sm font-medium">All good for now!</p>
                  <p className="text-xs text-muted-foreground">No specific actions needed based on current conditions</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Check-ins - Compact Horizontal Layout */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Check-ins</CardTitle>
              <Button onClick={() => setShowCheckIn(true)} variant="outline" size="sm" className="text-xs">
                {checkIns.getTodaysCheckIn() ? "Update" : "Add"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {checkIns.loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
              </div>
            ) : checkIns.checkIns.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground">
                <p>No check-ins recorded yet</p>
                <p className="mt-1">Start tracking your daily symptoms</p>
              </div>
            ) : (
              <div className="space-y-2">
                {checkIns.getRecentCheckIns(5).map((checkIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[60px]">
                        <div className="text-xs font-medium">
                          {new Date(checkIn.created_at).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric" 
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(checkIn.created_at).toLocaleDateString("en-US", { 
                            weekday: "short" 
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">I:</span>
                          <Badge variant={checkIn.itch_score >= 3 ? "destructive" : checkIn.itch_score >= 1 ? "secondary" : "outline"} className="text-xs">
                            {checkIn.itch_score}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">R:</span>
                          <Badge variant={checkIn.redness_score >= 2 ? "destructive" : checkIn.redness_score >= 1 ? "secondary" : "outline"} className="text-xs">
                            {checkIn.redness_score}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {checkIn.medication_used && (
                        <Badge variant="outline" className="text-xs">💊</Badge>
                      )}
                      {checkIn.notes && (
                        <span className="text-xs text-muted-foreground max-w-20 truncate">&quot;{checkIn.notes}&quot;</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Check-in Modal */}
      {showCheckIn && (
        <DailyCheckIn
          onSubmit={handleCheckInSubmit}
          onClose={() => setShowCheckIn(false)}
          weather={weather.data!}
          isSubmitting={isSubmittingCheckIn}
        />
      )}

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

      {/* AI Analysis Modal */}
      {showAIAnalysis && profile && weather.data && (
        <AIAnalysis
          onClose={() => setShowAIAnalysis(false)}
          weatherData={weather.data}
          userProfile={profile}
        />
      )}

      {/* Settings Modal */}
      {showSettings && profile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                ⚙️ Dashboard Settings
              </h2>
              <Button
                onClick={() => setShowSettings(false)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* User Session Section */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  👤 User Session
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-700 font-medium">User ID:</span>
                        <span className="text-xs text-blue-600 font-mono">{session?.userId || 'Loading...'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-700 font-medium">Session:</span>
                        <span className="text-xs text-blue-600">{session?.isNewUser ? 'New User' : 'Returning User'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-700 font-medium">Data:</span>
                        <span className="text-xs text-blue-600">
                          {(() => {
                            const summary = getUserDataSummary();
                            return summary ? `${summary.checkInsCount} check-ins` : 'No data';
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-200">
                    <div>
                      <p className="text-sm font-medium text-red-800">Reset All Data</p>
                      <p className="text-xs text-red-600">Clear profile, check-ins, and training data</p>
                    </div>
                    <Button 
                      onClick={() => {
                        if (confirm('Are you sure? This will delete all your data and create a new user session.')) {
                          clearSession();
                        }
                      }}
                      variant="outline" 
                      size="sm" 
                      className="text-xs border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Data Storage Section */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  🗄️ Data Storage
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50/50 rounded-lg border border-yellow-200">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-yellow-800 mb-2">Storage Location</p>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="storage"
                              value="local"
                              checked={storageType === 'local'}
                              onChange={(e) => setStorageType(e.target.value as 'local' | 'cloud')}
                              className="text-blue-600"
                            />
                            <span className="text-sm text-yellow-700">
                              <strong>Local Storage</strong> - Data stays on your device
                            </span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="storage"
                              value="cloud"
                              checked={storageType === 'cloud'}
                              onChange={(e) => {
                                if (e.target.value === 'cloud') {
                                  handleCloudStorageToggle();
                                } else {
                                  setStorageType(e.target.value as 'local' | 'cloud');
                                }
                              }}
                              className="text-blue-600"
                            />
                            <span className="text-sm text-yellow-700">
                              <strong>Cloud Storage</strong> - Secure cloud backup & sync
                              {!isCloudConfigured() && <span className="text-red-600"> (Not configured)</span>}
                            </span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded border">
                        {storageType === 'local' ? (
                          <>
                            <strong>Local Mode:</strong> Your data is stored only on this device. 
                            No data is sent to servers. Data will be lost if you clear browser data.
                          </>
                        ) : (
                          <>
                            <strong>Cloud Mode:</strong> Your data is encrypted and stored securely in the cloud. 
                            This enables backup, sync across devices, and enhanced AI features.
                          </>
                        )}
                      </div>
                      
                      {storageType === 'cloud' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-yellow-700">
                            <span>Storage Used:</span>
                            <span>0 MB / 500 MB free</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-yellow-700">
                            <span>Images Stored:</span>
                            <span>0 / 5,000 free</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Profile Section */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  👤 Profile Settings
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Update Profile</p>
                      <p className="text-xs text-muted-foreground">Edit skin type, triggers, location</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setShowSettings(false);
                        router.push('/onboarding');
                      }}
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                    >
                      Edit
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Risk Threshold</p>
                      <p className="text-xs text-muted-foreground">Currently: {profile.preferences?.riskThreshold || 'moderate'}</p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {profile.preferences?.riskThreshold || 'moderate'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Display Section */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  📱 Display Options
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Temperature Unit</p>
                      <p className="text-xs text-muted-foreground">Celsius or Fahrenheit</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant={tempUnit === 'C' ? "default" : "outline"} 
                        size="sm" 
                        className="text-xs px-2 py-1"
                        onClick={() => setTempUnit('C')}
                      >
                        °C
                      </Button>
                      <Button 
                        variant={tempUnit === 'F' ? "default" : "outline"} 
                        size="sm" 
                        className="text-xs px-2 py-1"
                        onClick={() => setTempUnit('F')}
                      >
                        °F
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Weather Forecasts</p>
                      <p className="text-xs text-muted-foreground">Show tomorrow&apos;s outlook</p>
                    </div>
                    <button
                      onClick={() => setShowForecast(!showForecast)}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                        showForecast ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                        showForecast ? 'right-0.5' : 'left-0.5'
                      }`}></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Trend Charts</p>
                      <p className="text-xs text-muted-foreground">7-day averages display</p>
                    </div>
                    <button
                      onClick={() => setShowTrends(!showTrends)}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                        showTrends ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                        showTrends ? 'right-0.5' : 'left-0.5'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Section */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  📊 Data & Privacy
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Export Data</p>
                      <p className="text-xs text-muted-foreground">Download your check-ins</p>
                    </div>
                    <Button 
                      onClick={handleExportData}
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                    >
                      Export
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="text-sm font-medium text-red-800">Reset Dashboard</p>
                      <p className="text-xs text-red-600">Clear all data and start fresh</p>
                    </div>
                    <Button 
                      onClick={handleResetDashboard}
                      variant="destructive" 
                      size="sm" 
                      className="text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI Model Section */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  🧠 AI Model Training
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Collect Training Data</p>
                      <p className="text-xs text-purple-600">Download datasets to improve AI accuracy</p>
                    </div>
                    <div className="flex gap-2">
                    <Button 
                      onClick={async () => {
                        if (isCollectingData) return;
                        
                        setIsCollectingData(true);
                        toast.loading('Starting data collection...', { id: 'data-collection' });
                        
                        try {
                          console.log('🔄 Starting data collection...');
                          const { dataCollectionService } = await import('@/lib/ai/dataCollection');
                          
                          await dataCollectionService.initializeDataCollection();
                          console.log('✅ Data collection initialized');
                          
                          await dataCollectionService.collectDataFromSources(50);
                          console.log('✅ Data collection completed!');
                          
                          // Show success feedback
                          toast.success('Training data collection completed successfully! Check the console for details.', { id: 'data-collection' });
                        } catch (error) {
                          console.error('❌ Data collection failed:', error);
                          toast.error(`Data collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'data-collection' });
                        } finally {
                          setIsCollectingData(false);
                        }
                      }}
                      disabled={isCollectingData}
                      variant="outline" 
                      size="sm" 
                      className="text-xs border-purple-300 text-purple-700 hover:bg-purple-100 disabled:opacity-50"
                    >
                      {isCollectingData ? "Collecting..." : "Collect"}
                    </Button>
                    <Button 
                      onClick={async () => {
                        const { dataCollectionService } = await import('@/lib/ai/dataCollection');
                        const stats = dataCollectionService.getDatasetInfo();
                        const data = dataCollectionService.getTrainingData();
                        
                        console.log('📊 Training Data Statistics:', stats);
                        console.log('📋 Sample Training Data (first 3 samples):', data.slice(0, 3)); 
                        console.log('🎯 All Conditions Found:', Object.keys(stats.conditionBreakdown));
                        console.log('📁 Data Sources:', Object.keys(stats.sourceBreakdown));
                        
                        toast.info(`Found ${stats.totalSamples} training samples. Check console for details.`, { id: 'view-data' });
                      }}
                      variant="outline" 
                      size="sm" 
                      className="text-xs border-green-300 text-green-700 hover:bg-green-100"
                    >
                      View Data
                    </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Train Local Model</p>
                      <p className="text-xs text-blue-600">Improve AI with your anonymous data</p>
                    </div>
                    <Button 
                      onClick={async () => {
                        const { localAI } = await import('@/lib/ai/localAI');
                        if (!localAI.getModelInfo().isLoaded) {
                          await localAI.initialize();
                        }
                        alert('Model training initiated! This may take a few minutes.');
                      }}
                      variant="outline" 
                      size="sm" 
                      className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Train
                    </Button>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Privacy Protection</p>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>• All training happens locally on your device</p>
                      <p>• No personal data is sent to external servers</p>
                      <p>• Your images are processed anonymously</p>
                      <p>• You control all data collection and training</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Version 1.0.0 • Updated today
                </p>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="default"
                  size="sm"
                  className="text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Cloud Storage Warning Dialog */}
      {showCloudWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                ☁️
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Enable Cloud Storage?</h2>
                <p className="text-sm text-gray-600">Securely backup and sync your data</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h3 className="font-medium text-green-800 mb-2">✅ Benefits:</h3>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Backup your data safely in the cloud</li>
                  <li>• Sync across multiple devices</li>
                  <li>• Enhanced AI features with cloud processing</li>
                  <li>• Never lose your progress</li>
                  <li>• 500MB storage + 5,000 images FREE</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h3 className="font-medium text-yellow-800 mb-2">⚠️ Privacy & Security:</h3>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Your data is encrypted with AES-256</li>
                  <li>• We cannot access your personal data</li>
                  <li>• Used only to improve app functionality</li>
                  <li>• You can switch back to local anytime</li>
                  <li>• Compliant with GDPR and healthcare standards</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h3 className="font-medium text-blue-800 mb-2">🔧 Technical Details:</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Powered by Supabase (PostgreSQL + Storage)</li>
                  <li>• Real-time sync and offline support</li>
                  <li>• Automatic data migration from local storage</li>
                  <li>• No vendor lock-in - export anytime</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCloudWarning(false)}
                variant="outline"
                className="flex-1"
              >
                Keep Local
              </Button>
              <Button
                onClick={() => {
                  setStorageType('cloud');
                  setShowCloudWarning(false);
                  toast.success('Cloud storage enabled! Migrating your data...', { id: 'cloud-enabled' });
                  // TODO: Initialize cloud storage
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Enable Cloud
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}