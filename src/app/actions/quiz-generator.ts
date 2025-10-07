
'use server';

import { generateQuizAndFlashcards } from "@/ai/flows/ai-quiz-generator";
import { z } from 'zod';

const QuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  options: z.array(z.string()).describe('An array of possible answers.'),
  answer: z.string().describe('The correct answer from the options.'),
  type: z.literal('multiple-choice').describe('The type of the question.'),
});

const FlashcardSchema = z.object({
  term: z.string().describe('The term or concept for the flashcard.'),
  definition: z.string().describe('The definition or explanation of the term.'),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;


const QuizSchema = z.object({
  title: z.string().describe('A suitable title for the quiz based on the material.'),
  questions: z.array(QuestionSchema).describe('An array of quiz questions.'),
});
export type Quiz = z.infer<typeof QuizSchema>;

export const QuizGeneratorInputSchema = z.object({
    courseMaterial: z.string().min(50).describe('The course notes or material to generate a quiz from.'),
});

export const QuizGeneratorOutputSchema = z.object({
  quiz: QuizSchema,
  flashcards: z.array(FlashcardSchema).describe('An array of flashcards with key terms.'),
});


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
  } catch (error) {
    console.error('Quiz generation error:', error);
    return {
      quiz: null,
      flashcards: null,
      message: 'Sorry, I encountered an error. Please try again.',
    };
  }
}
