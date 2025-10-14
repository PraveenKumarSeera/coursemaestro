
'use server';
/**
 * @fileOverview This file defines the AI Career Path Advisor flow.
 * It analyzes a student's performance and suggests potential career paths.
 */

import { ai } from '@/ai/genkit';
import {
  CareerAdvisorInputSchema,
  CareerAdvisorOutputSchema,
  type CareerAdvisorInput,
  type CareerAdvisorOutput,
} from '@/lib/ai-types';

const prompt = ai.definePrompt(
  {
    name: 'careerAdvisorPrompt',
    input: { schema: CareerAdvisorInputSchema },
    output: { schema: CareerAdvisorOutputSchema },
    prompt: `You are an expert career advisor for students.

Analyze the student's performance based on their grades in different courses.
Based on their strengths, suggest 3-5 potential career paths.

Here is the student's performance data:
{{{studentPerformanceData}}}

For each career path, provide:
1.  A title for the career.
2.  A brief description explaining why it's a good fit based on their academic performance.
3.  A list of key skills associated with that career.

Generate the response in the specified JSON format.
`,
  },
);

const careerAdvisorFlow = ai.defineFlow(
  {
    name: 'careerAdvisorFlow',
    inputSchema: CareerAdvisorInputSchema,
    outputSchema: CareerAdvisorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI returned an invalid response. Please try again.");
    }
    return output;
  }
);


export async function suggestCareers(
  input: CareerAdvisorInput
): Promise<CareerAdvisorOutput> {
  return careerAdvisorFlow(input);
}
