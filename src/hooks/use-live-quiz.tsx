
'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';
import { getSession } from '@/lib/session';
import { useToast } from './use-toast';

const QUIZ_BROADCAST_KEY = 'coursepilot-live-quiz';
const QUIZ_RESPONSE_KEY = 'coursepilot-quiz-response';

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
  timestamp: number; // Added timestamp to prevent processing old events
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
    const lastEventTimestamp = useRef<number>(0);
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
    
    const handleStartQuiz = useCallback((question: QuizQuestion, duration: number) => {
        setResponses({});
        setQuizState({ isActive: true, question, timer: duration });
    }, []);

    const handleEndQuiz = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setQuizState({ isActive: false, question: null, timer: 0 });
    }, []);

    const launchQuiz = useCallback((question: QuizQuestion, duration: number) => {
        const timestamp = Date.now();
        const payload: QuizBroadcast = { action: 'start', question, duration, timestamp };
        localStorage.setItem(QUIZ_BROADCAST_KEY, JSON.stringify(payload));
        // Manually trigger for the current tab
        handleStartQuiz(question, duration);
    }, [handleStartQuiz]);

    const endQuiz = useCallback(() => {
        const timestamp = Date.now();
        const payload: QuizBroadcast = { action: 'end', timestamp };
        localStorage.setItem(QUIZ_BROADCAST_KEY, JSON.stringify(payload));
        // Manually trigger for the current tab
        handleEndQuiz();
    }, [handleEndQuiz]);

    const submitAnswer = useCallback(async (quizId: string, answer: string) => {
        const { user } = await getSession();
        if (!user) return;
        const payload: QuizResponse = {
            quizId,
            userId: user.id,
            userName: user.name,
            answer,
        };
        localStorage.setItem(`${QUIZ_RESPONSE_KEY}-${user.id}-${Date.now()}`, JSON.stringify(payload));
    }, []);
    
    useEffect(() => {
        const handleStorageChange = async (event: StorageEvent) => {
            if (event.key === QUIZ_BROADCAST_KEY && event.newValue) {
                try {
                    const payload: QuizBroadcast = JSON.parse(event.newValue);
                    if (payload.timestamp <= lastEventTimestamp.current) return;
                    lastEventTimestamp.current = payload.timestamp;

                    if (payload.action === 'start' && payload.question && payload.duration) {
                        handleStartQuiz(payload.question, payload.duration);
                        const { user } = await getSession();
                        if(user && user.role === 'student'){
                            playQuizSound();
                            toast({ title: "Live Quiz Started!", description: "Your teacher has launched a live quiz." });
                        }
                    } else if (payload.action === 'end') {
                        handleEndQuiz();
                    }
                } catch (e) { console.error(e); }
            }

            if (event.key?.startsWith(QUIZ_RESPONSE_KEY) && event.newValue) {
                try {
                    const payload: QuizResponse = JSON.parse(event.newValue);
                    setResponses(prev => {
                        if (quizState.isActive && payload.quizId === quizState.question?.id) {
                            return { ...prev, [payload.userId]: payload };
                        }
                        return prev;
                    });
                } catch (e) { console.error(e); }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [toast, quizState.isActive, quizState.question?.id, handleStartQuiz, handleEndQuiz]);

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

export function useLiveQuiz() {
    const context = useContext(LiveQuizContext);
    if (!context) {
        throw new Error('useLiveQuiz must be used within a LiveQuizProvider');
    }
    return context;
}
