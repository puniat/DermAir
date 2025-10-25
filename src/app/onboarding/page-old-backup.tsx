"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/Logo";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { LocationStep } from "@/components/onboarding/location-step";
import { TriggersStep } from "@/components/onboarding/triggers-step";
import { SeverityStep } from "@/components/onboarding/severity-step";
import { CompletionStep } from "@/components/onboarding/completion-step";
import { useUserSession } from "@/hooks/useUserSession";
import type { UserProfile } from "@/types";
import { saveUserProfile } from '@/lib/services/firestore-data';

const TOTAL_STEPS = 5;

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

      // Create the complete profile with session user ID
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
      
      // Update session profile (this handles localStorage storage)
      updateSessionProfile(completeProfile);
      
      // Google sync is disabled for Firebase demo
      /*
      try {
        const { googleAuth } = await import('@/lib/services/google-auth');
        const { googleSheets } = await import('@/lib/services/google-sheets');
        
        if (googleAuth.isAuthenticated()) {
          console.log('Syncing profile to Google Sheets...');
          await googleSheets.saveProfile(completeProfile);
          console.log('✅ Profile synced to Google Sheets');
        }
      } catch (syncError) {
        console.warn('Failed to sync to Google Sheets:', syncError);
        // Continue anyway - local profile is saved
      }
      */
      
      // Save to Firestore
      await saveUserProfile(completeProfile);
      console.log('✅ Profile saved to Firestore');
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="md" />
          <h1 className="text-3xl font-bold text-primary mb-2 mt-4">DermAIr Setup</h1>
          <p className="text-muted-foreground">
            Let&apos;s personalize your skin weather companion
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {currentStep === 1 && (
              <WelcomeStep onNext={nextStep} />
            )}
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

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => router.push("/")}
            className="text-muted-foreground"
          >
            Skip Setup
          </Button>
        </div>
      </div>
    </div>
  );
}