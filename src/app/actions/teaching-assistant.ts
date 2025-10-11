
'use server';

import { analyzeSubmission } from "@/ai/flows/ai-teaching-assistant";
import { TeachingAssistantInputSchema, type TeachingAssistantOutput } from "@/lib/ai-types";

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

  // Bypass AI call and return demo data
  let demoAnalysis = '';
  if (task === 'summarize') {
    demoAnalysis = 'This is a demo summary. The student argues that modern JavaScript frameworks, while powerful, add a layer of abstraction that can obscure fundamental web principles. The key takeaway is the importance of balancing framework use with a strong understanding of the underlying technologies like the DOM API and HTTP protocol.';
  } else {
    demoAnalysis = `
This is a demo grammar check. Here are some suggestions:
- **Clarity:** In the first paragraph, the sentence "It's a thing that many people think..." is a bit vague. Consider rephrasing to be more specific, for example: "Many developers believe that..."
- **Spelling:** The word "seperate" in the second paragraph should be spelled "separate".
- **Punctuation:** There's a missing comma in the third paragraph after the introductory clause "In conclusion".
Overall, this is a well-structured submission with clear points.
`;
  }
  
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            analysis: demoAnalysis,
            message: 'Analysis successful.',
            task: task,
        });
    }, 1500);
  });
}
