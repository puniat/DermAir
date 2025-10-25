"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentLocation, reverseGeocode, getLocationByZipcode } from "@/lib/api/weather";
import type { UserProfile } from "@/types";

interface LocationStepProps {
  profile: Partial<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function LocationStep({ profile, updateProfile, onNext, onPrev }: LocationStepProps) {
  const [zipcode, setZipcode] = useState(profile.location?.zipcode || "");
  const [country, setCountry] = useState(profile.location?.country || "US");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  const getCurrentLocationHandler = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      const { latitude, longitude } = location;
      
      // Get city name from coordinates
      const locationInfo = await reverseGeocode(latitude, longitude);
      
      // Keep zipcode empty since we're using city-based location
      setZipcode("");
      setCountry(locationInfo.country);
      
      // Store the location data - the weather API will use city name
      updateProfile({
        location: {
          city: locationInfo.city,
          country: locationInfo.country,
          latitude,
          longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      
      // Update UI to show detected location
      setDetectedLocation(`${locationInfo.city}, ${locationInfo.country}`);
      console.log(`📍 Location detected: ${locationInfo.city}, ${locationInfo.country}`);
      
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Could not get your location. Please enter your zipcode manually.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // Check if we have either zipcode or detected location
    const hasZipcode = zipcode.trim();
    const hasDetectedLocation = profile.location?.latitude && profile.location?.longitude;
    
    if (!hasZipcode && !hasDetectedLocation) {
      alert("Please enter your zipcode or use current location");
      return;
    }

    // If current location was already detected, just proceed
    if (hasDetectedLocation && !hasZipcode) {
      onNext();
      return;
    }

    // If zipcode was provided, validate it
    if (hasZipcode) {
      setIsLoading(true);
      try {
        // Get location data from zipcode
        const locationData = await getLocationByZipcode(zipcode.trim(), country);
        
        updateProfile({
          location: {
            city: locationData.name,
            country: locationData.country,
            zipcode: zipcode.trim(),
            latitude: locationData.lat,
            longitude: locationData.lon,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        });
        
        onNext();
      } catch (error) {
        console.error("Error validating zipcode:", error);
        alert("Invalid zipcode. Please check and try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Header - Compact */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Where are you located?</h2>
        <p className="text-sm text-gray-600">Enter your zipcode or use your current location</p>
      </div>

      {/* Location Input Grid - Compact 2-Column */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="zipcode" className="text-sm font-medium">Zipcode</Label>
          <Input
            id="zipcode"
            placeholder="e.g., 10001"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="country" className="text-sm font-medium">Country</Label>
          <Input
            id="country"
            placeholder="US"
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
            maxLength={2}
            className="h-10 uppercase"
          />
        </div>
      </div>

      {/* Divider with OR */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-500 font-medium">Or</span>
        </div>
      </div>

      {/* Current Location Button */}
      <Button
        type="button"
        variant="outline"
        onClick={getCurrentLocationHandler}
        disabled={isLoading}
        className="w-full h-11 text-sm font-medium border-2 hover:border-teal-500 hover:bg-teal-50 transition-colors"
      >
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">⟳</span>
            Getting location...
          </>
        ) : (
          <>
            <span className="mr-2">📍</span>
            Use Current Location
          </>
        )}
      </Button>
      
      {/* Detected Location Badge */}
      {detectedLocation && (
        <div className="p-3 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ Location: {detectedLocation}
          </p>
        </div>
      )}

      {/* Privacy Note - Minimal */}
      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 text-center">
          🔒 <strong>Private & Secure</strong> — Your location is stored locally and never shared
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onPrev} className="flex-1 h-11">
          ← Previous
        </Button>
        <Button onClick={handleNext} disabled={isLoading} className="flex-1 h-11 bg-teal-600 hover:bg-teal-700">
          Continue →
        </Button>
      </div>
    </div>
  );
}