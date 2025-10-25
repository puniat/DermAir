import { Button } from "@/components/ui/button";
import { Check, Shield, AlertCircle } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to DermAIr!</h2>
        <p className="text-gray-600">Your personalized skin-weather companion</p>
      </div>
      
      {/* What we'll do - Compact Grid */}
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-4 rounded-xl border border-teal-200">
        <h3 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
          <span className="text-lg">✨</span>
          What we&apos;ll do together:
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">Set up location tracking</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">Identify skin triggers</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">Customize preferences</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">Create your profile</span>
          </div>
        </div>
      </div>
      
      {/* Important Notes - Horizontal Layout */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-900 mb-1">Privacy First</p>
              <p className="text-xs text-blue-700">Data stays on your device</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-900 mb-1">Medical Disclaimer</p>
              <p className="text-xs text-red-700">Wellness insights only</p>
            </div>
          </div>
        </div>
      </div>
      
      <Button onClick={onNext} size="lg" className="w-full">
        Let&apos;s Get Started →
      </Button>
    </div>
  );
}