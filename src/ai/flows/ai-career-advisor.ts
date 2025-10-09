
'use server';
/**
 * @fileOverview This file defines the AI Career Path Advisor flow.
 * It analyzes a student's performance and suggests potential career paths.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {
  CareerAdvisorInputSchema,
  CareerAdvisorOutputSchema,
  type CareerAdvisorInput,
  type CareerAdvisorOutput,
} from '@/lib/ai-types';

export async function suggestCareers(
  input: CareerAdvisorInput
): Promise<CareerAdvisorOutput> {
  const { text } = await ai.generate({
    prompt: `You are an expert career advisor for students.

Analyze the student's performance based on their grades in different courses.
Based on their strengths, suggest 3-5 potential career paths.

Here is the student's performance data:
${input.studentPerformanceData}

For each career path, provide:
1.  A title for the career.
2.  A brief description explaining why it's a good fit based on their academic performance.
3.  A list of key skills associated with that career.

Generate the response in the specified JSON format.
`,
    model: googleAI.model('gemini-1.5-flash-latest'),
  });

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse AI response:', text);
    throw new Error('The AI returned an invalid response. Please try again.');
  }
}
