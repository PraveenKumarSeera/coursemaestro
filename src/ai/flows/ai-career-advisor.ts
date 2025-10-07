
'use server';
/**
 * @fileOverview This file defines the AI Career Path Advisor flow.
 * It analyzes a student's performance and suggests potential career paths.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';

const GradedSubmissionSchema = z.object({
  course: z.object({
    title: z.string(),
  }),
  assignment: z.object({
    title: z.string(),
  }),
  grade: z.number().nullable(),
});

const CareerAdvisorInputSchema = z.object({
  gradedSubmissions: z.array(GradedSubmissionSchema).describe("An array of the student's graded assignments."),
});
export type CareerAdvisorInput = z.infer<typeof CareerAdvisorInputSchema>;

const CareerSuggestionSchema = z.object({
    title: z.string().describe("The job title or career path."),
    description: z.string().describe("A brief description of the career path and why it might be a good fit for the student."),
    keySkills: z.array(z.string()).describe("A list of key skills required for this career path.")
});

const CareerAdvisorOutputSchema = z.object({
  suggestions: z.array(CareerSuggestionSchema).describe("An array of 3-5 career path suggestions."),
});
export type CareerAdvisorOutput = z.infer<typeof CareerAdvisorOutputSchema>;

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
{{{jsonStringify gradedSubmissions}}}
\`\`\`

Generate the suggestions in the specified JSON format.
`,
});

export const careerAdvisorFlow = ai.defineFlow(
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
