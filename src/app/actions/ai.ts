
'use server';

import { askStudyAssistant } from '@/ai/flows/ai-study-assistant';
import type { AiStudyAssistantOutput } from '@/lib/ai-types';

type AiState = {
  answer: AiStudyAssistantOutput | null;
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
      answer: null,
      question: '',
      error: 'Please enter a question.',
    };
  }
  
  if (!courseMaterial) {
    return {
        answer: null,
        question: studentQuestion,
        error: 'Error: Course context is missing.',
    }
  }

  try {
    const result = await askStudyAssistant({ courseMaterial, studentQuestion });
    return {
      answer: result,
      question: studentQuestion,
    };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      answer: null,
      question: studentQuestion,
      error: `Sorry, I encountered an error: ${errorMessage}`,
    };
  }
}
