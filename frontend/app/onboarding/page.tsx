'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Rocket,
  User,
  Code,
  Palette,
  Brain,
  TrendingUp,
  Smartphone,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMode } from '@/contexts/ModeContext';
import { cn } from '@/lib/utils';

const academicSubjects = [
  { id: 'physics', label: 'Physics', icon: '⚡' },
  { id: 'chemistry', label: 'Chemistry', icon: '🧪' },
  { id: 'mathematics', label: 'Mathematics', icon: '📐' },
  { id: 'biology', label: 'Biology', icon: '🧬' },
  { id: 'computer-science', label: 'Computer Science', icon: '💻' },
  { id: 'english', label: 'English', icon: '📚' },
  { id: 'economics', label: 'Economics', icon: '📊' },
  { id: 'history', label: 'History', icon: '🏛️' },
];

const sideHustleInterests = [
  { id: 'web-dev', label: 'Web Development', icon: Code },
  { id: 'mobile-dev', label: 'Mobile Development', icon: Smartphone },
  { id: 'ai-ml', label: 'AI & Machine Learning', icon: Brain },
  { id: 'ui-ux', label: 'UI/UX Design', icon: Palette },
  { id: 'data-science', label: 'Data Science', icon: TrendingUp },
  { id: 'freelancing', label: 'Freelancing', icon: Rocket },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setUserProfile } = useMode();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    course: '',
    academicSubjects: [] as string[],
    sideHustleInterests: [] as string[],
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setUserProfile({
        ...formData,
        onboarded: true,
      });
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleAcademicSubject = (id: string) => {
    setFormData(prev => ({
      ...prev,
      academicSubjects: prev.academicSubjects.includes(id)
        ? prev.academicSubjects.filter(s => s !== id)
        : [...prev.academicSubjects, id]
    }));
  };

  const toggleSideHustleInterest = (id: string) => {
    setFormData(prev => ({
      ...prev,
      sideHustleInterests: prev.sideHustleInterests.includes(id)
        ? prev.sideHustleInterests.filter(s => s !== id)
        : [...prev.sideHustleInterests, id]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.college && formData.course;
      case 2:
        return formData.academicSubjects.length > 0;
      case 3:
        return formData.sideHustleInterests.length > 0;
      default:
        return true;
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
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="mb-2 font-heading text-3xl font-bold">Welcome to LearnAI</h1>
          <p className="text-muted-foreground">Let&apos;s personalize your learning experience</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, hsl(var(--mode-gradient-start)), hsl(var(--mode-gradient-end)))' }}
                initial={{ width: 0 }}
                animate={{ width: i < step ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="icon-container">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold">Personal Information</h2>
                    <p className="text-sm text-muted-foreground">Tell us about yourself</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="college">College / University</Label>
                    <Input
                      id="college"
                      placeholder="Enter your institution name"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Course / Major</Label>
                    <Input
                      id="course"
                      placeholder="e.g., Computer Science, Engineering"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="icon-container">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold">Academic Subjects</h2>
                    <p className="text-sm text-muted-foreground">Select subjects you&apos;re studying</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {academicSubjects.map((subject) => {
                    const isSelected = formData.academicSubjects.includes(subject.id);
                    return (
                      <button
                        key={subject.id}
                        onClick={() => toggleAcademicSubject(subject.id)}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <span className="text-2xl">{subject.icon}</span>
                        <span className="text-sm font-medium">{subject.label}</span>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="icon-container">
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold">Side Hustle Interests</h2>
                    <p className="text-sm text-muted-foreground">What skills do you want to build?</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {sideHustleInterests.map((interest) => {
                    const Icon = interest.icon;
                    const isSelected = formData.sideHustleInterests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleSideHustleInterest(interest.id)}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Icon className={cn('h-6 w-6', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                        <span className="text-sm font-medium text-center">{interest.label}</span>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-8 py-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </div>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              {step === totalSteps ? 'Go to Dashboard' : 'Continue'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
