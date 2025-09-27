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
  // ALL HOOKS MUST BE AT THE TOP LEVEL AND CALLED IN THE SAME ORDER EVERY TIME
  
  // 1. Basic React hooks
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

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

  // 6. Main effect for loading profile
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

  // Test API key function
  const handleTestApiKey = async () => {
    setApiTestResult("Testing...");
    const result = await testApiKey();
    if (result.success) {
      setApiTestResult("✅ API Key is working!");
    } else {
      setApiTestResult(`❌ API Key Error: ${result.error}`);
    }
    // Clear the message after 5 seconds
    setTimeout(() => setApiTestResult(null), 5000);
  };

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
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">DermAIr Dashboard</h1>
              <p className="text-muted-foreground">
                {profile.location?.city && `${profile.location.city}, `}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {shouldShowAlert && (
                <Badge variant="destructive" className="animate-pulse">
                  Risk Alert!
                </Badge>
              )}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleTestApiKey} variant="outline" size="sm">
                  Test API Key
                </Button>
                <Button onClick={() => setShowNotificationSettings(true)} variant="outline" size="sm">
                  🔔 Notifications
                </Button>
                <Button onClick={() => setShowAnalytics(true)} variant="outline" size="sm">
                  📊 Analytics
                </Button>
                <Button onClick={() => setShowCheckIn(true)} variant={checkIns.getTodaysCheckIn() ? "secondary" : "default"}>
                  {checkIns.getTodaysCheckIn() ? "✓ Update Check-in" : "Daily Check-in"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

        {/* Top Row - Risk Gauge and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RiskGauge 
              riskLevel={riskLevel} 
              riskScore={riskScore} 
              recommendations={recommendations}
            />
          </div>
          <div>
            {/* Quick Stats Card - Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Your profile summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Triggers tracked:</span>
                  <span className="text-sm font-medium">{profile.triggers?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Risk threshold:</span>
                  <span className="text-sm font-medium capitalize">{profile.preferences?.riskThreshold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Today&apos;s risk:</span>
                  <Badge variant={riskLevel === "high" ? "destructive" : riskLevel === "medium" ? "secondary" : "default"}>
                    {riskLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Second Row - Weather and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weather Card - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Current Conditions
                {(!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || weather.error) && (
                  <Badge variant="secondary" className="text-xs">
                    Demo Data
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Weather factors affecting your skin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold">{weather.data.temperature}°C</p>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                </div>
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold">{weather.data.humidity}%</p>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                </div>
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold">{weather.data.uv_index}</p>
                  <p className="text-sm text-muted-foreground">UV Index</p>
                </div>
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold">{weather.data.pollen_count.overall}</p>
                  <p className="text-sm text-muted-foreground">Pollen</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-center text-muted-foreground capitalize">{weather.data.weather_condition}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={weather.refetch}
                  disabled={weather.loading}
                >
                  {weather.loading ? "Updating..." : "Refresh"}
                </Button>
              </div>
              {weather.lastUpdated && (
                <p className="text-xs text-muted-foreground text-center">
                  Last updated: {weather.lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recommendations Card - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Recommendations</CardTitle>
              <CardDescription>Personalized tips for {riskLevel} risk conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}