
'use server';

import { runTeachingAssistant } from "@/ai/flows/ai-teaching-assistant";
import { z } from 'zod';

const TeachingAssistantInputSchema = z.object({
  submissionText: z.string().describe('The text of the student submission to be analyzed.'),
  task: z.enum(['summarize', 'grammarCheck']).describe("The specific task to perform: 'summarize' or 'grammarCheck'."),
});

const TeachingAssistantOutputSchema = z.object({
  analysis: z.string().describe('The result of the AI analysis, formatted as a markdown string.'),
});
export type TeachingAssistantOutput = z.infer<typeof TeachingAssistantOutputSchema>;


type ActionState = {
  analysis: string | null;
  message: string | null;
  task: 'summarize' | 'grammarCheck' | null;
};

export async function analyzeSubmissionAction(
  submissionText: string,
  task: 'summarize' | 'grammarCheck'
): Promise<ActionState> {
  
  const validatedInput = TeachingAssistantInputSchema.safeParse({ submissionText, task });

  if (!validatedInput.success) {
    return {
      analysis: null,
      message: 'Invalid input provided.',
      task: null,
    };
  }

  try {
    const result = await runTeachingAssistant(validatedInput.data);
    return {
      analysis: result.analysis,
      message: 'Analysis successful.',
      task: task,
    };
  } catch (error) {
    console.error('Teaching assistant error:', error);
    return {
      analysis: null,
      message: 'Sorry, I encountered an error while analyzing the submission. Please try again.',
      task: task,
    };
  }
}
