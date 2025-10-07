
'use server';

import { analyzePerformance } from "@/ai/flows/ai-performance-analyzer";
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

export const PerformanceAnalyzerInputSchema = z.object({
  gradedSubmissions: z.array(GradedSubmissionSchema).describe("An array of the student's graded assignments."),
});
export type PerformanceAnalyzerInput = z.infer<typeof PerformanceAnalyzerInputSchema>;

export const PerformanceAnalyzerOutputSchema = z.object({
    analysis: z.string().describe('A detailed analysis of the student\'s performance, formatted as a markdown string. Include headings, bullet points, and bold text.'),
});


type ActionState = {
  analysis: string | null;
  message: string | null;
};

export async function analyzePerformanceAction(
  { gradedSubmissions }: { gradedSubmissions: GradedSubmission[] }
): Promise<ActionState> {
  
  if (!gradedSubmissions || gradedSubmissions.length === 0) {
    return {
      analysis: null,
      message: 'You do not have any graded assignments to analyze.',
    };
  }

  try {
    const result = await analyzePerformance({ gradedSubmissions });
    return {
      analysis: result.analysis,
      message: 'Analysis successful.',
    };
  } catch (error) {
    console.error('Performance analysis error:', error);
    return {
      analysis: null,
      message: 'Sorry, I encountered an error while analyzing your performance. Please try again.',
    };
  }
}
