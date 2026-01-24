'use client';

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

// Mock data for side hustle dashboard
const skillProgress = [
  { name: 'Web Development', progress: 60, icon: Code },
  { name: 'Data Structures & Algorithms', progress: 40, icon: FolderKanban },
  { name: 'AI & Machine Learning', progress: 25, icon: Zap },
  { name: 'UI/UX Design', progress: 45, icon: Rocket },
];

const learningSources = [
  { id: 1, source: 'YouTube: React Full Course', skill: 'Web Development', type: 'video', status: 'In Progress' },
  { id: 2, source: 'Udemy: Complete Python Bootcamp', skill: 'AI/ML', type: 'course', status: 'Completed' },
  { id: 3, source: 'LeetCode: Array Problems', skill: 'DSA', type: 'practice', status: 'In Progress' },
  { id: 4, source: 'Figma: Design Fundamentals', skill: 'UI/UX', type: 'course', status: 'Queued' },
];

const assignedProjects = [
  { id: 1, title: 'Build a Portfolio Website', difficulty: 'Beginner', estimatedTime: '8 hours', skills: ['HTML', 'CSS', 'React'] },
  { id: 2, title: 'Create a CRUD Application', difficulty: 'Intermediate', estimatedTime: '12 hours', skills: ['Node.js', 'MongoDB', 'Express'] },
  { id: 3, title: 'AI Chatbot with OpenAI', difficulty: 'Advanced', estimatedTime: '20 hours', skills: ['Python', 'API', 'NLP'] },
];

const activityAlerts = [
  { id: 1, type: 'warning', message: 'No DSA practice in 5 days — revision scheduled automatically.', time: '1 hour ago' },
  { id: 2, type: 'info', message: 'New project milestone unlocked in Web Development track.', time: '3 hours ago' },
  { id: 3, type: 'success', message: 'Completed React Hooks module — next module queued.', time: '1 day ago' },
];

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
  return (
    <motion.div
      key="side-hustle"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Skills in Progress"
          value="4"
          icon={<Zap className="h-5 w-5 text-primary" />}
          delay={0}
        />
        <StatCard
          label="Projects Completed"
          value="7"
          icon={<FolderKanban className="h-5 w-5 text-primary" />}
          trend={{ value: 2, positive: true }}
          delay={0.1}
        />
        <StatCard
          label="Weekly Practice"
          value="18h"
          icon={<Code className="h-5 w-5 text-primary" />}
          trend={{ value: 15, positive: true }}
          delay={0.2}
        />
        <StatCard
          label="Portfolio Ready"
          value="65%"
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
            {skillProgress.map((skill, index) => {
              const Icon = skill.icon;
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
            {learningSources.map((source, index) => (
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
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[source.status as keyof typeof statusColors]}`}>
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
            {assignedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="rounded-xl border border-border bg-mode-surface-elevated p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-medium">{project.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${difficultyColors[project.difficulty as keyof typeof difficultyColors]}`}>
                    {project.difficulty}
                  </span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">Est. {project.estimatedTime}</p>
                <div className="flex flex-wrap gap-1">
                  {project.skills.map((skill) => (
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
            {activityAlerts.map((alert, index) => (
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
