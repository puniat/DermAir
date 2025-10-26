"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check for existing profile
    const checkProfile = () => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          router.replace('/landing');
          return;
        }
        
        const profile = localStorage.getItem('dermair-profile');
        
        if (profile) {
          // Profile exists, go to dashboard
          router.replace('/dashboard');
        } else {
          // No profile, go to landing page
          router.replace('/landing');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        // Default to landing page on error
        router.replace('/landing');
      }
    };

    checkProfile();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="text-center flex flex-col items-center">
        <Logo size="md" />
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4 mt-6" />
        <p className="text-gray-600">Loading DermAIr...</p>
      </div>
    </div>
  );
}