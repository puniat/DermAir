"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/Logo";
import { CompletionStep } from "@/components/onboarding/completion-step";
import { useUserSession } from "@/hooks/useUserSession";
import type { UserProfile } from "@/types";
import { saveUserProfile } from '@/lib/services/firestore-data';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getCurrentLocation, reverseGeocode, getLocationByZipcode } from "@/lib/api/weather";

const TOTAL_STEPS = 2;

const COMMON_TRIGGERS = [
  "High humidity", "Low humidity", "Temperature changes",
  "High pollen", "Dust", "Stress",
  "Certain fabrics", "Fragrances/perfumes", "Soaps/detergents",
  "Food allergies", "Exercise/sweating", "Lack of sleep",
];

const SEVERITY_LEVELS = [
  { value: "mild" as const, label: "Mild", emoji: "😊", color: "green", description: "Slight itching, minimal redness" },
  { value: "moderate" as const, label: "Moderate", emoji: "😐", color: "yellow", description: "Noticeable itching and redness" },
  { value: "severe" as const, label: "Severe", emoji: "😣", color: "red", description: "Intense itching, significant inflammation" }
];

const RISK_THRESHOLDS = [
  { value: "low" as const, label: "Low Risk", emoji: "🔔", description: "More alerts" },
  { value: "moderate" as const, label: "Moderate", emoji: "⚖️", description: "Balanced (recommended)" },
  { value: "high" as const, label: "High Risk", emoji: "⚠️", description: "Critical only" }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { session, updateProfile: updateSessionProfile } = useUserSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    triggers: [],
    severityHistory: [],
    preferences: {
      notifications: true,
      riskThreshold: "moderate"
    }
  });

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      if (!session) {
        console.error("No session available");
        return;
      }

      const completeProfile: UserProfile = {
        id: session.userId,
        skin_type: profile.skin_type!,
        location: profile.location!,
        triggers: profile.triggers || [],
        severityHistory: profile.severityHistory || [],
        preferences: profile.preferences || {
          notifications: true,
          riskThreshold: "moderate"
        },
        created_at: new Date()
      };

      console.log(`✅ Completing onboarding for user ${session.userId}:`, completeProfile);
      
      updateSessionProfile(completeProfile);
      await saveUserProfile(completeProfile);
      console.log('✅ Profile saved to Firestore');
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Compact Header */}
        <div className="text-center mb-4 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <Logo size="sm" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">DermAIr Setup</h1>
              <p className="text-xs text-gray-600">Quick & Easy Personalization</p>
            </div>
          </div>
        </div>

        {/* Step Indicators - Horizontal Pills */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {STEP_INFO.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <div
                  key={stepNumber}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                    isActive 
                      ? 'bg-teal-600 text-white scale-105 shadow-lg' 
                      : isCompleted
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <span className="text-base">{step.icon}</span>
                  <span className={`text-xs font-medium ${isActive ? 'block' : 'hidden sm:block'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <Progress value={progress} className="h-1.5" />
            <div className="absolute -top-1 right-0 text-xs font-medium text-teal-600">
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        {/* Main Content Card - Compact */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            {currentStep === 1 && <WelcomeStep onNext={nextStep} />}
            {currentStep === 2 && (
              <LocationStep 
                profile={profile}
                updateProfile={updateProfile}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {currentStep === 3 && (
              <TriggersStep
                profile={profile}
                updateProfile={updateProfile}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {currentStep === 4 && (
              <SeverityStep
                profile={profile}
                updateProfile={updateProfile}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {currentStep === 5 && (
              <CompletionStep
                profile={profile}
                onComplete={completeOnboarding}
                onPrev={prevStep}
              />
            )}
          </CardContent>
        </Card>

        {/* Compact Navigation Footer */}
        <div className="mt-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-gray-600"
          >
            Skip Setup
          </Button>
        </div>

        {/* Trust Badge */}
        <div className="mt-6 text-center">
          <Badge variant="secondary" className="gap-1 py-1 px-3">
            <Sparkles className="h-3 w-3" />
            <span className="text-xs">AI-Powered • Secure • Private</span>
          </Badge>
        </div>
      </div>
    </div>
  );
}