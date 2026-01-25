'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from '@/lib/firebase';

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
  user: User | null;
  isAuthenticated: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Load user profile from localStorage for authenticated user
        const saved = localStorage.getItem(`userProfile_${firebaseUser.uid}`);
        if (saved) {
          try {
            setUserProfile(JSON.parse(saved));
          } catch (e) {
            console.error('Error parsing user profile:', e);
          }
        }
      } else {
        setUserProfile(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save user profile to localStorage whenever it changes
  useEffect(() => {
    if (userProfile && user) {
      localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(userProfile));
    }
  }, [userProfile, user]);

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
  const isAuthenticated = user !== null;

  return (
    <ModeContext.Provider value={{
      mode,
      setMode,
      toggleMode,
      userProfile,
      setUserProfile,
      isOnboarded,
      isLoading,
      user,
      isAuthenticated
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
