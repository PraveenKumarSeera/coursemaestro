
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
      ...result,
      message: 'Successfully generated quiz and flashcards.',
    };
  } catch (error: any) {
    return {
      quiz: null,
      flashcards: null,
      message: `Failed to generate content: ${error.message || 'Please try again.'}`,
    };
  }
}
