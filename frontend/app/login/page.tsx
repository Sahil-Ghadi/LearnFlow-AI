'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Get the ID token
            const idToken = await result.user.getIdToken();

            // Verify token with backend
            const response = await fetch('http://localhost:8000/auth/google/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_token: idToken }),
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const userData = await response.json();

            // Check if user has completed onboarding
            const profileResponse = await fetch(`http://localhost:8000/profile/${userData.uid}`);

            if (profileResponse.ok) {
                // User has profile, go to dashboard
                router.push('/dashboard');
            } else {
                // New user, go to onboarding
                router.push('/onboarding');
            }

            toast.success('Signed in successfully!');
        } catch (error: any) {
            console.error('Sign in error:', error);
            toast.error(error.message || 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                {/* Card */}
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-primary to-accent p-8 text-center text-white">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                            <Bot className="h-8 w-8" />
                        </div>
                        <h1 className="mb-2 font-heading text-3xl font-bold">Welcome to LearnFlow AI</h1>
                        <p className="text-sm opacity-90">Your intelligent learning companion</p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="mb-6 text-center">
                            <h2 className="mb-2 font-heading text-xl font-bold">Sign in to continue</h2>
                            <p className="text-sm text-muted-foreground">
                                Get started with your personalized AI-powered learning experience
                            </p>
                        </div>

                        {/* Google Sign In Button */}
                        <Button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full gap-3 text-base"
                            size="lg"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {isLoading ? 'Signing in...' : 'Continue with Google'}
                        </Button>

                        <div className="mt-6 text-center text-xs text-muted-foreground">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </div>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="gap-2"
                    >
                        ← Back to Home
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
