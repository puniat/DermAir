/**
 * Enhanced Risk Dashboard Component
 * 
 * Displays advanced AI-powered risk assessment with medical-grade accuracy,
 * personalized recommendations, and comprehensive treatment planning.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRiskAssessment, EnhancedRiskAssessment } from '@/hooks/useRiskAssessment';
import { useWeather } from '@/hooks/useWeather';
import { useCheckIns } from '@/hooks/useCheckIns';
import { UserProfile } from '@/types';
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
  Eye
} from 'lucide-react';

interface EnhancedRiskDashboardProps {
  userProfile: UserProfile | null;
  className?: string;
}

export function EnhancedRiskDashboard({ userProfile, className }: EnhancedRiskDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: weather } = useWeather(userProfile);
  const { checkIns } = useCheckIns();
  
  const riskAssessment: EnhancedRiskAssessment = useRiskAssessment(
    weather, 
    userProfile, 
    checkIns.slice(0, 14), // Last 2 weeks
    true // Use advanced AI
  );

  if (!userProfile) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Please complete your profile to access AI-powered risk assessment.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Status Banner */}
      <Alert className={riskAssessment.isAdvancedMode ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          {riskAssessment.isAdvancedMode ? (
            <>
              <strong>AI-Powered Analysis Active:</strong> Using medical-grade algorithms with {(riskAssessment.confidence * 100).toFixed(1)}% confidence. 
              Processing time: {riskAssessment.processingTime.toFixed(0)}ms.
            </>
          ) : (
            <>
              <strong>Basic Mode:</strong> Using standard risk calculation. Enable AI mode for medical-grade accuracy.
            </>
          )}
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
          <TabsTrigger value="insights">Advanced Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Overall Risk Score */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                <Shield className={`h-4 w-4 ${getRiskColor(riskAssessment.riskLevel)}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{riskAssessment.riskLevel.toUpperCase()}</div>
                <Progress 
                  value={riskAssessment.riskScore} 
                  className="mt-2"
                  max={10}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Score: {riskAssessment.riskScore.toFixed(1)}/10
                </p>
              </CardContent>
            </Card>

            {/* Confidence Score */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
                <Brain className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(riskAssessment.confidence * 100).toFixed(1)}%</div>
                <Progress 
                  value={riskAssessment.confidence * 100} 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Medical-grade accuracy
                </p>
              </CardContent>
            </Card>

            {/* Next 24h Prediction */}
            {riskAssessment.advancedAssessment && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">24h Forecast</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {riskAssessment.advancedAssessment.predictions.next24h.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Predicted risk score
                  </p>
                  <Badge variant={getTrendBadgeVariant(riskAssessment.advancedAssessment.severity.trajectory)} className="mt-2">
                    {riskAssessment.advancedAssessment.severity.trajectory}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Active Recommendations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Actions</CardTitle>
                <Lightbulb className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{riskAssessment.aiRecommendations.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  AI recommendations
                </p>
                <div className="flex gap-1 mt-2">
                  {['critical', 'high', 'medium'].map(priority => {
                    const count = riskAssessment.aiRecommendations.filter(r => r.priority === priority).length;
                    return count > 0 ? (
                      <Badge key={priority} variant={getPriorityVariant(priority)} className="text-xs">
                        {count} {priority}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Factors Analysis */}
          {riskAssessment.advancedAssessment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Risk Factors Analysis
                </CardTitle>
                <CardDescription>
                  AI-identified factors contributing to your current risk level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskAssessment.advancedAssessment.factors.slice(0, 5).map((factor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {factor.category}
                          </Badge>
                          <span className="font-medium">{factor.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {factor.description}
                        </p>
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
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Evidence-based recommendations personalized for your condition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskAssessment.aiRecommendations.map((rec, index) => (
                  <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityVariant(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline">
                          {rec.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {(rec.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <Badge variant={getEvidenceVariant(rec.evidence)}>
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
                      {rec.monitoring.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>Monitor: {rec.monitoring.join(', ')}</span>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment" className="space-y-6">
          {riskAssessment.treatmentPlan ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Personalized Treatment Plan
                </CardTitle>
                <CardDescription>
                  Comprehensive plan based on your current condition and goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Treatment Phase */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Current Phase: {riskAssessment.treatmentPlan.phase.toUpperCase()}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Duration: {riskAssessment.treatmentPlan.duration}
                  </p>
                </div>

                {/* Goals */}
                <div>
                  <h3 className="font-semibold mb-2">Treatment Goals</h3>
                  <ul className="space-y-1">
                    {riskAssessment.treatmentPlan.goals.map((goal, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Monitoring */}
                <div>
                  <h3 className="font-semibold mb-2">Monitoring Protocol</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Frequency:</strong> {riskAssessment.treatmentPlan.monitoring.frequency}
                    </p>
                    <p className="text-sm">
                      <strong>Metrics:</strong> {riskAssessment.treatmentPlan.monitoring.metrics.join(', ')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                      {riskAssessment.treatmentPlan.monitoring.thresholds.map((threshold, index) => (
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

                {/* Plan Adjustments */}
                <div>
                  <h3 className="font-semibold mb-2">Plan Adjustments</h3>
                  <div className="space-y-2">
                    {riskAssessment.treatmentPlan.adjustments.map((adjustment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                        <span>{adjustment.condition}</span>
                        <Badge variant="outline">{adjustment.action}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Treatment plan generation in progress...
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Reasoning & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line text-sm">
                  {riskAssessment.reasoning}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{riskAssessment.processingTime.toFixed(0)}ms</div>
                  <div className="text-xs text-muted-foreground">Processing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{(riskAssessment.confidence * 100).toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{checkIns.length}</div>
                  <div className="text-xs text-muted-foreground">Data Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {riskAssessment.lastUpdated.toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Last Updated</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions for styling
function getRiskColor(riskLevel: string): string {
  const colors = {
    minimal: 'text-green-600',
    low: 'text-green-500',
    moderate: 'text-yellow-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    severe: 'text-red-500'
  };
  return colors[riskLevel as keyof typeof colors] || 'text-gray-500';
}

function getTrendBadgeVariant(trend: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (trend === 'improving') return 'default';
  if (trend === 'stable') return 'secondary';
  if (trend === 'worsening') return 'destructive';
  return 'outline';
}

function getPriorityVariant(priority: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (priority === 'critical') return 'destructive';
  if (priority === 'high') return 'default';
  if (priority === 'medium') return 'secondary';
  return 'outline';
}

function getEvidenceVariant(evidence: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (evidence === 'grade_a') return 'default';
  if (evidence === 'grade_b') return 'secondary';
  return 'outline';
}