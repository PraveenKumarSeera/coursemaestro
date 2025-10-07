
'use server';
/**
 * @fileOverview This file defines the AI Quiz Generator flow.
 * It takes course material as input and generates a quiz and a set of flashcards.
 */

import { ai } from '@/ai/genkit';
import { QuizGeneratorInputSchema, QuizGeneratorOutputSchema, type QuizGeneratorInput, type QuizGeneratorOutput } from '@/lib/ai-types';

export async function generateQuizAndFlashcards(input: QuizGeneratorInput): Promise<QuizGeneratorOutput> {
  return quizGeneratorFlow(input);
}

const quizGeneratorFlow = ai.defineFlow(
  {
    name: 'quizGeneratorFlow',
    inputSchema: QuizGeneratorInputSchema,
    outputSchema: QuizGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
        prompt: `You are an AI assistant that creates educational materials for teachers.
  Based on the provided course material, generate a quiz and a set of flashcards.

  The quiz should contain 5-7 multiple-choice questions that test the key concepts from the material.
  For each question, provide 4 options and clearly indicate the correct answer.

  The flashcards should identify and define 6-8 important keywords or concepts from the material.

  Course Material:
  '''
  ${input.courseMaterial}
  '''

  Generate the quiz and flashcards in the specified JSON format.
  `,
        output: {
            schema: QuizGeneratorOutputSchema,
        },
    });

    if (!output) {
        throw new Error("Failed to generate quiz content.");
    }
    return output;
  }
);
