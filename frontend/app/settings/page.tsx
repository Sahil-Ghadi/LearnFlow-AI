'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Clock,
  Sliders,
  Save,
  User,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { auth } from '@/lib/firebase';
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

export default function ProfilePage() {
  const { userProfile, setUserProfile, isOnboarded, isLoading, isAuthenticated } = useMode();
  const router = useRouter();
  const [settings, setSettings] = useState({
    dailyStudyHours: 4,
    difficultyLevel: 'medium',
    language: 'english',
    agentAutonomy: true,
    autoScheduling: true,
    breakReminders: true,
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isOnboarded) {
      router.push('/onboarding');
    }
  }, [isOnboarded, isLoading, router, isAuthenticated]);

  const handleSave = () => {
    toast.success('Profile updated successfully!');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem(`userProfile_${userProfile?.name}`); // Optional cleanup
      router.push('/'); // Redirect to login
      toast.success('Signed out successfully');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error('Failed to sign out');
    }
  };

  if (isLoading || !isOnboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-lg text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="My Profile"
      subtitle="Manage your personal information and learning preferences"
    >
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Hero Profile Card */}
        <GlowCard className="p-0 overflow-hidden border-primary/20">
          <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          </div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="flex items-end gap-6">
                <div className="h-24 w-24 rounded-2xl border-4 border-background bg-zinc-800 flex items-center justify-center shadow-xl">
                  <span className="text-3xl font-bold text-primary">
                    {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="mb-2">
                  <h1 className="text-4xl font-bold">{userProfile?.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground text-lg">
                    <GraduationCap className="h-5 w-5" />
                    <span>{userProfile?.college} • {userProfile?.course}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={userProfile?.name || ''} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="your@email.com" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="college">College / University</Label>
                <Input id="college" defaultValue={userProfile?.college || ''} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Major / Course</Label>
                <Input id="course" defaultValue={userProfile?.course || ''} className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Personal Website</Label>
                <Input id="website" type="url" placeholder="https://yourwebsite.com" className="bg-muted/50" />
              </div>
            </div>
          </div>
        </GlowCard>

        {/* Settings Grid */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Learning Preferences */}
          <GlowCard delay={0.1} className="h-full">
            <div className="mb-6 flex items-center gap-3">
              <div className="icon-container">
                <Sliders className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold">Learning Preferences</h2>
                <p className="text-xs text-muted-foreground">Configure your study parameters</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Daily Study Hours */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Daily Study Hours</Label>
                  <span className="font-medium text-primary">{settings.dailyStudyHours} hours</span>
                </div>
                <Slider
                  value={[settings.dailyStudyHours]}
                  onValueChange={([value]) => setSettings({ ...settings, dailyStudyHours: value })}
                  min={1}
                  max={10}
                  step={0.5}
                  className="w-full"
                />
              </div>

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
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label>Preferred Language</Label>
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
          </GlowCard>

          {/* AI Agent Settings */}
          <GlowCard delay={0.2} className="h-full">
            <div className="mb-6 flex items-center gap-3">
              <div className="icon-container">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold">AI Agent Behavior</h2>
                <p className="text-xs text-muted-foreground">Configure orchestrator autonomy</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
                <div>
                  <p className="font-medium text-sm">Full Autonomy</p>
                  <p className="text-xs text-muted-foreground">Allow AI to make scheduling decisions</p>
                </div>
                <Switch
                  checked={settings.agentAutonomy}
                  onCheckedChange={(checked) => setSettings({ ...settings, agentAutonomy: checked })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
                <div>
                  <p className="font-medium text-sm">Auto-Scheduling</p>
                  <p className="text-xs text-muted-foreground">Create daily plans automatically</p>
                </div>
                <Switch
                  checked={settings.autoScheduling}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoScheduling: checked })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
                <div>
                  <p className="font-medium text-sm">Break Reminders</p>
                  <p className="text-xs text-muted-foreground">Smart notifications for breaks</p>
                </div>
                <Switch
                  checked={settings.breakReminders}
                  onCheckedChange={(checked) => setSettings({ ...settings, breakReminders: checked })}
                />
              </div>
            </div>
          </GlowCard>
        </div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end pt-4"
        >
          <Button onClick={handleSave} size="lg" className="min-w-[150px] gap-2 shadow-lg shadow-primary/25">
            <Save className="h-4 w-4" />
            Save Profile
          </Button>
        </motion.div>

        {/* Sign Out Section */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex justify-center">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </DashboardLayout >
  );
}
