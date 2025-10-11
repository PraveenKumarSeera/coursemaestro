
'use server';

import { analyzeSubmission } from "@/ai/flows/ai-teaching-assistant";
import { TeachingAssistantInputSchema, type TeachingAssistantOutput } from "@/lib/ai-types";

type ActionState = {
  analysis: string | null;
  message: string | null;
  task: 'summarize' | 'grammarCheck' | null;
};

const demoSummary = "The student argues that responsive design is crucial for modern web development, improves user experience, and boosts SEO. They suggest a mobile-first approach is the most effective strategy.";

const demoGrammarCheck = `
- **Well-written overall!** The submission is clear and well-structured.
- Consider rephrasing the sentence "It is a thing that is very important" in the second paragraph for better clarity. Perhaps "This principle is critical because..."
- There's a minor typo in the third paragraph: "delevopment" should be "development".
- The conclusion is strong but could be even more impactful by restating the main thesis.
`;


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

  // Return demo data based on the task
  return new Promise(resolve => {
    setTimeout(() => {
        resolve({
            analysis: task === 'summarize' ? demoSummary : demoGrammarCheck,
            message: 'Analysis successful.',
            task: task,
        });
    }, 1500);
  });
}
