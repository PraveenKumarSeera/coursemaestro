
'use server';
/**
 * @fileOverview This file defines the AI Brain Stretch Generator flow.
 * It creates cognitive puzzles based on course material.
 */

import { ai } from '@/ai/genkit';
import {
  BrainStretchGeneratorInputSchema,
  BrainStretchGeneratorOutputSchema,
  type BrainStretchGeneratorInput,
  type BrainStretchGeneratorOutput,
} from '@/lib/ai-types';

const prompt = ai.definePrompt({
  name: 'brainStretchGeneratorPrompt',
  input: { schema: BrainStretchGeneratorInputSchema },
  output: { schema: BrainStretchGeneratorOutputSchema },
  model: 'gemini-1.5-flash-latest',
  prompt: `You are an AI that creates cognitive puzzles for students based on course material.
    
      Generate a set of 3-5 "Brain Stretch" puzzles based on the provided course material. The puzzles should test reasoning and memory.
      
      Create a mix of the following puzzle types:
      1.  **Analogy:** "X is to Y as A is to B".
      2.  **Odd-one-out:** Which term does not belong with the others?
      3.  **Anagram:** An unscrambled version of a key term.
      
      For each puzzle, provide:
      - The puzzle type ('analogy', 'odd-one-out', 'anagram').
      - The question.
      - Four plausible options.
      - The correct answer.
      - A brief explanation of why the answer is correct.
      
      Course Material:
      '''
      {{{courseMaterial}}}
      '''
      
      Generate the response in the specified JSON format.
      `,
});

const brainStretchGeneratorFlow = ai.defineFlow(
  {
    name: 'brainStretchGeneratorFlow',
    inputSchema: BrainStretchGeneratorInputSchema,
    outputSchema: BrainStretchGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an invalid response. Please try again.');
    }
    return output;
  }
);

export async function generateBrainStretches(
  input: BrainStretchGeneratorInput
): Promise<BrainStretchGeneratorOutput> {
  return brainStretchGeneratorFlow(input);
}
