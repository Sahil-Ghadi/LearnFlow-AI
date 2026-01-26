'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Brain,
  Target,
  AlertTriangle,
  TrendingUp,
  Settings,
  Calendar
} from 'lucide-react';
import { GlowCard, StatCard, ProgressBar, AgentBadge } from '@/components/ui/GlowCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StudyReminders } from '@/components/StudyReminders';
import { UpcomingDeadlines } from '@/components/UpcomingDeadlines';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMode } from '@/contexts/ModeContext';
import { PlannerSettings, PlannerSettingsData } from './StudyPlanner/PlannerSettings';
import { PlannerCalendar, DaySchedule } from './StudyPlanner/PlannerCalendar';



export function AcademicDashboard() {
  const { user } = useMode();

  // Planner State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState<DaySchedule[] | null>(null);
  const [plannerView, setPlannerView] = useState<'daily' | 'weekly'>('daily');
  const [isGenerating, setIsGenerating] = useState(false);

  // Stats State
  const [stats, setStats] = useState<any>({
    weak_areas: [],
    performance_graph: [],
    accuracy_rate: 0,
    exam_readiness: 0,
    agent_decisions: [],
    study_hours: "0h",
    syllabus_completion: 0
  });

  // Fetch data function
  const fetchDashboardData = async () => {
    if (!user?.uid) return;

    try {
      // Fetch Plan
      const planRes = await fetch(`http://localhost:8000/planner/latest/${user.uid}`);
      if (planRes.ok) {
        const data = await planRes.json();
        if (data.schedule && data.schedule.length > 0) {
          setScheduleData(data.schedule);
          if (data.schedule.length > 1) setPlannerView('weekly');
        }
      }

      // Fetch Stats
      const statsRes = await fetch(`http://localhost:8000/stats/academic/${user.uid}`);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [user?.uid]);

  const handleGenerateSchedule = async (settings: PlannerSettingsData) => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid,
          ...settings
        })
      });

      if (!response.ok) throw new Error('Failed to generate schedule');

      const data = await response.json();
      setScheduleData(data.schedule);
      setPlannerView(settings.view_mode);
      setIsSettingsOpen(false);
      toast.success('AI Schedule Generated Successfully!');
      fetchDashboardData(); // Refresh stats (study hours)
    } catch (error) {
      console.error('Planner Error:', error);
      toast.error('Failed to generate schedule. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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
          value={stats.study_hours}
          icon={<Clock className="h-5 w-5 text-primary" />}
          trend={{ value: 12, positive: true }}
          delay={0}
        />
        <StatCard
          label="Syllabus Complete"
          value={`${stats.syllabus_completion}%`}
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          trend={{ value: 5, positive: true }}
          delay={0.1}
        />
        <StatCard
          label="Exam Readiness"
          value={`${stats.exam_readiness}%`}
          icon={<Target className="h-5 w-5 text-primary" />}
          trend={{ value: 8, positive: true }}
          delay={0.2}
        />
        <StatCard
          label="Accuracy Rate"
          value={`${stats.accuracy_rate}%`}
          icon={<Brain className="h-5 w-5 text-primary" />}
          trend={{ value: 3, positive: true }}
          delay={0.3}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Advanced AI Study Planner */}
        <div className="lg:col-span-2">
          {/* ... Planner UI kept same ... */}
          {/* Reusing existing code for planner card, logic is unchanged inside */}
          <GlowCard className="h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 z-10">
              <Button
                onClick={() => setIsSettingsOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-xs"
              >
                <Settings className="h-3.5 w-3.5" />
                Configure
              </Button>
            </div>

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold">AI Study Schedule</h2>
                <p className="text-xs text-zinc-500">
                  {scheduleData ? ` Optimized for ${plannerView} view` : 'Auto-generated based on your constraints'}
                </p>
              </div>
            </div>

            <PlannerCalendar scheduleData={scheduleData} viewMode={plannerView} />
          </GlowCard>
        </div>

        {/* Upcoming Deadlines Panel (Moved here) */}
        <UpcomingDeadlines onRefreshStats={fetchDashboardData} />
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
              <AreaChart data={stats.performance_graph}>
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
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Marks Trend</span>
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
            {stats.agent_decisions.map((decision: any, index: number) => (
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

      {/* Reminders & Weak Areas Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StudyReminders />

        {/* Weak Areas (Moved here) */}
        <GlowCard delay={0.3}>
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="font-heading text-xl font-bold">Weak Areas</h2>
          </div>
          <div className="space-y-4">
            {stats.weak_areas.map((area: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium">{area.topic}</p>
                  <span className="text-xs text-muted-foreground">{area.confidence}% confidence</span>
                </div>
                <ProgressBar value={area.confidence} label="" showPercentage={false} />
              </motion.div>
            ))}
            {stats.weak_areas.length === 0 && (
              <p className="text-center text-zinc-500 text-sm py-4">No weak areas identified yet. Keep it up!</p>
            )}
          </div>
        </GlowCard>
      </div>

      {/* Planner Settings Modal */}
      <PlannerSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onGenerate={handleGenerateSchedule}
        isLoading={isGenerating}
      />
    </motion.div>
  );
}
