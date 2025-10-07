
'use server';

import { suggestCareers } from "@/ai/flows/ai-career-advisor";
import type { GradedSubmission } from "@/lib/types";
import type { CareerAdvisorOutput } from '@/lib/ai-types';

export type { CareerAdvisorInput, CareerAdvisorOutput } from '@/lib/ai-types';

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

  // Map GradedSubmission to the format expected by the AI
  const aiSubmissions = gradedSubmissions.map(sub => ({
    course: { title: sub.course.title },
    assignment: { title: sub.assignment.title },
    grade: sub.grade,
  }));

  try {
    const result = await suggestCareers({ gradedSubmissions: aiSubmissions });
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
