'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, Sparkles, TrendingUp, Brain, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Logo/Icon */}
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                <Bot className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="mb-6 font-heading text-5xl font-bold leading-tight lg:text-7xl">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Learning Companion
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground lg:text-xl">
              Balance academics and side hustles effortlessly. LearnFlow AI creates personalized study plans,
              detects weak areas, and helps you build marketable skills—all powered by advanced AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="gap-2 text-lg"
                onClick={() => router.push('/login')}
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-heading text-4xl font-bold">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-muted-foreground">
              Powered by cutting-edge AI to optimize your learning journey
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-heading text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-primary to-accent p-12 text-center text-white"
          >
            <h2 className="mb-4 font-heading text-4xl font-bold">
              Ready to Transform Your Learning?
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Join thousands of students already using AI to achieve their goals
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-lg"
              onClick={() => router.push('/login')}
            >
              Start Your Journey
              <Sparkles className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: Brain,
    title: 'AI Study Planner',
    description: 'Get personalized daily study plans optimized for your exam schedule and learning pace.',
  },
  {
    icon: TrendingUp,
    title: 'Weak Area Detection',
    description: 'Automatically identify struggling topics and get targeted practice recommendations.',
  },
  {
    icon: Zap,
    title: 'Dual-Mode Learning',
    description: 'Seamlessly balance academic studies with skill-building for side hustles and freelancing.',
  },
  {
    icon: Sparkles,
    title: 'Smart Analytics',
    description: 'Track your progress with detailed insights, performance charts, and readiness scores.',
  },
  {
    icon: Bot,
    title: 'AI ChatBot',
    description: 'Ask questions anytime and get instant, context-aware answers about your learning journey.',
  },
  {
    icon: TrendingUp,
    title: 'Burnout Prevention',
    description: 'AI monitors your workload and automatically adjusts schedules to prevent exhaustion.',
  },
];
