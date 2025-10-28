"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { useUserSession } from "@/hooks/useUserSession";
import type { UserProfile } from "@/types";
import { saveUserProfile, checkUsernameExists, checkEmailExists, getUserByUsername } from '@/lib/services/firestore-data';
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
  const { session, updateProfile: updateSessionProfile, initializeSession } = useUserSession();
  
  // Debug: Check environment on mount
  useEffect(() => {
    console.log('[Onboarding] Component mounted');
    console.log('[Onboarding] Environment check:', {
      hasApiKey: !!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
      apiKeyLength: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY?.length || 0,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'SSR'
    });
  }, []);
  
  // Username
  const [username, setUsername] = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  // Email (optional for account recovery)
  const [email, setEmail] = useState("");
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  
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

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!username.trim() || username.trim().length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setUsernameChecking(true);
      try {
        const exists = await checkUsernameExists(username.trim());
        setUsernameAvailable(!exists);
      } catch (error) {
        console.error('[Onboarding] Error checking username:', error);
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    };

    // Debounce the username check
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  // Email validation helper
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check email availability
  useEffect(() => {
    const checkEmail = async () => {
      // If email is empty, it's optional so just reset states
      if (!email.trim()) {
        setEmailValid(null);
        setEmailAvailable(null);
        return;
      }

      // Validate email format
      const isValid = validateEmail(email.trim());
      setEmailValid(isValid);

      if (!isValid) {
        setEmailAvailable(null);
        return;
      }

      // Check if email is already taken
      setEmailChecking(true);
      try {
        const exists = await checkEmailExists(email.trim());
        setEmailAvailable(!exists);
      } catch (error) {
        console.error('[Onboarding] Error checking email:', error);
        setEmailAvailable(null);
      } finally {
        setEmailChecking(false);
      }
    };

    // Debounce the email check
    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const getCurrentLocationHandler = async () => {
    console.log('[Onboarding] Getting current location...');
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      console.log('[Onboarding] Got coordinates:', location);
      
      const { latitude, longitude } = location;
      const locationInfo = await reverseGeocode(latitude, longitude);
      console.log('[Onboarding] Reverse geocode result:', locationInfo);
      
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
      console.log('[Onboarding] Location data set successfully');
    } catch (error) {
      console.error("[Onboarding] Error getting location:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Could not get your location: ${errorMessage}\n\nPlease enter your zipcode manually.`);
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
      // Validate username
      if (!username.trim()) {
        alert("Please enter a username to identify your profile");
        return;
      }

      if (username.trim().length < 3) {
        alert("Username must be at least 3 characters long");
        return;
      }

      // Validate email if provided
      if (email.trim()) {
        if (!validateEmail(email.trim())) {
          alert("Please enter a valid email address or leave it empty");
          return;
        }

        // Check if email is already taken
        console.log('[Onboarding] Checking if email exists:', email.trim());
        const emailExists = await checkEmailExists(email.trim());
        
        if (emailExists) {
          alert("This email is already registered. Please use a different email or leave it empty.");
          return;
        }
      }

      // Check if username is already taken
      console.log('[Onboarding] Checking if username exists:', username.trim());
      const usernameExists = await checkUsernameExists(username.trim());
      
      if (usernameExists) {
        // Username exists - try to load existing profile
        console.log('[Onboarding] Username exists, loading existing profile');
        const existingProfile = await getUserByUsername(username.trim());
        
        if (existingProfile) {
          console.log('[Onboarding] Existing profile loaded:', existingProfile.id);
          
          // CRITICAL: Store userId in localStorage BEFORE any other operations
          if (typeof window !== 'undefined') {
            localStorage.setItem('dermair_userId', existingProfile.id);
            console.log('[Onboarding] Stored existing userId in localStorage:', existingProfile.id);
          }
          
          // Initialize session with existing user data
          initializeSession(username.trim(), existingProfile.id);
          updateSessionProfile(existingProfile);
          
          //alert(`Welcome back, ${username}! Your profile has been loaded.`);
          router.push("/dashboard");
          return;
        } else {
          alert("Username is taken. Please choose a different username.");
          return;
        }
      }

      // New user - validate all required fields
      // Initialize session if needed
      if (!session || !session.username) {
        // Username will be used as userId, set it later after validation
        initializeSession(username.trim());
      }

      if (!session) {
        console.error("No session available");
        return;
      }

      // Validate location
      let finalLocationData = locationData;
      
      if (!finalLocationData && zipcode.trim()) {
        setIsLoadingLocation(true);
        try {
          console.log('[Onboarding] Validating zipcode:', zipcode.trim(), country);
          const locationInfo = await getLocationByZipcode(zipcode.trim(), country);
          console.log('[Onboarding] Zipcode validation success:', locationInfo);
          
          finalLocationData = {
            city: locationInfo.name,
            country: locationInfo.country,
            zipcode: zipcode.trim(),
            latitude: locationInfo.lat,
            longitude: locationInfo.lon,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          };
        } catch (error) {
          console.error('[Onboarding] Zipcode validation error:', error);
          
          // Show specific error message
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (errorMessage.includes('not configured')) {
            alert("Weather API is not configured. Please contact support.");
          } else if (errorMessage.includes('Invalid zipcode')) {
            alert(`Invalid zipcode: ${zipcode.trim()}. Please check and try again.`);
          } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
            alert("Weather API authentication failed. Please contact support.");
          } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            alert("Network error. Please check your connection and try again.");
          } else {
            alert(`Error validating zipcode: ${errorMessage}`);
          }
          
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

      // USE USERNAME AS THE USER ID (since username is unique)
      const userId = username.trim().toLowerCase();

      const completeProfile: UserProfile = {
        id: userId,  // Use username as userId
        username: username.trim(),
        email: email.trim() || undefined, // Only include email if provided
        skin_type: "sensitive",
        location: finalLocationData,
        triggers: selectedTriggers,
        severityHistory,
        preferences: { notifications: true, riskThreshold },
        created_at: new Date()
      };

      console.log('[Onboarding] Saving NEW profile to Firebase with username as userId:', completeProfile.id);
      
      // CRITICAL: Store username (userId) in localStorage BEFORE saving and redirecting
      if (typeof window !== 'undefined') {
        localStorage.setItem('dermair_userId', userId);
        console.log('[Onboarding] Stored username as userId in localStorage:', userId);
      }
      
      updateSessionProfile(completeProfile);
      await saveUserProfile(completeProfile);
      console.log('[Onboarding] Profile saved successfully, redirecting to dashboard');
      router.push("/dashboard");
    } catch (error) {
      console.error("[Onboarding] Error completing onboarding:", error);
      alert(`Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Compact Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">DermAIr Setup</h1>
              <p className="text-xs text-gray-600">2-minute personalization</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600">
            <Heart className="h-4 w-4 text-teal-600" />
            <span>Secure & Private</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-6">
        <Card className="shadow-xl border-0 pt-0">
          <CardContent className="p-6 sm:p-8">
            {/* Top Section - Username & Location in 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 pb-6 border-b">
              {/* LEFT - Username */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-teal-600" />
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Choose Your Username</h2>
                </div>
                <Label className="text-xs font-medium text-gray-700">Create a username to identify your profile</Label>
                <Input
                  placeholder="e.g., john_doe or skincare_user123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1"
                  required
                />
                {username && username.length >= 3 && (
                  <div className="mt-1">
                    {usernameChecking && (
                      <p className="text-xs text-gray-600">⏳ Checking availability...</p>
                    )}
                    {!usernameChecking && usernameAvailable === true && (
                      <p className="text-xs text-green-600">✓ Username available</p>
                    )}
                    {!usernameChecking && usernameAvailable === false && (
                      <p className="text-xs text-orange-600">⚠️ Username exists - will load your existing profile</p>
                    )}
                  </div>
                )}
                {username && username.length < 3 && (
                  <p className="text-xs text-red-600 mt-1">Username must be at least 3 characters</p>
                )}

                {/* Email field (optional) */}
                <div className="mt-4">
                  <div className="flex items-center justify-start gap-2 flex-wrap">
                    <Label className="text-xs font-medium text-gray-700">Email (Optional)</Label>
                    <p className="text-xs text-gray-500">💡 Only enter if you want to recover your username</p>
                  </div>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                  {email && (
                    <div className="mt-1">
                      {emailChecking && (
                        <p className="text-xs text-gray-600">⏳ Checking email...</p>
                      )}
                      {!emailChecking && emailValid === false && (
                        <p className="text-xs text-red-600">✗ Invalid email format</p>
                      )}
                      {!emailChecking && emailValid === true && emailAvailable === true && (
                        <p className="text-xs text-green-600">✓ Email available</p>
                      )}
                      {!emailChecking && emailValid === true && emailAvailable === false && (
                        <p className="text-xs text-red-600">✗ Email already registered</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT - Location */}
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

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* LEFT COLUMN - Triggers */}
              <div className="space-y-6">
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
                      className="h-8 text-sm flex-1"
                    />
                    <Button 
                      type="button"
                      size="sm"
                      onClick={addCustomTrigger}
                      disabled={!customTrigger.trim()}
                      className="h-8 px-3 whitespace-nowrap"
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
              </div>
            </div>

            {/* Complete Setup Button - Centered at bottom */}
            <div className="mt-8 pt-6 border-t">
              <div className="max-w-md mx-auto">
                <Button
                  onClick={handleComplete}
                  disabled={isLoadingLocation}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoadingLocation ? (
                    <>⏳ Validating location...</>
                  ) : (
                    <>Complete Setup & Go to Dashboard →</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
