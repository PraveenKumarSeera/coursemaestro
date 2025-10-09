
'use server';
/**
 * @fileOverview This file defines the AI Teaching Assistant flow.
 * It helps teachers analyze student submissions by summarizing text or checking grammar.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { TeachingAssistantInputSchema, TeachingAssistantOutputSchema, type TeachingAssistantInput, type TeachingAssistantOutput } from '@/lib/ai-types';


export async function runTeachingAssistant(input: TeachingAssistantInput): Promise<TeachingAssistantOutput> {
  const result = await teachingAssistantFlow(input);
  if (typeof result === 'string') {
    try {
        return JSON.parse(result);
    } catch (e) {
        throw new Error('Failed to parse analysis from AI.');
    }
  }
  return result;
}

const teachingAssistantFlow = ai.defineFlow(
  {
    name: 'teachingAssistantFlow',
    inputSchema: TeachingAssistantInputSchema,
    outputSchema: TeachingAssistantOutputSchema,
  },
  async (input) => {
    const promptText = input.task === 'grammarCheck' 
    ? `You are an expert grammar and style checker for a teaching assistant.
Analyze the following student submission for grammatical errors, spelling mistakes, and clarity.
Provide a bulleted list of suggested improvements. If there are no errors, state that the submission is well-written.
Keep the feedback constructive and encouraging.

Student Submission:
'''
${input.submissionText}
'''

Generate the response in the specified JSON format.`
    : `You are an expert summarizer for a teaching assistant.
Provide a concise, 2-3 sentence summary of the key points in the following student submission.

Student Submission:
'''
${input.submissionText}
'''

Generate the response in the specified JSON format.`;
    
    const { text } = await ai.generate({
      prompt: promptText,
      model: googleAI.model('gemini-1.0-pro'),
    });
    
    return text;
  }
);
