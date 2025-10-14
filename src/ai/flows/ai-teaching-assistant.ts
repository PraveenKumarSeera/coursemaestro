
'use server';
/**
 * @fileOverview This file defines the AI Teaching Assistant flow.
 * It helps teachers analyze student submissions by summarizing text or checking grammar.
 */

import { ai } from '@/ai/genkit';
import {
  TeachingAssistantInputSchema,
  TeachingAssistantOutputSchema,
  type TeachingAssistantInput,
  type TeachingAssistantOutput,
} from '@/lib/ai-types';
import { z } from 'zod';


const grammarPrompt = ai.definePrompt({
    name: 'grammarCheckPrompt',
    input: { schema: TeachingAssistantInputSchema },
    output: { schema: TeachingAssistantOutputSchema },
    model: 'gemini-pro',
    prompt: `You are an expert grammar and style checker for a teaching assistant.
Analyze the following student submission for grammatical errors, spelling mistakes, and clarity.
Provide a bulleted list of suggested improvements. If there are no errors, state that the submission is well-written.
Keep the feedback constructive and encouraging.

Student Submission:
'''
{{{submissionText}}}
'''

Generate the response in the specified JSON format.`
});

const summarizePrompt = ai.definePrompt({
    name: 'summarizePrompt',
    input: { schema: TeachingAssistantInputSchema },
    output: { schema: TeachingAssistantOutputSchema },
    model: 'gemini-pro',
    prompt: `You are an expert summarizer for a teaching assistant.
Provide a concise, 2-3 sentence summary of the key points in the following student submission.

Student Submission:
'''
{{{submissionText}}}
'''

Generate the response in the specified JSON format.`
});

const teachingAssistantFlow = ai.defineFlow({
    name: 'teachingAssistantFlow',
    inputSchema: TeachingAssistantInputSchema,
    outputSchema: TeachingAssistantOutputSchema,
}, async (input) => {
    const prompt = input.task === 'grammarCheck' ? grammarPrompt : summarizePrompt;
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI returned an invalid response. Please try again.");
    }
    return output;
});

export async function analyzeSubmission(
  input: TeachingAssistantInput
): Promise<TeachingAssistantOutput> {
  return teachingAssistantFlow(input);
}
