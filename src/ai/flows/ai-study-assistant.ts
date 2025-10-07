
'use server';

/**
 * @fileOverview This file defines the AI Study Assistant flow, which allows students to ask questions about course material.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const AiStudyAssistantInputSchema = z.object({
  courseMaterial: z
    .string()
    .describe('The course material to be used as context for answering questions.'),
  studentQuestion: z.string().describe('The question from the student about the course material.'),
});
export type AiStudyAssistantInput = z.infer<typeof AiStudyAssistantInputSchema>;

export const AiStudyAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the student question, based on the course material.'),
});
export type AiStudyAssistantOutput = z.infer<typeof AiStudyAssistantOutputSchema>;


export async function aiStudyAssistant(input: AiStudyAssistantInput): Promise<AiStudyAssistantOutput> {
  return aiStudyAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStudyAssistantPrompt',
  input: {schema: AiStudyAssistantInputSchema},
  output: {schema: AiStudyAssistantOutputSchema},
  prompt: `You are an AI study assistant helping students understand course material.
  Use the provided course material to answer the student's question.
  If the answer is not found within the context, respond that you cannot answer the question with the given context.

  Course Material:
  {{courseMaterial}}

  Student Question:
  {{studentQuestion}}

  Answer:
  `,
});

export const aiStudyAssistantFlow = ai.defineFlow(
  {
    name: 'aiStudyAssistantFlow',
    inputSchema: AiStudyAssistantInputSchema,
    outputSchema: AiStudyAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('Failed to generate an answer.');
    }
    return output;
  }
);
