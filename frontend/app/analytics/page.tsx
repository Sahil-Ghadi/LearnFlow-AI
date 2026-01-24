'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Target,
  BookOpen,
  Award,
  Code,
  Rocket,
  PieChart
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlowCard, StatCard, ProgressBar } from '@/components/ui/GlowCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMode } from '@/contexts/ModeContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Academic data
const examReadinessData = [
  { subject: 'Physics', readiness: 78 },
  { subject: 'Chemistry', readiness: 65 },
  { subject: 'Mathematics', readiness: 82 },
  { subject: 'Biology', readiness: 71 },
  { subject: 'Computer Science', readiness: 88 },
];

const syllabusProgressData = [
  { name: 'Physics', completed: 72, remaining: 28 },
  { name: 'Chemistry', completed: 58, remaining: 42 },
  { name: 'Math', completed: 85, remaining: 15 },
  { name: 'Biology', completed: 63, remaining: 37 },
  { name: 'CS', completed: 91, remaining: 9 },
];

const weeklyPerformance = [
  { week: 'Week 1', score: 65, target: 70 },
  { week: 'Week 2', score: 68, target: 72 },
  { week: 'Week 3', score: 72, target: 74 },
  { week: 'Week 4', score: 78, target: 76 },
  { week: 'Week 5', score: 75, target: 78 },
  { week: 'Week 6', score: 82, target: 80 },
];

// Side Hustle data
const skillMasteryData = [
  { name: 'Web Dev', value: 60, color: 'hsl(var(--chart-1))' },
  { name: 'DSA', value: 40, color: 'hsl(var(--chart-2))' },
  { name: 'AI/ML', value: 25, color: 'hsl(var(--chart-3))' },
  { name: 'UI/UX', value: 45, color: 'hsl(var(--chart-4))' },
  { name: 'Backend', value: 35, color: 'hsl(var(--chart-5))' },
];

const projectCompletionData = [
  { month: 'Jan', projects: 1 },
  { month: 'Feb', projects: 2 },
  { month: 'Mar', projects: 1 },
  { month: 'Apr', projects: 3 },
  { month: 'May', projects: 2 },
  { month: 'Jun', projects: 3 },
];

const portfolioItems = [
  { category: 'Web Projects', count: 4, target: 6 },
  { category: 'API Projects', count: 2, target: 4 },
  { category: 'Full Stack', count: 1, target: 3 },
  { category: 'Open Source', count: 0, target: 2 },
];

export default function Analytics() {
  const { mode, isOnboarded, isLoading } = useMode();
  const router = useRouter();

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
      title="Analytics Dashboard"
      subtitle="Comprehensive insights into your learning progress"
    >
      <Tabs defaultValue={mode === 'academic' ? 'academic' : 'sidehustle'} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="academic" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Academic Metrics
          </TabsTrigger>
          <TabsTrigger value="sidehustle" className="gap-2">
            <Rocket className="h-4 w-4" />
            Side Hustle Metrics
          </TabsTrigger>
        </TabsList>

        {/* Academic Metrics */}
        <TabsContent value="academic" className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Overall Exam Readiness"
              value="77%"
              icon={<Target className="h-5 w-5 text-primary" />}
              trend={{ value: 8, positive: true }}
              delay={0}
            />
            <StatCard
              label="Syllabus Coverage"
              value="74%"
              icon={<BookOpen className="h-5 w-5 text-primary" />}
              trend={{ value: 5, positive: true }}
              delay={0.1}
            />
            <StatCard
              label="Average Score"
              value="78%"
              icon={<Award className="h-5 w-5 text-primary" />}
              trend={{ value: 12, positive: true }}
              delay={0.2}
            />
            <StatCard
              label="Study Streak"
              value="12 days"
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              delay={0.3}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Exam Readiness */}
            <GlowCard delay={0.2}>
              <h3 className="mb-4 font-heading text-lg font-bold">Exam Readiness by Subject</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={examReadinessData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis type="category" dataKey="subject" width={100} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                    <Bar dataKey="readiness" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlowCard>

            {/* Weekly Performance */}
            <GlowCard delay={0.3}>
              <h3 className="mb-4 font-heading text-lg font-bold">Weekly Performance vs Target</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyPerformance}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
                    <Area type="monotone" dataKey="target" stroke="hsl(var(--accent))" fill="none" strokeDasharray="5 5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Your Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-0.5 border-t-2 border-dashed border-accent" style={{ width: '12px' }} />
                  <span className="text-sm text-muted-foreground">Target</span>
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Syllabus Progress */}
          <GlowCard delay={0.4}>
            <h3 className="mb-6 font-heading text-lg font-bold">Syllabus Progress by Subject</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              {syllabusProgressData.map((subject, index) => (
                <motion.div
                  key={subject.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <ProgressBar value={subject.completed} label={subject.name} />
                </motion.div>
              ))}
            </div>
          </GlowCard>
        </TabsContent>

        {/* Side Hustle Metrics */}
        <TabsContent value="sidehustle" className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Skills in Progress"
              value="5"
              icon={<Code className="h-5 w-5 text-primary" />}
              delay={0}
            />
            <StatCard
              label="Projects Completed"
              value="12"
              icon={<Rocket className="h-5 w-5 text-primary" />}
              trend={{ value: 3, positive: true }}
              delay={0.1}
            />
            <StatCard
              label="Portfolio Ready"
              value="58%"
              icon={<PieChart className="h-5 w-5 text-primary" />}
              trend={{ value: 15, positive: true }}
              delay={0.2}
            />
            <StatCard
              label="Freelance Ready"
              value="Soon"
              icon={<Target className="h-5 w-5 text-primary" />}
              delay={0.3}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Skill Mastery */}
            <GlowCard delay={0.2}>
              <h3 className="mb-4 font-heading text-lg font-bold">Skill Mastery Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={skillMasteryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {skillMasteryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </GlowCard>

            {/* Project Completion */}
            <GlowCard delay={0.3}>
              <h3 className="mb-4 font-heading text-lg font-bold">Projects Completed per Month</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                    <Bar dataKey="projects" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlowCard>
          </div>

          {/* Portfolio Readiness */}
          <GlowCard delay={0.4}>
            <h3 className="mb-6 font-heading text-lg font-bold">Portfolio Readiness</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {portfolioItems.map((item, index) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="rounded-xl border border-border bg-mode-surface-elevated p-4"
                >
                  <p className="mb-2 text-sm text-muted-foreground">{item.category}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold font-heading">{item.count}</span>
                    <span className="text-muted-foreground">/ {item.target}</span>
                  </div>
                  <ProgressBar value={(item.count / item.target) * 100} label="" showPercentage={false} />
                </motion.div>
              ))}
            </div>
          </GlowCard>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
