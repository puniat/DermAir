"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/types";

const SEVERITY_LEVELS = [
  {
    value: "mild" as const,
    label: "Mild",
    emoji: "😊",
    color: "green",
    description: "Slight itching, minimal redness",
    details: "Doesn't affect daily activities"
  },
  {
    value: "moderate" as const,
    label: "Moderate",
    emoji: "😐",
    color: "yellow",
    description: "Noticeable itching and redness",
    details: "Sometimes affects sleep or activities"
  },
  {
    value: "severe" as const,
    label: "Severe",
    emoji: "😣",
    color: "red",
    description: "Intense itching, significant inflammation",
    details: "Regularly disrupts daily life"
  }
];

const RISK_THRESHOLDS = [
  {
    value: "low" as const,
    label: "Low Risk & Above",
    emoji: "🔔",
    description: "More frequent alerts, even for minor risks"
  },
  {
    value: "moderate" as const,
    label: "Moderate Risk & Above",
    emoji: "⚖️",
    description: "Balanced approach (recommended)"
  },
  {
    value: "high" as const,
    label: "High Risk Only",
    emoji: "⚠️",
    description: "Only significant risk conditions"
  }
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

  const getSeverityColor = (severity: string) => {
    const level = SEVERITY_LEVELS.find(l => l.value === severity);
    return level?.color || 'gray';
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    if (color === 'green') {
      return isSelected 
        ? 'bg-green-100 border-green-500 shadow-lg' 
        : 'bg-white border-green-200 hover:border-green-400 hover:bg-green-50';
    }
    if (color === 'yellow') {
      return isSelected 
        ? 'bg-yellow-100 border-yellow-500 shadow-lg' 
        : 'bg-white border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50';
    }
    if (color === 'red') {
      return isSelected 
        ? 'bg-red-100 border-red-500 shadow-lg' 
        : 'bg-white border-red-200 hover:border-red-400 hover:bg-red-50';
    }
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about your skin</h2>
        <p className="text-xs text-gray-600">Help us calibrate predictions to your experience</p>
      </div>

      <div className="space-y-5">
        {/* Current Severity - Visual Cards */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900">How is your skin right now?</Label>
          <div className="grid grid-cols-3 gap-3">
            {SEVERITY_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setCurrentSeverity(level.value)}
                className={`
                  p-4 rounded-xl border-2 transition-all cursor-pointer text-center
                  ${getColorClasses(level.color, currentSeverity === level.value)}
                `}
              >
                <div className="text-3xl mb-2">{level.emoji}</div>
                <div className="font-bold text-sm mb-1">{level.label}</div>
                <div className="text-xs text-gray-600">{level.description}</div>
                <div className="text-xs text-gray-500 mt-1">{level.details}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent History */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900">How was it in the past month?</Label>
          <div className="grid grid-cols-3 gap-3">
            {SEVERITY_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setRecentSeverity(level.value)}
                className={`
                  p-3 rounded-xl border-2 transition-all cursor-pointer text-center
                  ${getColorClasses(level.color, recentSeverity === level.value)}
                `}
              >
                <div className="text-2xl mb-1">{level.emoji}</div>
                <div className="font-bold text-sm">{level.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Risk Threshold - Visual Cards */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-900">When should we alert you?</Label>
          <div className="grid grid-cols-3 gap-3">
            {RISK_THRESHOLDS.map((threshold) => (
              <button
                key={threshold.value}
                type="button"
                onClick={() => setRiskThreshold(threshold.value)}
                className={`
                  p-3 rounded-xl border-2 transition-all cursor-pointer text-center
                  ${riskThreshold === threshold.value
                    ? 'bg-teal-100 border-teal-500 shadow-lg'
                    : 'bg-white border-gray-200 hover:border-teal-400 hover:bg-teal-50'
                  }
                `}
              >
                <div className="text-2xl mb-1">{threshold.emoji}</div>
                <div className="font-bold text-sm mb-1">{threshold.label}</div>
                <div className="text-xs text-gray-600">{threshold.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Note - Minimal */}
        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700 text-center">
            🔒 <strong>Secure & Private</strong> — All data stored locally on your device
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onPrev} className="flex-1 h-11">
          ← Previous
        </Button>
        <Button onClick={handleNext} className="flex-1 h-11 bg-teal-600 hover:bg-teal-700">
          Continue →
        </Button>
      </div>
    </div>
  );
}