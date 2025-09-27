import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/types";

interface CompletionStepProps {
  profile: Partial<UserProfile>;
  onComplete: () => void;
  onPrev: () => void;
}

export function CompletionStep({ profile, onComplete, onPrev }: CompletionStepProps) {
  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle className="text-center">You&apos;re all set!</CardTitle>
        <CardDescription className="text-center">
          Review your profile and start using DermAIr to track your skin health.
        </CardDescription>
      </CardHeader>

      <div className="space-y-4">
        {/* Profile Summary */}
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h3 className="font-semibold text-primary mb-3">Your Profile Summary:</h3>
          
          <div className="space-y-2 text-sm">
            {profile.location && (
              <div>
                <strong>Location:</strong> {profile.location.city}
                {profile.location.country && `, ${profile.location.country}`}
              </div>
            )}
            
            {profile.triggers && profile.triggers.length > 0 && (
              <div>
                <strong>Triggers:</strong> {profile.triggers.join(", ")}
              </div>
            )}
            
            {profile.preferences?.riskThreshold && (
              <div>
                <strong>Alert threshold:</strong> {profile.preferences.riskThreshold} risk and above
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="notifications" className="font-medium">
              Enable notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Get alerts about weather conditions that might trigger flare-ups
            </p>
          </div>
          <Switch
            id="notifications"
            checked={profile.preferences?.notifications ?? true}
            disabled
          />
        </div>

        {/* What's Next */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">What&apos;s next?</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• View your personalized dashboard</li>
            <li>• Check today&apos;s skin risk forecast</li>
            <li>• Get recommendations for skin care</li>
            <li>• Start logging daily symptoms (optional)</li>
          </ul>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-800">
            <strong>Remember:</strong> DermAIr provides wellness insights based on weather patterns. 
            Always consult healthcare professionals for medical advice, diagnosis, or treatment decisions.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button onClick={onComplete} size="lg" className="bg-primary hover:bg-primary/90">
          Complete Setup & Go to Dashboard
        </Button>
      </div>
    </div>
  );
}