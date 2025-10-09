
'use server';

import { aiStudyAssistant } from '@/ai/flows/ai-study-assistant';
import type { AiStudyAssistantInput, AiStudyAssistantOutput } from '@/lib/ai-types';

type AiState = {
  answer: string;
  question: string;
  error?: string;
};

export async function askAI(
  prevState: AiState,
  formData: FormData
): Promise<AiState> {
  const studentQuestion = formData.get('studentQuestion') as string;
  const courseMaterial = formData.get('courseMaterial') as string;

  if (!studentQuestion) {
    return {
      answer: 'Please enter a question.',
      question: '',
    };
  }
  
  if (!courseMaterial) {
    return {
        answer: 'Error: Course context is missing.',
        question: studentQuestion,
    }
  }

  try {
    const result = await aiStudyAssistant({
      courseMaterial,
      studentQuestion,
    });
    return {
      answer: result.answer,
      question: studentQuestion,
    };
  } catch (error: any) {
    console.error('AI assistant error:', error);
    return {
      answer: '',
      question: studentQuestion,
      error: error.message || 'Sorry, I encountered an error. Please try again.',
    };
  }
}
