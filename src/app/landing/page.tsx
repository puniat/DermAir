"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Camera, 
  Brain, 
  Bell, 
  User,
  Lock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Activity,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { checkUsernameExists, getUserByUsername, getUserSummary } from '@/lib/services/firestore-data';
import { useUserSession } from "@/hooks/useUserSession";
import { verifyPin } from "@/lib/auth";
import type { UserProfile } from "@/types";

type UserState = 'initial' | 'checking' | 'returning' | 'verifying' | 'new';

interface UserSummary {
  username: string;
  displayName: string;
  lastActive: Date;
  checkInsCount: number;
  currentRiskLevel: 'low' | 'medium' | 'high' | 'severe';
  streakDays: number;
}

export default function LandingPage() {
  const router = useRouter();
  const { initializeSession } = useUserSession();
  
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [userState, setUserState] = useState<UserState>('initial');
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Debounced username check
  useEffect(() => {
    const checkUser = async () => {
      if (username.length < 3) {
        setUserState('initial');
        setUserSummary(null);
        setError(null);
        return;
      }

      // Validate username format
      const isValid = /^[a-z0-9_]{3,30}$/.test(username);
      if (!isValid) {
        setError('Username must be 3-30 characters (letters, numbers, underscores only)');
        return;
      }

      setUserState('checking');
      setError(null);

      try {
        const exists = await checkUsernameExists(username);
        
        if (exists) {
          // Returning user - fetch their profile
          const profile = await getUserByUsername(username);
          if (profile) {
            setUserProfile(profile);
            
            console.log('[Landing] Profile loaded:', {
              username: profile.username,
              hasPin: !!profile.pin,
              pinLength: profile.pin?.length || 0
            });
            
            // All users must have a PIN - no legacy users
            if (profile.pin) {
              // User has PIN - require verification
              console.log('[Landing] PIN detected, showing verification screen');
              setUserState('verifying');
            } else {
              // Data error - user exists but has no PIN
              console.error('[Landing] User exists but has no PIN - data integrity issue');
              setError('Account error: No PIN found. Please contact support or create a new account.');
              setUserState('initial');
            }
          } else {
            setError('Error loading user data. Please try again.');
            setUserState('initial');
          }
        } else {
          // New user - username available
          setUserState('new');
        }
      } catch (err) {
        console.error('Error checking username:', err);
        setError('Connection error. Please try again.');
        setUserState('initial');
      }
    };

    const timeoutId = setTimeout(checkUser, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    setPin(''); // Clear PIN when username changes
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
  };

  const handleVerifyPin = useCallback(async () => {
    if (!userProfile || !userProfile.pin) return;
    
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const isValid = await verifyPin(pin, userProfile.pin);
      
      if (isValid) {
        try {
          const summary = await getUserSummary(userProfile.id);
          if (summary) {
            setUserSummary(summary);
          } else {
            setUserSummary({
              username: userProfile.username || username,
              displayName: userProfile.username || username,
              lastActive: userProfile.created_at || new Date(),
              checkInsCount: 0,
              currentRiskLevel: 'low',
              streakDays: 0
            });
          }
        } catch (summaryError) {
          console.error('Error fetching summary:', summaryError);
          setUserSummary({
            username: userProfile.username || username,
            displayName: userProfile.username || username,
            lastActive: userProfile.created_at || new Date(),
            checkInsCount: 0,
            currentRiskLevel: 'low',
            streakDays: 0
          });
        }
        
        setUserState('returning');
        setPin('');
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch (err) {
      console.error('PIN verification error:', err);
      setError('Verification failed. Please try again.');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  }, [pin, userProfile, username]);

  const handleContinueToOnboarding = useCallback(() => {
    initializeSession(username);
    router.push(`/onboarding?username=${username}`);
  }, [username, initializeSession, router]);

  const handleContinueToDashboard = useCallback(() => {
    if (!userProfile) return;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('dermair_userId', userProfile.id);
    }
    
    initializeSession(username, userProfile.id);
    router.push('/dashboard');
  }, [username, userProfile, initializeSession, router]);

  const handleReset = () => {
    setUsername('');
    setPin('');
    setUserState('initial');
    setUserSummary(null);
    setUserProfile(null);
    setError(null);
  };

  const getRiskStyling = (level: string) => {
    switch (level) {
      case 'low':
        return { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-600', icon: '✓' };
      case 'medium':
        return { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200', text: 'text-yellow-600', icon: '⚖️' };
      case 'high':
        return { bg: 'from-orange-50 to-red-50', border: 'border-orange-200', text: 'text-orange-600', icon: '⚠️' };
      case 'severe':
        return { bg: 'from-red-50 to-rose-50', border: 'border-red-200', text: 'text-red-600', icon: '🚨' };
      default:
        return { bg: 'from-gray-50 to-slate-50', border: 'border-gray-200', text: 'text-gray-600', icon: '—' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-3 md:py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with Logo */}
          <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-8 mb-4 md:mb-8">
            {/* Eye-catching Logo */}
            <Logo size="sm" />

            {/* Title and Description */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 md:mb-3">
                Welcome to <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">DermAIr</span>
              </h1>
              <p className="text-sm md:text-lg text-gray-600">
                Your intelligent companion for managing skin conditions with AI-powered insights
              </p>
            </div>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
            {/* Left: Feature Cards */}
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-shadow">
                <CardContent className="p-2 md:p-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-teal-100 rounded-lg flex items-center justify-center mb-1 md:mb-2">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-0.5 md:mb-1 text-[10px] md:text-xs leading-tight">Smart Risk Tracking</h3>
                  <p className="text-[9px] md:text-xs text-gray-600 leading-tight hidden md:block">
                    AI-powered analysis of weather, air quality, and pollen to predict flare-ups
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-shadow">
                <CardContent className="p-2 md:p-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-1 md:mb-2">
                    <Camera className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-0.5 md:mb-1 text-[10px] md:text-xs leading-tight">Photo Journaling</h3>
                  <p className="text-[9px] md:text-xs text-gray-600 leading-tight hidden md:block">
                    Upload skin photos to track progress and personalize your insights
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-shadow">
                <CardContent className="p-2 md:p-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-1 md:mb-2">
                    <Brain className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-0.5 md:mb-1 text-[10px] md:text-xs leading-tight">AI Recommendations</h3>
                  <p className="text-[9px] md:text-xs text-gray-600 leading-tight hidden md:block">
                    Personalized advice based on your triggers, severity, and patterns
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-shadow">
                <CardContent className="p-2 md:p-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded-lg flex items-center justify-center mb-1 md:mb-2">
                    <Bell className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-0.5 md:mb-1 text-[10px] md:text-xs leading-tight">Proactive Alerts</h3>
                  <p className="text-[9px] md:text-xs text-gray-600 leading-tight hidden md:block">
                    Get notified before conditions trigger a flare-up
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right: Get Started Panel - Dynamic based on user state */}
            <Card className="border-none shadow-2xl bg-white">
              <CardContent className="p-4 md:p-6">
                
                {/* Initial/Checking/New User State */}
                {(userState === 'initial' || userState === 'checking' || userState === 'new') && (
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5 md:mb-2 text-center">
                      Get Started
                    </h2>
                    <p className="text-gray-600 mb-3 md:mb-4 text-center text-xs md:text-sm">
                      {userState === 'new' ? 'Create your account' : 'Enter your username'}
                    </p>

                    <div className="space-y-2 md:space-y-3">
                      {/* Username Input */}
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                          Username
                        </label>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="e.g., john_doe or skincare_user"
                            value={username}
                            onChange={handleUsernameChange}
                            className="w-full pr-10 text-sm md:text-base h-10 md:h-12 border-2 focus:border-teal-500"
                            autoFocus
                            style={{ fontSize: '16px' }}
                          />
                          {userState === 'checking' && (
                            <div className="absolute right-3 top-2 md:top-3">
                              <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-gray-400 animate-spin" />
                            </div>
                          )}
                          {userState === 'new' && username.length >= 3 && (
                            <div className="absolute right-3 top-2 md:top-3">
                              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                            </div>
                          )}
                        </div>

                        {error && (
                          <div className="mt-1.5 md:mt-2 flex items-center gap-2 text-xs md:text-sm text-red-600">
                            <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{error}</span>
                          </div>
                        )}

                        {!error && username.length > 0 && username.length < 3 && (
                          <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 md:mt-2">
                            Username must be at least 3 characters
                          </p>
                        )}
                      </div>

                      {/* Continue Button for New Users */}
                      {userState === 'new' && (
                        <Button
                          onClick={handleContinueToOnboarding}
                          className="w-full h-10 md:h-12 text-sm md:text-base bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                          Create Account
                          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                        </Button>
                      )}

                      {/* Info Panel */}
                      <div className="mt-3 md:mt-4 p-2 md:p-3 bg-teal-50 rounded-lg border border-teal-100">
                        <p className="text-[10px] md:text-xs font-medium text-teal-900 mb-0.5 md:mb-1">
                          ✨ Quick & Simple Setup
                        </p>
                        <ul className="text-[9px] md:text-xs text-teal-700 space-y-0.5">
                          <li>• Choose a username to identify your profile</li>
                          <li>• Your data is securely stored</li>
                          <li>• Access from any device with your username</li>
                        </ul>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600 mt-2 md:mt-3">
                        <Lock className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Your data is secure and private</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PIN Verification State */}
                {userState === 'verifying' && (
                  <div>
                    <div className="flex justify-center mb-3 md:mb-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-lg flex items-center justify-center">
                        <Lock className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-center mb-1.5 md:mb-2">
                      Welcome back, <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">@{username}</span>!
                    </h2>
                    <p className="text-center text-gray-600 mb-3 md:mb-4 text-xs md:text-sm">
                      Enter your PIN to access your health data
                    </p>

                    <div className="space-y-2 md:space-y-3">
                      {/* PIN Input */}
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
                          4-6 Digit PIN
                        </label>
                        <div className="relative">
                          <Input
                            type={showPin ? "text" : "password"}
                            inputMode="numeric"
                            placeholder="Enter your PIN"
                            value={pin}
                            onChange={handlePinChange}
                            onKeyPress={(e) => e.key === 'Enter' && handleVerifyPin()}
                            className="w-full pr-10 text-base md:text-xl h-10 md:h-12 border-2 focus:border-teal-500 text-center tracking-widest font-mono"
                            autoFocus
                            maxLength={6}
                            style={{ fontSize: '20px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>

                        {error && (
                          <div className="mt-1.5 md:mt-2 flex items-center gap-2 text-xs md:text-sm text-red-600 bg-red-50 p-2 rounded">
                            <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{error}</span>
                          </div>
                        )}

                        <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 md:mt-2 text-center">
                          {pin.length}/6 digits
                        </p>
                      </div>

                      {/* Verify Button */}
                      <Button 
                        onClick={handleVerifyPin}
                        disabled={pin.length < 4 || isVerifying}
                        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white h-10 md:h-12 text-sm md:text-base font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Unlock Account
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                          </>
                        )}
                      </Button>

                      {/* Back Link */}
                      <button 
                        onClick={handleReset}
                        className="w-full text-center text-xs md:text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors"
                      >
                        ← Try a different username
                      </button>

                      {/* Security Note */}
                      <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Lock className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-purple-700">
                            Your PIN is encrypted and never stored in plain text.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Returning User Welcome State */}
                {userState === 'returning' && userSummary && (
                  <div>
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl shadow-lg flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center mb-2">
                      Welcome back, <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">@{userSummary.username}</span>!
                    </h2>
                    <p className="text-center text-gray-600 mb-4 text-sm">
                      Ready to continue your health journey?
                    </p>

                    {/* User Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className={`bg-gradient-to-br ${getRiskStyling(userSummary.currentRiskLevel).bg} border ${getRiskStyling(userSummary.currentRiskLevel).border} rounded-lg p-3`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className={`w-4 h-4 ${getRiskStyling(userSummary.currentRiskLevel).text}`} />
                          <span className="text-xs font-medium text-gray-700">Risk Level</span>
                        </div>
                        <p className={`text-lg font-bold ${getRiskStyling(userSummary.currentRiskLevel).text} capitalize`}>
                          {userSummary.currentRiskLevel}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-gray-700">Streak</span>
                        </div>
                        <p className="text-lg font-bold text-blue-600">
                          {userSummary.streakDays} days
                        </p>
                      </div>
                    </div>

                    {/* Check-ins Badge */}
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-teal-900">
                          Total Check-ins
                        </span>
                        <Badge className="bg-teal-600 text-white">
                          {userSummary.checkInsCount}
                        </Badge>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <Button
                      onClick={handleContinueToDashboard}
                      className="w-full h-12 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                      Continue to Dashboard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    {/* Reset Link */}
                    <button 
                      onClick={handleReset}
                      className="w-full text-center text-sm text-gray-600 hover:text-gray-900 py-2 mt-2 transition-colors"
                    >
                      Not you? Switch account
                    </button>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
