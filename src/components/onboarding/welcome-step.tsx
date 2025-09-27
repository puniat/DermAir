import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-6">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to DermAIr!</CardTitle>
        <CardDescription className="text-lg">
          Your personalized skin-weather companion
        </CardDescription>
      </CardHeader>
      
      <div className="space-y-4">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h3 className="font-semibold text-primary mb-2">What we&apos;ll do together:</h3>
          <ul className="text-sm space-y-1 text-left">
            <li>• Set up your location for weather tracking</li>
            <li>• Identify your personal skin triggers</li>
            <li>• Customize your risk preferences</li>
            <li>• Create your personalized profile</li>
          </ul>
        </div>
        
        <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
          <p className="text-sm">
            <strong>Privacy First:</strong> All your data stays on your device. 
            We only use weather APIs - no personal data is shared.
          </p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-800">
            <strong>Medical Disclaimer:</strong> DermAIr provides general wellness insights only. 
            Always consult healthcare professionals for medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>
      
      <Button onClick={onNext} size="lg" className="w-full">
        Let&apos;s Get Started
      </Button>
    </div>
  );
}