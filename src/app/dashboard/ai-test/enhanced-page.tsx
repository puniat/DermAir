"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Clock, 
  Activity,
  Lightbulb,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Heart,
  Thermometer,
  Eye,
  RefreshCw
} from 'lucide-react';

// Mock data for demonstration
const mockUserProfile = {
  id: "demo-user",
  email: "demo@example.com",
  age_range: "26-35" as const,
  skin_type: "sensitive" as const,
  triggers: ["humidity", "pollen", "stress"],
  severityHistory: [
    { date: "2024-10-01", severity: "moderate" as const },
    { date: "2024-09-28", severity: "mild" as const }
  ],
  preferences: {
    notifications: true,
    riskThreshold: "moderate" as const
  },
  location: {
    city: "Demo City",
    country: "Demo Country",
    zipcode: "12345"
  }
};

const mockWeatherData = {
  temperature: 22,
  humidity: 68,
  pressure: 1013,
  uv_index: 5,
  air_quality_index: 45,
  pollen_count: {
    tree: 3,
    grass: 2,
    weed: 1,
    overall: 6
  },
  weather_condition: "partly_cloudy",
  wind_speed: 12,
  timestamp: new Date()
};

const mockAdvancedAssessment = {
  overallRisk: 67,
  riskLevel: 'moderate' as const,
  confidence: 0.94,
  factors: [
    {
      name: "High Humidity",
      category: 'environmental' as const,
      impact: 75,
      confidence: 0.92,
      evidence: 'high' as const,
      clinicalSource: "Journal of Dermatology 2023",
      description: "Current humidity (68%) exceeds your sensitivity threshold",
      interventions: ["Use dehumidifier", "Apply barrier cream"]
    },
    {
      name: "Elevated Pollen",
      category: 'environmental' as const,
      impact: 45,
      confidence: 0.87,
      evidence: 'moderate' as const,
      clinicalSource: "Allergy Research 2023",
      description: "Pollen count above normal for sensitive individuals",
      interventions: ["Limit outdoor exposure", "Use air purifier"]
    },
    {
      name: "Stress Response",
      category: 'physiological' as const,
      impact: 60,
      confidence: 0.89,
      evidence: 'high' as const,
      clinicalSource: "Psychodermatology 2023",
      description: "Stress patterns correlate with flare frequency",
      interventions: ["Stress management", "Meditation"]
    }
  ],
  predictions: {
    next24h: 6.8,
    next7days: 5.2,
    nextMonth: 4.1
  },
  recommendations: {
    immediate: ["Apply moisturizer", "Avoid known triggers"],
    preventive: ["Use humidifier", "Take antihistamine"],
    lifestyle: ["Reduce stress", "Maintain sleep schedule"],
    medical: ["Consider topical steroid", "Schedule dermatologist visit"]
  },
  triggers: {
    primary: ["humidity", "pollen"],
    secondary: ["stress", "temperature"],
    emerging: ["air_pollution"]
  },
  severity: {
    current: 6.7,
    predicted: 5.8,
    trajectory: 'improving' as const
  }
};

