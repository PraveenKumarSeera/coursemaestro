'use server';

import { generateQuizAndFlashcards } from "@/ai/flows/ai-quiz-generator";
import type { Quiz as AIEQuiz, Flashcard as AIFlashcard } from "@/ai/flows/ai-quiz-generator";

export type Quiz = AIEQuiz;
export type Flashcard = AIFlashcard;

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
  const file = formData.get('file') as File | null;

  let fileDataUri: string | undefined;

  if (file && file.size > 0) {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    fileDataUri = `data:${file.type};base64,${base64}`;
  }

  if (!courseMaterial && !fileDataUri) {
      return {
          quiz: null,
          flashcards: null,
          message: 'Please provide course material text or upload a file.',
      };
  }
  
  if (courseMaterial && courseMaterial.length < 50 && !fileDataUri) {
    return {
      quiz: null,
      flashcards: null,
      message: 'Please provide at least 50 characters of course material or upload a file.',
    };
  }

  try {
    const result = await generateQuizAndFlashcards({ 
        courseMaterial: courseMaterial || '', // Send empty string if not provided
        fileDataUri 
    });
    return {
      quiz: result.quiz,
      flashcards: result.flashcards,
      message: 'Successfully generated quiz and flashcards.',
    };
  } catch (error) {
    console.error('Quiz generation error:', error);
    return {
      quiz: null,
      flashcards: null,
      message: 'Sorry, I encountered an error. Please try again.',
    };
  }
}
