
'use server';
/**
 * @fileOverview An AI chatbot that can answer questions about the features of this application.
 *
 * This file is currently not in use as the chatbot feature was removed from the UI.
 * The code is kept here as a reference for future development.
 */

import {ai} from '@/ai/genkit';
import { AppGuideInputSchema, AppGuideOutputSchema, type AppGuideInput, type AppGuideOutput } from '@/lib/ai-types';


const prompt = ai.definePrompt({
    name: 'appGuidePrompt',
    input: { schema: AppGuideInputSchema },
    output: { schema: AppGuideOutputSchema },
    model: 'gemini-pro',
    prompt: `You are a helpful AI assistant for the CourseMaestro application. Answer the user's question based on the provided conversation history.
    
    Conversation History:
    {{{chatHistory}}}
    `,
});

const appGuideFlow = ai.defineFlow(
  {
    name: 'appGuideFlow',
    inputSchema: AppGuideInputSchema,
    outputSchema: AppGuideOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an invalid response. Please try again.');
    }
    return output;
  }
);

export async function getAppGuidance(input: AppGuideInput): Promise<AppGuideOutput> {
    return appGuideFlow(input);
}
