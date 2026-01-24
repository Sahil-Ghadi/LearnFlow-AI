'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Clock,
  Bell,
  Globe,
  Sliders,
  Save,
  User,
  Moon,
  Sun
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlowCard } from '@/components/ui/GlowCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useMode } from '@/contexts/ModeContext';
import { toast } from 'sonner';

export default function Settings() {
  const { userProfile, setUserProfile, isOnboarded, isLoading } = useMode();
  const router = useRouter();
  const [settings, setSettings] = useState({
    dailyStudyHours: 4,
    difficultyLevel: 'medium',
    language: 'english',
    notificationFrequency: 'normal',
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    agentAutonomy: true,
    autoScheduling: true,
    breakReminders: true,
  });

  useEffect(() => {
    if (!isLoading && !isOnboarded) {
      router.push('/onboarding');
    }
  }, [isOnboarded, isLoading, router]);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  if (isLoading || !isOnboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Customize your learning experience"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile Section */}
        <GlowCard delay={0}>
          <div className="mb-6 flex items-center gap-3">
            <div className="icon-container">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Profile Information</h2>
              <p className="text-sm text-muted-foreground">Update your personal details</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={userProfile?.name || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input id="college" defaultValue={userProfile?.college || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Input id="course" defaultValue={userProfile?.course || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
          </div>
        </GlowCard>

        {/* Learning Preferences */}
        <GlowCard delay={0.1}>
          <div className="mb-6 flex items-center gap-3">
            <div className="icon-container">
              <Sliders className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Learning Preferences</h2>
              <p className="text-sm text-muted-foreground">Configure your study parameters</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Daily Study Hours */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Daily Study Hours</Label>
                <span className="font-medium">{settings.dailyStudyHours} hours</span>
              </div>
              <Slider
                value={[settings.dailyStudyHours]}
                onValueChange={([value]) => setSettings({ ...settings, dailyStudyHours: value })}
                min={1}
                max={10}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 hour</span>
                <span>10 hours</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Difficulty Level */}
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select
                  value={settings.difficultyLevel}
                  onValueChange={(value) => setSettings({ ...settings, difficultyLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy - More time, simpler problems</SelectItem>
                    <SelectItem value="medium">Medium - Balanced approach</SelectItem>
                    <SelectItem value="hard">Hard - Intensive, challenging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings({ ...settings, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </GlowCard>

        {/* Notification Settings */}
        <GlowCard delay={0.2}>
          <div className="mb-6 flex items-center gap-3">
            <div className="icon-container">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Notifications</h2>
              <p className="text-sm text-muted-foreground">Control when and how you&apos;re notified</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Notification Frequency */}
            <div className="space-y-2">
              <Label>Notification Frequency</Label>
              <Select
                value={settings.notificationFrequency}
                onValueChange={(value) => setSettings({ ...settings, notificationFrequency: value })}
              >
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal - Only critical</SelectItem>
                  <SelectItem value="normal">Normal - Important updates</SelectItem>
                  <SelectItem value="frequent">Frequent - All updates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Weekly Progress Reports</p>
                  <p className="text-sm text-muted-foreground">Summary of your learning progress</p>
                </div>
                <Switch
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
                />
              </div>
            </div>
          </div>
        </GlowCard>

        {/* AI Agent Settings */}
        <GlowCard delay={0.3}>
          <div className="mb-6 flex items-center gap-3">
            <div className="icon-container">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">AI Agent Behavior</h2>
              <p className="text-sm text-muted-foreground">Configure how the AI orchestrator works</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">Full Autonomy Mode</p>
                <p className="text-sm text-muted-foreground">Allow AI to make all scheduling decisions</p>
              </div>
              <Switch
                checked={settings.agentAutonomy}
                onCheckedChange={(checked) => setSettings({ ...settings, agentAutonomy: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">Auto-Scheduling</p>
                <p className="text-sm text-muted-foreground">Automatically create daily study plans</p>
              </div>
              <Switch
                checked={settings.autoScheduling}
                onCheckedChange={(checked) => setSettings({ ...settings, autoScheduling: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">Break Reminders</p>
                <p className="text-sm text-muted-foreground">Notify when it&apos;s time to take a break</p>
              </div>
              <Switch
                checked={settings.breakReminders}
                onCheckedChange={(checked) => setSettings({ ...settings, breakReminders: checked })}
              />
            </div>
          </div>
        </GlowCard>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end"
        >
          <Button onClick={handleSave} size="lg" className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
