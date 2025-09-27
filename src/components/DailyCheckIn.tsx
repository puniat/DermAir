"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calendar, Camera, Pill, ThermometerSun, Droplets } from "lucide-react";
import type { DailyCheckInFormData, WeatherData } from "@/types";

interface DailyCheckInProps {
  onSubmit: (data: DailyCheckInFormData) => void;
  onClose: () => void;
  weather?: WeatherData;
  isSubmitting?: boolean;
}

const itchScoreLabels = [
  "No itch",
  "Mild itch",
  "Moderate itch", 
  "Noticeable itch",
  "Severe itch",
  "Extreme itch"
];

const rednessScoreLabels = [
  "No redness",
  "Light redness",
  "Moderate redness",
  "Severe redness"
];

export function DailyCheckIn({ onSubmit, onClose, weather, isSubmitting = false }: DailyCheckInProps) {
  const [formData, setFormData] = useState<DailyCheckInFormData>({
    itch_score: 0,
    redness_score: 0,
    medication_used: false,
    notes: "",
    photo: undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric", 
    month: "long",
    day: "numeric"
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Daily Check-in</CardTitle>
                <CardDescription>{today}</CardDescription>
              </div>
            </div>
            {weather && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ThermometerSun className="h-4 w-4" />
                <span>{Math.round(weather.temperature)}°C</span>
                <Droplets className="h-4 w-4 ml-2" />
                <span>{weather.humidity}%</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Itch Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="itch-score" className="text-base font-medium">
                  How itchy is your skin today?
                </Label>
                <Badge variant="secondary">
                  {formData.itch_score}/5 - {itchScoreLabels[formData.itch_score]}
                </Badge>
              </div>
              <Slider
                id="itch-score"
                min={0}
                max={5}
                step={1}
                value={[formData.itch_score]}
                onValueChange={(value) =>
                  setFormData({ ...formData, itch_score: value[0] })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>No itch</span>
                <span>Extreme</span>
              </div>
            </div>

            {/* Redness Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="redness-score" className="text-base font-medium">
                  How red is your skin today?
                </Label>
                <Badge variant="secondary">
                  {formData.redness_score}/3 - {rednessScoreLabels[formData.redness_score]}
                </Badge>
              </div>
              <Slider
                id="redness-score"
                min={0}
                max={3}
                step={1}
                value={[formData.redness_score]}
                onValueChange={(value) =>
                  setFormData({ ...formData, redness_score: value[0] })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>No redness</span>
                <span>Severe</span>
              </div>
            </div>

            {/* Medication Used */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="medication"
                checked={formData.medication_used}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, medication_used: !!checked })
                }
              />
              <Label htmlFor="medication" className="flex items-center gap-2 text-base font-medium cursor-pointer">
                <Pill className="h-4 w-4" />
                I used medication/treatment today
              </Label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-medium">
                Additional notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="How did you feel today? Any specific triggers or observations?"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Photo Upload - Placeholder for now */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Photo (optional)
              </Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Photo upload feature coming soon
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Saving..." : "Save Check-in"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}