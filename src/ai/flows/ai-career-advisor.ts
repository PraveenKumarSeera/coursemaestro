
'use server';
/**
 * @fileOverview This file defines the AI Career Path Advisor flow.
 * It analyzes a student's performance and suggests potential career paths.
 */

import { ai } from '@/ai/genkit';
import { CareerAdvisorInputSchema, CareerAdvisorOutputSchema, type CareerAdvisorInput, type CareerAdvisorOutput } from '@/lib/ai-types';

export async function suggestCareers(input: CareerAdvisorInput): Promise<CareerAdvisorOutput> {
  return careerAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerAdvisorPrompt',
  input: { schema: CareerAdvisorInputSchema },
  output: { schema: CareerAdvisorOutputSchema },
  prompt: `You are an expert career advisor for students.
  
Analyze the student's performance based on their grades in different courses.
Based on their strengths, suggest 3-5 potential career paths.

For each career path, provide:
1.  A title for the career.
2.  A brief description explaining why it's a good fit based on their academic performance.
3.  A list of key skills associated with that career.

Student's Graded Assignments:
\`\`\`json
{{{JSON.stringify gradedSubmissions}}}
\`\`\`
`,
});

const careerAdvisorFlow = ai.defineFlow(
  {
    name: 'careerAdvisorFlow',
    inputSchema: CareerAdvisorInputSchema,
    outputSchema: CareerAdvisorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate career suggestions.');
    }
    return output;
  }
);
