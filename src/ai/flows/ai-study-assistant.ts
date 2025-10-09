
'use server';

/**
 * @fileOverview This file defines the AI Study Assistant flow, which allows students to ask questions about course material.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {
  AiStudyAssistantInputSchema,
  AiStudyAssistantOutputSchema,
  type AiStudyAssistantInput,
  type AiStudyAssistantOutput,
} from '@/lib/ai-types';

export async function askStudyAssistant(
  input: AiStudyAssistantInput
): Promise<AiStudyAssistantOutput> {
  const { text } = await ai.generate({
    prompt: `You are an AI study assistant helping students understand course material.
    Use the provided course material to answer the student's question.
    If the answer is not found within the context, respond that you cannot answer the question with the given context.

    Course Material:
    ${input.courseMaterial}

    Student Question:
    ${input.studentQuestion}

    Answer in JSON format with a single key "answer".
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
