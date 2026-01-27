"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Brain,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useMode } from "@/contexts/ModeContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer?: number; // Hidden from user until result? Actually backend sends it but we shouldn't peek.
  // Wait, backend sent it for grading? No, backend sends it to client for simple state, or we should hide it.
  // For security, usually hidden, but for hackathon client-side is fine or we trust the client to send it back.
  // My backend 'submit' takes 'questions' list BACK to verify.
  topic_tag: string;
}

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: any;
  onUpdate: () => void;
}

export function AssessmentModal({
  isOpen,
  onClose,
  exam,
  onUpdate,
}: AssessmentModalProps) {
  const { user } = useMode();
  const [step, setStep] = useState<"intro" | "quiz" | "result">("intro");
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({}); // question_id -> selected_index
  const [result, setResult] = useState<any>(null);
  const [setNumber, setSetNumber] = useState(1); // 1, 2, 3
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("intro");
      setAnswers({});
      setResult(null);
      setTimeLeft(180);
      // Determine set number based on exam data if we had it, for now starts at 1
      // In a real app we'd fetch "current_set" from exam details.
    }
  }, [isOpen]);

  // Timer Logic
  useEffect(() => {
    if (step === "quiz" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && step === "quiz") {
      handleSubmit();
      toast.info("Time's up! Submitting answers...");
    }
  }, [timeLeft, step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    setIsGenerating(true);
    try {
      const syllabusNames = exam.syllabus
        ? exam.syllabus.map((s: any) => s.name)
        : [];

      const res = await fetch("http://localhost:8000/assessment/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: exam.subject,
          topics: syllabusNames,
          set_number: 1, // Standardize to 1
        }),
      });

      if (!res.ok) throw new Error("Failed to generate questions");

      const data = await res.json();
      setQuestions(data);
      setStep("quiz");
      setCurrentQIdx(0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to start assessment");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (optionIdx: number) => {
    const currentQ = questions[currentQIdx];
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionIdx }));
  };

  const handleNext = () => {
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const formattedAnswers = Object.entries(answers).map(
        ([qid, selected]) => ({
          question_id: qid,
          selected: selected,
        }),
      );

      const res = await fetch("http://localhost:8000/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid,
          exam_id: exam.id,
          set_number: 1, // Standardize
          answers: formattedAnswers,
          questions: questions,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      const data = await res.json();
      setResult(data);
      setStep("result");
      onUpdate(); // Refresh parent stats
    } catch (error) {
      toast.error("Failed to submit results");
    }
  };

  const handleFinish = () => {
    setStep("intro");
    onClose();
  };

  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            <h2 className="font-bold text-zinc-900">Assessment</h2>
          </div>

          {step === "quiz" && (
            <div
              className={cn(
                "px-3 py-1 rounded-full font-mono text-sm font-bold border",
                timeLeft < 30
                  ? "bg-red-500/10 text-red-600 border-red-200 animate-pulse"
                  : "bg-zinc-100 text-zinc-600 border-zinc-200",
              )}
            >
              {formatTime(timeLeft)}
            </div>
          )}

          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            {/* INTRO STEP */}
            {step === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center space-y-6"
              >
                <div className="h-24 w-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-12 w-12 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">
                    Ready to test your knowledge?
                  </h3>
                  <p className="text-zinc-500 max-w-md mx-auto">
                    This set contains 10 questions based on your syllabus:{" "}
                    <br />
                    <span className="text-zinc-800 italic font-medium">
                      {exam.subject}
                    </span>
                  </p>
                </div>
                <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-lg max-w-md mx-auto text-sm text-zinc-500">
                  <p>• 10 Multiple Choice Questions</p>
                  <p>• Adapts to difficulty levels</p>
                  <p>• Updates your Exam Readiness Score</p>
                </div>
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="w-full max-w-xs font-bold text-base"
                  disabled={isGenerating}
                >
                  {isGenerating
                    ? "Generating Questions..."
                    : "Start Assessment"}
                </Button>
              </motion.div>
            )}

            {/* QUIZ STEP */}
            {step === "quiz" && questions.length > 0 && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Progress Bar */}
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{
                      width: `${((currentQIdx + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Question {currentQIdx + 1} of {questions.length}
                    </span>
                    <span className="text-xs px-2 py-1 bg-zinc-100 rounded text-zinc-500 border border-zinc-200">
                      {questions[currentQIdx].topic_tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-medium text-zinc-900 leading-relaxed">
                    {questions[currentQIdx].question}
                  </h3>
                </div>

                <div className="space-y-3">
                  {questions[currentQIdx].options.map((option, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer transition-all hover:bg-zinc-50 flex items-center gap-3",
                        answers[questions[currentQIdx].id] === idx
                          ? "bg-accent/10 border-accent/50 ring-1 ring-accent/50"
                          : "bg-white border-zinc-200 text-zinc-500",
                      )}
                    >
                      <div
                        className={cn(
                          "h-6 w-6 rounded-full border flex items-center justify-center text-xs font-bold transition-colors",
                          answers[questions[currentQIdx].id] === idx
                            ? "border-accent text-accent"
                            : "border-zinc-300 text-zinc-400",
                        )}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span
                        className={
                          answers[questions[currentQIdx].id] === idx
                            ? "text-zinc-900 font-medium"
                            : "text-zinc-600"
                        }
                      >
                        {option}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleNext}
                    disabled={answers[questions[currentQIdx].id] === undefined}
                    className="gap-2"
                  >
                    {currentQIdx === questions.length - 1
                      ? "Finish & Submit"
                      : "Next Question"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* RESULT STEP */}
            {step === "result" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="relative inline-block">
                  <svg className="h-32 w-32 rotate-[-90deg]">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-zinc-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className={
                        result.accuracy >= 70
                          ? "text-green-500"
                          : result.accuracy >= 40
                            ? "text-yellow-500"
                            : "text-red-500"
                      }
                      strokeDasharray={351}
                      strokeDashoffset={351 - (351 * result.accuracy) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-zinc-900">
                      {Math.round(result.accuracy)}%
                    </span>
                    <span className="text-xs text-zinc-500 uppercase">
                      Accuracy
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    <p className="text-2xl font-bold text-zinc-900">
                      {result.score}/{result.total}
                    </p>
                    <p className="text-xs text-zinc-500">Correct Answers</p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    <p className="text-2xl font-bold text-zinc-900">
                      {Math.round(result.readiness)}%
                    </p>
                    <p className="text-xs text-zinc-500">Exam Readiness</p>
                  </div>
                </div>

                {result.weak_areas && result.weak_areas.length > 0 && (
                  <div className="text-left bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Identified Weak Areas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.weak_areas.map((topic: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-zinc-200 hover:bg-zinc-100 text-zinc-600"
                  >
                    Take a Break
                  </Button>
                  <Button
                    onClick={handleFinish}
                    className="bg-zinc-900 text-white hover:bg-zinc-800"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
