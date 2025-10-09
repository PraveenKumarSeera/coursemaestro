
'use server';
/**
 * @fileOverview This file defines the AI Resume Builder flow.
 * It generates a resume for a student based on their academic performance.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {
  ResumeBuilderInputSchema,
  ResumeBuilderOutputSchema,
  type ResumeBuilderInput,
  type ResumeBuilderOutput,
} from '@/lib/ai-types';

export async function generateResume(
  input: ResumeBuilderInput
): Promise<ResumeBuilderOutput> {
  const { text } = await ai.generate({
    prompt: `You are an expert resume writer helping a student create a professional resume.

Generate a resume in Markdown format based on the student's information and academic performance provided in the input.

Student Name: ${input.studentName}
Student Email: ${input.studentEmail}

Academic Performance (High-performing assignments):
${input.studentPerformanceData}

The resume should include the following sections:
1.  **Header:** Student's Name and Email.
2.  **Summary:** A brief, 2-3 sentence professional summary highlighting their strengths as a motivated and capable student, inferred from the course topics.
3.  **Education:** List the courses they have taken (infer from the performance data).
4.  **Skills:** Infer a list of potential skills (technical and soft skills) from the course titles.
5.  **Projects / Coursework:** Frame their best-performing assignments (provided in the performance data) as "projects". For each project, include the course it was for and a brief, professional description of what the assignment likely entailed based on its title.

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
