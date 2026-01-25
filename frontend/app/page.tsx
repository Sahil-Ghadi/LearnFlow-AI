'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMode } from '@/contexts/ModeContext';
import Landing from '@/components/Landing';

export default function Home() {
  const { isOnboarded, isLoading, isAuthenticated } = useMode();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isOnboarded) {
        router.push('/dashboard');
      } else if (!isAuthenticated) {
        router.push('/onboarding');
      }
    }
  }, [isOnboarded, isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <Landing />;
}
