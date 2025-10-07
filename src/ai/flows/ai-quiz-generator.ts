'use server';
/**
 * @fileOverview This file defines the AI Quiz Generator flow.
 * It takes course material as input and generates a quiz and a set of flashcards.
 *
 * @exports generateQuizAndFlashcards - The main function to call the flow.
 * @exports Quiz - The type definition for the generated quiz.
 * @exports Flashcard - The type definition for a single flashcard.
 */

import { ai } from '@/ai/genkit';
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

const QuizGeneratorInputSchema = z.object({
    courseMaterial: z.string().min(50).describe('The course notes or material to generate a quiz from.'),
});

const QuizGeneratorOutputSchema = z.object({
  quiz: QuizSchema,
  flashcards: z.array(FlashcardSchema).describe('An array of flashcards with key terms.'),
});

export async function generateQuizAndFlashcards(
  input: z.infer<typeof QuizGeneratorInputSchema>
): Promise<z.infer<typeof QuizGeneratorOutputSchema>> {
  return quizGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quizGeneratorPrompt',
  input: { schema: QuizGeneratorInputSchema },
  output: { schema: QuizGeneratorOutputSchema },
  prompt: `You are an AI assistant that creates educational materials for teachers.
  Based on the provided course material, generate a quiz and a set of flashcards.

  The quiz should contain 5-7 multiple-choice questions that test the key concepts from the material.
  For each question, provide 4 options and clearly indicate the correct answer.

  The flashcards should identify and define 6-8 important keywords or concepts from the material.

  Course Material:
  '''
  {{courseMaterial}}
  '''

  Generate the quiz and flashcards in the specified JSON format.
  `,
});

export const quizGeneratorFlow = ai.defineFlow(
  {
    name: 'quizGeneratorFlow',
    inputSchema: QuizGeneratorInputSchema,
    outputSchema: QuizGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate quiz content.");
    }
    return output;
  }
);
