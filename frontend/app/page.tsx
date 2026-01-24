'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMode } from '@/contexts/ModeContext';
import Landing from '@/components/Landing';

export default function Home() {
  const { isOnboarded, isLoading } = useMode();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isOnboarded) {
      router.push('/dashboard');
    }
  }, [isOnboarded, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <Landing />;
}
