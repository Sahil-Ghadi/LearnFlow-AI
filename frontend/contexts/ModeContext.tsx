'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LearningMode = 'academic' | 'side-hustle';

interface UserProfile {
  name: string;
  college: string;
  course: string;
  academicSubjects: string[];
  sideHustleInterests: string[];
  onboarded: boolean;
}

interface ModeContextType {
  mode: LearningMode;
  setMode: (mode: LearningMode) => void;
  toggleMode: () => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  isOnboarded: boolean;
  isLoading: boolean;
}

const defaultProfile: UserProfile = {
  name: '',
  college: '',
  course: '',
  academicSubjects: [],
  sideHustleInterests: [],
  onboarded: false,
};

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LearningMode>('academic');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from localStorage on mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing user profile:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save user profile to localStorage whenever it changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // Apply mode class to document
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'side-hustle') {
      root.classList.add('side-hustle-mode');
    } else {
      root.classList.remove('side-hustle-mode');
    }
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => prev === 'academic' ? 'side-hustle' : 'academic');
  };

  const isOnboarded = userProfile?.onboarded ?? false;

  return (
    <ModeContext.Provider value={{ 
      mode, 
      setMode, 
      toggleMode, 
      userProfile, 
      setUserProfile,
      isOnboarded,
      isLoading
    }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
