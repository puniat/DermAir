"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to landing page
    // User authentication/profile check will be handled by Firebase
    router.replace('/landing');
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