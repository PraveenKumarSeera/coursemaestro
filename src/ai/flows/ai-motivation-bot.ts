'use server';
/**
 * @fileOverview This file defines the AI Motivation Bot flow.
 * It generates an encouraging message for a student whose grade has dropped.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MotivationBotInputSchema = z.object({
  studentName: z.string().describe("The first name of the student."),
  courseTitle: z.string().describe("The title of the course."),
});
export type MotivationBotInput = z.infer<typeof MotivationBotInputSchema>;

const MotivationBotOutputSchema = z.object({
  message: z.string().describe("A short, positive, and encouraging message for the student."),
});
export type MotivationBotOutput = z.infer<typeof MotivationBotOutputSchema>;

export async function generateMotivationalMessage(input: MotivationBotInput): Promise<MotivationBotOutput> {
  return motivationBotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'motivationBotPrompt',
  input: { schema: MotivationBotInputSchema },
  output: { schema: MotivationBotOutputSchema },
  prompt: `You are an encouraging and positive AI academic advisor named "Maestro".
  
A student, {{studentName}}, just received a grade in their course, "{{courseTitle}}", that was lower than their average.
Generate a short, kind, and motivational message (2-3 sentences) to send to them.

Your message should:
- Be supportive and acknowledge that setbacks happen.
- Encourage them to review feedback and not get discouraged.
- Remind them that one grade doesn't define their ability.
- Maintain a warm and uplifting tone.

Do not mention the specific grade or assignment. Focus on encouragement.
Example: "Hey {{studentName}}, just a friendly check-in. Remember that every learning journey has its ups and downs. Keep your head up and keep moving forward. You've got this!"

Generate the message in the specified JSON format.
`,
});

const motivationBotFlow = ai.defineFlow(
  {
    name: 'motivationBotFlow',
    inputSchema: MotivationBotInputSchema,
    outputSchema: MotivationBotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate motivational message.');
    }
    return output;
  }
);
