
'use server';

import { suggestCareers } from "@/ai/flows/ai-career-advisor";
import type { GradedSubmission } from "@/lib/types";
import type { CareerAdvisorOutput } from '@/lib/ai-types';

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

  const studentPerformanceData = gradedSubmissions
      .map(sub => `Course: "${sub.course.title}", Assignment: "${sub.assignment.title}", Grade: ${sub.grade}%`)
      .join('\n');
      
  try {
    const result = await suggestCareers({ studentPerformanceData });
    return {
        suggestions: result.suggestions,
        message: 'Analysis successful.',
    };
  } catch (error: any) {
    return {
        suggestions: null,
        message: `Failed to get suggestions: ${error.message || 'Please try again.'}`,
    };
  }
}
