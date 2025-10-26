"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { useUserSession } from "@/hooks/useUserSession";
import type { UserProfile } from "@/types";
import { saveUserProfile } from '@/lib/services/firestore-data';
import { getCurrentLocation, reverseGeocode, getLocationByZipcode } from "@/lib/api/weather";
import { Check, MapPin, Zap, Heart } from "lucide-react";

const COMMON_TRIGGERS = [
  "High humidity", "Low humidity", "Temperature changes",
  "High pollen", "Dust", "Stress",
  "Certain fabrics", "Fragrances/perfumes", "Soaps/detergents",
  "Food allergies", "Exercise/sweating", "Lack of sleep",
];

const SEVERITY_LEVELS = [
  { value: "mild" as const, label: "Mild", emoji: "😊", color: "green" },
  { value: "moderate" as const, label: "Moderate", emoji: "😐", color: "yellow" },
  { value: "severe" as const, label: "Severe", emoji: "😣", color: "red" }
];

const RISK_THRESHOLDS = [
  { value: "low" as const, label: "Low", emoji: "🔔" },
  { value: "moderate" as const, label: "Moderate", emoji: "⚖️" },
  { value: "high" as const, label: "High", emoji: "⚠️" }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { session, updateProfile: updateSessionProfile } = useUserSession();
  
  // Location
  const [zipcode, setZipcode] = useState("");
  const [country, setCountry] = useState("US");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<any>(null);
  
  // Triggers
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState("");
  
  // Severity
  const [currentSeverity, setCurrentSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [recentSeverity, setRecentSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [riskThreshold, setRiskThreshold] = useState<"low" | "moderate" | "high">("moderate");

  const getCurrentLocationHandler = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      const { latitude, longitude } = location;
      const locationInfo = await reverseGeocode(latitude, longitude);
      
      setZipcode("");
      setCountry(locationInfo.country);
      setDetectedLocation(`${locationInfo.city}, ${locationInfo.country}`);
      setLocationData({
        city: locationInfo.city,
        country: locationInfo.country,
        latitude,
        longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Could not get your location. Please enter your zipcode manually.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]
    );
  };

  const addCustomTrigger = () => {
    if (customTrigger.trim() && !selectedTriggers.includes(customTrigger.trim())) {
      setSelectedTriggers(prev => [...prev, customTrigger.trim()]);
      setCustomTrigger("");
    }
  };

  const getSeverityColor = (color: string, isSelected: boolean) => {
    if (color === 'green') return isSelected ? 'bg-green-100 border-green-500 shadow-md' : 'border-green-200 hover:border-green-400';
    if (color === 'yellow') return isSelected ? 'bg-yellow-100 border-yellow-500 shadow-md' : 'border-yellow-200 hover:border-yellow-400';
    if (color === 'red') return isSelected ? 'bg-red-100 border-red-500 shadow-md' : 'border-red-200 hover:border-red-400';
    return '';
  };

  const handleComplete = async () => {
    try {
      if (!session) {
        console.error("No session available");
        return;
      }

      // Validate location
      let finalLocationData = locationData;
      
      if (!finalLocationData && zipcode.trim()) {
        setIsLoadingLocation(true);
        try {
          const locationInfo = await getLocationByZipcode(zipcode.trim(), country);
          finalLocationData = {
            city: locationInfo.name,
            country: locationInfo.country,
            zipcode: zipcode.trim(),
            latitude: locationInfo.lat,
            longitude: locationInfo.lon,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          };
        } catch (error) {
          alert("Invalid zipcode. Please check and try again.");
          setIsLoadingLocation(false);
          return;
        } finally {
          setIsLoadingLocation(false);
        }
      }

      if (!finalLocationData) {
        alert("Please provide your location");
        return;
      }

      const severityHistory = [
        { date: new Date().toISOString(), severity: currentSeverity },
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), severity: recentSeverity }
      ];

      const completeProfile: UserProfile = {
        id: session.userId,
        skin_type: "sensitive",
        location: finalLocationData,
        triggers: selectedTriggers,
        severityHistory,
        preferences: { notifications: true, riskThreshold },
        created_at: new Date()
      };

      updateSessionProfile(completeProfile);
      await saveUserProfile(completeProfile);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Compact Header - No extra space */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">DermAIr Setup</h1>
              <p className="text-xs text-gray-600">2-minute personalization</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600">
            <Heart className="h-4 w-4 text-teal-600" />
            <span>Secure & Private</span>
          </div>
        </div>
      </div>

      {/* Main Content - Full Screen Usage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <Card className="shadow-xl border-0">
          <CardContent className="p-4 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* LEFT COLUMN - Location & Triggers */}
              <div className="space-y-6">
                {/* Location Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Your Location</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <Label className="text-xs font-medium text-gray-700">Zipcode</Label>
                        <Input
                          placeholder="10001"
                          value={zipcode}
                          onChange={(e) => setZipcode(e.target.value)}
                          className="h-9 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Country</Label>
                        <Input
                          placeholder="US"
                          value={country}
                          onChange={(e) => setCountry(e.target.value.toUpperCase())}
                          maxLength={2}
                          className="h-9 mt-1 uppercase"
                        />
                      </div>
                    </div>

                    <div className="relative"><div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-gray-500">or</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocationHandler}
                      disabled={isLoadingLocation}
                      className="w-full h-9 text-sm border-2 hover:border-teal-500"
                    >
                      {isLoadingLocation ? "Getting location..." : "📍 Use Current Location"}
                    </Button>
                    
                    {detectedLocation && (
                      <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-center">
                        <p className="text-xs text-green-800 font-medium">✓ {detectedLocation}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Triggers Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-5 w-5 text-teal-600" />
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Your Triggers</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {COMMON_TRIGGERS.map((trigger) => (
                      <div 
                        key={trigger}
                        onClick={() => toggleTrigger(trigger)}
                        className={`
                          flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all
                          ${selectedTriggers.includes(trigger)
                            ? 'bg-teal-50 border-teal-400'
                            : 'bg-white border-gray-200 hover:border-teal-200'
                          }
                        `}
                      >
                        <Checkbox
                          checked={selectedTriggers.includes(trigger)}
                          className="pointer-events-none"
                        />
                        <Label className="text-xs font-medium cursor-pointer flex-1">
                          {trigger}
                        </Label>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom trigger..."
                      value={customTrigger}
                      onChange={(e) => setCustomTrigger(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCustomTrigger()}
                      className="h-8 text-sm"
                    />
                    <Button 
                      type="button"
                      size="sm"
                      onClick={addCustomTrigger}
                      disabled={!customTrigger.trim()}
                      className="h-8 px-3"
                    >
                      + Add
                    </Button>
                  </div>

                  {selectedTriggers.length > 0 && (
                    <div className="mt-3 p-2 bg-teal-50 rounded-lg border border-teal-200">
                      <p className="text-xs font-semibold text-teal-900 mb-1">
                        ✓ {selectedTriggers.length} Selected
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedTriggers.map((trigger) => (
                          <span
                            key={trigger}
                            className="bg-white text-teal-700 px-2 py-0.5 rounded-full text-xs font-medium border border-teal-300"
                          >
                            {trigger}
                            <button
                              onClick={() => toggleTrigger(trigger)}
                              className="ml-1 text-teal-600 hover:text-teal-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN - Severity & Risk */}
              <div className="space-y-6">
                {/* Current Severity */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    How is your skin right now?
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {SEVERITY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setCurrentSeverity(level.value)}
                        className={`
                          p-3 rounded-xl border-2 transition-all text-center
                          ${getSeverityColor(level.color, currentSeverity === level.value)}
                        `}
                      >
                        <div className="text-2xl mb-1">{level.emoji}</div>
                        <div className="font-bold text-xs">{level.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent History */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    How was it the past month?
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {SEVERITY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setRecentSeverity(level.value)}
                        className={`
                          p-2 rounded-xl border-2 transition-all text-center
                          ${getSeverityColor(level.color, recentSeverity === level.value)}
                        `}
                      >
                        <div className="text-xl mb-0.5">{level.emoji}</div>
                        <div className="font-bold text-xs">{level.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Risk Alerts */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    When should we alert you?
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {RISK_THRESHOLDS.map((threshold) => (
                      <button
                        key={threshold.value}
                        type="button"
                        onClick={() => setRiskThreshold(threshold.value)}
                        className={`
                          p-2 rounded-xl border-2 transition-all text-center
                          ${riskThreshold === threshold.value
                            ? 'bg-teal-100 border-teal-500 shadow-md'
                            : 'border-gray-200 hover:border-teal-400'
                          }
                        `}
                      >
                        <div className="text-xl mb-0.5">{threshold.emoji}</div>
                        <div className="font-bold text-xs">{threshold.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy & Info */}
                <div className="space-y-2">
                  <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-3 rounded-lg border border-teal-200">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-teal-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-teal-900">What we'll do</p>
                        <p className="text-xs text-teal-700">Track weather, predict flare-ups, send alerts</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-700 text-center">
                      🔒 All data stored locally & never shared
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Button */}
            <div className="mt-8">
              <Button 
                onClick={handleComplete}
                disabled={isLoadingLocation}
                className="w-full h-12 text-base bg-teal-600 hover:bg-teal-700"
              >
                Complete Setup & Go to Dashboard →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
