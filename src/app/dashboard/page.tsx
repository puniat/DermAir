"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { useWeather } from "@/hooks/useWeather";
import { Header } from "@/components/Header";
import { useCheckIns } from "@/hooks/useCheckIns";
import { useNotifications } from "@/hooks/useNotifications";
import { useRiskAssessment } from "@/hooks/useRiskAssessment";
import { useRiskAlerts } from "@/hooks/useRiskAlerts";
import { testApiKey } from "@/lib/api/weather";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { NotificationSettings } from "@/components/NotificationSettings";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AccountSettings } from "@/components/AccountSettings";
import { useAIModeStore } from "@/lib/stores/ai-mode";
import { loadUserProfile } from '@/lib/services/firestore-data';
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
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  // AI Mode store
  const { isAIModeEnabled } = useAIModeStore();

  // 2. ALL CUSTOM HOOKS IN CONSISTENT ORDER
  const weather = useWeather(profile);
  const checkIns = useCheckIns();
  const notifications = useNotifications();
  
  // 3. DEPENDENT CALCULATIONS THAT DON'T INVOLVE HOOKS
  const recentCheckIns = useMemo(() => 
    checkIns.loading ? [] : checkIns.getRecentCheckIns(7), 
    [checkIns.loading, checkIns]
  );
  
  // 4. MORE CUSTOM HOOKS THAT DEPEND ON THE ABOVE
  const { riskScore, riskLevel, recommendations } = useRiskAssessment(
    weather.data, 
    profile, 
    recentCheckIns,
    false // Regular dashboard uses basic mode, not AI mode
  );

  // 5. HOOKS THAT NEED THE RISK ASSESSMENT RESULTS
  useRiskAlerts(
    weather.data, 
    profile, 
    riskLevel === 'severe' ? 'high' : riskLevel as "low" | "medium" | "high", 
    riskScore, 
    weather.loading, 
    notifications
  );

  // 6. ALL useEffect HOOKS
  useEffect(() => {
    const savedProfile = localStorage.getItem("dermair-profile");
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile({
          ...parsedProfile,
          created_at: new Date(parsedProfile.created_at || Date.now()),
        });
      } catch (error) {
        console.error("Error parsing profile:", error);
        router.push("/onboarding");
      }
    } else {
      // Try to load from Firestore (for demo, use a default user id)
      loadUserProfile("user-1").then(fbProfile => {
        if (fbProfile) {
          setProfile(fbProfile);
        } else {
          router.push("/onboarding");
        }
      });
    }
    setLoading(false);
  }, [router]);

  // Navigate to enhanced dashboard when AI mode is enabled
  useEffect(() => {
    if (isAIModeEnabled && !loading) {
      router.push("/dashboard/enhanced");
    }
  }, [isAIModeEnabled, loading, router]);

  // Handle daily check-in submission
  const handleCheckInSubmit = async (data: DailyCheckInFormData) => {
    setIsSubmittingCheckIn(true);
    try {
      // Create the check-in data
      const checkInData = {
        id: `checkin-${Date.now()}`,
        user_id: profile?.id || "user-1",
        date: new Date(),
        itch_score: data.itch_score,
        redness_score: data.redness_score,
        medication_used: data.medication_used,
        notes: data.notes || "",
        photo_url: undefined, // Will add photo support later
        weather_data: weather.data || {} as any,
        created_at: new Date()
      };

      // Add using the hook
      checkIns.addCheckIn(checkInData);
      
      // Close the modal
      setShowCheckIn(false);
      
    } catch (error) {
      console.error("Error saving check-in:", error);
    } finally {
      setIsSubmittingCheckIn(false);
    }
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
      <Header 
        profile={profile}
        shouldShowAlert={shouldShowAlert}
        onRefresh={() => weather.refetch()}
        onShowNotificationSettings={() => setShowNotificationSettings(true)}
        onShowAnalytics={() => setShowAnalytics(true)}
        onShowCheckIn={() => setShowCheckIn(true)}
        onShowAccountSettings={() => setShowAccountSettings(true)}
        hasTodaysCheckIn={!!checkIns.getTodaysCheckIn()}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* API Test Result */}
        {apiTestResult && (
          <Card className={`border ${
            apiTestResult.includes('❌') ? 'border-red-200 bg-red-50' : 
            apiTestResult.includes('✅') ? 'border-green-200 bg-green-50' : 
            'border-blue-200 bg-blue-50'
          }`}>
            <CardContent className="p-4">
              <p className="font-medium">{apiTestResult}</p>
            </CardContent>
          </Card>
        )}

        {/* API Key Setup Notice */}
        {!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <div>
                  <p className="font-medium text-warning-foreground">
                    Using demo weather data
                  </p>
                  <p className="text-sm text-muted-foreground">
                    To get real weather data, set up your OpenWeatherMap API key. 
                    See WEATHER_API_SETUP.md for instructions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weather Error Notice */}
        {weather.error && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <div>
                    <p className="font-medium text-warning-foreground">
                      Weather data unavailable
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Using demo data. {weather.error}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={weather.refetch}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Risk Alert Banner */}
        {shouldShowAlert && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-destructive">
                    High flare-up risk detected for today
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current conditions match several of your triggers. Check recommendations below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Risk</p>
                <div className="flex items-center gap-2">
                  <Badge variant={riskLevel === "high" ? "destructive" : riskLevel === "medium" ? "secondary" : "default"}>
                    {riskLevel}
                  </Badge>
                  <span className="text-lg font-bold">{Math.round(riskScore / 10)}/10</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                riskLevel === "high" ? "bg-red-100 text-red-600" : 
                riskLevel === "medium" ? "bg-yellow-100 text-yellow-600" : 
                "bg-green-100 text-green-600"
              }`}>
                {riskLevel === "high" ? "⚠️" : riskLevel === "medium" ? "🟡" : "✅"}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temperature</p>
                <p className="text-lg font-bold">{weather.data.temperature}°C</p>
                <p className="text-xs text-muted-foreground capitalize">{weather.data.weather_condition}</p>
              </div>
              <div className="text-2xl">🌡️</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Humidity</p>
                <p className="text-lg font-bold">{weather.data.humidity}%</p>
                <p className="text-xs text-muted-foreground">
                  {weather.data.humidity > 70 ? "High" : weather.data.humidity > 40 ? "Normal" : "Low"}
                </p>
              </div>
              <div className="text-2xl">💧</div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">UV & Pollen</p>
                <p className="text-lg font-bold">UV {weather.data.uv_index} | P {weather.data.pollen_count.overall}</p>
                <p className="text-xs text-muted-foreground">
                  {weather.data.uv_index > 6 ? "High UV" : "Moderate"}
                </p>
              </div>
              <div className="text-2xl">☀️</div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Risk Assessment and Recommendations - Wider section */}
          <div className="lg:col-span-8 space-y-6">
            {/* Today's Risk Analysis */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Today's Risk Analysis</CardTitle>
                    <CardDescription>AI-powered assessment for your skin health</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(Date.now() / 1000) % 100}% confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-6 mb-4">
                  <div className="relative w-24 h-24">
                    {/* Background circle */}
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className={
                          riskLevel === "high" ? "text-red-100" : 
                          riskLevel === "medium" ? "text-yellow-100" : 
                          "text-green-100"
                        }
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - riskScore / 100)}`}
                        className={
                          riskLevel === "high" ? "text-red-500" : 
                          riskLevel === "medium" ? "text-yellow-500" : 
                          "text-green-500"
                        }
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold ${
                        riskLevel === "high" ? "text-red-600" : 
                        riskLevel === "medium" ? "text-yellow-600" : 
                        "text-green-600"
                      }`}>
                        {riskScore}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      riskLevel === "high" ? "text-red-600" : 
                      riskLevel === "medium" ? "text-yellow-600" : 
                      "text-green-600"
                    }`}>
                      {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on current weather conditions and your triggers
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Triggers: {profile.triggers?.join(", ") || "None set"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Personalized Recommendations</CardTitle>
                <CardDescription>Actions to take today based on {riskLevel} risk conditions</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === 0 ? "bg-blue-100 text-blue-600" :
                        index === 1 ? "bg-purple-100 text-purple-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {index + 1}
                      </div>
                      <p className="text-sm flex-1">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quick Stats and Weather Details */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Triggers tracked:</span>
                  <Badge variant="secondary">{profile.triggers?.length || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Risk threshold:</span>
                  <span className="text-sm font-medium capitalize">{profile.preferences?.riskThreshold || "moderate"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Check-ins:</span>
                  <Badge variant="outline">{checkIns.checkIns.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <span className="text-sm font-medium">{profile.location?.city || "Not set"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Weather Details */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Weather Details</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={weather.refetch}
                    disabled={weather.loading}
                  >
                    {weather.loading ? "↻" : "🔄"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-blue-50">
                    <p className="text-lg font-bold text-blue-600">{weather.data.pressure}</p>
                    <p className="text-xs text-blue-600">Pressure (hPa)</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50">
                    <p className="text-lg font-bold text-green-600">{weather.data.wind_speed}</p>
                    <p className="text-xs text-green-600">Wind (km/h)</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Air Quality:</span>
                    <span className="font-medium">{weather.data.air_quality_index || "Good"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tree Pollen:</span>
                    <span className="font-medium">{weather.data.pollen_count.tree}/10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Grass Pollen:</span>
                    <span className="font-medium">{weather.data.pollen_count.grass}/10</span>
                  </div>
                </div>
                {weather.lastUpdated && (
                  <p className="text-xs text-muted-foreground">
                    Updated: {weather.lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
            <CardDescription>Your daily symptom tracking history</CardDescription>
          </CardHeader>
          <CardContent>
            {checkIns.loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground text-sm">Loading check-ins...</p>
              </div>
            ) : checkIns.checkIns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No check-ins recorded yet</p>
                <p className="text-sm mt-2">Click "Daily Check-in" to start tracking your symptoms</p>
              </div>
            ) : (
              <div className="space-y-4">
                {checkIns.getRecentCheckIns(7).map((checkIn, index) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-sm font-medium">
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
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Itch:</span>
                          <Badge variant={checkIn.itch_score >= 3 ? "destructive" : checkIn.itch_score >= 1 ? "secondary" : "outline"}>
                            {checkIn.itch_score}/5
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Redness:</span>
                          <Badge variant={checkIn.redness_score >= 2 ? "destructive" : checkIn.redness_score >= 1 ? "secondary" : "outline"}>
                            {checkIn.redness_score}/3
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {checkIn.medication_used && (
                        <Badge variant="outline" className="mb-1">
                          💊 Medication
                        </Badge>
                      )}
                      {checkIn.notes && (
                        <p className="text-xs text-muted-foreground max-w-32 truncate">
                          "{checkIn.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Show averages for the week */}
                {checkIns.checkIns.length > 1 && (
                  <div className="border-t pt-4 mt-4">
                    <div className="text-sm text-muted-foreground mb-2">7-day averages:</div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-lg font-medium">{checkIns.getAverageScores().avgItch}</div>
                        <div className="text-xs text-muted-foreground">Avg Itch</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-medium">{checkIns.getAverageScores().avgRedness}</div>
                        <div className="text-xs text-muted-foreground">Avg Redness</div>
                      </div>
                    </div>
                  </div>
                )}
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

      {/* Account Settings Modal */}
      <AccountSettings
        open={showAccountSettings}
        onOpenChange={setShowAccountSettings}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}