
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSession } from '@/lib/session';

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

export function useLiveQuiz() {
  const [quizState, setQuizState] = useState<QuizState>({
    isActive: false,
    question: null,
    timer: 0,
  });
  const [responses, setResponses] = useState<Responses>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Function for the teacher to launch a quiz
  const launchQuiz = useCallback((question: QuizQuestion, duration: number) => {
    const payload: QuizBroadcast = {
      action: 'start',
      question,
      duration,
    };
    localStorage.setItem(QUIZ_BROADCAST_KEY, JSON.stringify(payload));
    setQuizState({ isActive: true, question, timer: duration });
    setResponses({}); // Clear old responses
  }, []);

  // Function for the teacher to end a quiz
  const endQuiz = useCallback(() => {
    const payload: QuizBroadcast = { action: 'end' };
    localStorage.setItem(QUIZ_BROADCAST_KEY, JSON.stringify(payload));
    setQuizState({ isActive: false, question: null, timer: 0 });
    if (timerRef.current) {
        clearInterval(timerRef.current);
    }
  }, []);
  
  // Function for students to submit an answer
  const submitAnswer = useCallback(async (quizId: string, answer: string) => {
    const { user } = await getSession();
    if (!user) return;
    const payload: QuizResponse = {
      quizId,
      userId: user.id,
      userName: user.name,
      answer,
    };
    // Use a unique key for each submission to trigger storage event reliably
    localStorage.setItem(`${QUIZ_RESPONSE_KEY}-${user.id}`, JSON.stringify(payload));
  }, []);
  
  // Effect for handling storage events (for both teacher and student)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // --- For Students: Listen for quiz start/end ---
      if (event.key === QUIZ_BROADCAST_KEY && event.newValue) {
        try {
          const payload: QuizBroadcast = JSON.parse(event.newValue);
          if (payload.action === 'start' && payload.question && payload.duration) {
            setQuizState({ isActive: true, question: payload.question, timer: payload.duration });
          } else if (payload.action === 'end') {
            setQuizState({ isActive: false, question: null, timer: 0 });
          }
        } catch (e) { console.error(e); }
      }

      // --- For Teachers: Listen for student responses ---
      if (event.key?.startsWith(QUIZ_RESPONSE_KEY) && event.newValue) {
         try {
          const payload: QuizResponse = JSON.parse(event.newValue);
           if (quizState.isActive && payload.quizId === quizState.question?.id) {
               setResponses(prev => ({
                   ...prev,
                   [payload.userId]: payload,
               }));
           }
        } catch (e) { console.error(e); }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [quizState.isActive, quizState.question?.id]);


  // Effect for the countdown timer
  useEffect(() => {
    if (quizState.isActive && quizState.timer > 0) {
      timerRef.current = setInterval(() => {
        setQuizState(prev => {
          const newTime = prev.timer - 1;
          if (newTime <= 0) {
            endQuiz(); // End quiz automatically when timer reaches 0
            return { ...prev, isActive: false, timer: 0 };
          }
          return { ...prev, timer: newTime };
        });
      }, 1000);
    } else if (!quizState.isActive && timerRef.current) {
        clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizState.isActive, quizState.timer, endQuiz]);

  return { quizState, responses, launchQuiz, endQuiz, submitAnswer };
}
