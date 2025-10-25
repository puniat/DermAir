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
    <div className="space-y-6">
      <CardHeader>
        <CardTitle>Where are you located?</CardTitle>
        <CardDescription>
          Enter your zipcode for the most accurate weather data, or use your current location for city-based weather information.
        </CardDescription>
      </CardHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="zipcode">Zipcode</Label>
          <Input
            id="zipcode"
            placeholder="e.g., 10001"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country Code</Label>
          <Input
            id="country"
            placeholder="e.g., US"
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
          
          {detectedLocation && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✓ Location detected:</strong> {detectedLocation}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Weather data will be based on this location. You can still enter a zipcode above for more precision.
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Privacy Note:</strong> Your zipcode is only used to fetch weather data. 
            It&apos;s stored locally on your device and never shared.
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Why zipcode?</strong> Using your zipcode provides more accurate weather data 
            than city names, since many cities have the same name across different regions.
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