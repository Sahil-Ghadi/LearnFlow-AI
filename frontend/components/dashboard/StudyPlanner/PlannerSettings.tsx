'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PlannerSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (settings: PlannerSettingsData) => void;
    isLoading: boolean;
}

export interface PlannerSettingsData {
    available_hours: number;
    start_time: string;
    end_time: string;
    constraints: string;
    view_mode: 'daily' | 'weekly';
}

export function PlannerSettings({ isOpen, onClose, onGenerate, isLoading }: PlannerSettingsProps) {
    const [data, setData] = useState<PlannerSettingsData>({
        available_hours: 4,
        start_time: '09:00',
        end_time: '21:00',
        constraints: '',
        view_mode: 'daily',
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl"
            >
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <Settings className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Planner Configuration</h2>
                            <p className="text-xs text-zinc-400">Customize your study schedule generation</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/5 text-zinc-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Study Hours Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Label className="text-sm font-medium text-zinc-300">Daily Study Goal</Label>
                            <span className="text-sm font-bold text-primary">{data.available_hours} hours</span>
                        </div>
                        <Slider
                            defaultValue={[data.available_hours]}
                            max={12}
                            min={1}
                            step={0.5}
                            onValueChange={(val) => setData({ ...data, available_hours: val[0] })}
                            className="py-2"
                        />
                        <p className="text-[11px] text-zinc-500">Recommended based on your 6 subjects: 4-5 hours</p>
                    </div>

                    {/* Time Window */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Start Time</Label>
                            <Input
                                type="time"
                                value={data.start_time}
                                onChange={(e) => setData({ ...data, start_time: e.target.value })}
                                className="bg-white/5 border-white/10 text-white focus:border-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">End Time</Label>
                            <Input
                                type="time"
                                value={data.end_time}
                                onChange={(e) => setData({ ...data, end_time: e.target.value })}
                                className="bg-white/5 border-white/10 text-white focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* View Mode */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Schedule Type</Label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl">
                            <button
                                onClick={() => setData({ ...data, view_mode: 'daily' })}
                                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${data.view_mode === 'daily' ? 'bg-primary text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
                            >
                                <Clock className="h-3.5 w-3.5" />
                                Daily Plan
                            </button>
                            <button
                                onClick={() => setData({ ...data, view_mode: 'weekly' })}
                                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${data.view_mode === 'weekly' ? 'bg-primary text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                Weekly Plan
                            </button>
                        </div>
                    </div>


                    {/* Natural Language Constraints */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Constraints & Preferences</Label>
                            <MessageSquare className="h-3 w-3 text-zinc-500" />
                        </div>
                        <Textarea
                            placeholder="e.g. 'I have gym from 5-7pm', 'No math on Tuesdays', '15 min breaks'"
                            value={data.constraints}
                            onChange={(e) => setData({ ...data, constraints: e.target.value })}
                            className="resize-none bg-white/5 border-white/10 text-white focus:border-primary h-24"
                        />
                        <p className="text-[11px] text-zinc-500">Our AI planner naturally understands your schedule requests.</p>
                    </div>
                </div>

                <div className="mt-8">
                    <Button
                        onClick={() => onGenerate(data)}
                        disabled={isLoading}
                        className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all active:scale-[0.98]"
                    >
                        {isLoading ? 'Generating Optimized Plan...' : 'Generate AI Schedule'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
