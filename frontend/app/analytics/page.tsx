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

export default function Analytics() {
  const { mode, isOnboarded, isLoading, user } = useMode();
  const router = useRouter();

  // Academic data state
  const [academicStats, setAcademicStats] = useState<any>(null);
  const [academicLoading, setAcademicLoading] = useState(true);

  // Side hustle data state
  const [sideHustleStats, setSideHustleStats] = useState<any>(null);
  const [sideHustleLoading, setSideHustleLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isOnboarded) {
      router.push('/onboarding');
    }
  }, [isOnboarded, isLoading, router]);

  // Fetch academic analytics
  useEffect(() => {
    const fetchAcademicAnalytics = async () => {
      if (!user) return;

      try {
        setAcademicLoading(true);
        const response = await fetch(`http://localhost:8000/analytics/academic/${user.uid}`);

        if (response.ok) {
          const data = await response.json();
          setAcademicStats(data);
        }
      } catch (err) {
        console.error('Error fetching academic analytics:', err);
      } finally {
        setAcademicLoading(false);
      }
    };

    if (user && !isLoading && isOnboarded) {
      fetchAcademicAnalytics();
    }
  }, [user, isLoading, isOnboarded]);

  // Fetch side hustle analytics
  useEffect(() => {
    const fetchSideHustleAnalytics = async () => {
      if (!user) return;

      try {
        setSideHustleLoading(true);
        const response = await fetch(`http://localhost:8000/analytics/sidehustle/${user.uid}`);

        if (response.ok) {
          const data = await response.json();
          setSideHustleStats(data);
        }
      } catch (err) {
        console.error('Error fetching side hustle analytics:', err);
      } finally {
        setSideHustleLoading(false);
      }
    };

    if (user && !isLoading && isOnboarded) {
      fetchSideHustleAnalytics();
    }
  }, [user, isLoading, isOnboarded]);

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
          {academicLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
            </div>
          ) : academicStats ? (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Overall Exam Readiness"
                  value={`${academicStats.stats.overall_readiness}%`}
                  icon={<Target className="h-5 w-5 text-primary" />}
                  trend={{ value: academicStats.stats.readiness_trend, positive: academicStats.stats.readiness_trend > 0 }}
                  delay={0}
                />
                <StatCard
                  label="Syllabus Coverage"
                  value={`${academicStats.stats.syllabus_coverage}%`}
                  icon={<BookOpen className="h-5 w-5 text-primary" />}
                  trend={{ value: 5, positive: true }}
                  delay={0.1}
                />
                <StatCard
                  label="Average Score"
                  value={`${academicStats.stats.average_score}%`}
                  icon={<Award className="h-5 w-5 text-primary" />}
                  trend={{ value: academicStats.stats.score_trend, positive: academicStats.stats.score_trend > 0 }}
                  delay={0.2}
                />
                <StatCard
                  label="Study Streak"
                  value={`${academicStats.stats.study_streak} days`}
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
                      <BarChart data={academicStats.exam_readiness_data} layout="vertical">
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
                      <AreaChart data={academicStats.weekly_performance}>
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
                  {academicStats.syllabus_progress_data.map((subject: any, index: number) => (
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
            </>
          ) : (
            <GlowCard delay={0.1}>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No academic data available yet. Start creating study plans!</p>
              </div>
            </GlowCard>
          )}
        </TabsContent>

        {/* Side Hustle Metrics */}
        <TabsContent value="sidehustle" className="space-y-6">
          {sideHustleLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
            </div>
          ) : sideHustleStats ? (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Skills in Progress"
                  value={sideHustleStats.stats.skills_in_progress.toString()}
                  icon={<Code className="h-5 w-5 text-primary" />}
                  delay={0}
                />
                <StatCard
                  label="Projects Completed"
                  value={sideHustleStats.stats.projects_completed.toString()}
                  icon={<Rocket className="h-5 w-5 text-primary" />}
                  trend={{ value: 3, positive: true }}
                  delay={0.1}
                />
                <StatCard
                  label="Portfolio Ready"
                  value={`${sideHustleStats.stats.portfolio_ready}%`}
                  icon={<PieChart className="h-5 w-5 text-primary" />}
                  trend={{ value: 15, positive: true }}
                  delay={0.2}
                />
                <StatCard
                  label="Freelance Ready"
                  value={sideHustleStats.stats.freelance_ready}
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
                          data={sideHustleStats.skill_mastery_data}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sideHustleStats.skill_mastery_data.map((entry: any, index: number) => (
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
                      <BarChart data={sideHustleStats.project_completion_data}>
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
                  {sideHustleStats.portfolio_items.map((item: any, index: number) => (
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
            </>
          ) : (
            <GlowCard delay={0.1}>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No side hustle data available yet. Start building your portfolio!</p>
              </div>
            </GlowCard>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
