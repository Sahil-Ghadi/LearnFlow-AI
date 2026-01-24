'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    X,
    Send,
    Bot,
    User,
    Sparkles,
    Calendar,
    BookOpen,
    Target,
    Clock,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMode } from '@/contexts/ModeContext';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Suggested prompts for quick actions
const quickPrompts = [
    { icon: Calendar, text: "What's my schedule today?", category: 'schedule' },
    { icon: BookOpen, text: "Show my syllabus progress", category: 'syllabus' },
    { icon: Target, text: "What are my upcoming deadlines?", category: 'deadlines' },
    { icon: Clock, text: "How much study time today?", category: 'time' },
];

// Mock AI responses based on mode and query type
const getAIResponse = (query: string, mode: string, userName: string): string => {
    const lowerQuery = query.toLowerCase();

    // Schedule related
    if (lowerQuery.includes('schedule') || lowerQuery.includes('today') || lowerQuery.includes('plan')) {
        if (mode === 'academic') {
            return `Good question, ${userName}! 📅 Here's your optimized study schedule for today:

**Morning (9:00 AM - 12:00 PM)**
• Physics - Quantum Mechanics (40 mins)
• Break (15 mins)
• Calculus - Integration Practice (45 mins)

**Afternoon (2:00 PM - 5:00 PM)**  
• Chemistry - Organic Reactions (35 mins)
• Mock Test Review (25 mins)

I've prioritized Physics today since your exam readiness is at 72%. Want me to adjust anything?`;
        } else {
            return `Hey ${userName}! 🚀 Here's your skill-building schedule for today:

**Session 1 (10:00 AM - 12:00 PM)**
• React Hooks Deep Dive (45 mins)
• Build: Todo App Feature (60 mins)

**Session 2 (3:00 PM - 5:00 PM)**
• TypeScript Fundamentals (40 mins)
• LeetCode - 2 Easy Problems (35 mins)

I've scheduled extra React time since you haven't practiced in 5 days. Ready to crush it?`;
        }
    }

    // Syllabus related
    if (lowerQuery.includes('syllabus') || lowerQuery.includes('progress') || lowerQuery.includes('covered')) {
        if (mode === 'academic') {
            return `📚 Here's your syllabus progress breakdown, ${userName}:

| Subject | Completed | Remaining |
|---------|-----------|-----------|
| Physics | 72% | 28% |
| Chemistry | 58% | 42% |
| Mathematics | 85% | 15% |
| Biology | 63% | 37% |
| Computer Science | 91% | 9% |

**Focus Areas:**
⚠️ Chemistry needs attention - 42% remaining with only 3 weeks to exams
✅ CS is nearly complete - great job!

Would you like me to create a catch-up plan for Chemistry?`;
        } else {
            return `📊 Your skill progress dashboard, ${userName}:

| Skill | Mastery | Status |
|-------|---------|--------|
| Web Development | 60% | On Track |
| DSA | 40% | Needs Attention |
| AI/ML | 25% | Just Started |
| UI/UX Design | 45% | Good Progress |

**Recommendations:**
🎯 Focus on DSA - many job interviews require it
🔥 Your React skills are improving fast!

Want me to suggest the next learning module?`;
        }
    }

    // Deadlines related
    if (lowerQuery.includes('deadline') || lowerQuery.includes('due') || lowerQuery.includes('upcoming')) {
        if (mode === 'academic') {
            return `⏰ Upcoming deadlines, ${userName}:

**This Week:**
• 📝 Physics Assignment - Due in 2 days
• 📊 Math Problem Set - Due in 4 days
• 🧪 Chemistry Lab Report - Due in 5 days

**Next Week:**
• 📖 Mid-term Exams Begin - 8 days away
  - Physics (Day 1)
  - Mathematics (Day 2)
  - Chemistry (Day 4)

**AI Recommendation:** I've already adjusted your study plan to prioritize Physics and Chemistry revision. Should I send you daily reminders?`;
        } else {
            return `📅 Your project deadlines, ${userName}:

**Active Projects:**
• 🌐 Portfolio Website - Deadline: 5 days
  - Status: 70% complete
  - Remaining: Contact form, animations

• 💻 CRUD Application - Deadline: 12 days
  - Status: 35% complete
  - Remaining: API integration, testing

**Suggested:** Complete the Portfolio first - it's almost done and will boost your confidence!

Need help breaking down these tasks?`;
        }
    }

    // Time related
    if (lowerQuery.includes('time') || lowerQuery.includes('hours') || lowerQuery.includes('study')) {
        return `⏱️ Your study time summary, ${userName}:

**Today:** 4.5 hours (Target: 5 hours)
**This Week:** 22 hours (Target: 25 hours)
**This Month:** 78 hours (+12% vs last month)

**Insights:**
• Most productive time: 10 AM - 12 PM
• Average session length: 45 minutes
• Focus score: 82% (Great!)

💡 Tip: You're 30 mins away from today's goal. A quick revision session would help!`;
    }

    // Weak areas
    if (lowerQuery.includes('weak') || lowerQuery.includes('improve') || lowerQuery.includes('struggle')) {
        if (mode === 'academic') {
            return `🎯 I've analyzed your performance, ${userName}. Here are areas needing attention:

**Critical (< 50% accuracy):**
• Physics → Electromagnetic Induction (35%)
• Math → Differential Equations (42%)

**Moderate (50-70% accuracy):**
• Chemistry → Thermodynamics (55%)
• Physics → Wave Optics (62%)

**Action Plan:**
1. I've added extra revision sessions for EM Induction
2. Scheduled 3 practice problem sets for Differential Equations
3. Created flashcards for Thermodynamics formulas

Want me to explain any of these topics?`;
        } else {
            return `🔍 Skills that need more practice, ${userName}:

**Priority Focus:**
• TypeScript - You're using 'any' type too often
• System Design - Important for interviews
• Git workflows - Branch management

**Suggested Actions:**
1. Complete the TypeScript type challenges
2. Watch 2 system design videos this week
3. Practice merge conflict resolution

I can assign you specific exercises for any of these!`;
        }
    }

    // Help/general
    if (lowerQuery.includes('help') || lowerQuery.includes('can you') || lowerQuery.includes('what can')) {
        return `Hi ${userName}! 👋 I'm your AI Learning Orchestrator. Here's how I can help:

**📅 Scheduling**
• Generate daily study plans
• Optimize your calendar
• Set reminders

**📊 Progress Tracking**
• Syllabus completion status
• Performance analytics
• Weak area detection

**⏰ Deadline Management**
• Track all your deadlines
• Prioritize tasks automatically
• Send timely reminders

**🎯 Personalized Learning**
• Recommend study resources
• Adapt difficulty levels
• Suggest break times

Just ask me anything! Try: "What should I study today?"`;
    }

    // Motivation
    if (lowerQuery.includes('motivat') || lowerQuery.includes('tired') || lowerQuery.includes('break')) {
        return `I hear you, ${userName}! 💪 

**Quick Pick-Me-Ups:**
• You've maintained a 12-day study streak! 🔥
• Your accuracy improved 8% this week
• You're ahead of 73% of your peers

**Maybe you need:**
🍵 A 15-minute break? I'll pause your timer
🎵 Some focus music? Try lo-fi beats
🚶 A quick walk? Movement helps concentration

Remember: Progress > Perfection. You're doing amazing!

Want me to reschedule today's remaining tasks to tomorrow?`;
    }

    // Default response
    return `Thanks for your question, ${userName}! 🤔

I'm analyzing your data to give you the best answer. In the meantime, here are some things I can help with:

• **"What's my schedule?"** - Get today's study plan
• **"Show deadlines"** - See upcoming due dates  
• **"Syllabus progress"** - Track what you've covered
• **"Help me improve"** - Find your weak areas

What would you like to explore?`;
};

