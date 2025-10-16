
'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';
import { getSession } from '@/lib/session';
import { useToast } from './use-toast';

const QUIZ_BROADCAST_KEY = 'coursemestro-live-quiz';
const QUIZ_RESPONSE_KEY = 'coursemestro-quiz-response';

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
};

export type QuizResponse = {
  quizId: string;
  userId: string;
  userName: string;
  answer: string;
};

type QuizBroadcast = {
  action: 'start' | 'end';
  question?: QuizQuestion;
  duration?: number;
};

type QuizState = {
  isActive: boolean;
  question: QuizQuestion | null;
  timer: number;
};

type Responses = {
  [userId: string]: QuizResponse;
};

// --- Context for Shared State ---
interface LiveQuizContextType {
    quizState: QuizState;
    responses: Responses;
    launchQuiz: (question: QuizQuestion, duration: number) => void;
    endQuiz: () => void;
    submitAnswer: (quizId: string, answer: string) => void;
}

const LiveQuizContext = createContext<LiveQuizContextType | null>(null);

export function LiveQuizProvider({ children }: { children: ReactNode }) {
    const [quizState, setQuizState] = useState<QuizState>({
        isActive: false,
        question: null,
        timer: 0,
    });
    const [responses, setResponses] = useState<Responses>({});
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    const playQuizSound = () => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (!context) return;
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(440, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.1, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.3);
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.3);
        } catch (e) {
            console.error("Failed to play sound", e);
        }
    };

    const endQuiz = useCallback(() => {
        const payload: QuizBroadcast = { action: 'end' };
        localStorage.setItem(QUIZ_BROADCAST_KEY, JSON.stringify(payload));
        setQuizState({ isActive: false, question: null, timer: 0 });
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    }, []);
    
    const launchQuiz = useCallback((question: QuizQuestion, duration: number) => {
        const payload: QuizBroadcast = { action: 'start', question, duration };
        localStorage.setItem(QUIZ_BROADCAST_KEY, JSON.stringify(payload));
        setQuizState({ isActive: true, question, timer: duration });
        setResponses({});
    }, []);

    const submitAnswer = useCallback(async (quizId: string, answer: string) => {
        const { user } = await getSession();
        if (!user) return;
        const payload: QuizResponse = {
            quizId,
            userId: user.id,
            userName: user.name,
            answer,
        };
        localStorage.setItem(`${QUIZ_RESPONSE_KEY}-${user.id}`, JSON.stringify(payload));
    }, []);

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === QUIZ_BROADCAST_KEY && event.newValue) {
                try {
                    const payload: QuizBroadcast = JSON.parse(event.newValue);
                    if (payload.action === 'start' && payload.question && payload.duration) {
                        setQuizState({ isActive: true, question: payload.question, timer: payload.duration });
                        playQuizSound();
                        toast({ title: "Live Quiz Started!", description: "Your teacher has launched a live quiz." });
                    } else if (payload.action === 'end') {
                        setQuizState({ isActive: false, question: null, timer: 0 });
                    }
                } catch (e) { console.error(e); }
            }

            if (event.key?.startsWith(QUIZ_RESPONSE_KEY) && event.newValue) {
                try {
                    const payload: QuizResponse = JSON.parse(event.newValue);
                    if (quizState.isActive && payload.quizId === quizState.question?.id) {
                        setResponses(prev => ({ ...prev, [payload.userId]: payload }));
                    }
                } catch (e) { console.error(e); }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [quizState.isActive, quizState.question?.id, toast]);

    useEffect(() => {
        if (quizState.isActive && quizState.timer > 0) {
            timerRef.current = setInterval(() => {
                setQuizState(prev => {
                    const newTime = prev.timer - 1;
                    if (newTime <= 0) {
                        endQuiz();
                        return { ...prev, isActive: false, timer: 0 };
                    }
                    return { ...prev, timer: newTime };
                });
            }, 1000);
        } else if (!quizState.isActive && timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [quizState.isActive, quizState.timer, endQuiz]);

    return (
        <LiveQuizContext.Provider value={{ quizState, responses, launchQuiz, endQuiz, submitAnswer }}>
            {children}
        </LiveQuizContext.Provider>
    );
}

// Custom hook to use the context
export function useLiveQuiz() {
    const context = useContext(LiveQuizContext);
    if (!context) {
        throw new Error('useLiveQuiz must be used within a LiveQuizProvider');
    }
    return context;
}