const mockAIRecommendations = [
  {
    id: "rec_1",
    category: 'immediate' as const,
    priority: 'critical' as const,
    confidence: 0.95,
    evidence: 'grade_a' as const,
    recommendation: "Apply fragrance-free, ceramide-based moisturizer twice daily",
    rationale: "Current humidity levels and skin barrier analysis indicate urgent barrier repair needed",
    timeframe: "Immediate and ongoing",
    contraindications: ["known allergies to ceramides"],
    monitoring: ["skin hydration", "barrier integrity"],
    sources: ["AAD Clinical Guidelines 2023", "Barrier Research Journal"],
    personalizedFactors: ["sensitive_skin_type", "humidity_sensitivity"]
  },
  {
    id: "rec_2",
    category: 'preventive' as const,
    priority: 'high' as const,
    confidence: 0.91,
    evidence: 'grade_a' as const,
    recommendation: "Use low-potency topical corticosteroid for 5-7 days",
    rationale: "Risk assessment indicates moderate inflammation requiring targeted intervention",
    timeframe: "5-7 days, then reassess",
    contraindications: ["viral infections", "bacterial infections"],
    monitoring: ["symptom improvement", "skin atrophy signs"],
    sources: ["NICE Guidelines 2023", "Steroid Use Protocols"],
    personalizedFactors: ["age_26-35", "moderate_risk_threshold"]
  },
  {
    id: "rec_3",
    category: 'lifestyle' as const,
    priority: 'medium' as const,
    confidence: 0.87,
    evidence: 'grade_b' as const,
    recommendation: "Implement stress reduction techniques and maintain consistent sleep schedule",
    rationale: "Stress patterns correlate with 73% of your historical flare episodes",
    timeframe: "Ongoing lifestyle modification",
    contraindications: [],
    monitoring: ["stress levels", "sleep quality", "flare frequency"],
    sources: ["Psychodermatology Research 2023"],
    personalizedFactors: ["stress_trigger_history", "sleep_pattern_analysis"]
  }
];

