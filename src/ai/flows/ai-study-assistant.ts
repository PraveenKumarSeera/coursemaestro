
'use server';

/**
 * @fileOverview This file defines the AI Study Assistant flow, which allows students to ask questions about course material.
 */

import {ai} from '@/ai/genkit';
import { AiStudyAssistantInputSchema, AiStudyAssistantOutputSchema, type AiStudyAssistantInput, type AiStudyAssistantOutput } from '@/lib/ai-types';

export async function aiStudyAssistant(input: AiStudyAssistantInput): Promise<AiStudyAssistantOutput> {
  return await ai.run('studyAssistantFlow', input);
}

ai.defineFlow(
  {
    name: 'studyAssistantFlow',
    inputSchema: AiStudyAssistantInputSchema,
    outputSchema: AiStudyAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      prompt: `You are an AI study assistant helping students understand course material.
    Use the provided course material to answer the student's question.
    If the answer is not found within the context, respond that you cannot answer the question with the given context.

    Course Material:
    ${input.courseMaterial}

    Student Question:
    ${input.studentQuestion}

    Answer:
    `,
      model: 'gemini-1.5-flash-latest',
      output: {
        schema: AiStudyAssistantOutputSchema,
      },
    });

    if (!output) {
        throw new Error('Failed to generate an answer.');
    }
    return output;
  }
);
