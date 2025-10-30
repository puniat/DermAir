"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserSession } from "@/hooks/useUserSession";
import type { UserProfile } from "@/types";
import { saveUserProfile, checkUsernameExists, checkEmailExists, getUserByUsername } from '@/lib/services/firestore-data';
import { getCurrentLocation, reverseGeocode, getLocationByZipcode } from "@/lib/api/weather";
import { hashPin, isValidPin } from "@/lib/auth";
import { Check, MapPin, Zap, Heart, Lock } from "lucide-react";

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

function OnboardingContent() {
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
    
    // Check for username parameter from welcome page
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const usernameParam = urlParams.get('username');
      if (usernameParam) {
        console.log('[Onboarding] Username from welcome page:', usernameParam);
        setUsername(usernameParam);
        setUsernameAvailable(true); // Already verified on welcome page
      }
    }
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
  
  // PIN for security (required for new users)
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  
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

      // Validate PIN (required for security)
      if (!pin.trim() || !confirmPin.trim()) {
        alert("Please create a 4-6 digit PIN to secure your account");
        return;
      }

      if (!isValidPin(pin)) {
        alert("PIN must be 4-6 digits");
        return;
      }

      if (pin !== confirmPin) {
        alert("PINs do not match. Please try again.");
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

      // Hash the PIN for security
      const hashedPin = await hashPin(pin);
      console.log('[Onboarding] PIN hashed successfully, length:', hashedPin.length);

      const completeProfile: UserProfile = {
        id: userId,  // Use username as userId
        username: username.trim(),
        email: email.trim() || undefined, // Only include email if provided
        pin: hashedPin, // Store hashed PIN
        skin_type: "sensitive",
        location: finalLocationData,
        triggers: selectedTriggers,
        severityHistory,
        preferences: { notifications: true, riskThreshold },
        created_at: new Date()
      };

      console.log('[Onboarding] Saving NEW profile to Firebase:', {
        userId: completeProfile.id,
        hasPIN: !!completeProfile.pin,
        pinLength: completeProfile.pin?.length || 0
      });
      
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2">
        <Card className="shadow-xl border-0">
          <CardContent className="p-4 sm:p-6">
            
            {/* Section 1: Account Setup */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Account Setup</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Username *</Label>
                  <Input
                    placeholder="john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1.5 h-11"
                    required
                  />
                  {username && username.length >= 3 && (
                    <div className="mt-1.5">
                      {usernameChecking && (
                        <p className="text-xs text-gray-600">⏳ Checking...</p>
                      )}
                      {!usernameChecking && usernameAvailable === true && (
                        <p className="text-xs text-green-600">✓ Available</p>
                      )}
                      {!usernameChecking && usernameAvailable === false && (
                        <p className="text-xs text-orange-600">⚠️ Already exists</p>
                      )}
                    </div>
                  )}
                  {username && username.length < 3 && (
                    <p className="text-xs text-red-600 mt-1.5">Min 3 characters</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Email <span className="text-gray-500 font-normal">(optional)</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 h-11"
                  />
                  {email && (
                    <div className="mt-1.5">
                      {emailChecking && <p className="text-xs text-gray-600">⏳ Checking...</p>}
                      {!emailChecking && emailValid === false && <p className="text-xs text-red-600">✗ Invalid format</p>}
                      {!emailChecking && emailValid === true && emailAvailable === true && <p className="text-xs text-green-600">✓ Available</p>}
                      {!emailChecking && emailValid === true && emailAvailable === false && <p className="text-xs text-red-600">✗ Already used</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* PIN Security */}
              
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Security PIN</h3>
                    <p className="text-xs text-gray-600">4-6 digits to secure your account</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="password"
                      inputMode="numeric"
                      placeholder="Create PIN"
                      value={pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPin(value);
                      }}
                      maxLength={6}
                      className="text-center tracking-widest font-mono text-lg h-11"
                    />
                  </div>

                  <div>
                    <Input
                      type="password"
                      inputMode="numeric"
                      placeholder="Confirm PIN"
                      value={confirmPin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setConfirmPin(value);
                      }}
                      maxLength={6}
                      className="text-center tracking-widest font-mono text-lg h-11"
                    />
                    <div className="mt-1.5 text-center h-4">
                      {confirmPin && pin !== confirmPin && (
                        <p className="text-xs text-red-600">✗ No match</p>
                      )}
                      {confirmPin && pin === confirmPin && pin.length >= 4 && (
                        <p className="text-xs text-green-600">✓ Match</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            

            {/* Section 2: Location */}
            <div className="mb-5 pb-5 border-b">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Location</h2>
                  <p className="text-xs text-gray-600">For weather & environmental data</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Zipcode *</Label>
                      <Input
                        placeholder="10001"
                        value={zipcode}
                        onChange={(e) => setZipcode(e.target.value)}
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Country</Label>
                      <Input
                        placeholder="US"
                        value={country}
                        onChange={(e) => setCountry(e.target.value.toUpperCase())}
                        maxLength={2}
                        className="mt-1.5 h-11 uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocationHandler}
                    disabled={isLoadingLocation}
                    className="w-full h-11 border-2 hover:border-teal-500"
                  >
                    {isLoadingLocation ? "Getting..." : "📍 Auto-detect"}
                  </Button>
                </div>
              </div>
              
              {detectedLocation && (
                <div className="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-800 font-medium text-center">✓ {detectedLocation}</p>
                </div>
              )}
            </div>

            {/* Section 3: Health Profile */}
            <div className="mb-5 pb-5 border-b">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Health Profile</h2>
                  <p className="text-xs text-gray-600">Track your severity & triggers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* Current Severity */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">How is your skin right now?</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentSeverity("mild")}
                      className={`
                        p-3 rounded-xl border-2 transition-all text-center
                        ${currentSeverity === "mild"
                          ? 'bg-green-100 border-green-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-green-300'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">😊</div>
                      <div className="font-bold text-xs text-gray-900">Mild</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentSeverity("moderate")}
                      className={`
                        p-3 rounded-xl border-2 transition-all text-center
                        ${currentSeverity === "moderate"
                          ? 'bg-yellow-100 border-yellow-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-yellow-300'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">😐</div>
                      <div className="font-bold text-xs text-gray-900">Moderate</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentSeverity("severe")}
                      className={`
                        p-3 rounded-xl border-2 transition-all text-center
                        ${currentSeverity === "severe"
                          ? 'bg-red-100 border-red-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-red-300'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">😣</div>
                      <div className="font-bold text-xs text-gray-900">Severe</div>
                    </button>
                  </div>
                </div>

                {/* Past Month Average */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">How was it the past month?</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRecentSeverity("mild")}
                      className={`
                        p-3 rounded-xl border-2 transition-all text-center
                        ${recentSeverity === "mild"
                          ? 'bg-green-100 border-green-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-green-300'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">😊</div>
                      <div className="font-bold text-xs text-gray-900">Mild</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecentSeverity("moderate")}
                      className={`
                        p-3 rounded-xl border-2 transition-all text-center
                        ${recentSeverity === "moderate"
                          ? 'bg-yellow-100 border-yellow-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-yellow-300'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">😐</div>
                      <div className="font-bold text-xs text-gray-900">Moderate</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecentSeverity("severe")}
                      className={`
                        p-3 rounded-xl border-2 transition-all text-center
                        ${recentSeverity === "severe"
                          ? 'bg-red-100 border-red-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-red-300'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">😣</div>
                      <div className="font-bold text-xs text-gray-900">Severe</div>
                    </button>
                  </div>
                </div>

                {/* Alert Threshold */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">When should we alert you?</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRiskThreshold("low")}
                      className={`
                        p-3 rounded-xl border-2 transition-all text-center
                        ${riskThreshold === "low"
                          ? 'bg-teal-100 border-teal-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-teal-300'
                        }
                      `}
                    >
                      <div className="text-xl mb-1">🔔</div>
                      <div className="font-bold text-xs text-gray-900">Low</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRiskThreshold("moderate")}
                      className={`
                        p-3 rounded-xl border-2 transition-all text-center
                        ${riskThreshold === "moderate"
                          ? 'bg-teal-100 border-teal-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-teal-300'
                        }
                      `}
                    >
                      <div className="text-xl mb-1">🔔</div>
                      <div className="font-bold text-xs text-gray-900">Moderate</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRiskThreshold("high")}
                      className={`
                        p-3 rounded-xl border-2 transition-all text-center
                        ${riskThreshold === "high"
                          ? 'bg-teal-100 border-teal-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-teal-300'
                        }
                      `}
                    >
                      <div className="text-xl mb-1">🔔</div>
                      <div className="font-bold text-xs text-gray-900">High</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Triggers */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">What triggers your flare-ups?</h3>
                
                {/* Trigger Grid - Common + Custom Triggers */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {COMMON_TRIGGERS.map((trigger) => (
                    <div 
                      key={trigger}
                      onClick={() => toggleTrigger(trigger)}
                      className="flex items-center gap-2 p-2 rounded-lg border bg-white cursor-pointer transition-all hover:border-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTriggers.includes(trigger)}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                      <span className="text-xs text-gray-700 flex-1">{trigger}</span>
                    </div>
                  ))}
                  
                  {/* Custom Triggers */}
                  {selectedTriggers
                    .filter(trigger => !COMMON_TRIGGERS.includes(trigger))
                    .map((trigger) => (
                      <div 
                        key={trigger}
                        onClick={() => toggleTrigger(trigger)}
                        className="flex items-center gap-2 p-2 rounded-lg border bg-teal-50 border-teal-300 cursor-pointer transition-all hover:border-teal-400"
                      >
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                        <span className="text-xs text-teal-800 flex-1 font-medium">{trigger}</span>
                      </div>
                    ))}
                </div>

                {/* Custom Trigger Input */}
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add custom trigger..."
                    value={customTrigger}
                    onChange={(e) => setCustomTrigger(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCustomTrigger()}
                    className="h-10 text-sm"
                  />
                  <Button 
                    type="button"
                    size="sm"
                    onClick={addCustomTrigger}
                    disabled={!customTrigger.trim()}
                    className="h-10 px-4 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    + Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Complete Setup Button - Centered at bottom */}
            
              <div className="max-w-md mx-auto">
                <Button
                  onClick={handleComplete}
                  disabled={isLoadingLocation}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoadingLocation ? (
                    <>⏳ Validating location...</>
                  ) : (
                    <>Complete Setup & Go to Dashboard →</>
                  )}
                </Button>
              </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Wrap with authentication protection
export default function OnboardingPage() {
  return (
    <ProtectedRoute requireAuth={true} redirectTo="/landing">
      <OnboardingContent />
    </ProtectedRoute>
  );
}
