
'use server';

import { askStudyAssistant } from '@/ai/flows/ai-study-assistant';

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
      answer: '',
      question: '',
      error: 'Please enter a question.',
    };
  }
  
  if (!courseMaterial) {
    return {
        answer: '',
        question: studentQuestion,
        error: 'Error: Course context is missing.',
    }
  }

  try {
    const result = await askStudyAssistant({ courseMaterial, studentQuestion });
    return {
      answer: result.answer,
      question: studentQuestion,
    };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      answer: '',
      question: studentQuestion,
      error: `Sorry, I encountered an error: ${errorMessage}`,
    };
  }
}
