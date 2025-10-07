
'use server';
/**
 * @fileOverview This file defines the AI Teaching Assistant flow.
 * It helps teachers analyze student submissions by summarizing text or checking grammar.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const TeachingAssistantInputSchema = z.object({
  submissionText: z.string().describe('The text of the student submission to be analyzed.'),
  task: z.enum(['summarize', 'grammarCheck']).describe("The specific task to perform: 'summarize' or 'grammarCheck'."),
});
export type TeachingAssistantInput = z.infer<typeof TeachingAssistantInputSchema>;

export const TeachingAssistantOutputSchema = z.object({
  analysis: z.string().describe('The result of the AI analysis, formatted as a markdown string.'),
});
export type TeachingAssistantOutput = z.infer<typeof TeachingAssistantOutputSchema>;

export async function runTeachingAssistant(input: TeachingAssistantInput): Promise<TeachingAssistantOutput> {
  return teachingAssistantFlow(input);
}

const grammarCheckPrompt = `You are an expert grammar and style checker for a teaching assistant.
Analyze the following student submission for grammatical errors, spelling mistakes, and clarity.
Provide a bulleted list of suggested improvements. If there are no errors, state that the submission is well-written.
Keep the feedback constructive and encouraging.

Student Submission:
'''
{{submissionText}}
'''
`;

const summarizePrompt = `You are an expert summarizer for a teaching assistant.
Provide a concise, 2-3 sentence summary of the key points in the following student submission.

Student Submission:
'''
{{submissionText}}
'''
`;

export const teachingAssistantFlow = ai.defineFlow(
  {
    name: 'teachingAssistantFlow',
    inputSchema: TeachingAssistantInputSchema,
    outputSchema: TeachingAssistantOutputSchema,
  },
  async ({ submissionText, task }) => {
    const promptText = task === 'grammarCheck' ? grammarCheckPrompt : summarizePrompt;

    const { output } = await ai.generate({
      prompt: promptText.replace('{{submissionText}}', submissionText),
      output: {
        schema: TeachingAssistantOutputSchema,
      }
    });
    
    if (!output) {
      throw new Error('Failed to generate analysis.');
    }
    return output;
  }
);
