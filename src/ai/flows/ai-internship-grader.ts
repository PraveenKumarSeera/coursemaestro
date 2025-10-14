
'use server';
/**
 * @fileOverview This file defines the AI flow for grading a virtual internship submission.
 */

import { ai } from '@/ai/genkit';
import {
  InternshipGraderInputSchema,
  InternshipGraderOutputSchema,
  type InternshipGraderInput,
  type InternshipGraderOutput,
} from '@/lib/ai-types';
import { googleAI } from '@genkit-ai/google-genai';

const prompt = ai.definePrompt({
  name: 'internshipGraderPrompt',
  input: { schema: InternshipGraderInputSchema },
  output: { schema: InternshipGraderOutputSchema },
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an expert AI teaching assistant, specializing in grading complex, open-ended technical and strategic submissions from a simulated internship program.

Your task is to provide a fair and constructive assessment of a student's submission.

Task Title: {{{taskTitle}}}
Task Description: {{{taskDescription}}}
Student's Submission:
'''
{{{submissionText}}}
'''

Evaluate the submission based on the following criteria and generate the response in the specified JSON format:

1.  **problemSolving (0-100):** Assess the logic, feasibility, and completeness of the solution. How well did they understand and address the core problem?
2.  **creativity (0-100):** Evaluate the novelty and innovation of the proposed solution. Did they think outside the box or just provide a standard answer?
3.  **overall (0-100):** Provide a weighted overall score. This should be roughly 60% problem-solving and 40% creativity.
4.  **feedback:** Write a constructive, encouraging paragraph. Start by highlighting the strengths of the submission. Then, provide specific, actionable suggestions for improvement. Maintain a professional and supportive tone, as if you were a senior mentor.
`,
});

const internshipGraderFlow = ai.defineFlow(
  {
    name: 'internshipGraderFlow',
    inputSchema: InternshipGraderInputSchema,
    outputSchema: InternshipGraderOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an invalid response. Please try again.');
    }
    return output;
  }
);

export async function gradeInternshipSubmission(
  input: InternshipGraderInput
): Promise<InternshipGraderOutput> {
  return internshipGraderFlow(input);
}
