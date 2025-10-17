
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
  timestamp: number;
};

type QuizState = {
  isActive: boolean;
  question: QuizQuestion | null;
  timer: number;
};

type Responses = {
  [userId: string]: QuizResponse;
};

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

    // Sound effect for student when quiz starts
    const playQuizSound = useCallback(() => {
        getSession().then(({ user }) => {
            if (user?.role !== 'student') return;
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
        });
    }, []);

    const handleStartQuiz = useCallback((question: QuizQuestion, duration: number) => {
        setResponses({});
        setQuizState({ isActive: true, question, timer: duration });
        playQuizSound();
    }, [playQuizSound]);

    const handleEndQuiz = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setQuizState({ isActive: false, question: null, timer: 0 });
    }, []);

    const launchQuiz = useCallback((question: QuizQuestion, duration: number) => {
        const timestamp = Date.now();
        lastEventTimestamp.current = timestamp; 
        const payload: QuizBroadcast = { action: 'start', question, duration, timestamp };
        localStorage.setItem(QUIZ_BROADCAST_KEY, JSON.stringify(payload));
        // Manually trigger for the current (teacher's) tab
        handleStartQuiz(question, duration);
    }, [handleStartQuiz]);

    const endQuiz = useCallback(() => {
        const timestamp = Date.now();
        lastEventTimestamp.current = timestamp;
        const payload: QuizBroadcast = { action: 'end', timestamp };
        localStorage.setItem(QUIZ_BROADCAST_KEY, JSON.stringify(payload));
        // Manually trigger for the current (teacher's) tab
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
        // Use a unique key for each submission to ensure the storage event fires
        localStorage.setItem(`${QUIZ_RESPONSE_KEY}-${user.id}-${Date.now()}`, JSON.stringify(payload));
    }, []);

    // Effect for handling storage events from other tabs
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === QUIZ_BROADCAST_KEY && event.newValue) {
                try {
                    const payload: QuizBroadcast = JSON.parse(event.newValue);
                    if (payload.timestamp <= lastEventTimestamp.current) return;
                    lastEventTimestamp.current = payload.timestamp;

                    if (payload.action === 'start' && payload.question && payload.duration) {
                        handleStartQuiz(payload.question, payload.duration);
                    } else if (payload.action === 'end') {
                        handleEndQuiz();
                    }
                } catch (e) { console.error("Error parsing quiz broadcast:", e); }
            }

            if (event.key?.startsWith(QUIZ_RESPONSE_KEY) && event.newValue) {
                 try {
                    const payload: QuizResponse = JSON.parse(event.newValue);
                    if (quizState.isActive && payload.quizId === quizState.question?.id) {
                       setResponses(prev => ({ ...prev, [payload.userId]: payload }));
                    }
                } catch (e) { console.error("Error parsing quiz response:", e); }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [handleStartQuiz, handleEndQuiz, quizState.isActive, quizState.question?.id]);

    // Effect for managing the countdown timer
    useEffect(() => {
        if (quizState.isActive && quizState.timer > 0) {
            timerRef.current = setInterval(() => {
                setQuizState(prev => {
                    const newTime = prev.timer - 1;
                    if (newTime <= 0) {
                        if(timerRef.current) clearInterval(timerRef.current);
                        // Only the teacher's tab should broadcast the end event
                        getSession().then(({ user }) => {
                            if (user?.role === 'teacher') {
                                endQuiz();
                            }
                        });
                        return { ...prev, isActive: false, timer: 0 };
                    }
                    return { ...prev, timer: newTime };
                });
            }, 1000);
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
