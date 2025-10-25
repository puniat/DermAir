"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/types";

const COMMON_TRIGGERS = [
  "High humidity",
  "Low humidity", 
  "Temperature changes",
  "High pollen",
  "Dust",
  "Stress",
  "Certain fabrics",
  "Fragrances/perfumes",
  "Soaps/detergents",
  "Food allergies",
  "Exercise/sweating",
  "Lack of sleep",
];

interface TriggersStepProps {
  profile: Partial<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function TriggersStep({ profile, updateProfile, onNext, onPrev }: TriggersStepProps) {
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    profile.triggers || []
  );
  const [customTrigger, setCustomTrigger] = useState("");

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const addCustomTrigger = () => {
    if (customTrigger.trim() && !selectedTriggers.includes(customTrigger.trim())) {
      setSelectedTriggers(prev => [...prev, customTrigger.trim()]);
      setCustomTrigger("");
    }
  };

  const handleNext = () => {
    updateProfile({ triggers: selectedTriggers });
    onNext();
  };

  return (
    <div className="space-y-3">
      {/* Header - Compact */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">What triggers your skin issues?</h2>
        <p className="text-xs text-gray-600">
          Select all factors that worsen your condition — the more you identify, the better our predictions
        </p>
      </div>

      <div className="space-y-2">
        {/* 3-Column Grid with Better Styling */}
        <div className="grid grid-cols-3 gap-3">
          {COMMON_TRIGGERS.map((trigger) => (
            <div 
              key={trigger} 
              className={`
                flex items-center space-x-2 p-2.5 rounded-lg border-2 transition-all cursor-pointer
                ${selectedTriggers.includes(trigger)
                  ? 'bg-teal-50 border-teal-400 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-teal-200 hover:bg-teal-50/30'
                }
              `}
              onClick={() => toggleTrigger(trigger)}
            >
              <Checkbox
                id={trigger}
                checked={selectedTriggers.includes(trigger)}
                onCheckedChange={() => toggleTrigger(trigger)}
                className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
              />
              <Label
                htmlFor={trigger}
                className="text-sm font-medium cursor-pointer flex-1"
              >
                {trigger}
              </Label>
            </div>
          ))}
        </div>

        {/* Custom Trigger Input - Compact */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200">
          <Label className="text-sm font-semibold text-purple-900 mb-2 block">Add custom trigger</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Pet dander, Cold weather..."
              value={customTrigger}
              onChange={(e) => setCustomTrigger(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomTrigger()}
              className="h-9 bg-white border-purple-200 focus:border-purple-400"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={addCustomTrigger}
              disabled={!customTrigger.trim()}
              className="h-9 px-4 border-purple-300 hover:bg-purple-100"
            >
              + Add
            </Button>
          </div>
        </div>

        {/* Selected Triggers Display */}
        {selectedTriggers.length > 0 && (
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
            <h4 className="font-semibold text-teal-900 mb-2 text-sm">
              ✓ {selectedTriggers.length} Trigger{selectedTriggers.length !== 1 ? 's' : ''} Selected
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTriggers.map((trigger) => (
                <span
                  key={trigger}
                  className="bg-white text-teal-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 border border-teal-300 shadow-sm"
                >
                  {trigger}
                  <button
                    onClick={() => toggleTrigger(trigger)}
                    className="ml-1 text-teal-600 hover:text-teal-800 hover:bg-teal-100 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tip - Minimal */}
        <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800 text-center">
            💡 <strong>Pro Tip:</strong> More triggers = Better predictions to prevent flare-ups
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onPrev} className="flex-1 h-11">
          ← Previous
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={selectedTriggers.length === 0}
          className="flex-1 h-11 bg-teal-600 hover:bg-teal-700"
        >
          Continue ({selectedTriggers.length}) →
        </Button>
      </div>
    </div>
  );
}