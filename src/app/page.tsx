import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-primary">DermAIr</h1>
        <p className="text-xl text-muted-foreground">
          Your personalized skin-weather companion
        </p>
        <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
          <p className="text-sm">
            <strong>NOT medical advice.</strong> Consult healthcare professionals.
          </p>
        </div>
        
        <div className="space-y-3 pt-4">
          <Link href="/onboarding">
            <Button size="lg" className="w-full max-w-sm">
              Get Started
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Set up your personalized skin-weather companion in just a few steps
          </p>
        </div>
      </div>
    </div>
  );
}