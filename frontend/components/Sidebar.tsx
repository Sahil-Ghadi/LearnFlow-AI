'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Settings,
  Bot,
  GraduationCap,
  Rocket,
  Brain,
  User
} from 'lucide-react';
import { useMode } from '@/contexts/ModeContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/insights', label: 'Insights', icon: Brain },
  { path: '/timeline', label: 'Agent Timeline', icon: Activity },

  { path: '/settings', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mode, userProfile } = useMode();

  const ModeIcon = mode === 'academic' ? GraduationCap : Rocket;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-foreground">LearnFLow AI</h1>
          <p className="text-xs text-muted-foreground">Orchestrator</p>
        </div>
      </div>

      {/* Mode indicator */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-mode-accent-soft p-3">
          <ModeIcon className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Current Mode</p>
            <p className="font-medium capitalize">
              {mode === 'academic' ? 'Academic' : 'Side Hustle'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path}>
              <div className={cn('nav-link', isActive && 'active')}>
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 -z-10 rounded-lg bg-primary/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      {userProfile && (
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <span className="text-sm font-bold text-primary">
                {userProfile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{userProfile.name}</p>
              <p className="truncate text-xs text-muted-foreground">{userProfile.college}</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
