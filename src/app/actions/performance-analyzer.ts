
'use server';

import { analyzePerformance } from "@/ai/flows/ai-performance-analyzer";
import type { PerformanceAnalyzerInput, PerformanceAnalyzerOutput } from "@/ai/flows/ai-performance-analyzer";
import type { GradedSubmission } from "@/lib/types";

export type { PerformanceAnalyzerInput, PerformanceAnalyzerOutput };

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
