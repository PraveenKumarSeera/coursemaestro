
'use server';

import { suggestCareers } from "@/ai/flows/ai-career-advisor";
import type { GradedSubmission } from "@/lib/types";
import { z } from 'zod';

const GradedSubmissionSchema = z.object({
  course: z.object({
    title: z.string(),
  }),
  assignment: z.object({
    title: z.string(),
  }),
  grade: z.number().nullable(),
});

export const CareerAdvisorInputSchema = z.object({
  gradedSubmissions: z.array(GradedSubmissionSchema).describe("An array of the student's graded assignments."),
});
export type CareerAdvisorInput = z.infer<typeof CareerAdvisorInputSchema>;

const CareerSuggestionSchema = z.object({
    title: z.string().describe("The job title or career path."),
    description: z.string().describe("A brief description of the career path and why it might be a good fit for the student."),
    keySkills: z.array(z.string()).describe("A list of key skills required for this career path.")
});

export const CareerAdvisorOutputSchema = z.object({
  suggestions: z.array(CareerSuggestionSchema).describe("An array of 3-5 career path suggestions."),
});
export type CareerAdvisorOutput = z.infer<typeof CareerAdvisorOutputSchema>;


type ActionState = {
  suggestions: CareerAdvisorOutput['suggestions'] | null;
  message: string | null;
};

export async function suggestCareersAction(
  { gradedSubmissions }: { gradedSubmissions: GradedSubmission[] }
): Promise<ActionState> {
  
  if (!gradedSubmissions || gradedSubmissions.length === 0) {
    return {
      suggestions: null,
      message: 'You do not have any graded assignments to analyze for career advice.',
    };
  }

  try {
    const result = await suggestCareers({ gradedSubmissions });
    return {
      suggestions: result.suggestions,
      message: 'Analysis successful.',
    };
  } catch (error) {
    console.error('Career advisor error:', error);
    return {
      suggestions: null,
      message: 'Sorry, I encountered an error while generating career advice. Please try again.',
    };
  }
}
