'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Map,
    CheckCircle,
    Clock,
    BookOpen,
    Loader2,
    ChevronRight,
    ChevronDown,
    ArrowLeft,
    Trophy,
    Sparkles,
    Play
} from 'lucide-react';
import { useMode } from '@/contexts/ModeContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/DashboardLayout';
import { YouTubeModal } from '@/components/dashboard/SideHustle/YouTubeModal';

interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    estimated_time: string;
    resources: string[];
    completed: boolean;
}

interface RoadmapPhase {
    id: string;
    title: string;
    items: RoadmapItem[];
}

interface RoadmapResponse {
    skill: string;
    phases: RoadmapPhase[];
}

export default function SkillRoadmapPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useMode();
    const skillName = decodeURIComponent(params.skill as string);

    const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [showVideoModal, setShowVideoModal] = useState(false);

    useEffect(() => {
        if (user && skillName) {
            fetchRoadmap();
        }
    }, [user, skillName]);

    const fetchRoadmap = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/roadmap/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user?.uid,
                    skill: skillName,
                    current_level: "Beginner"
                })
            });

            if (!res.ok) throw new Error("Failed to load roadmap");

            const data = await res.json();
            setRoadmap(data);
            if (data.phases && data.phases.length > 0) {
                setExpandedPhase(data.phases[0].id);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate roadmap");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (phaseId: string, itemId: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!roadmap || !user) return;

        // Optimistic update
        const newPhases = roadmap.phases.map(p => {
            if (p.id === phaseId) {
                return {
                    ...p,
                    items: p.items.map(i => i.id === itemId ? { ...i, completed: !currentStatus } : i)
                };
            }
            return p;
        });
        setRoadmap({ ...roadmap, phases: newPhases });

        try {
            const res = await fetch('http://localhost:8000/roadmap/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    skill: skillName,
                    phase_id: phaseId,
                    item_id: itemId,
                    completed: !currentStatus
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.project_unlocked && data.new_project) {
                    toast.success("New Project Unlocked! Check your Dashboard.");
                }
            }
        } catch (error) {
            toast.error("Failed to save progress");
        }
    };

    // Calculate progress
    const totalItems = roadmap?.phases.reduce((acc, p) => acc + p.items.length, 0) || 0;
    const completedItems = roadmap?.phases.reduce((acc, p) => acc + p.items.filter(i => i.completed).length, 0) || 0;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return (
        <DashboardLayout
            title={`${skillName} Roadmap`}
            subtitle="AI-Curated Learning Path • Beginner to Pro"
        >
            <div className="bg-[#050505] text-zinc-100 rounded-3xl overflow-hidden min-h-[calc(100vh-10rem)] border border-zinc-800 p-8 shadow-2xl relative">
                {/* Ambient Background */}
                <div className="absolute top-0 right-0 p-20 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-20 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

                <div className="max-w-5xl mx-auto space-y-8 relative z-10">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.back()}
                                className="pl-0 text-zinc-500 hover:text-zinc-300 hover:bg-transparent -ml-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Map className="h-6 w-6 text-primary" />
                                    </div>
                                    <span className="text-sm font-bold tracking-wider text-primary uppercase">Skill Roadmap</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{skillName}</h1>
                                <p className="text-zinc-400 mt-2 text-lg max-w-2xl">
                                    A curated, AI-powered learning path designed to take you from basics to mastery. Follow the phases to build expertise.
                                </p>
                            </div>
                        </div>

                        {/* Progress Card */}
                        {roadmap && (
                            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl min-w-[240px] backdrop-blur-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wide">Total Progress</p>
                                        <p className="text-3xl font-bold text-white mt-1">{progress}%</p>
                                    </div>
                                    <Trophy className={cn("h-8 w-8", progress === 100 ? "text-yellow-500" : "text-zinc-700")} />
                                </div>
                                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-full h-px bg-zinc-900" />

                    {/* Main Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-medium text-white">Generating Roadmap</h3>
                                <p className="text-zinc-500">Our AI agent is crafting your personalized learning path...</p>
                            </div>
                        </div>
                    ) : roadmap ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                            {/* Sidebar / Phase Navigation (Desktop) */}
                            <div className="hidden lg:block space-y-4 sticky top-8">
                                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider px-2">Phases</h3>
                                <div className="space-y-1">
                                    {roadmap.phases.map((phase, index) => {
                                        const isActive = expandedPhase === phase.id;
                                        const isCompleted = phase.items.every(i => i.completed);

                                        return (
                                            <button
                                                key={phase.id}
                                                onClick={() => setExpandedPhase(phase.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border",
                                                    isActive
                                                        ? "bg-primary/10 border-primary/20 text-white shadow-sm"
                                                        : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors",
                                                    isActive
                                                        ? "border-primary bg-primary text-white"
                                                        : isCompleted
                                                            ? "border-zinc-700 bg-zinc-800 text-zinc-400"
                                                            : "border-zinc-700 bg-transparent text-zinc-600"
                                                )}>
                                                    {isCompleted ? <CheckCircle className="h-3 w-3" /> : index + 1}
                                                </div>
                                                <span className="font-medium truncate">{phase.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Main Roadmap Area */}
                            <div className="lg:col-span-2 space-y-6">
                                {roadmap.phases.map((phase, index) => (
                                    <div
                                        key={phase.id}
                                        className={cn(
                                            "bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden transition-all duration-500",
                                            expandedPhase === phase.id ? "opacity-100 ring-1 ring-zinc-700/50" : "opacity-60 lg:opacity-100"
                                        )}
                                    >
                                        {/* Mobile/Tablet Phase Header */}
                                        <button
                                            onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                                            className="w-full flex items-center justify-between p-6 bg-zinc-900/60 hover:bg-zinc-900 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-zinc-800 text-zinc-100 font-bold font-mono text-lg border border-zinc-700">
                                                    0{index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-xl text-zinc-100">{phase.title}</h3>
                                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">{phase.items.length} Topics</p>
                                                </div>
                                            </div>
                                            {expandedPhase === phase.id ? <ChevronDown className="h-5 w-5 text-zinc-500" /> : <ChevronRight className="h-5 w-5 text-zinc-500" />}
                                        </button>

                                        <AnimatePresence>
                                            {expandedPhase === phase.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-6 pt-0 space-y-4 border-t border-zinc-800/50 bg-black/20">
                                                        <div className="h-4" /> {/* Spacer */}
                                                        {phase.items.map(item => (
                                                            <motion.div
                                                                key={item.id}
                                                                initial={{ x: -10, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                className={cn(
                                                                    "group p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                                                                    item.completed
                                                                        ? "bg-primary/5 border-primary/20"
                                                                        : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/40"
                                                                )}
                                                                onClick={(e) => handleToggle(phase.id, item.id, item.completed, e)}
                                                            >
                                                                <div className="flex items-start gap-5 relative z-10">
                                                                    <div className={cn(
                                                                        "mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0",
                                                                        item.completed
                                                                            ? "bg-primary border-primary text-black scale-110"
                                                                            : "border-zinc-600 text-transparent group-hover:border-primary group-hover:scale-110"
                                                                    )}>
                                                                        <CheckCircle className="h-3.5 w-3.5" strokeWidth={3} />
                                                                    </div>

                                                                    <div className="flex-1 space-y-3">
                                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                                            <h4 className={cn(
                                                                                "font-bold text-lg transition-colors",
                                                                                item.completed ? "text-primary line-through opacity-70" : "text-zinc-100"
                                                                            )}>{item.title}</h4>

                                                                            <span className="self-start md:self-auto text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
                                                                                <Clock className="h-3 w-3" />
                                                                                {item.estimated_time}
                                                                            </span>
                                                                        </div>

                                                                        <p className="text-zinc-400 leading-relaxed text-sm max-w-2xl">{item.description}</p>

                                                                        <div className="flex flex-wrap gap-2 pt-3 items-center">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedTopic(item.title);
                                                                                    setShowVideoModal(true);
                                                                                }}
                                                                                className="text-[11px] uppercase font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow-red-500/20"
                                                                            >
                                                                                <Play className="h-3 w-3 fill-current" />
                                                                                Watch Video
                                                                            </button>

                                                                            {item.resources.map((res, i) => (
                                                                                <a
                                                                                    key={i}
                                                                                    href={`https://www.google.com/search?q=${encodeURIComponent(res)}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    className="text-[11px] font-medium text-zinc-400 bg-zinc-900/80 hover:bg-zinc-800 hover:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors flex items-center gap-2 group/link"
                                                                                >
                                                                                    <BookOpen className="h-3 w-3 text-zinc-500 group-hover/link:text-primary transition-colors" />
                                                                                    {res}
                                                                                </a>
                                                                            ))}
                                                                        </div>    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <YouTubeModal
                        isOpen={showVideoModal}
                        onClose={() => setShowVideoModal(false)}
                        topic={selectedTopic || ""}
                        subject={skillName}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
