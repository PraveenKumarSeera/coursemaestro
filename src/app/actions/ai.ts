
'use server';

import { aiStudyAssistant } from '@/ai/flows/ai-study-assistant';

type AiState = {
  answer: string;
  question: string;
};

export async function askAI(
  { courseMaterial }: { courseMaterial: string },
  prevState: AiState,
  formData: FormData
): Promise<AiState> {
  const studentQuestion = formData.get('studentQuestion') as string;

  if (!studentQuestion) {
    return {
      answer: 'Please enter a question.',
      question: '',
    };
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
  } catch (error) {
    console.error('AI assistant error:', error);
    return {
      answer: 'Sorry, I encountered an error. Please try again.',
      question: studentQuestion,
    };
  }
}
