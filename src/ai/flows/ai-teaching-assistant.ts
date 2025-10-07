
'use server';
/**
 * @fileOverview This file defines the AI Teaching Assistant flow.
 * It helps teachers analyze student submissions by summarizing text or checking grammar.
 */

import { ai } from '@/ai/genkit';
import { TeachingAssistantInputSchema, TeachingAssistantOutputSchema, type TeachingAssistantInput, type TeachingAssistantOutput } from '@/lib/ai-types';


export async function runTeachingAssistant(input: TeachingAssistantInput): Promise<TeachingAssistantOutput> {
  return teachingAssistantFlow(input);
}


const grammarPrompt = ai.definePrompt({
    name: 'grammarCheckPrompt',
    input: { schema: TeachingAssistantInputSchema },
    output: { schema: TeachingAssistantOutputSchema },
    prompt: `You are an expert grammar and style checker for a teaching assistant.
Analyze the following student submission for grammatical errors, spelling mistakes, and clarity.
Provide a bulleted list of suggested improvements. If there are no errors, state that the submission is well-written.
Keep the feedback constructive and encouraging.

Student Submission:
'''
{{{submissionText}}}
'''`
});

const summarizePrompt = ai.definePrompt({
    name: 'summarizePrompt',
    input: { schema: TeachingAssistantInputSchema },
    output: { schema: TeachingAssistantOutputSchema },
    prompt: `You are an expert summarizer for a teaching assistant.
Provide a concise, 2-3 sentence summary of the key points in the following student submission.

Student Submission:
'''
{{{submissionText}}}
'''`
});


const teachingAssistantFlow = ai.defineFlow(
  {
    name: 'teachingAssistantFlow',
    inputSchema: TeachingAssistantInputSchema,
    outputSchema: TeachingAssistantOutputSchema,
  },
  async ({ submissionText, task }) => {
    
    const prompt = task === 'grammarCheck' ? grammarPrompt : summarizePrompt;
    
    const { output } = await prompt({ submissionText, task });
    
    if (!output) {
      throw new Error('Failed to generate analysis.');
    }
    return output;
  }
);
