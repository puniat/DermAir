'use client';

import { useEffect, useState } from 'react';
import { Brain, CloudSun, Sparkles, Activity } from 'lucide-react';

interface AILoadingProgressProps {
  isLoading: boolean;
  progress: number; // 0-100
}

export function AILoadingProgress({ isLoading, progress }: AILoadingProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');

  const steps = [
    { icon: CloudSun, label: 'Analyzing weather conditions', progress: 25 },
    { icon: Activity, label: 'Evaluating your health patterns', progress: 50 },
    { icon: Brain, label: 'Generating AI insights', progress: 75 },
    { icon: Sparkles, label: 'Personalizing recommendations', progress: 100 }
  ];

  useEffect(() => {
    // Update current step based on progress
    const step = steps.findIndex(s => s.progress > progress);
    setCurrentStep(step === -1 ? steps.length - 1 : Math.max(0, step - 1));
  }, [progress]);

  useEffect(() => {
    // Animated dots
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!isLoading || progress >= 100) return null;

  const CurrentIcon = steps[currentStep]?.icon || Brain;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50/95 via-purple-50/95 to-pink-50/95 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 space-y-6">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Pulsing background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse opacity-30" />
            
            {/* Icon */}
            <div className="relative bg-white rounded-full p-8 shadow-2xl">
              <CurrentIcon className="w-16 h-16 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analyzing Your Risk
          </h3>
          <p className="text-gray-600 text-lg">
            {steps[currentStep]?.label}{dots}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Processing...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between px-4">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isComplete = progress >= step.progress;
            const isCurrent = idx === currentStep;
            
            return (
              <div 
                key={idx}
                className={`flex flex-col items-center space-y-2 transition-all duration-300 ${
                  isCurrent ? 'scale-110' : ''
                }`}
              >
                <div 
                  className={`rounded-full p-2 transition-all duration-300 ${
                    isComplete 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                      : isCurrent
                        ? 'bg-blue-100 text-blue-600 animate-pulse'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              Powered by Advanced AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add shimmer animation to globals.css
/* 
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 2s infinite;
}
*/
