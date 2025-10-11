
'use server';

import { askStudyAssistant } from '@/ai/flows/ai-study-assistant';
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
    const result = await askStudyAssistant({ studentQuestion, courseMaterial });
    return {
        answer: result.answer,
        question: studentQuestion,
    };
  } catch (e: any) {
    console.error("AI Error in askAI:", e);
    const errorMessage = e.message || "Sorry, I had trouble processing that request. Please try again.";
    return {
        answer: errorMessage, // Display error in chat
        question: studentQuestion,
        error: errorMessage,
    };
  }
}
