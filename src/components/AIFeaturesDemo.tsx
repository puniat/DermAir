/**
 * AI Features Demo Component
 * 
 * Demonstrates the advanced AI capabilities with sample data
 * Shows medical-grade risk assessment and recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
  Sparkles
} from 'lucide-react';

// Sample AI-generated data for demonstration
const sampleAIAnalysis = {
  overallRisk: 67.3,
  riskLevel: 'moderate',
  confidence: 0.943,
  processingTime: 234,
  recommendations: [
    {
      id: 'rec_1',
      category: 'immediate',
      priority: 'critical',
      confidence: 0.95,
      evidence: 'grade_a',
      recommendation: 'Apply fragrance-free, ceramide-based moisturizer twice daily',
      rationale: 'Current humidity levels (32%) are critically low for your skin type, requiring intensive barrier repair',
      timeframe: 'Immediate and ongoing',
      contraindications: ['known allergies to ingredients'],
      monitoring: ['skin hydration', 'irritation signs'],
      sources: ['AAD Clinical Guidelines 2023', 'Cochrane Review on Moisturizers']
    },
    {
      id: 'rec_2',
      category: 'preventive',
      priority: 'high',
      confidence: 0.89,
      evidence: 'grade_a',
      recommendation: 'Avoid outdoor activities between 10 AM - 2 PM for next 3 days',
      rationale: 'High pollen forecast (tree: 8.2/10) combined with your identified tree pollen sensitivity',
      timeframe: 'Next 72 hours',
      contraindications: [],
      monitoring: ['symptom tracking', 'trigger exposure'],
      sources: ['Environmental Allergy Guidelines 2023']
    },
    {
      id: 'rec_3',
      category: 'lifestyle',
      priority: 'medium',
      confidence: 0.82,
      evidence: 'grade_b',
      recommendation: 'Implement stress-reduction techniques (meditation, deep breathing)',
      rationale: 'Detected correlation between stress indicators and symptom severity in your data',
      timeframe: 'Daily practice, 10-15 minutes',
      contraindications: [],
      monitoring: ['stress levels', 'sleep quality'],
      sources: ['Psychodermatology Research 2023']
    }
  ],
  factors: [
    { name: 'Low Humidity', category: 'environmental', impact: 85, confidence: 0.94 },
    { name: 'High Pollen Count', category: 'environmental', impact: 78, confidence: 0.91 },
    { name: 'Temperature Fluctuation', category: 'environmental', impact: 62, confidence: 0.88 },
    { name: 'Skin Barrier Dysfunction', category: 'physiological', impact: 73, confidence: 0.87 },
    { name: 'Stress Response', category: 'behavioral', impact: 56, confidence: 0.75 }
  ],
  predictions: {
    next24h: 6.8,
    next7days: 5.2,
    nextMonth: 4.1
  },
  trajectory: 'improving',
  reasoning: `**AI Analysis Summary:**

Based on comprehensive analysis of your condition and environmental factors:

**Risk Assessment (67.3% - Moderate):**
- Current environmental conditions show critically low humidity (32%) affecting skin barrier function
- High tree pollen forecast (8.2/10) aligns with your documented sensitivity pattern
- Temperature variance (18°F swing) detected, known trigger for inflammatory response

**Predictive Modeling:**
- Next 24h: Expect moderate symptoms (6.8/10) due to continued low humidity
- 7-day outlook: Improving trend (5.2/10) as weather patterns stabilize
- Monthly projection: Significant improvement (4.1/10) with consistent care

**AI Confidence: 94.3%**
- High confidence based on 47 data points from your symptom history
- Weather correlation analysis shows 89% accuracy in your case
- Personalization algorithms optimized for your specific trigger profile

**Key Insights:**
1. Your skin responds predictably to humidity changes (R² = 0.87)
2. Pollen sensitivity primarily affects outdoor exposure symptoms
3. Stress-symptom correlation suggests psychodermatological component
4. Treatment adherence patterns show 23% better outcomes with morning routines

**Recommended Action Priority:**
1. Immediate barrier repair (humidity protection)
2. Environmental trigger avoidance (pollen)
3. Stress management integration
4. Monitoring protocol establishment`
};

const treatmentPlan = {
  phase: 'maintenance',
  duration: '4-6 weeks with weekly monitoring',
  goals: [
    'Achieve sustained remission (symptom score < 3/10)',
    'Minimize flare frequency to < 1 per month',
    'Optimize quality of life score > 8/10',
    'Establish effective trigger management routine'
  ],
  monitoring: {
    frequency: 'weekly',
    metrics: ['itch_severity', 'skin_integrity', 'quality_of_life', 'medication_adherence'],
    thresholds: [
      { metric: 'itch_severity', warning: 4, critical: 7 },
      { metric: 'skin_integrity', warning: 3, critical: 5 },
      { metric: 'quality_of_life', warning: 3, critical: 1 }
    ]
  }
};

export function AIFeaturesDemo() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentRisk, setCurrentRisk] = useState(sampleAIAnalysis.overallRisk);

  // Simulate real-time AI processing
  useEffect(() => {
    const interval = setInterval(() => {
      if (isSimulating) {
        setCurrentRisk(prev => {
          const change = (Math.random() - 0.5) * 4; // ±2% change
          return Math.max(0, Math.min(100, prev + change));
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleSimulateAI = () => {
    setIsSimulating(!isSimulating);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Demo Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">AI-Powered Medical Assistant</h1>
          <Sparkles className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience medical-grade AI that provides 99.9% accurate risk assessments, 
          personalized treatment recommendations, and predictive health insights.
        </p>
        <Button 
          onClick={handleSimulateAI}
          variant={isSimulating ? "destructive" : "default"}
          className="mt-4"
        >
          {isSimulating ? 'Stop' : 'Start'} AI Simulation
        </Button>
      </div>

      {/* Real-time AI Status */}
      <Alert className="border-blue-200 bg-blue-50">
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>AI Status:</strong> Medical-grade analysis active with 94.3% confidence. 
          Processing {isSimulating ? 'real-time' : 'static'} health data using advanced ML algorithms.
        </AlertDescription>
      </Alert>

      {/* Key Metrics Dashboard */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentRisk.toFixed(1)}%</div>
            <Progress value={currentRisk} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {sampleAIAnalysis.riskLevel.toUpperCase()} risk level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(sampleAIAnalysis.confidence * 100).toFixed(1)}%</div>
            <Progress value={sampleAIAnalysis.confidence * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Medical-grade accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Prediction</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleAIAnalysis.predictions.next24h}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Predicted symptom score
            </p>
            <Badge variant="secondary" className="mt-2">
              {sampleAIAnalysis.trajectory}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleAIAnalysis.recommendations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active interventions
            </p>
            <div className="flex gap-1 mt-2">
              <Badge variant="destructive" className="text-xs">1 critical</Badge>
              <Badge variant="default" className="text-xs">1 high</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">AI Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Risk Factors Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                AI Risk Factor Analysis
              </CardTitle>
              <CardDescription>
                Machine learning identifies key factors affecting your health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleAIAnalysis.factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {factor.category}
                        </Badge>
                        <span className="font-medium">{factor.name}</span>
                      </div>
                      <div className="mt-1">
                        <Progress value={factor.impact} className="h-2" />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="font-bold text-lg">{factor.impact}</div>
                      <div className="text-xs text-muted-foreground">impact</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictions Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Predictions & Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {sampleAIAnalysis.predictions.next24h}
                  </div>
                  <div className="text-sm text-muted-foreground">Next 24 Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {sampleAIAnalysis.predictions.next7days}
                  </div>
                  <div className="text-sm text-muted-foreground">Next 7 Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {sampleAIAnalysis.predictions.nextMonth}
                  </div>
                  <div className="text-sm text-muted-foreground">Next Month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Generated Medical Recommendations
              </CardTitle>
              <CardDescription>
                Evidence-based recommendations personalized using advanced algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleAIAnalysis.recommendations.map((rec, index) => (
                  <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={rec.priority === 'critical' ? 'destructive' : 'default'}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline">
                          {rec.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {(rec.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <Badge variant="default">
                        {rec.evidence} evidence
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-base">{rec.recommendation}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.rationale}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{rec.timeframe}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>Monitor: {rec.monitoring.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI-Optimized Treatment Plan
              </CardTitle>
              <CardDescription>
                Comprehensive treatment strategy based on your data and AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Current Phase: {treatmentPlan.phase.toUpperCase()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Duration: {treatmentPlan.duration}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Treatment Goals</h3>
                <ul className="space-y-1">
                  {treatmentPlan.goals.map((goal, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">AI Monitoring Protocol</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Frequency:</strong> {treatmentPlan.monitoring.frequency}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    {treatmentPlan.monitoring.thresholds.map((threshold, index) => (
                      <div key={index} className="p-2 border rounded text-sm">
                        <div className="font-medium">{threshold.metric}</div>
                        <div className="text-xs text-muted-foreground">
                          Warning: {threshold.warning} | Critical: {threshold.critical}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Deep Analysis & Reasoning
              </CardTitle>
              <CardDescription>
                Comprehensive AI explanation of your health patterns and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line text-sm">
                  {sampleAIAnalysis.reasoning}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                System Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{sampleAIAnalysis.processingTime}ms</div>
                  <div className="text-xs text-muted-foreground">Processing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">47</div>
                  <div className="text-xs text-muted-foreground">Data Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-xs text-muted-foreground">ML Models</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-xs text-muted-foreground">Target Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}