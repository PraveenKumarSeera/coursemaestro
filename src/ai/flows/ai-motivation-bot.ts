
'use server';
/**
 * @fileOverview This file defines the AI Motivation Bot flow.
 * It generates an encouraging message for a student whose grade has dropped.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { MotivationBotInputSchema, MotivationBotOutputSchema, type MotivationBotInput, type MotivationBotOutput } from '@/lib/ai-types';

export async function generateMotivationalMessage(input: MotivationBotInput): Promise<MotivationBotOutput> {
  return await motivationalMessageFlow(input);
}

const motivationalMessageFlow = ai.defineFlow(
  {
    name: 'motivationalMessageFlow',
    inputSchema: MotivationBotInputSchema,
    outputSchema: MotivationBotOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are an encouraging and positive AI academic advisor named "Maestro".
    
A student, ${input.studentName}, just received a grade in their course, "${input.courseTitle}", that was lower than their average.
Generate a short, kind, and motivational message (2-3 sentences) to send to them.

Your message should:
- Be supportive and acknowledge that setbacks happen.
- Encourage them to review feedback and not get discouraged.
- Remind them that one grade doesn't define their ability.
- Maintain a warm and uplifting tone.

Do not mention the specific grade or assignment. Focus on encouragement.
Example: "Hey ${input.studentName}, just a friendly check-in. Remember that every learning journey has its ups and downs. Keep your head up and keep moving forward. You've got this!"

Generate the message in the specified JSON format.
`,
      model: 'googleai/gemini-pro',
      output: {
        schema: MotivationBotOutputSchema,
      },
    });
    
    if (!output) {
      throw new Error('Failed to generate motivational message.');
    }
    return output;
  }
);
