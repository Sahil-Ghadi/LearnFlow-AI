'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  Rocket,
  Youtube,
  BookMarked,
  Zap,
  FolderKanban,
  AlertCircle
} from 'lucide-react';
import { GlowCard, StatCard, ProgressBar, AgentBadge } from '@/components/ui/GlowCard';
import { StudyReminders } from '@/components/StudyReminders';
import { UpcomingDeadlines } from '@/components/UpcomingDeadlines';
import { useMode } from '@/contexts/ModeContext';

const iconMap: Record<string, any> = {
  Code,
  FolderKanban,
  Zap,
  Rocket
};

const difficultyColors = {
  Beginner: 'bg-accent/20 text-accent',
  Intermediate: 'bg-primary/20 text-primary',
  Advanced: 'bg-destructive/20 text-destructive',
};

const statusColors = {
  'In Progress': 'bg-primary/20 text-primary',
  'Completed': 'bg-accent/20 text-accent',
  'Queued': 'bg-muted text-muted-foreground',
};

export function SideHustleDashboard() {
  const { user } = useMode();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/dashboard/sidehustle/${user.uid}`);

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const skillProgress = dashboardData?.skill_progress || [];
  const learningSources = dashboardData?.learning_sources || [];
  const assignedProjects = dashboardData?.assigned_projects || [];
  const activityAlerts = dashboardData?.activity_alerts || [];

  return (
    <motion.div
      key="side-hustle"
      initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.4, ease: "easeIn" } }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Skills in Progress"
          value={stats.skills_in_progress?.toString() || "0"}
          icon={<Zap className="h-5 w-5 text-primary" />}
          delay={0}
        />
        <StatCard
          label="Projects Completed"
          value={stats.projects_completed?.toString() || "0"}
          icon={<FolderKanban className="h-5 w-5 text-primary" />}
          trend={{ value: 2, positive: true }}
          delay={0.1}
        />
        <StatCard
          label="Weekly Practice"
          value={stats.weekly_practice || "0h"}
          icon={<Code className="h-5 w-5 text-primary" />}
          trend={{ value: 15, positive: true }}
          delay={0.2}
        />
        <StatCard
          label="Portfolio Ready"
          value={stats.portfolio_ready || "0%"}
          icon={<Rocket className="h-5 w-5 text-primary" />}
          trend={{ value: 10, positive: true }}
          delay={0.3}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Skill Progress Tracker */}
        <GlowCard className="lg:col-span-2" delay={0.2}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold">Skill Progress Tracker</h2>
            <AgentBadge>AI Monitored</AgentBadge>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {skillProgress.map((skill: any, index: number) => {
              const Icon = iconMap[skill.icon] || Code;
              return (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="rounded-xl border border-border bg-mode-surface-elevated p-4"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="icon-container">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{skill.name}</span>
                  </div>
                  <ProgressBar value={skill.progress} label="" />
                </motion.div>
              );
            })}
          </div>
        </GlowCard>

        {/* Learning Sources */}
        <GlowCard delay={0.3}>
          <div className="mb-4 flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl font-bold">Learning Sources</h2>
          </div>
          <div className="space-y-3">
            {learningSources.map((source: any, index: number) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="rounded-lg border border-border p-3"
              >
                <div className="mb-2 flex items-start gap-2">
                  {source.type === 'video' && <Youtube className="mt-0.5 h-4 w-4 text-destructive" />}
                  {source.type === 'course' && <BookMarked className="mt-0.5 h-4 w-4 text-primary" />}
                  {source.type === 'practice' && <Code className="mt-0.5 h-4 w-4 text-accent" />}
                  <p className="text-sm font-medium">{source.source}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">→ {source.skill}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[source.status as keyof typeof statusColors] || 'bg-muted text-muted-foreground'}`}>
                    {source.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </GlowCard>
      </div>

      {/* Projects & Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Auto-Assigned Projects */}
        <GlowCard delay={0.4}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold">Auto-Assigned Projects</h2>
            <AgentBadge>Assigned by AI Agent</AgentBadge>
          </div>
          <div className="space-y-4">
            {assignedProjects.map((project: any, index: number) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="rounded-xl border border-border bg-mode-surface-elevated p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-medium">{project.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${difficultyColors[project.difficulty as keyof typeof difficultyColors] || 'bg-muted text-muted-foreground'}`}>
                    {project.difficulty}
                  </span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">Est. {project.estimatedTime}</p>
                <div className="flex flex-wrap gap-1">
                  {project.skills?.map((skill: string) => (
                    <span key={skill} className="rounded-md bg-muted px-2 py-0.5 text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </GlowCard>

        {/* Skill Activity Monitor */}
        <GlowCard delay={0.5}>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative">
              <AlertCircle className="h-5 w-5 text-primary" />
              <span className="absolute -right-1 -top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            </div>
            <h2 className="font-heading text-xl font-bold">Skill Activity Monitor</h2>
          </div>
          <div className="space-y-4">
            {activityAlerts.map((alert: any, index: number) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`rounded-lg border p-4 ${alert.type === 'warning'
                  ? 'border-destructive/30 bg-destructive/10'
                  : alert.type === 'success'
                    ? 'border-accent/30 bg-accent/10'
                    : 'border-border bg-mode-accent-soft'
                  }`}
              >
                <p className="text-sm">{alert.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{alert.time}</p>
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
