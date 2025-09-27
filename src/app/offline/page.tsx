"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff, RefreshCw, CheckCircle } from "lucide-react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Check initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsReconnecting(true);
    
    try {
      // Test connection
      await fetch('/api/health', { method: 'GET' });
      
      // If successful, redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      setIsReconnecting(false);
      // Connection still failed
    }
  };

  const handleGoOffline = () => {
    // Navigate to cached dashboard
    window.location.href = '/dashboard?offline=true';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-muted rounded-full w-fit mb-4">
            {isOnline ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <WifiOff className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <CardTitle>
            {isOnline ? "Connection Restored!" : "You're Offline"}
          </CardTitle>
          <CardDescription>
            {isOnline 
              ? "Your internet connection has been restored."
              : "It looks like you've lost your internet connection."
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isOnline && (
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">What you can still do:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View your cached dashboard</li>
                <li>• Review previous check-ins</li>
                <li>• Access your profile information</li>
                <li>• Log symptoms (will sync when online)</li>
              </ul>
            </div>
          )}

          <div className="space-y-3">
            {isOnline ? (
              <Button 
                onClick={() => window.location.href = '/dashboard'} 
                className="w-full"
              >
                Return to Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleRetry} 
                  disabled={isReconnecting}
                  className="w-full"
                >
                  {isReconnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Reconnecting...
                    </>
                  ) : (
                    "Try Again"
                  )}
                </Button>
                
                <Button 
                  onClick={handleGoOffline}
                  variant="outline" 
                  className="w-full"
                >
                  Continue Offline
                </Button>
              </>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              DermAIr works offline with limited functionality.
              <br />
              Your data will sync when you're back online.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}