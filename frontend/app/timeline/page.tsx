'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bot,
  Calendar,
  Target,
  Brain,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  Code
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlowCard, AgentBadge } from '@/components/ui/GlowCard';
import { useMode } from '@/contexts/ModeContext';

const academicTimelineEvents = [
  {
    id: 1,
    type: 'schedule',
    icon: Calendar,
    title: 'Daily Study Plan Generated',
    description: 'Created optimized study schedule based on syllabus progress and weak areas.',
    time: '8:00 AM',
    date: 'Today',
    details: ['Physics: 40 mins', 'Calculus: 30 mins', 'Chemistry: 25 mins']
  },
  {
    id: 2,
    type: 'detection',
    icon: AlertTriangle,
    title: 'Weak Topic Identified',
    description: 'Detected low confidence in Electromagnetic Induction after practice test analysis.',
    time: '10:30 AM',
    date: 'Today',
    details: ['Accuracy: 45%', 'Added 2 extra revision sessions']
  },
  {
    id: 3,
    type: 'adjustment',
    icon: Brain,
    title: 'Learning Pace Adjusted',
    description: 'Reduced daily workload by 20% to prevent burnout based on activity patterns.',
    time: '2:00 PM',
    date: 'Today',
    details: ['Previous: 5 hours', 'Adjusted: 4 hours', 'Reason: Fatigue patterns detected']
  },
  {
    id: 4,
    type: 'priority',
    icon: Target,
    title: 'Exam Priority Mode Activated',
    description: 'Mid-term exams detected. Side-hustle learning paused for 2 weeks.',
    time: '6:00 PM',
    date: 'Yesterday',
    details: ['Exam date: 15 days away', 'Focus subjects: Physics, Mathematics']
  },
  {
    id: 5,
    type: 'insight',
    icon: TrendingUp,
    title: 'Performance Trend Analyzed',
    description: 'Weekly performance report shows 12% improvement in problem-solving accuracy.',
    time: '9:00 PM',
    date: 'Yesterday',
    details: ['Best subject: Physics (+15%)', 'Needs work: Chemistry (+5%)']
  },
];

const sideHustleTimelineEvents = [
  {
    id: 1,
    type: 'schedule',
    icon: Clock,
    title: 'Skill Practice Scheduled',
    description: 'Auto-scheduled React practice session based on 5-day inactivity alert.',
    time: '9:00 AM',
    date: 'Today',
    details: ['Duration: 45 mins', 'Focus: React Hooks', 'Source: YouTube tutorial']
  },
  {
    id: 2,
    type: 'project',
    icon: Code,
    title: 'Project Assignment',
    description: 'Assigned "Portfolio Website" project based on current skill level.',
    time: '11:00 AM',
    date: 'Today',
    details: ['Difficulty: Beginner', 'Est. time: 8 hours', 'Skills: HTML, CSS, React']
  },
  {
    id: 3,
    type: 'detection',
    icon: Zap,
    title: 'Skill Gap Detected',
    description: 'Identified TypeScript as prerequisite for advanced React projects.',
    time: '3:00 PM',
    date: 'Today',
    details: ['Added TypeScript module', 'Priority: High', 'Est. completion: 2 weeks']
  },
  {
    id: 4,
    type: 'insight',
    icon: TrendingUp,
    title: 'Portfolio Readiness Update',
    description: 'Portfolio completion increased to 65% after project submission.',
    time: '7:00 PM',
    date: 'Yesterday',
    details: ['Projects completed: 4/6', 'Skills showcased: 5', 'Recommendation: Add more AI projects']
  },
  {
    id: 5,
    type: 'adjustment',
    icon: Brain,
    title: 'Learning Path Optimized',
    description: 'Reordered learning modules for better skill progression.',
    time: '10:00 PM',
    date: 'Yesterday',
    details: ['Moved: Node.js before Express', 'Added: MongoDB basics', 'Reason: Dependency chain']
  },
];

const typeColors = {
  schedule: 'from-blue-500 to-cyan-500',
  detection: 'from-orange-500 to-red-500',
  adjustment: 'from-purple-500 to-pink-500',
  priority: 'from-green-500 to-emerald-500',
  insight: 'from-indigo-500 to-purple-500',
  project: 'from-cyan-500 to-blue-500',
};

export default function Timeline() {
  const { mode, isOnboarded, isLoading } = useMode();
  const router = useRouter();
  const events = mode === 'academic' ? academicTimelineEvents : sideHustleTimelineEvents;

  useEffect(() => {
    if (!isLoading && !isOnboarded) {
      router.push('/onboarding');
    }
  }, [isOnboarded, isLoading, router]);

  if (isLoading || !isOnboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Agent Activity Timeline"
      subtitle="Real-time log of autonomous AI decisions and actions"
    >
      <div className="mx-auto max-w-4xl">
        {/* Header Card */}
        <GlowCard className="mb-8" delay={0}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
                  <Bot className="h-7 w-7 text-primary" />
                </div>
                <span className="absolute -right-1 -top-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-accent" />
                </span>
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold">AI Orchestrator Active</h2>
                <p className="text-sm text-muted-foreground">
                  Continuously monitoring and optimizing your {mode === 'academic' ? 'academic' : 'skill-building'} journey
                </p>
              </div>
            </div>
            <AgentBadge>Autonomous Mode</AgentBadge>
          </div>
        </GlowCard>

        {/* Timeline */}
        <div className="space-y-0">
          {events.map((event, index) => {
            const Icon = event.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="timeline-item"
              >
                <div className={`timeline-dot bg-gradient-to-br ${typeColors[event.type as keyof typeof typeColors]}`}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-bold">{event.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{event.time}</span>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.details.map((detail, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-muted px-3 py-1 text-xs"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
