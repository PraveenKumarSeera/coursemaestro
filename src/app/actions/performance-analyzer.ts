
'use server';

import { analyzePerformanceFlow } from "@/ai/flows/ai-performance-analyzer";
import type { GradedSubmission } from "@/lib/types";
import type { PerformanceAnalyzerOutput } from "@/lib/ai-types";

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

  // Pre-process the data into a simple string
  const studentPerformanceData = gradedSubmissions
    .map(sub => `Course: "${sub.course.title}", Assignment: "${sub.assignment.title}", Grade: ${sub.grade}%`)
    .join('\n');

  try {
    const result: PerformanceAnalyzerOutput = await analyzePerformanceFlow({ studentPerformanceData });
    return {
      analysis: result.analysis,
      message: 'Analysis successful.',
    };
  } catch (error: any) {
    console.error('Performance analysis error:', error);
    return {
      analysis: null,
      message: error.message || 'Sorry, I encountered an error while analyzing your performance. Please try again.',
    };
  }
}
