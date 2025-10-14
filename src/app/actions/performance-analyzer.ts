
'use server';

import { analyzePerformance } from "@/ai/flows/ai-performance-analyzer";
import type { GradedSubmission } from "@/lib/types";
import type { PerformanceAnalyzerOutput } from "@/lib/ai-types";

type ActionState = {
  analysis: PerformanceAnalyzerOutput | null;
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

  const studentPerformanceData = gradedSubmissions
    .map(sub => `Course: "${sub.course.title}", Assignment: "${sub.assignment.title}", Grade: ${sub.grade}%`)
    .join('\n');

  try {
    const result = await analyzePerformance({ studentPerformanceData });
    return {
      analysis: result,
      message: 'Analysis successful.',
    };
  } catch (error: any) {
    return {
      analysis: null,
      message: `Failed to analyze performance: ${error.message || 'Please try again.'}`,
    };
  }
}
