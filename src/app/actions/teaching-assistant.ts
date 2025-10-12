
'use server';

import { analyzeSubmission } from "@/ai/flows/ai-teaching-assistant";
import { TeachingAssistantInputSchema } from "@/lib/ai-types";

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
    const result = await analyzeSubmission({ submissionText, task });
    return {
      analysis: result.analysis,
      message: 'Analysis successful.',
      task: task,
    };
  } catch (error: any) {
    return {
      analysis: null,
      message: `Failed to analyze submission: ${error.message || 'Please try again.'}`,
      task: task,
    };
  }
}
