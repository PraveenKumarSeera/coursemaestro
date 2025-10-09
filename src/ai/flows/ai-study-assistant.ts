
'use server';

/**
 * @fileOverview This file defines the AI Study Assistant flow, which allows students to ask questions about course material.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { AiStudyAssistantInputSchema, AiStudyAssistantOutputSchema, type AiStudyAssistantInput, type AiStudyAssistantOutput } from '@/lib/ai-types';

export async function aiStudyAssistant(input: AiStudyAssistantInput): Promise<AiStudyAssistantOutput> {
  const result = await studyAssistantFlow(input);
  if (typeof result === 'string') {
    try {
      const parsed = JSON.parse(result);
      return { answer: parsed.answer };
    } catch (e) {
        // If parsing fails, it might be a direct string answer.
        return { answer: result };
    }
  }
  return result;
}

const studyAssistantFlow = ai.defineFlow(
  {
    name: 'studyAssistantFlow',
    inputSchema: AiStudyAssistantInputSchema,
    outputSchema: AiStudyAssistantOutputSchema,
  },
  async (input) => {
    const {text} = await ai.generate({
      prompt: `You are an AI study assistant helping students understand course material.
    Use the provided course material to answer the student's question.
    If the answer is not found within the context, respond that you cannot answer the question with the given context.

    Course Material:
    ${input.courseMaterial}

    Student Question:
    ${input.studentQuestion}

    Answer in JSON format with a single key "answer".
    `,
      model: googleAI.model('gemini-1.0-pro'),
    });

    return text;
  }
);
