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
    <div className="space-y-6">
      <CardHeader>
        <CardTitle>What triggers your skin issues?</CardTitle>
        <CardDescription>
          Select all factors that typically worsen your eczema or cause flare-ups. 
          This helps us provide more accurate predictions.
        </CardDescription>
      </CardHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COMMON_TRIGGERS.map((trigger) => (
            <div key={trigger} className="flex items-center space-x-2">
              <Checkbox
                id={trigger}
                checked={selectedTriggers.includes(trigger)}
                onCheckedChange={() => toggleTrigger(trigger)}
              />
              <Label
                htmlFor={trigger}
                className="text-sm font-normal cursor-pointer"
              >
                {trigger}
              </Label>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <Label className="text-sm font-medium">Add custom trigger:</Label>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Enter a custom trigger..."
              value={customTrigger}
              onChange={(e) => setCustomTrigger(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomTrigger()}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={addCustomTrigger}
              disabled={!customTrigger.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {selectedTriggers.length > 0 && (
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <h4 className="font-medium mb-2">Selected triggers:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTriggers.map((trigger) => (
                <span
                  key={trigger}
                  className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1"
                >
                  {trigger}
                  <button
                    onClick={() => toggleTrigger(trigger)}
                    className="ml-1 text-primary/70 hover:text-primary"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-800">
            <strong>Tip:</strong> Be thorough! The more triggers you identify, 
            the better we can predict and help prevent flare-ups.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={selectedTriggers.length === 0}>
          Continue ({selectedTriggers.length} selected)
        </Button>
      </div>
    </div>
  );
}