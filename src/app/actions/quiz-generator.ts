
'use server';

import { generateQuizAndFlashcards } from "@/ai/flows/ai-quiz-generator";
import type { Quiz, Flashcard } from '@/lib/ai-types';

type FormState = {
  quiz: Quiz | null;
  flashcards: Flashcard[] | null;
  message: string;
};

export async function generateQuizAndFlashcardsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const courseMaterial = formData.get('courseMaterial') as string;

  if (!courseMaterial) {
      return {
          quiz: null,
          flashcards: null,
          message: 'Please provide course material text.',
      };
  }
  
  if (courseMaterial.length < 50) {
    return {
      quiz: null,
      flashcards: null,
      message: 'Please provide at least 50 characters of course material.',
    };
  }

  try {
    const result = await generateQuizAndFlashcards({ courseMaterial });
    return {
      quiz: result.quiz,
      flashcards: result.flashcards,
      message: 'Successfully generated quiz and flashcards.',
    };
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return {
      quiz: null,
      flashcards: null,
      message: error.message || 'Sorry, I encountered an error. Please try again.',
    };
  }
}
