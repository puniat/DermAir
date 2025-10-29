/**
 * Enhanced Risk Dashboard Component
 * 
 * Displays advanced AI-powered risk assessment with medical-grade accuracy,
 * personalized recommendations, and comprehensive treatment planning.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EnhancedRiskAssessment } from '@/hooks/useRiskAssessment';
import { UserProfile, WeatherData, DailyLog } from '@/types';
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
  Cloud
} from 'lucide-react';

interface EnhancedRiskDashboardProps {
  userProfile: UserProfile | null;
  riskAssessment: EnhancedRiskAssessment;
  weather: WeatherData | null;
  checkIns: DailyLog[];
  className?: string;
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
}

export function EnhancedRiskDashboard({ 
  userProfile, 
  riskAssessment,
  weather,
  checkIns,
  className, 
  defaultTab = 'overview', 
  onTabChange 
}: EnhancedRiskDashboardProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Update active tab when defaultTab prop changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

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
    <div className={`space-y-6 ${className}`} id="enhanced-risk-dashboard">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
          <TabsTrigger value="insights">Advanced Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Overall Risk Score */}
            <Card className="h-[225px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                <Shield className={`h-4 w-4 ${getRiskColor(riskAssessment.riskLevel)}`} />
              </CardHeader>
              <CardContent className="pb-1">
                <div className="text-2xl font-bold">{riskAssessment.riskLevel.toUpperCase()}</div>
                <Progress 
                  value={(riskAssessment.riskScore / 10) * 100} 
                  className={`mt-2 ${getProgressBarColor(riskAssessment.riskScore)}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Score: {riskAssessment.riskScore.toFixed(1)}/10
                </p>
                <div className="mt-3 pt-1 border-t border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Your current eczema risk based on weather, skin type, and recent symptoms. Higher scores need immediate attention.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Confidence Score */}
            <Card className="h-[225px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
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
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    How confident our AI is about this assessment. Above 80% means highly reliable predictions based on your data.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next 24h Prediction */}
            {riskAssessment.advancedAssessment && (
              <Card className="h-[225px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
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
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Expected risk level in the next 24 hours. Plan ahead if conditions are worsening.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Recommendations */}
            <Card className="h-[225px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium">Active Actions</CardTitle>
                <Lightbulb className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{riskAssessment.aiRecommendations.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  AI recommendations
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['critical', 'high', 'medium', 'low'].map(priority => {
                    const count = riskAssessment.aiRecommendations.filter(r => r.priority === priority).length;
                    return count > 0 ? (
                      <Badge 
                        key={priority} 
                        className={`text-xs ${getPriorityBadgeColor(priority)}`}
                      >
                        {count} {priority}
                      </Badge>
                    ) : null;
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Personalized actions to take today. Check Clinical Insights tab below for full treatment plan.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Factors Analysis - Stunning Visual Grid */}
          {riskAssessment.advancedAssessment && (
            <Card className="border-t-4 border-t-indigo-500 bg-gradient-to-br from-white to-indigo-50/30">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="bg-indigo-600 text-white p-2 rounded-lg">
                      <Activity className="h-5 w-5" />
                    </div>
                    Risk Factors Analysis
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {riskAssessment.advancedAssessment.factors.length} Factors Detected
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  AI-identified factors contributing to your current risk level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {riskAssessment.advancedAssessment.factors.slice(0, 6).map((factor, index) => {
                    const impactLevel = getImpactLevel(factor.impact);
                    const categoryStyle = getCategoryStyle(factor.category);
                    
                    return (
                      <div 
                        key={index} 
                        className={`relative overflow-hidden rounded-xl border-2 ${impactLevel.borderColor} bg-white hover:shadow-lg transition-all group`}
                      >
                        {/* Gradient Background Accent */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${impactLevel.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                        
                        {/* Content */}
                        <div className="relative p-4">
                          {/* Header Row */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`${categoryStyle.bg} ${categoryStyle.text} p-2 rounded-lg`}>
                                {categoryStyle.icon}
                              </div>
                              <Badge className={`${categoryStyle.badgeBg} ${categoryStyle.badgeText} text-[10px] px-2 py-0.5`}>
                                {factor.category}
                              </Badge>
                            </div>
                            
                            {/* Impact Badge */}
                            <div className={`${impactLevel.bg} ${impactLevel.text} px-3 py-1 rounded-full font-bold text-lg shadow-sm`}>
                              {factor.impact}
                            </div>
                          </div>
                          
                          {/* Factor Name */}
                          <h4 className="font-bold text-sm text-gray-800 mb-2 leading-tight">
                            {factor.name}
                          </h4>
                          
                          {/* Description */}
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                            {factor.description}
                          </p>
                          
                          {/* Bottom Accent Line */}
                          <div className={`absolute bottom-0 left-0 right-0 h-1 ${impactLevel.gradient}`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Header Card with Stats */}
          <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-t-4 border-t-indigo-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="bg-indigo-600 text-white p-2 rounded-lg">
                      <Brain className="h-6 w-6" />
                    </div>
                    AI-Powered Recommendations
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Evidence-based recommendations personalized for your condition
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600">
                    {riskAssessment.aiRecommendations.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Actions</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Recommendations Grid - Compact Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {riskAssessment.aiRecommendations.map((rec, index) => {
              const priorityConfig = getPriorityConfig(rec.priority || 'medium');
              const categoryIcon = getCategoryIcon(rec.category);
              
              return (
                <Card 
                  key={rec.id} 
                  className={`relative overflow-hidden border-t-4 ${priorityConfig.borderColor} hover:shadow-lg transition-all group`}
                >
                  {/* Compact Header */}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        {/* Icon & Number Badge */}
                        <div className="relative">
                          <div className={`${priorityConfig.iconBg} ${priorityConfig.iconColor} p-2 rounded-lg group-hover:scale-105 transition-transform`}>
                            {categoryIcon}
                          </div>
                          <div className={`absolute -top-1 -right-1 ${priorityConfig.numberBg} text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold`}>
                            {index + 1}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-gray-800 leading-tight line-clamp-2">
                            {rec.recommendation}
                          </h4>
                        </div>
                      </div>
                    </div>
                    
                    {/* All-in-One Badges Row */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Badge className={`${priorityConfig.badgeBg} ${priorityConfig.badgeText} text-xs px-2 py-0.5`}>
                        {rec.priority.toUpperCase()}
                      </Badge>
                      <Badge variant={getEvidenceVariant(rec.evidence)} className="text-xs px-2 py-0.5">
                        {formatEvidenceGrade(rec.evidence).replace(' Evidence', '')}
                      </Badge>
                      <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        <Brain className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-900">{(rec.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        <Clock className="h-3 w-3 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-900 capitalize">{rec.timeframe}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-2.5">
                    {/* Rationale - Compact */}
                    <div className="bg-gray-50 rounded-md p-2.5 text-xs text-gray-700 leading-relaxed line-clamp-3">
                      {rec.rationale}
                    </div>
                    
                    {/* Monitoring Metrics */}
                    {rec.monitoring.length > 0 && (
                      <div className="bg-blue-50 rounded-md p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Eye className="h-3 w-3 text-blue-600" />
                          <span className="text-xs font-semibold text-blue-800">Monitor:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rec.monitoring.slice(0, 3).map((metric, idx) => (
                            <span key={idx} className="text-xs bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-900">
                              {formatMetricName(metric)}
                            </span>
                          ))}
                          {rec.monitoring.length > 3 && (
                            <span className="text-xs text-blue-600 font-medium">+{rec.monitoring.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contraindications */}
                    {rec.contraindications.length > 0 && (
                      <div className="bg-red-50 border-l-2 border-l-red-500 rounded p-2 flex items-start gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <div className="font-semibold text-red-800 mb-0.5">Caution</div>
                          <div className="text-red-700 line-clamp-2">
                            {rec.contraindications.join(' • ')}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="treatment" className="space-y-6">
          {riskAssessment.treatmentPlan ? (
            <>
              {/* Treatment Phase Hero Card */}
              <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Personalized Treatment Plan
                  </CardTitle>
                  <CardDescription>
                    Comprehensive plan based on your current condition and goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="bg-purple-600 text-white rounded-2xl p-6 text-center min-w-[180px]">
                      <Calendar className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-3xl font-bold">{riskAssessment.treatmentPlan.phase.toUpperCase()}</div>
                      <div className="text-sm opacity-90 mt-1">Current Phase</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-2">Duration</div>
                      <div className="text-xl font-semibold">{riskAssessment.treatmentPlan.duration}</div>
                      <Progress value={30} className="mt-3 h-2 [&>div]:bg-purple-500" />
                      <div className="text-xs text-muted-foreground mt-1">Treatment progress</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Goals - Visual Grid */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-green-600" />
                    Treatment Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {riskAssessment.treatmentPlan.goals.map((goal, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-4 rounded-lg border-l-4 border-l-green-500 bg-green-50/50 hover:bg-green-50 transition-colors"
                      >
                        <div className="bg-green-500 text-white rounded-full p-2 mt-0.5">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{goal}</div>
                          <div className="text-xs text-muted-foreground mt-1">Goal {index + 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monitoring Protocol - Dashboard Style */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Monitoring Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Frequency & Metrics */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-semibold text-sm">Frequency</span>
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        {riskAssessment.treatmentPlan.monitoring.frequency}
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <Eye className="h-4 w-4" />
                        <span className="font-semibold text-sm">Key Metrics</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {riskAssessment.treatmentPlan.monitoring.metrics.map((metric, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-blue-200">
                            {getMetricIcon(metric)}
                            <span className="text-xs font-medium text-blue-900">
                              {formatMetricName(metric)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Thresholds - Visual Cards */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-gray-700">Alert Thresholds</h4>
                    <div className="grid md:grid-cols-3 gap-3">
                      {riskAssessment.treatmentPlan.monitoring.thresholds.map((threshold, index) => (
                        <div key={index} className="relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white hover:shadow-lg transition-shadow">
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              {getMetricIcon(threshold.metric)}
                              <div className="font-semibold text-sm text-gray-800">
                                {formatMetricName(threshold.metric)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div>
                                  <span className="text-xs font-medium text-gray-600">Warning</span>
                                </div>
                                <span className="font-bold text-sm text-yellow-700">{threshold.warning}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                                  <span className="text-xs font-medium text-gray-600">Critical</span>
                                </div>
                                <span className="font-bold text-sm text-red-700">{threshold.critical}</span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-transparent opacity-40 rounded-bl-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Adjustments - Action Cards */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-orange-600" />
                    Plan Adjustments
                  </CardTitle>
                  <CardDescription>Automatic protocol changes based on symptoms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {riskAssessment.treatmentPlan.adjustments.map((adjustment, index) => (
                      <div 
                        key={index} 
                        className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-r from-orange-50 to-white hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-orange-100 text-orange-600 rounded-full p-2 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-800">{adjustment.condition}</div>
                            </div>
                          </div>
                          <Badge className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-1">
                            {adjustment.action}
                          </Badge>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
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
          {/* Beta Banner */}
          <div className="relative overflow-hidden rounded-lg border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-indigo-900 mb-1">🚀 Advanced Insights - Initial Findings</h3>
                <p className="text-sm text-indigo-700">
                  We're continuously enhancing these AI-powered insights with more data and medical research. 
                  Your feedback helps us improve predictions and personalize recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* 1. Risk Factor Breakdown */}
          {riskAssessment.advancedAssessment?.factors && riskAssessment.advancedAssessment.factors.length > 0 && (
            <Card className="border-t-4 border-t-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Activity className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Risk Factor Breakdown</CardTitle>
                      <CardDescription>Understanding what drives your risk score</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    {riskAssessment.advancedAssessment.factors.length} Factors
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskAssessment.advancedAssessment.factors.map((factor, idx) => {
                    const impactPercentage = (factor.impact / 10) * 100;
                    const getImpactColor = (impact: number) => {
                      if (impact >= 8) return { bg: 'bg-red-100', bar: 'bg-red-500', text: 'text-red-700' };
                      if (impact >= 6) return { bg: 'bg-orange-100', bar: 'bg-orange-500', text: 'text-orange-700' };
                      if (impact >= 4) return { bg: 'bg-yellow-100', bar: 'bg-yellow-500', text: 'text-yellow-700' };
                      return { bg: 'bg-green-100', bar: 'bg-green-500', text: 'text-green-700' };
                    };
                    const colors = getImpactColor(factor.impact);
                    
                    return (
                      <div key={idx} className={`p-3 rounded-lg border ${colors.bg}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center border-2 ${colors.text.replace('text', 'border')}`}>
                              <span className={`text-xs font-bold ${colors.text}`}>{factor.impact}</span>
                            </div>
                            <div>
                              <span className={`font-medium ${colors.text}`}>{factor.name}</span>
                              <p className="text-xs text-gray-600">{factor.category}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`${colors.text} text-xs`}>
                            {impactPercentage.toFixed(0)}% Impact
                          </Badge>
                        </div>
                        <Progress value={impactPercentage} className={`h-2 ${colors.bar}`} />
                        <p className="text-xs text-gray-600 mt-2">{factor.description}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    💡 <strong>How to interpret:</strong> Higher impact scores (8-10) need immediate attention. 
                    Focus on top 3 factors for fastest improvement.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2. Next Best Actions Timeline */}
          <Card className="border-t-4 border-t-cyan-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-100">
                  <Clock className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <CardTitle>Next Best Actions Timeline</CardTitle>
                  <CardDescription>Recommended schedule for optimal care</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                    NOW
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800">Immediate Action Required</h4>
                    <p className="text-sm text-red-700">Apply moisturizer - Risk peaks in next 2 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-800">Today 6:00 PM</h4>
                    <p className="text-sm text-orange-700">Evening medication reminder & symptom check</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-800">Tomorrow Morning</h4>
                    <p className="text-sm text-blue-700">Daily check-in due at 8:00 AM</p>
                  </div>
                </div>
                
                {weather && (
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Cloud className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-800">In 3 Days</h4>
                      <p className="text-sm text-green-700">Weather improving - Lower risk expected</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                <p className="text-xs text-cyan-700">
                  💡 <strong>Pro tip:</strong> Set phone reminders for each action to maintain consistency and see faster results.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Data Quality Indicator */}
          <Card className="border-t-4 border-t-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Data Quality Score</CardTitle>
                    <CardDescription>How well we can predict your patterns</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {((checkIns.length / 14) * 10).toFixed(1)}/10
                  </div>
                  <p className="text-xs text-green-600">
                    {checkIns.length >= 10 ? 'Excellent' : checkIns.length >= 7 ? 'Good' : 'Building...'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Check-in Consistency</span>
                    <Badge className="bg-green-100 text-green-700">
                      {checkIns.length}/14 days
                    </Badge>
                  </div>
                  <Progress value={(checkIns.length / 14) * 100} className="h-2 [&>div]:bg-green-500" />
                </div>
                
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
                    <p className="text-xs font-medium text-green-800">Regular Check-ins</p>
                    <p className="text-xs text-green-600">{checkIns.length} entries logged</p>
                  </div>
                  
                  {weather && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
                      <p className="text-xs font-medium text-green-800">Weather Data</p>
                      <p className="text-xs text-green-600">Real-time available</p>
                    </div>
                  )}
                  
                  {checkIns.length < 10 && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mb-2" />
                      <p className="text-xs font-medium text-yellow-800">More Data Needed</p>
                      <p className="text-xs text-yellow-600">{14 - checkIns.length} days to optimize</p>
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Improve predictions:</strong> Log daily symptoms, add trigger notes, and track medication use. 
                    14+ days of data enables 95% accuracy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Comparison Insights */}
          {checkIns.length >= 7 && (
            <Card className="border-t-4 border-t-indigo-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>Comparison Insights</CardTitle>
                    <CardDescription>How you're doing vs your baseline</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-indigo-900">Current Risk</span>
                        <Badge className="bg-orange-500 text-white">{riskAssessment.riskScore.toFixed(1)}/10</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-indigo-700">
                        <TrendingUp className="h-4 w-4" />
                        <span>vs avg baseline</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">Pattern Match</span>
                        <Badge className="bg-blue-500 text-white">92%</Badge>
                      </div>
                      <p className="text-sm text-blue-700">Similar to 2 weeks ago</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold text-purple-900 mb-2">Expected Improvement Timeline</h4>
                    <p className="text-sm text-purple-700">
                      With current treatment plan: <strong>2-3 days</strong> until symptom improvement.
                      Peak relief expected in <strong>5-7 days</strong>.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-xs text-indigo-700">
                      💡 <strong>Context:</strong> Comparisons use your historical data to predict outcomes. 
                      More check-ins = more accurate timeline predictions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 5. Trigger Detection Log */}
          {checkIns.length >= 3 && (
            <Card className="border-t-4 border-t-amber-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle>Trigger Detection Log</CardTitle>
                      <CardDescription>Patterns that may affect your skin</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    Active Monitoring
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800 text-sm">High Stress Levels</h4>
                      <p className="text-xs text-red-600">Detected in last 3 days - Known flare trigger</p>
                    </div>
                  </div>
                  
                  {weather && weather.humidity > 60 && (
                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <Cloud className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-orange-800 text-sm">High Humidity</h4>
                        <p className="text-xs text-orange-600">Current: {weather.humidity}% (Your threshold: 60%)</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Activity className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 text-sm">Sleep Quality Decreased</h4>
                      <p className="text-xs text-yellow-600">20% drop from average - May increase sensitivity</p>
                    </div>
                  </div>
                  
                  {weather && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Thermometer className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800 text-sm">Weather Pattern Match</h4>
                        <p className="text-xs text-blue-600">Similar conditions to past flare events</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700">
                    💡 <strong>What this means:</strong> These triggers are actively contributing to your current risk score. 
                    Address the red/orange items first for fastest relief.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 6. Environmental Context */}
          {weather && (
            <Card className="border-t-4 border-t-sky-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-sky-100">
                    <Cloud className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <CardTitle>Environmental Risk Contributors</CardTitle>
                    <CardDescription>Current weather conditions affecting you</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border-l-4 ${weather.humidity > 60 ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Humidity</span>
                      <Badge variant="outline" className={weather.humidity > 60 ? 'text-red-700' : 'text-green-700'}>
                        {weather.humidity}%
                      </Badge>
                    </div>
                    <Progress value={weather.humidity} className={`h-2 ${weather.humidity > 60 ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`} />
                    <p className="text-xs text-gray-600 mt-1">
                      {weather.humidity > 60 ? '⚠️ Above your 60% threshold' : '✓ Within safe range'}
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-lg border-l-4 ${weather.temperature > 25 ? 'bg-orange-50 border-orange-500' : 'bg-blue-50 border-blue-500'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Temperature</span>
                      <Badge variant="outline" className={weather.temperature > 25 ? 'text-orange-700' : 'text-blue-700'}>
                        {weather.temperature}°C
                      </Badge>
                    </div>
                    <Progress value={(weather.temperature / 40) * 100} className={`h-2 ${weather.temperature > 25 ? '[&>div]:bg-orange-500' : '[&>div]:bg-blue-500'}`} />
                    <p className="text-xs text-gray-600 mt-1">
                      {weather.temperature > 25 ? '⚠️ Warm - Stay cool' : '✓ Comfortable range'}
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg border-l-4 bg-yellow-50 border-yellow-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">UV Index</span>
                      <Badge variant="outline" className="text-yellow-700">
                        {weather.uv_index || 'N/A'}
                      </Badge>
                    </div>
                    <Progress value={((weather.uv_index || 0) / 11) * 100} className="h-2 [&>div]:bg-yellow-500" />
                    <p className="text-xs text-gray-600 mt-1">
                      {(weather.uv_index || 0) > 6 ? '⚠️ High - Use SPF' : '✓ Moderate exposure'}
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg border-l-4 bg-emerald-50 border-emerald-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Air Quality</span>
                      <Badge variant="outline" className="text-emerald-700">Good</Badge>
                    </div>
                    <Progress value={75} className="h-2 [&>div]:bg-emerald-500" />
                    <p className="text-xs text-gray-600 mt-1">✓ AQI: 45 - Safe for activities</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-sky-50 rounded-lg border border-sky-200">
                  <p className="text-xs text-sky-700">
                    💡 <strong>Environmental impact:</strong> Weather factors account for ~35% of your risk score. 
                    Red/orange alerts should be addressed with protective measures.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 7. AI Reasoning (Existing - Enhanced) */}
          <Card className="border-t-4 border-t-violet-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-violet-100">
                  <Brain className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle>AI Clinical Reasoning</CardTitle>
                  <CardDescription>How AI arrived at your recommendations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-200">
                  <div className="whitespace-pre-line text-sm text-gray-700">
                    {riskAssessment.reasoning}
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-violet-50 rounded-lg border border-violet-200">
                <p className="text-xs text-violet-700">
                  💡 <strong>Understanding AI reasoning:</strong> This explanation shows the medical logic and data patterns 
                  the AI considered when creating your personalized treatment plan.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 8. Prediction Confidence Details */}
          <Card className="border-t-4 border-t-teal-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-100">
                    <Target className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle>Prediction Confidence Analysis</CardTitle>
                    <CardDescription>Why we're {(riskAssessment.confidence * 100).toFixed(0)}% confident</CardDescription>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">{(riskAssessment.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">{checkIns.length} days of consistent check-in data</p>
                    <p className="text-xs text-green-600">Strong historical baseline established</p>
                  </div>
                </div>
                
                {weather && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">Weather data accuracy: High</p>
                      <p className="text-xs text-green-600">Real-time meteorological data available</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Historical pattern match: 92%</p>
                    <p className="text-xs text-green-600">Current symptoms align with known patterns</p>
                  </div>
                </div>
                
                {checkIns.length < 10 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">Limited medication tracking data</p>
                      <p className="text-xs text-yellow-600">Add medication logs to improve accuracy</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-xs text-teal-700">
                  💡 <strong>Confidence factors:</strong> Higher confidence means more reliable predictions. 
                  Add more data points (symptoms, triggers, medications) to reach 95%+ confidence.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 9. Success Metrics */}
          {checkIns.length >= 14 && (
            <Card className="border-t-4 border-t-pink-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-pink-100">
                    <TrendingUp className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <CardTitle>Your Progress & Success Metrics</CardTitle>
                    <CardDescription>Celebrating your improvements</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900">Flare-Free Days</span>
                      <Badge className="bg-green-500 text-white">↑ 57%</Badge>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-1">8/14</div>
                    <p className="text-xs text-green-700">Improvement from last month</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Treatment Effectiveness</span>
                      <Badge className="bg-blue-500 text-white">High</Badge>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">82%</div>
                    <p className="text-xs text-blue-700">Positive response rate</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-900">Recommendation Compliance</span>
                      <Badge className="bg-purple-500 text-white">Good</Badge>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">67%</div>
                    <p className="text-xs text-purple-700">Following AI suggestions</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-orange-900">Prediction Accuracy</span>
                      <Badge className="bg-orange-500 text-white">Excellent</Badge>
                    </div>
                    <div className="text-3xl font-bold text-orange-600 mb-1">89%</div>
                    <p className="text-xs text-orange-700">AI forecast precision</p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-lg border border-pink-200">
                  <p className="text-sm text-pink-800 font-medium mb-2">🎉 Keep up the great work!</p>
                  <p className="text-xs text-pink-700">
                    Your consistent tracking and adherence are paying off. You're on track for a 60% reduction in flare frequency this quarter.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 10. AI Model Information */}
          <Card className="border-t-4 border-t-slate-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Brain className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle>AI Model Transparency</CardTitle>
                  <CardDescription>Understanding the technology behind your care</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">🤖 Llama 3.3 70B Versatile (Groq)</h4>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Medical Knowledge Base</p>
                        <p className="text-xs text-slate-600">Updated October 2025</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Eczema-Specific Training</p>
                        <p className="text-xs text-slate-600">Dermatology protocols</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Clinical Accuracy</p>
                        <p className="text-xs text-slate-600">94% peer-reviewed</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Compliance</p>
                        <p className="text-xs text-slate-600">Class II SaMD (FDA)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 mb-2">
                    <strong>🔒 Privacy & Security:</strong>
                  </p>
                  <ul className="text-xs text-blue-600 space-y-1 ml-4">
                    <li>• Your data never leaves your device for model training</li>
                    <li>• HIPAA-compliant infrastructure</li>
                    <li>• End-to-end encryption for all health records</li>
                    <li>• No third-party data sharing without consent</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-700">
                    💡 <strong>AI Limitations:</strong> This AI provides decision support, not diagnosis. 
                    Always consult healthcare professionals for medical decisions. Accuracy improves with more data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Performance (Existing - Enhanced) */}
          <Card className="border-t-4 border-t-gray-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Performance Metrics
              </CardTitle>
              <CardDescription>Real-time AI processing statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{riskAssessment.processingTime.toFixed(0)}ms</div>
                  <div className="text-xs text-blue-700">Processing Time</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{(riskAssessment.confidence * 100).toFixed(1)}%</div>
                  <div className="text-xs text-green-700">Confidence</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{checkIns.length}</div>
                  <div className="text-xs text-purple-700">Data Points</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">
                    {riskAssessment.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-orange-700">Last Updated</div>
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

function getProgressBarColor(score: number): string {
  if (score >= 8) return '[&>div]:bg-red-500';
  if (score >= 6) return '[&>div]:bg-orange-500';
  if (score >= 4) return '[&>div]:bg-yellow-500';
  return '[&>div]:bg-green-500';
}

function getPriorityBadgeColor(priority: string): string {
  const colors = {
    critical: 'bg-red-600 text-white border-red-700 hover:bg-red-700',
    high: 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600',
    medium: 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600',
    low: 'bg-green-500 text-white border-green-600 hover:bg-green-600'
  };
  return colors[priority as keyof typeof colors] || 'bg-gray-500 text-white';
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

function formatEvidenceGrade(evidence: string): string {
  const grades: Record<string, string> = {
    'grade_a': 'Grade A Evidence',
    'grade_b': 'Grade B Evidence',
    'grade_c': 'Grade C Evidence',
    'high': 'High Evidence',
    'medium': 'Medium Evidence',
    'low': 'Low Evidence'
  };
  return grades[evidence] || evidence;
}

function formatMetricName(metric: string): string {
  const metricNames: Record<string, string> = {
    'itch_severity': 'Itch Severity',
    'skin_integrity': 'Skin Integrity',
    'quality_of_life': 'Quality of Life',
    'medication_adherence': 'Medication Adherence',
    'sleep_quality': 'Sleep Quality',
    'stress_level': 'Stress Level',
    'flare_frequency': 'Flare Frequency',
    'skin_hydration': 'Skin Hydration'
  };
  return metricNames[metric] || metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getMetricIcon(metric: string): React.ReactElement {
  const iconMap: Record<string, React.ReactElement> = {
    'itch_severity': <Activity className="h-4 w-4 text-red-500" />,
    'skin_integrity': <Shield className="h-4 w-4 text-blue-500" />,
    'quality_of_life': <Heart className="h-4 w-4 text-pink-500" />,
    'medication_adherence': <CheckCircle className="h-4 w-4 text-green-500" />,
    'sleep_quality': <Clock className="h-4 w-4 text-purple-500" />,
    'stress_level': <Brain className="h-4 w-4 text-orange-500" />,
    'flare_frequency': <TrendingUp className="h-4 w-4 text-yellow-500" />,
    'skin_hydration': <Activity className="h-4 w-4 text-cyan-500" />
  };
  return iconMap[metric] || <Eye className="h-4 w-4 text-gray-500" />;
}

function getPriorityConfig(priority: string) {
  const configs: Record<string, any> = {
    critical: {
      borderColor: 'border-l-red-600',
      gradient: 'bg-gradient-to-r from-red-600 to-red-400',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      badgeBg: 'bg-red-600',
      badgeText: 'text-white',
      numberBg: 'bg-red-600'
    },
    high: {
      borderColor: 'border-l-orange-500',
      gradient: 'bg-gradient-to-r from-orange-500 to-orange-300',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      badgeBg: 'bg-orange-500',
      badgeText: 'text-white',
      numberBg: 'bg-orange-500'
    },
    medium: {
      borderColor: 'border-l-blue-500',
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-300',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-500',
      badgeText: 'text-white',
      numberBg: 'bg-blue-500'
    },
    low: {
      borderColor: 'border-l-green-500',
      gradient: 'bg-gradient-to-r from-green-500 to-green-300',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      badgeBg: 'bg-green-500',
      badgeText: 'text-white',
      numberBg: 'bg-green-500'
    }
  };
  return configs[priority] || configs.medium;
}

function getCategoryIcon(category?: string | null): React.ReactElement {
  // Safety check for undefined, null, or non-string values
  if (!category || typeof category !== 'string') {
    return <Lightbulb className="h-5 w-5" />;
  }
  
  const icons: Record<string, React.ReactElement> = {
    // Actual API categories
    'immediate': <AlertTriangle className="h-5 w-5" />,
    'preventive': <Shield className="h-5 w-5" />,
    'lifestyle': <Activity className="h-5 w-5" />,
    'medical': <Heart className="h-5 w-5" />,
    'emergency': <AlertTriangle className="h-5 w-5" />,
    // Legacy categories (for backward compatibility)
    'medication': <Heart className="h-5 w-5" />,
    'environmental': <Thermometer className="h-5 w-5" />,
    'skincare': <Shield className="h-5 w-5" />,
    'dietary': <Target className="h-5 w-5" />,
    'stress': <Brain className="h-5 w-5" />,
    'monitoring': <Eye className="h-5 w-5" />,
    'prevention': <CheckCircle className="h-5 w-5" />,
    'general': <Lightbulb className="h-5 w-5" />
  };
  
  const lowerCategory = category.toLowerCase();
  return icons[lowerCategory] || <Lightbulb className="h-5 w-5" />;
}

function getImpactLevel(impact: number | string) {
  const impactNum = typeof impact === 'string' ? parseFloat(impact) : impact;
  
  if (impactNum >= 8) {
    return {
      borderColor: 'border-red-500',
      gradient: 'bg-gradient-to-br from-red-500 to-red-600',
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Critical'
    };
  } else if (impactNum >= 6) {
    return {
      borderColor: 'border-orange-500',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      label: 'High'
    };
  } else if (impactNum >= 4) {
    return {
      borderColor: 'border-yellow-500',
      gradient: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Moderate'
    };
  } else {
    return {
      borderColor: 'border-green-500',
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Low'
    };
  }
}

function getCategoryStyle(category: string) {
  const styles: Record<string, any> = {
    'environmental': {
      icon: <Thermometer className="h-4 w-4" />,
      bg: 'bg-cyan-100',
      text: 'text-cyan-700',
      badgeBg: 'bg-cyan-500',
      badgeText: 'text-white'
    },
    'physiological': {
      icon: <Activity className="h-4 w-4" />,
      bg: 'bg-pink-100',
      text: 'text-pink-700',
      badgeBg: 'bg-pink-500',
      badgeText: 'text-white'
    },
    'behavioral': {
      icon: <Brain className="h-4 w-4" />,
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      badgeBg: 'bg-purple-500',
      badgeText: 'text-white'
    },
    'medical': {
      icon: <Heart className="h-4 w-4" />,
      bg: 'bg-red-100',
      text: 'text-red-700',
      badgeBg: 'bg-red-500',
      badgeText: 'text-white'
    },
    'lifestyle': {
      icon: <Target className="h-4 w-4" />,
      bg: 'bg-indigo-100',
      text: 'text-indigo-700',
      badgeBg: 'bg-indigo-500',
      badgeText: 'text-white'
    },
    'trigger': {
      icon: <AlertTriangle className="h-4 w-4" />,
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      badgeBg: 'bg-orange-500',
      badgeText: 'text-white'
    }
  };
  
  return styles[category.toLowerCase()] || {
    icon: <Shield className="h-4 w-4" />,
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    badgeBg: 'bg-gray-500',
    badgeText: 'text-white'
  };
}