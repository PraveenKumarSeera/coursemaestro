
'use server';

import type { GradedSubmission, User } from "@/lib/types";
import type { PerformanceAnalyzerOutput } from "@/lib/ai-types";

type ActionState = {
  analysis: PerformanceAnalyzerOutput | null;
  message: string | null;
};

// This function now generates static analysis instead of calling an AI flow.
export async function analyzePerformanceAction(
  user: User, 
  gradedSubmissions: GradedSubmission[]
): Promise<ActionState> {
  
  if (!gradedSubmissions || gradedSubmissions.length === 0) {
    return {
      analysis: null,
      message: 'You do not have any graded assignments to analyze.',
    };
  }

  const totalGrade = gradedSubmissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
  const averageGrade = totalGrade / gradedSubmissions.length;
  
  const highPerforming = gradedSubmissions.filter(sub => sub.grade && sub.grade >= 90).map(sub => sub.course.title);
  const needsImprovement = gradedSubmissions.filter(sub => sub.grade && sub.grade < 75).map(sub => sub.course.title);

  let summary = '';
  if (averageGrade >= 90) {
    summary = `Excellent work, ${user.name}! You're consistently performing at a high level. Your dedication is clear, and you're mastering the material.`;
  } else if (averageGrade >= 75) {
    summary = `Great job, ${user.name}! You're doing well and have a solid grasp on most topics. Keep up the consistent effort.`;
  } else {
    summary = `You've built a solid foundation, ${user.name}. There are opportunities for improvement, but you're on the right track. Let's focus on a few key areas to boost your scores.`;
  }

  // Simulate a short delay to make it feel like it's processing
  await new Promise(resolve => setTimeout(resolve, 750));

  return {
    analysis: {
      summary,
      strengths: [...new Set(highPerforming)],
      improvements: [...new Set(needsImprovement)],
    },
    message: 'Analysis successful.',
  };
}
