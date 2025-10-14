
'use server';

/**
 * @fileOverview This file defines the AI Study Assistant flow, which allows students to ask questions about course material.
 */

import { ai } from '@/ai/genkit';
import {
  AiStudyAssistantInputSchema,
  AiStudyAssistantOutputSchema,
  type AiStudyAssistantInput,
  type AiStudyAssistantOutput,
} from '@/lib/ai-types';
import { googleAI } from '@genkit-ai/google-genai';

const prompt = ai.definePrompt({
    name: 'studyAssistantPrompt',
    input: { schema: AiStudyAssistantInputSchema },
    output: { schema: AiStudyAssistantOutputSchema },
    model: googleAI.model('gemini-1.5-flash-latest'),
    prompt: `You are an AI study assistant helping students understand course material.
    Use the provided course material to answer the student's question.
    Your answer should be concise and accurate. Also provide a few related keywords.
    If the answer is not found within the context, respond that you cannot answer the question with the given context.

    Course Material:
    {{{courseMaterial}}}

    Student Question:
    {{{studentQuestion}}}

    Generate the response in the specified JSON format.
    `,
});

const studyAssistantFlow = ai.defineFlow({
    name: 'studyAssistantFlow',
    inputSchema: AiStudyAssistantInputSchema,
    outputSchema: AiStudyAssistantOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI returned an invalid response. Please try again.");
    }
    return output;
});


export async function askStudyAssistant(
  input: AiStudyAssistantInput
): Promise<AiStudyAssistantOutput> {
  return await studyAssistantFlow(input);
}
