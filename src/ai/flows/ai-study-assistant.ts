
'use server';

/**
 * @fileOverview This file defines the AI Study Assistant flow, which allows students to ask questions about course material.
 */

import {ai} from '@/ai/genkit';
import { AiStudyAssistantInputSchema, AiStudyAssistantOutputSchema, type AiStudyAssistantInput, type AiStudyAssistantOutput } from '@/lib/ai-types';

export async function aiStudyAssistant(input: AiStudyAssistantInput): Promise<AiStudyAssistantOutput> {
  return aiStudyAssistantFlow(input);
}

const prompt = ai.definePrompt({
    name: 'aiStudyAssistantPrompt',
    input: { schema: AiStudyAssistantInputSchema },
    output: { schema: AiStudyAssistantOutputSchema },
    prompt: `You are an AI study assistant helping students understand course material.
  Use the provided course material to answer the student's question.
  If the answer is not found within the context, respond that you cannot answer the question with the given context.

  Course Material:
  {{{courseMaterial}}}

  Student Question:
  {{{studentQuestion}}}

  Answer:
  `,
});

const aiStudyAssistantFlow = ai.defineFlow(
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
