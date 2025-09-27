"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentLocation, reverseGeocode } from "@/lib/api/weather";
import type { UserProfile } from "@/types";

interface LocationStepProps {
  profile: Partial<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function LocationStep({ profile, updateProfile, onNext, onPrev }: LocationStepProps) {
  const [city, setCity] = useState(profile.location?.city || "");
  const [country, setCountry] = useState(profile.location?.country || "");
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocationHandler = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      const { latitude, longitude } = location;
      
      // Get city name from coordinates
      const locationInfo = await reverseGeocode(latitude, longitude);
      
      setCity(locationInfo.city);
      setCountry(locationInfo.country);
      
      updateProfile({
        location: {
          city: locationInfo.city,
          country: locationInfo.country,
          latitude,
          longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Could not get your location. Please enter manually.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (!city.trim()) {
      alert("Please enter your city");
      return;
    }

    updateProfile({
      location: {
        city: city.trim(),
        country: country.trim() || "Unknown",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle>Where are you located?</CardTitle>
        <CardDescription>
          We need your location to provide accurate weather and pollen data for skin risk predictions.
        </CardDescription>
      </CardHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="e.g., New York"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country (optional)</Label>
          <Input
            id="country"
            placeholder="e.g., United States"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">Or use your current location:</p>
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocationHandler}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Getting location..." : "Use Current Location"}
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Privacy Note:</strong> Your location is only used to fetch weather data. 
            It&apos;s stored locally on your device and never shared.
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