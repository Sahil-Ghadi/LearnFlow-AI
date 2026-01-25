'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Brain,
  Target,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { GlowCard, StatCard, ProgressBar, AgentBadge } from '@/components/ui/GlowCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StudyReminders } from '@/components/StudyReminders';
import { UpcomingDeadlines } from '@/components/UpcomingDeadlines';
import { AIStudyPlanner } from '@/components/AIStudyPlanner';

// Mock data for academic dashboard (to be replaced with real data)
const weakAreas = [
  { subject: 'Physics', topic: 'Electromagnetic Induction', confidence: 35 },
  { subject: 'Mathematics', topic: 'Differential Equations', confidence: 42 },
  { subject: 'Chemistry', topic: 'Thermodynamics', confidence: 55 },
];

const performanceData = [
  { name: 'Week 1', marks: 65, accuracy: 70 },
  { name: 'Week 2', marks: 68, accuracy: 72 },
  { name: 'Week 3', marks: 72, accuracy: 75 },
  { name: 'Week 4', marks: 70, accuracy: 78 },
  { name: 'Week 5', marks: 78, accuracy: 82 },
  { name: 'Week 6', marks: 82, accuracy: 85 },
];

const agentDecisions = [
  { id: 1, message: 'Reduced side-skill workload by 40% due to upcoming mid-terms.', time: '2 hours ago' },
  { id: 2, message: 'Auto-scheduled Physics revision for weak topics detected.', time: '4 hours ago' },
  { id: 3, message: 'Increased practice problems for Calculus based on error patterns.', time: '6 hours ago' },
];

export function AcademicDashboard() {
  return (
    <motion.div
      key="academic"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Study Hours Today"
          value="4.5h"
          icon={<Clock className="h-5 w-5 text-primary" />}
          trend={{ value: 12, positive: true }}
          delay={0}
        />
        <StatCard
          label="Syllabus Complete"
          value="67%"
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          trend={{ value: 5, positive: true }}
          delay={0.1}
        />
        <StatCard
          label="Exam Readiness"
          value="72%"
          icon={<Target className="h-5 w-5 text-primary" />}
          trend={{ value: 8, positive: true }}
          delay={0.2}
        />
        <StatCard
          label="Accuracy Rate"
          value="85%"
          icon={<Brain className="h-5 w-5 text-primary" />}
          trend={{ value: 3, positive: true }}
          delay={0.3}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* AI Study Planner - Replaces dummy study plan */}
        <div className="lg:col-span-2">
          <AIStudyPlanner />
        </div>

        {/* Weak Areas Panel */}
        <GlowCard delay={0.3}>
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="font-heading text-xl font-bold">Weak Areas</h2>
          </div>
          <div className="space-y-4">
            {weakAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium">{area.subject}</p>
                  <span className="text-xs text-muted-foreground">{area.confidence}% confidence</span>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">{area.topic}</p>
                <ProgressBar value={area.confidence} label="" showPercentage={false} />
              </motion.div>
            ))}
          </div>
        </GlowCard>
      </div>

      {/* Performance Chart & Agent Decisions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Performance Tracker */}
        <GlowCard delay={0.4}>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl font-bold">Academic Performance</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="marks"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorMarks)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="hsl(var(--accent))"
                  fillOpacity={1}
                  fill="url(#colorAccuracy)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Marks Trend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Accuracy %</span>
            </div>
          </div>
        </GlowCard>

        {/* AI Agent Decisions */}
        <GlowCard delay={0.5}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Brain className="h-5 w-5 text-primary" />
                <span className="absolute -right-1 -top-1 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
              </div>
              <h2 className="font-heading text-xl font-bold">AI Agent Decisions</h2>
            </div>
            <span className="text-xs text-muted-foreground">Live updates</span>
          </div>
          <div className="space-y-4">
            {agentDecisions.map((decision, index) => (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="rounded-lg border border-border bg-mode-accent-soft p-4"
              >
                <p className="text-sm">{decision.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{decision.time}</p>
              </motion.div>
            ))}
          </div>
        </GlowCard>
      </div>

      {/* Reminders & Deadlines Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StudyReminders />
        <UpcomingDeadlines />
      </div>
    </motion.div>
  );
}
