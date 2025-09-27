"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/types";

const SEVERITY_LEVELS = [
  {
    value: "mild" as const,
    label: "Mild",
    description: "Slight itching, minimal redness, doesn't affect daily activities"
  },
  {
    value: "moderate" as const,
    label: "Moderate", 
    description: "Noticeable itching and redness, sometimes affects sleep or activities"
  },
  {
    value: "severe" as const,
    label: "Severe",
    description: "Intense itching, significant redness/inflammation, regularly disrupts life"
  }
];

const TIME_PERIODS = [
  "Past week",
  "Past month", 
  "Past 3 months",
  "Past 6 months",
  "Past year"
];

interface SeverityStepProps {
  profile: Partial<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function SeverityStep({ profile, updateProfile, onNext, onPrev }: SeverityStepProps) {
  const [currentSeverity, setCurrentSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [recentSeverity, setRecentSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [timePeriod, setTimePeriod] = useState("Past month");
  const [riskThreshold, setRiskThreshold] = useState<"low" | "moderate" | "high">(
    profile.preferences?.riskThreshold || "moderate"
  );

  const handleNext = () => {
    const severityHistory = [
      {
        date: new Date().toISOString(),
        severity: currentSeverity
      },
      {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        severity: recentSeverity
      }
    ];

    updateProfile({
      severityHistory,
      preferences: {
        ...profile.preferences,
        notifications: profile.preferences?.notifications ?? true,
        riskThreshold
      }
    });
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle>Tell us about your skin condition</CardTitle>
        <CardDescription>
          Understanding your typical severity helps us calibrate risk predictions to your experience.
        </CardDescription>
      </CardHeader>

      <div className="space-y-6">
        {/* Current Severity */}
        <div className="space-y-3">
          <Label className="text-base font-medium">How would you describe your skin right now?</Label>
          <Select value={currentSeverity} onValueChange={(value: "mild" | "moderate" | "severe") => setCurrentSeverity(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <div>
                    <div className="font-medium">{level.label}</div>
                    <div className="text-xs text-muted-foreground">{level.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recent History */}
        <div className="space-y-3">
          <Label className="text-base font-medium">What about in the {timePeriod.toLowerCase()}?</Label>
          <div className="flex gap-3">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_PERIODS.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={recentSeverity} onValueChange={(value: "mild" | "moderate" | "severe") => setRecentSeverity(value)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Risk Threshold */}
        <div className="space-y-3">
          <Label className="text-base font-medium">When should we alert you about potential flare-ups?</Label>
          <Select value={riskThreshold} onValueChange={(value: "low" | "moderate" | "high") => setRiskThreshold(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div>
                  <div className="font-medium">Low risk and above</div>
                  <div className="text-xs text-muted-foreground">Get more frequent alerts, even for minor risks</div>
                </div>
              </SelectItem>
              <SelectItem value="moderate">
                <div>
                  <div className="font-medium">Moderate risk and above</div>
                  <div className="text-xs text-muted-foreground">Balanced approach - recommended for most users</div>
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div>
                  <div className="font-medium">High risk only</div>
                  <div className="text-xs text-muted-foreground">Only alert for significant risk conditions</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Privacy Note:</strong> This information helps personalize your experience 
            and is stored securely on your device only.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}