export default function AITestPage() {
  const [useAdvancedAI, setUseAdvancedAI] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI-Powered Risk Assessment Demo
          </h1>
          <p className="text-muted-foreground">
            Medical-grade accuracy with 99.9% confidence target
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="advanced-ai"
              checked={useAdvancedAI}
              onCheckedChange={setUseAdvancedAI}
            />
            <Label htmlFor="advanced-ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Mode
            </Label>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* AI Status Banner */}
      <Alert className={useAdvancedAI ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          {useAdvancedAI ? (
            <>
              <strong>Advanced AI Analysis Active:</strong> Using medical-grade algorithms with clinical evidence backing. 
              Real-time risk assessment with personalized recommendations.
            </>
          ) : (
            <>
              <strong>Basic Mode Active:</strong> Using standard weather-based risk calculation. 
              Enable AI mode for medical-grade accuracy and personalized treatment plans.
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {useAdvancedAI ? mockAdvancedAssessment.riskLevel.toUpperCase() : 'MEDIUM'}
            </div>
            <Progress 
              value={useAdvancedAI ? mockAdvancedAssessment.overallRisk : 45} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Score: {useAdvancedAI ? mockAdvancedAssessment.overallRisk : 45}/100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {useAdvancedAI ? 'AI Confidence' : 'Assessment Type'}
            </CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {useAdvancedAI ? `${(mockAdvancedAssessment.confidence * 100).toFixed(1)}%` : 'Basic'}
            </div>
            <Progress 
              value={useAdvancedAI ? mockAdvancedAssessment.confidence * 100 : 70} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {useAdvancedAI ? 'Medical-grade accuracy' : 'Weather-based analysis'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {useAdvancedAI ? '24h Prediction' : 'Current Risk'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {useAdvancedAI ? mockAdvancedAssessment.predictions.next24h.toFixed(1) : '4.5'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {useAdvancedAI ? 'Predicted risk score' : 'Weather-based score'}
            </p>
            {useAdvancedAI && (
              <Badge variant="default" className="mt-2">
                {mockAdvancedAssessment.severity.trajectory}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {useAdvancedAI ? 'AI Recommendations' : 'Basic Recommendations'}
            </CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {useAdvancedAI ? mockAIRecommendations.length : '3'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {useAdvancedAI ? 'Personalized actions' : 'General suggestions'}
            </p>
            <div className="flex gap-1 mt-2">
              {useAdvancedAI ? (
                <>
                  <Badge variant="destructive" className="text-xs">1 critical</Badge>
                  <Badge variant="default" className="text-xs">1 high</Badge>
                  <Badge variant="secondary" className="text-xs">1 medium</Badge>
                </>
              ) : (
                <Badge variant="outline" className="text-xs">3 basic</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Risk Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="insights">Medical Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Risk Factors Analysis */}
          {useAdvancedAI ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Advanced Risk Factors Analysis
                </CardTitle>
                <CardDescription>
                  AI-identified factors contributing to your current risk level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAdvancedAssessment.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {factor.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {factor.evidence} evidence
                          </Badge>
                          <span className="font-medium">{factor.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {factor.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Source: {factor.clinicalSource}
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="font-bold text-2xl">{factor.impact}</div>
                        <div className="text-xs text-muted-foreground">impact score</div>
                        <Progress value={factor.impact} className="w-16 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Basic Risk Factors
                </CardTitle>
                <CardDescription>
                  Weather-based factors affecting your condition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">environmental</Badge>
                        <span className="font-medium">High Humidity</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Current humidity levels may increase skin irritation
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-bold text-2xl">65</div>
                      <div className="text-xs text-muted-foreground">impact score</div>
                      <Progress value={65} className="w-16 mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">environmental</Badge>
                        <span className="font-medium">UV Exposure</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Moderate UV levels - use sun protection
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-bold text-2xl">40</div>
                      <div className="text-xs text-muted-foreground">impact score</div>
                      <Progress value={40} className="w-16 mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">environmental</Badge>
                        <span className="font-medium">Pollen Count</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Elevated pollen levels detected
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-bold text-2xl">55</div>
                      <div className="text-xs text-muted-foreground">impact score</div>
                      <Progress value={55} className="w-16 mt-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {useAdvancedAI ? 'Predictive Analysis' : 'Current Assessment'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {useAdvancedAI ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {mockAdvancedAssessment.predictions.next24h.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Next 24 Hours</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {mockAdvancedAssessment.predictions.next7days.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Next 7 Days</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {mockAdvancedAssessment.predictions.nextMonth.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Next Month</div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">22°C</div>
                    <div className="text-sm text-muted-foreground">Temperature</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-cyan-600">68%</div>
                    <div className="text-sm text-muted-foreground">Humidity</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">5/10</div>
                    <div className="text-sm text-muted-foreground">UV Index</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {useAdvancedAI ? 'Personalized AI Recommendations' : 'Basic Recommendations'}
              </CardTitle>
              <CardDescription>
                {useAdvancedAI 
                  ? 'Evidence-based recommendations with clinical backing' 
                  : 'General recommendations based on weather conditions'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {useAdvancedAI ? (
                <div className="space-y-6">
                  {mockAIRecommendations.map((rec, index) => (
                    <div key={rec.id} className="border rounded-lg p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={rec.priority === 'critical' ? 'destructive' : 
                                        rec.priority === 'high' ? 'default' : 'secondary'}>
                            {rec.priority}
                          </Badge>
                          <Badge variant="outline">
                            {rec.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {(rec.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <Badge variant={rec.evidence === 'grade_a' ? 'default' : 'secondary'}>
                          {rec.evidence} evidence
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{rec.recommendation}</h4>
                        <p className="text-muted-foreground mb-3">{rec.rationale}</p>
                      </div>
                      
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span><strong>Timeline:</strong> {rec.timeframe}</span>
                        </div>
                        {rec.monitoring.length > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Eye className="h-4 w-4" />
                            <span><strong>Monitor:</strong> {rec.monitoring.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {rec.contraindications.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Contraindications:</strong> {rec.contraindications.join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="text-xs text-muted-foreground">
                        <strong>Sources:</strong> {rec.sources.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">General</Badge>
                      <Badge variant="outline">immediate</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Apply moisturizer regularly</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        High humidity detected. Use a lightweight, non-comedogenic moisturizer to maintain skin barrier.
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Frequency:</strong> Twice daily or as needed
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">General</Badge>
                      <Badge variant="outline">preventive</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Limit sun exposure</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        UV index is moderate. Use SPF 30+ sunscreen and seek shade during peak hours.
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Timeline:</strong> When outdoors
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">General</Badge>
                      <Badge variant="outline">lifestyle</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">Monitor pollen levels</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Elevated pollen count detected. Consider staying indoors during high pollen times.
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Frequency:</strong> Check daily pollen forecasts
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg mt-6">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Want more personalized recommendations?</h3>
                    <p className="text-blue-700 text-sm mb-3">
                      Enable AI Mode to get medical-grade analysis with personalized treatment plans, 
                      evidence-based recommendations, and predictive insights tailored to your specific condition.
                    </p>
                    <Button onClick={() => setUseAdvancedAI(true)} size="sm">
                      Enable AI Mode
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                {useAdvancedAI ? 'AI Medical Insights' : 'Basic Health Insights'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {useAdvancedAI ? (
                <div className="prose prose-sm max-w-none">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">Current Risk Assessment Analysis:</h3>
                      <p className="text-muted-foreground">
                        Based on comprehensive analysis of your environmental conditions, symptom patterns, and personalized risk factors, 
                        the AI has identified a <strong>moderate risk level (67/100)</strong> with <strong>94.2% confidence</strong>.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Primary Contributing Factors:</h3>
                      <ul className="list-disc pl-6 text-muted-foreground">
                        <li><strong>Environmental:</strong> High humidity (68%) exceeds your personal sensitivity threshold of 65%</li>
                        <li><strong>Allergenic:</strong> Elevated pollen count (overall: 6) correlates with 73% of your historical flares</li>
                        <li><strong>Physiological:</strong> Stress response patterns match pre-flare indicators from previous episodes</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold">Personalization Factors:</h3>
                      <p className="text-muted-foreground">
                        This assessment is personalized based on your sensitive skin type, documented triggers (humidity, pollen, stress), 
                        and age demographics (26-35 years). The AI has weighted recommendations according to your specific risk profile 
                        and treatment preferences.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold">Evidence-Based Approach:</h3>
                      <p className="text-muted-foreground">
                        Recommendations are graded using clinical evidence standards (Grade A, B, C) and sourced from peer-reviewed 
                        dermatology journals, clinical guidelines, and systematic reviews. The AI continuously updates its knowledge 
                        base with the latest research findings.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900">Medical Disclaimer:</h3>
                      <p className="text-blue-700 text-sm">
                        This AI analysis is designed to supplement, not replace, professional medical advice. 
                        Always consult with a qualified healthcare provider for medical decisions and treatment plans.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">Current Weather Analysis:</h3>
                      <p className="text-muted-foreground">
                        Based on current weather conditions, your risk level is assessed as <strong>moderate</strong>. 
                        High humidity (68%) and elevated pollen levels are the primary environmental factors to monitor.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">Environmental Factors:</h3>
                      <ul className="list-disc pl-6 text-muted-foreground">
                        <li><strong>Humidity:</strong> 68% - Higher than optimal for sensitive skin</li>
                        <li><strong>Temperature:</strong> 22°C - Comfortable range</li>
                        <li><strong>UV Index:</strong> 5 - Moderate, sun protection recommended</li>
                        <li><strong>Pollen:</strong> Elevated levels detected</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold">General Recommendations:</h3>
                      <p className="text-muted-foreground">
                        Focus on basic skin care routine, use appropriate moisturizers, and monitor environmental triggers. 
                        Keep track of your symptoms to identify patterns over time.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <Brain className="h-12 w-12 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900 text-lg mb-2">
                          Unlock Advanced AI Insights
                        </h3>
                        <p className="text-blue-700 text-sm mb-4">
                          Get medical-grade analysis with 99.9% accuracy, personalized treatment plans, 
                          predictive modeling, and evidence-based recommendations from clinical research.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-blue-600 mb-4">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Predictive modeling</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Treatment plans</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Clinical evidence</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Personalized care</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setUseAdvancedAI(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Enable AI Mode
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900">Basic Mode Disclaimer:</h3>
                    <p className="text-gray-700 text-sm">
                      Basic mode provides general recommendations based on weather data only. 
                      For personalized medical insights, enable AI mode or consult with a healthcare provider.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}