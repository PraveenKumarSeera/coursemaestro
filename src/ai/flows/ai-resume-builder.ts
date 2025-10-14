
'use server';
/**
 * @fileOverview This file defines the AI Resume Builder flow.
 * It generates a resume for a student based on their academic performance.
 */

import { ai } from '@/ai/genkit';
import {
  ResumeBuilderInputSchema,
  ResumeBuilderOutputSchema,
  type ResumeBuilderInput,
  type ResumeBuilderOutput,
} from '@/lib/ai-types';
import { z } from 'zod';


const prompt = ai.definePrompt({
    name: 'resumeBuilderPrompt',
    input: { schema: ResumeBuilderInputSchema },
    output: { schema: ResumeBuilderOutputSchema },
    model: 'gemini-pro',
    prompt: `You are an expert resume writer helping a student create a professional resume.

Generate a resume in Markdown format based on the student's information and academic performance provided in the input.

Student Name: {{{studentName}}}
Student Email: {{{studentEmail}}}

Academic Performance (High-performing assignments):
{{{studentPerformanceData}}}

The resume should include the following sections:
1.  **Header:** Student's Name and Email.
2.  **Summary:** A brief, 2-3 sentence professional summary highlighting their strengths as a motivated and capable student, inferred from the course topics.
3.  **Education:** List the courses they have taken (infer from the performance data).
4.  **Skills:** Infer a list of potential skills (technical and soft skills) from the course titles.
5.  **Projects / Coursework:** Frame their best-performing assignments (provided in the performance data) as "projects". For each project, include the course it was for and a brief, professional description of what the assignment likely entailed based on its title.

Generate ONLY the markdown for the resume and nothing else. Your entire output should be the markdown content.
`,
});

const resumeBuilderFlow = ai.defineFlow({
    name: 'resumeBuilderFlow',
    inputSchema: ResumeBuilderInputSchema,
    outputSchema: ResumeBuilderOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI returned an invalid response. Please try again.");
    }
    return output;
});


export async function generateResume(
  input: ResumeBuilderInput
): Promise<ResumeBuilderOutput> {
  return resumeBuilderFlow(input);
}
