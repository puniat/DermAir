"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Camera, Brain, Bell } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinueLocal = () => {
    // Go to onboarding
    setIsLoading(true);
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with Logo */}
          <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
            {/* Eye-catching Logo */}
            <Logo size="md" />

            {/* Title and Description */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                Welcome to <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">DermAIr</span>
              </h1>
              <p className="text-lg text-gray-600">
                Your intelligent companion for managing skin conditions with AI-powered insights and personalized recommendations
              </p>
            </div>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Smart Risk Tracking</h3>
                  <p className="text-xs text-gray-600">
                    AI-powered analysis of weather, air quality, and pollen to predict flare-ups
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <Camera className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Photo Journaling</h3>
                  <p className="text-xs text-gray-600">
                    Upload skin photos to track progress and personalize your insights
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">AI Recommendations</h3>
                  <p className="text-xs text-gray-600">
                    Personalized advice based on your triggers, severity, and patterns
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <Bell className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Proactive Alerts</h3>
                  <p className="text-xs text-gray-600">
                    Get notified before conditions trigger a flare-up
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right: Sign In Section */}
            <Card className="border-none shadow-2xl bg-white">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Get Started
                </h2>
                <p className="text-gray-600 mb-4 text-center text-sm">
                  Create your profile to begin
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Get Started Button */}
                  <Button
                    onClick={handleContinueLocal}
                    disabled={isLoading}
                    size="lg"
                    className="w-full h-12 border-2"
                  >
                    Get Started
                  </Button>

                  <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-100">
                    <p className="text-xs font-medium text-teal-900 mb-1">
                      ✨ Quick & Simple Setup
                    </p>
                    <ul className="text-xs text-teal-700 space-y-0.5">
                      <li>• Choose a username to identify your profile</li>
                      <li>• Your data is securely stored</li>
                      <li>• Access from any device with your username</li>
                    </ul>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    We never share your data. Your health information stays private.
                  </p>
                </div>
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