export function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { mode, userProfile } = useMode();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Add welcome message when chat opens for the first time
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage: Message = {
                id: 'welcome',
                role: 'assistant',
                content: `Hey ${userProfile?.name || 'there'}! 👋 I'm your AI Learning Assistant. I'm here to help you stay on track with your ${mode === 'academic' ? 'academics' : 'skill-building journey'}!\n\nTry asking me:\n• "What's my schedule today?"\n• "Show my upcoming deadlines"\n• "How's my progress?"`,
                timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, messages.length, userProfile?.name, mode]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        const aiResponse = getAIResponse(content, mode, userProfile?.name || 'there');

        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date(),
        };

        setIsTyping(false);
        setMessages(prev => [...prev, assistantMessage]);
    };

    const handleQuickPrompt = (prompt: string) => {
        handleSendMessage(prompt);
    };

    return (
        <>
            {/* Floating Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, hsl(var(--mode-gradient-start)), hsl(var(--mode-gradient-end)))',
                        }}
                    >
                        <MessageCircle className="h-6 w-6 text-white" />
                        <span className="absolute -right-1 -top-1 flex h-4 w-4">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                            <span className="relative inline-flex h-4 w-4 rounded-full bg-accent" />
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                    >
                        {/* Header */}
                        <div
                            className="flex items-center justify-between p-4"
                            style={{
                                background: 'linear-gradient(135deg, hsl(var(--mode-gradient-start)), hsl(var(--mode-gradient-end)))',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-heading font-bold text-white">AI Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-xs text-white/80">Always Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        'flex gap-3',
                                        message.role === 'user' ? 'flex-row-reverse' : ''
                                    )}
                                >
                                    <div className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    )}>
                                        {message.role === 'user' ? (
                                            <User className="h-4 w-4" />
                                        ) : (
                                            <Sparkles className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                    <div className={cn(
                                        'max-w-[280px] rounded-2xl px-4 py-3',
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                            : 'bg-muted rounded-bl-md'
                                    )}>
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <span className={cn(
                                            'text-xs mt-1 block',
                                            message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                        )}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                                        <div className="flex gap-1">
                                            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Prompts */}
                        {messages.length <= 1 && (
                            <div className="px-4 pb-2">
                                <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickPrompts.map((prompt, index) => {
                                        const Icon = prompt.icon;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleQuickPrompt(prompt.text)}
                                                className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                                            >
                                                <Icon className="h-3 w-3 text-primary" />
                                                {prompt.text}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="border-t border-border p-4">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage(inputValue);
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask me anything..."
                                    className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    disabled={isTyping}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-10 w-10 rounded-full"
                                    disabled={!inputValue.trim() || isTyping}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
