'use client';

import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, BookOpen, Coffee, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// Types matching the Backend response
export interface Task {
    time: string;
    task: string;
    type: 'study' | 'break' | 'other';
    subject?: string;
    duration: number;
}

export interface DaySchedule {
    day: string;
    date: string;
    slots: Task[];
}

interface PlannerCalendarProps {
    scheduleData: DaySchedule[] | null;
    viewMode: 'daily' | 'weekly';
}

export function PlannerCalendar({ scheduleData, viewMode }: PlannerCalendarProps) {
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);

    if (!scheduleData || scheduleData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-[#111111] rounded-[2rem] border border-white/5">
                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <CalendarIcon className="h-10 w-10 text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Schedule Generated</h3>
                <p className="text-zinc-500 text-sm max-w-md text-center">
                    Configure your preferences in settings to generate your first AI-optimized study plan.
                </p>
            </div>
        );
    }

    // Daily View Component
    const DailyView = () => {
        const dayData = scheduleData[selectedDateIndex];
        if (!dayData) return null;

        return (
            <div className="bg-[#111111] rounded-[2rem] border border-white/5 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-white font-heading">{dayData.day}</h3>
                        <p className="text-zinc-500 text-sm">{dayData.date}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={selectedDateIndex === 0}
                            onClick={() => setSelectedDateIndex(prev => prev - 1)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition-all"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            disabled={selectedDateIndex === scheduleData.length - 1}
                            onClick={() => setSelectedDateIndex(prev => prev + 1)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition-all"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Timeline */}
                <div className="p-6 space-y-4">
                    {dayData.slots.map((slot, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex gap-4 group"
                        >
                            {/* Time Column */}
                            <div className="w-16 flex-shrink-0 pt-2">
                                <span className="text-xs font-bold text-zinc-500">{slot.time.split('-')[0]}</span>
                            </div>

                            {/* Card */}
                            <div className={cn(
                                "flex-1 rounded-2xl p-4 border transition-all hover:scale-[1.01]",
                                slot.type === 'study' ? "bg-primary/5 border-primary/20 hover:border-primary/40" :
                                    slot.type === 'break' ? "bg-accent/5 border-accent/20 hover:border-accent/40" :
                                        "bg-zinc-800/30 border-white/5 hover:border-white/10"
                            )}>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {slot.type === 'study' && <BookOpen className="h-4 w-4 text-primary" />}
                                        {slot.type === 'break' && <Coffee className="h-4 w-4 text-accent" />}
                                        {slot.type === 'other' && <Clock className="h-4 w-4 text-zinc-400" />}
                                        <span className={cn(
                                            "text-xs font-bold uppercase tracking-wider",
                                            slot.type === 'study' ? "text-primary" :
                                                slot.type === 'break' ? "text-accent" : "text-zinc-500"
                                        )}>
                                            {slot.type}
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-zinc-500">{slot.duration} mins</span>
                                </div>
                                <h4 className="text-base font-bold text-white mb-1">{slot.task}</h4>
                                {slot.subject && (
                                    <p className="text-sm text-zinc-400">{slot.subject}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    // Simple Grid Weekly View (Visual placeholder mostly in this iteration)
    const WeeklyView = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {scheduleData.map((day, idx) => (
                    <div key={idx} className="bg-[#111111] rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all cursor-pointer" onClick={() => setSelectedDateIndex(idx)}>
                        <h4 className="text-lg font-bold text-white mb-1">{day.day}</h4>
                        <p className="text-xs text-zinc-500 mb-4">{day.date}</p>

                        <div className="space-y-2">
                            {day.slots.slice(0, 4).map((slot, sIdx) => (
                                <div key={sIdx} className="flex gap-2 items-center">
                                    <div className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0",
                                        slot.type === 'study' ? "bg-primary" :
                                            slot.type === 'break' ? "bg-accent" : "bg-zinc-700"
                                    )}></div>
                                    <span className="text-xs text-zinc-400 truncate flex-1">{slot.task}</span>
                                </div>
                            ))}
                            {day.slots.length > 4 && (
                                <p className="text-[10px] text-zinc-600 pl-3.5 italic">+ {day.slots.length - 4} more activities</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="animate-in fade-in duration-500">
            {viewMode === 'daily' ? <DailyView /> : <WeeklyView />}
        </div>
    );
}
