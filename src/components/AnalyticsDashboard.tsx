"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Calendar, Activity, Pill, CloudSun, AlertTriangle } from "lucide-react";
import { useDatabase } from "@/hooks/useDatabase";
import type { UserProfile } from "@/types";

interface AnalyticsData {
  overview: {
    avgItch: number;
    avgRedness: number;
    medicationDays: number;
    totalDays: number;
    medicationUsageRate: number;
  };
  weeklyTrends: Array<{
    week: number;
    weekStart: string;
    weekEnd: string;
    avgItch: number;
    avgRedness: number;
    logCount: number;
    medicationUsed: number;
  }>;
  weatherCorrelations: {
    temperature: number;
    humidity: number;
    uv: number;
    pollen: number;
  };
  recentActivity: any[];
}

interface AnalyticsDashboardProps {
  profile: UserProfile;
  onClose: () => void;
}

export function AnalyticsDashboard({ profile, onClose }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<30 | 60 | 90>(30);
  const { getAnalytics, loading, error } = useDatabase();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, profile.id]);

  const loadAnalytics = async () => {
    const data = await getAnalytics(profile.id, timeRange);
    if (data) {
      setAnalytics(data);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your analytics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
              <div>
                <p className="font-medium text-destructive">Unable to load analytics</p>
                <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
              </div>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getCorrelationColor = (percentage: number) => {
    if (percentage >= 70) return "text-red-600 bg-red-50 border-red-200";
    if (percentage >= 50) return "text-orange-600 bg-orange-50 border-orange-200";
    if (percentage >= 30) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>Your skin health patterns and trends</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={timeRange === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(30)}
              >
                30d
              </Button>
              <Button
                variant={timeRange === 60 ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(60)}
              >
                60d
              </Button>
              <Button
                variant={timeRange === 90 ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(90)}
              >
                90d
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Avg Itch Score</span>
                </div>
                <div className="text-2xl font-bold">{analytics.overview.avgItch.toFixed(1)}/5</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview.totalDays} days tracked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Avg Redness</span>
                </div>
                <div className="text-2xl font-bold">{analytics.overview.avgRedness.toFixed(1)}/3</div>
                <p className="text-xs text-muted-foreground">
                  Overall severity level
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Medication Usage</span>
                </div>
                <div className="text-2xl font-bold">{analytics.overview.medicationUsageRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview.medicationDays} of {analytics.overview.totalDays} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Check-in Streak</span>
                </div>
                <div className="text-2xl font-bold">{analytics.overview.totalDays}</div>
                <p className="text-xs text-muted-foreground">
                  Days logged recently
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Trends</CardTitle>
              <CardDescription>Track your symptoms over time</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.weeklyTrends.length > 0 ? (
                <div className="space-y-4">
                  {analytics.weeklyTrends.map((week, index) => {
                    const prevWeek = analytics.weeklyTrends[index + 1];
                    const itchTrend = prevWeek ? week.avgItch - prevWeek.avgItch : 0;
                    const rednesssTrend = prevWeek ? week.avgRedness - prevWeek.avgRedness : 0;
                    
                    return (
                      <div key={week.week} className="p-4 rounded-lg border bg-muted/20">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">
                              Week {week.week} ({new Date(week.weekStart).toLocaleDateString()} - {new Date(week.weekEnd).toLocaleDateString()})
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {week.logCount} check-ins, {week.medicationUsed} medication days
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Itch Score</span>
                              <div className="flex items-center gap-1">
                                {prevWeek && getTrendIcon(week.avgItch, prevWeek.avgItch)}
                                <Badge variant="outline">{week.avgItch.toFixed(1)}</Badge>
                              </div>
                            </div>
                            <Progress value={(week.avgItch / 5) * 100} className="h-2" />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Redness Score</span>
                              <div className="flex items-center gap-1">
                                {prevWeek && getTrendIcon(week.avgRedness, prevWeek.avgRedness)}
                                <Badge variant="outline">{week.avgRedness.toFixed(1)}</Badge>
                              </div>
                            </div>
                            <Progress value={(week.avgRedness / 3) * 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Not enough data for weekly trends</p>
                  <p className="text-sm">Keep logging daily to see patterns</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weather Correlations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weather Pattern Correlations</CardTitle>
              <CardDescription>How weather conditions affect your symptoms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'temperature', label: 'High Temperature', icon: '🌡️', threshold: '>25°C' },
                  { key: 'humidity', label: 'High Humidity', icon: '💧', threshold: '>70%' },
                  { key: 'uv', label: 'High UV Index', icon: '☀️', threshold: '>6' },
                  { key: 'pollen', label: 'High Pollen', icon: '🌸', threshold: '>6/10' }
                ].map(({ key, label, icon, threshold }) => {
                  const percentage = analytics.weatherCorrelations[key as keyof typeof analytics.weatherCorrelations];
                  return (
                    <div key={key} className={`p-4 rounded-lg border-2 ${getCorrelationColor(percentage)}`}>
                      <div className="text-center space-y-2">
                        <div className="text-2xl">{icon}</div>
                        <div className="text-lg font-bold">{percentage}%</div>
                        <div className="text-sm font-medium">{label}</div>
                        <div className="text-xs opacity-75">{threshold}</div>
                        {percentage > 0 && (
                          <div className="text-xs">
                            {percentage >= 70 ? 'Strong correlation' :
                             percentage >= 50 ? 'Moderate correlation' :
                             percentage >= 30 ? 'Weak correlation' :
                             'Low correlation'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {Object.values(analytics.weatherCorrelations).every(val => val === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <CloudSun className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Not enough data for weather correlations</p>
                  <p className="text-sm">Keep logging to discover your weather triggers</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personalized Insights</CardTitle>
              <CardDescription>Key findings from your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.overview.medicationUsageRate > 50 && (
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <p className="text-sm">
                      <strong>High medication usage:</strong> You've used medication on {analytics.overview.medicationUsageRate}% of tracked days. 
                      Consider discussing preventive strategies with your healthcare provider.
                    </p>
                  </div>
                )}
                
                {analytics.weatherCorrelations.humidity > 60 && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm">
                      <strong>Humidity sensitivity detected:</strong> High humidity days correlate with {analytics.weatherCorrelations.humidity}% of your high-symptom days. 
                      Consider using a dehumidifier during humid weather.
                    </p>
                  </div>
                )}
                
                {analytics.weatherCorrelations.temperature > 60 && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm">
                      <strong>Heat sensitivity detected:</strong> Hot weather correlates with {analytics.weatherCorrelations.temperature}% of your flare-ups. 
                      Stay cool and hydrated during hot days.
                    </p>
                  </div>
                )}
                
                {analytics.weatherCorrelations.pollen > 60 && (
                  <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <p className="text-sm">
                      <strong>Pollen trigger identified:</strong> High pollen days correlate with {analytics.weatherCorrelations.pollen}% of your symptoms. 
                      Monitor pollen forecasts and keep windows closed during peak seasons.
                    </p>
                  </div>
                )}
                
                {analytics.overview.avgItch < 2 && analytics.overview.avgRedness < 1.5 && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm">
                      <strong>Great control!</strong> Your symptoms are well-managed with low average scores. 
                      Keep up your current routine and preventive measures.
                    </p>
                  </div>
                )}
                
                {analytics.weeklyTrends.length >= 2 && 
                 analytics.weeklyTrends[0].avgItch > analytics.weeklyTrends[1].avgItch && (
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <p className="text-sm">
                      <strong>Recent increase detected:</strong> Your symptoms have increased recently. 
                      Consider what might have changed in your routine or environment.
                    </p>
                  </div>
                )}
                
                {analytics.overview.totalDays < 7 && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm">
                      <strong>More data needed:</strong> Log your symptoms daily for at least 2 weeks to get more accurate insights and correlations.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Close Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}