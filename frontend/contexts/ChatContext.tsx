'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface StudyReminder {
    id: string;
    subject: string;
    topic: string;
    dueTime: Date;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
}

interface Deadline {
    id: string;
    title: string;
    dueDate: Date;
    category: 'exam' | 'assignment' | 'project';
    subject?: string;
}

interface ChatContextType {
    reminders: StudyReminder[];
    addReminder: (reminder: Omit<StudyReminder, 'id' | 'completed'>) => void;
    completeReminder: (id: string) => void;
    deleteReminder: (id: string) => void;
    deadlines: Deadline[];
    addDeadline: (deadline: Omit<Deadline, 'id'>) => void;
    deleteDeadline: (id: string) => void;
    chatHistory: { role: 'user' | 'assistant'; content: string }[];
    addToChatHistory: (message: { role: 'user' | 'assistant'; content: string }) => void;
    clearChatHistory: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Sample initial data
const sampleReminders: StudyReminder[] = [
    {
        id: '1',
        subject: 'Physics',
        topic: 'Electromagnetic Induction',
        dueTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        priority: 'high',
        completed: false,
    },
    {
        id: '2',
        subject: 'Mathematics',
        topic: 'Integration Practice',
        dueTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
        priority: 'medium',
        completed: false,
    },
];

const sampleDeadlines: Deadline[] = [
    {
        id: '1',
        title: 'Physics Assignment',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        category: 'assignment',
        subject: 'Physics',
    },
    {
        id: '2',
        title: 'Mid-term Exams',
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days
        category: 'exam',
    },
    {
        id: '3',
        title: 'Chemistry Lab Report',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        category: 'assignment',
        subject: 'Chemistry',
    },
];

export function ChatProvider({ children }: { children: ReactNode }) {
    const [reminders, setReminders] = useState<StudyReminder[]>(sampleReminders);
    const [deadlines, setDeadlines] = useState<Deadline[]>(sampleDeadlines);
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

    const addReminder = (reminder: Omit<StudyReminder, 'id' | 'completed'>) => {
        const newReminder: StudyReminder = {
            ...reminder,
            id: Date.now().toString(),
            completed: false,
        };
        setReminders(prev => [...prev, newReminder]);
    };

    const completeReminder = (id: string) => {
        setReminders(prev =>
            prev.map(r => (r.id === id ? { ...r, completed: true } : r))
        );
    };

    const deleteReminder = (id: string) => {
        setReminders(prev => prev.filter(r => r.id !== id));
    };

    const addDeadline = (deadline: Omit<Deadline, 'id'>) => {
        const newDeadline: Deadline = {
            ...deadline,
            id: Date.now().toString(),
        };
        setDeadlines(prev => [...prev, newDeadline]);
    };

    const deleteDeadline = (id: string) => {
        setDeadlines(prev => prev.filter(d => d.id !== id));
    };

    const addToChatHistory = (message: { role: 'user' | 'assistant'; content: string }) => {
        setChatHistory(prev => [...prev, message]);
    };

    const clearChatHistory = () => {
        setChatHistory([]);
    };

    return (
        <ChatContext.Provider
            value={{
                reminders,
                addReminder,
                completeReminder,
                deleteReminder,
                deadlines,
                addDeadline,
                deleteDeadline,
                chatHistory,
                addToChatHistory,
                clearChatHistory,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
}
