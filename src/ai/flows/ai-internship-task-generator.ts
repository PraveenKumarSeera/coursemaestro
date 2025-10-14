
'use server';
/**
 * @fileOverview This file defines the AI flow for generating a virtual internship task.
 */

import { ai } from '@/ai/genkit';
import {
  InternshipTaskGeneratorInputSchema,
  InternshipTaskGeneratorOutputSchema,
  type InternshipTaskGeneratorInput,
  type InternshipTaskGeneratorOutput,
} from '@/lib/ai-types';

const prompt = ai.definePrompt({
  name: 'internshipTaskGeneratorPrompt',
  input: { schema: InternshipTaskGeneratorInputSchema },
  output: { schema: InternshipTaskGeneratorOutputSchema },
  model: 'gemini-1.5-flash-latest',
  prompt: `You are a Senior Manager at a prestigious tech company, responsible for creating challenging and realistic tasks for interns.

Your goal is to generate a single, compelling task based on the provided company domain. The task should be a self-contained problem that a smart university student could reasonably tackle in a few hours.

Company Domain: {{{domainName}}}
Domain Description: {{{domainDescription}}}

Generate a response in the specified JSON format with the following fields:
1.  **title:** A concise, engaging title for the task (e.g., "Develop a Content Recommendation Algorithm").
2.  **scenario:** A detailed paragraph that sets the scene. Describe the team, the problem, and the business context. Make it sound like a real memo or task assignment.
3.  **task:** A clear and specific description of what the student needs to do. This should be an actionable request.
4.  **deliverables:** A list of 2-3 concrete items the student should produce (e.g., "A 1-page technical proposal," "Pseudo-code for the core algorithm," "A high-level system diagram").

The task should be creative, require critical thinking, and be relevant to the company's domain. Avoid simple coding exercises. Focus on problem-solving, design, and strategy.
`,
});

const internshipTaskGeneratorFlow = ai.defineFlow(
  {
    name: 'internshipTaskGeneratorFlow',
    inputSchema: InternshipTaskGeneratorInputSchema,
    outputSchema: InternshipTaskGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an invalid response. Please try again.');
    }
    return output;
  }
);

export async function generateInternshipTask(
  input: InternshipTaskGeneratorInput
): Promise<InternshipTaskGeneratorOutput> {
  return internshipTaskGeneratorFlow(input);
}
