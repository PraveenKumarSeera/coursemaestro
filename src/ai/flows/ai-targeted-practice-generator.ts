
'use server';
/**
 * @fileOverview This file defines the AI flow for generating targeted practice sessions.
 * It creates a micro-lesson and practice problem based on a student's weak performance on an assignment.
 */

import { ai } from '@/ai/genkit';
import {
  TargetedPracticeInputSchema,
  TargetedPracticeOutputSchema,
  type TargetedPracticeInput,
  type TargetedPracticeOutput,
} from '@/lib/ai-types';
import { googleAI } from '@genkit-ai/google-genai';

const prompt = ai.definePrompt({
  name: 'targetedPracticePrompt',
  input: { schema: TargetedPracticeInputSchema },
  output: { schema: TargetedPracticeOutputSchema },
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are an expert AI tutor. A student has performed poorly on an assignment and needs a targeted micro-lesson to help them improve.

Course: "{{courseTitle}}"
Assignment: "{{assignmentTitle}}"
Student's Grade: {{grade}}%

Based on the assignment title and low grade, infer a likely core concept the student struggled with. Then, generate a response in the specified JSON format containing a markdown-formatted "microLesson" with the following three sections:

1.  **Concept Review:** Start with a heading like "### Let's Review: [Concept Name]". Write a brief, clear, and encouraging explanation of the inferred core concept.

2.  **New Practice Problem:** Start with a heading "### Your Turn: New Practice Problem". Create a new, short practice problem that tests the same concept.

3.  **Solution Walkthrough:** Start with a heading "### Step-by-Step Solution". Provide a detailed, step-by-step walkthrough of the solution to the new practice problem. Explain the reasoning at each step.

Keep the tone supportive and focus on building the student's confidence.
`,
});

const targetedPracticeFlow = ai.defineFlow(
  {
    name: 'targetedPracticeFlow',
    inputSchema: TargetedPracticeInputSchema,
    outputSchema: TargetedPracticeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an invalid response. Please try again.');
    }
    return output;
  }
);

export async function generateTargetedPractice(
  input: TargetedPracticeInput
): Promise<TargetedPracticeOutput> {
  return targetedPracticeFlow(input);
}
