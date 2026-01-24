'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    BookOpen,
    FileText,
    FolderKanban,
    Clock,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMode } from '@/contexts/ModeContext';

interface Deadline {
    id: string;
    title: string;
    dueDate: Date;
    category: 'exam' | 'assignment' | 'project';
    subject?: string;
    progress?: number;
}

const academicDeadlines: Deadline[] = [
    {
        id: '1',
        title: 'Physics Assignment',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        category: 'assignment',
        subject: 'Physics',
        progress: 65,
    },
    {
        id: '2',
        title: 'Mathematics Problem Set',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        category: 'assignment',
        subject: 'Mathematics',
        progress: 30,
    },
    {
        id: '3',
        title: 'Chemistry Lab Report',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        category: 'assignment',
        subject: 'Chemistry',
        progress: 0,
    },
    {
        id: '4',
        title: 'Mid-term Examinations',
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        category: 'exam',
        progress: 72,
    },
];

const sideHustleDeadlines: Deadline[] = [
    {
        id: '1',
        title: 'Portfolio Website',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        category: 'project',
        subject: 'Web Development',
        progress: 70,
    },
    {
        id: '2',
        title: 'CRUD Application',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        category: 'project',
        subject: 'Full Stack',
        progress: 35,
    },
    {
        id: '3',
        title: 'React Hooks Module',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        category: 'assignment',
        subject: 'React',
        progress: 85,
    },
];

const categoryIcons = {
    exam: BookOpen,
    assignment: FileText,
    project: FolderKanban,
};

const categoryColors = {
    exam: 'bg-destructive/10 text-destructive border-destructive/30',
    assignment: 'bg-primary/10 text-primary border-primary/30',
    project: 'bg-accent/10 text-accent border-accent/30',
};

export function UpcomingDeadlines() {
    const { mode } = useMode();
    const deadlines = mode === 'academic' ? academicDeadlines : sideHustleDeadlines;

    const formatDaysUntil = (date: Date) => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days < 7) return `${days} days`;
        return `${Math.ceil(days / 7)} week${days >= 14 ? 's' : ''}`;
    };

    const getUrgencyColor = (date: Date) => {
        const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (days <= 2) return 'text-destructive';
        if (days <= 5) return 'text-accent';
        return 'text-muted-foreground';
    };

    const sortedDeadlines = [...deadlines].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            {/* Header */}
            <div className="mb-4 flex items-center gap-2">
                <div className="icon-container">
                    <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-heading font-bold">Upcoming Deadlines</h3>
                    <p className="text-xs text-muted-foreground">
                        {deadlines.length} {mode === 'academic' ? 'academic' : 'project'} deadlines
                    </p>
                </div>
            </div>

            {/* Deadlines List */}
            <div className="space-y-3">
                {sortedDeadlines.map((deadline, index) => {
                    const Icon = categoryIcons[deadline.category];
                    const daysUntil = formatDaysUntil(deadline.dueDate);
                    const urgencyColor = getUrgencyColor(deadline.dueDate);
                    const isUrgent = Math.ceil((deadline.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 2;

                    return (
                        <motion.div
                            key={deadline.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                'group rounded-lg border p-4 transition-all hover:shadow-md',
                                isUrgent ? 'border-destructive/50 bg-destructive/5' : 'border-border'
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                                    categoryColors[deadline.category]
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="font-medium text-sm">{deadline.title}</h4>
                                            {deadline.subject && (
                                                <p className="text-xs text-muted-foreground">{deadline.subject}</p>
                                            )}
                                        </div>
                                        <div className={cn('flex items-center gap-1 text-sm font-medium', urgencyColor)}>
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{daysUntil}</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {deadline.progress !== undefined && (
                                        <div className="mt-3">
                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{deadline.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${deadline.progress}%` }}
                                                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                                                    className={cn(
                                                        'h-full rounded-full',
                                                        deadline.progress >= 70 ? 'bg-accent' : deadline.progress >= 40 ? 'bg-primary' : 'bg-destructive'
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Urgent Warning */}
                            {isUrgent && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2"
                                >
                                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                                    <span className="text-xs text-destructive font-medium">
                                        {deadline.progress !== undefined && deadline.progress < 50
                                            ? 'Low progress - prioritize this!'
                                            : 'Due soon - stay focused!'}
                                    </span>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-4 grid grid-cols-3 gap-2">
                {(['exam', 'assignment', 'project'] as const).map((cat) => {
                    const count = deadlines.filter(d => d.category === cat).length;
                    if (count === 0) return null;
                    const Icon = categoryIcons[cat];
                    return (
                        <div
                            key={cat}
                            className={cn(
                                'flex items-center justify-center gap-1.5 rounded-lg border py-2',
                                categoryColors[cat]
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium capitalize">
                                {count} {cat}{count > 1 ? 's' : ''}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
