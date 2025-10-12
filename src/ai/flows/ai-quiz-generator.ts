
'use server';
/**
 * @fileOverview This file defines the AI Quiz Generator flow.
 * It takes course material as input and generates a quiz and a set of flashcards.
 */

import { ai } from '@/ai/genkit';
import {
  QuizGeneratorInputSchema,
  QuizGeneratorOutputSchema,
  type QuizGeneratorInput,
  type QuizGeneratorOutput,
} from '@/lib/ai-types';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

const prompt = ai.definePrompt({
    name: 'quizGeneratorPrompt',
    input: { schema: QuizGeneratorInputSchema },
    output: { schema: QuizGeneratorOutputSchema },
    model: googleAI('gemini-1.5-pro-latest'),
    prompt: `You are an AI assistant that creates educational materials for teachers.
      Based on the provided course material, generate a quiz and a set of flashcards.
    
      The quiz should contain 5-7 multiple-choice questions that test the key concepts from the material.
      For each question, provide 4 options and clearly indicate the correct answer.
    
      The flashcards should identify and define 6-8 important keywords or concepts from the material.
    
      Course Material:
      '''
      {{{courseMaterial}}}
      '''
    
      Generate the quiz and flashcards in the specified JSON format.
      `,
});

const quizGeneratorFlow = ai.defineFlow({
    name: 'quizGeneratorFlow',
    inputSchema: QuizGeneratorInputSchema,
    outputSchema: QuizGeneratorOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI returned an invalid response. Please try again.");
    }
    return output;
});


export async function generateQuizAndFlashcards(
  input: QuizGeneratorInput
): Promise<QuizGeneratorOutput> {
  return quizGeneratorFlow(input);
}
