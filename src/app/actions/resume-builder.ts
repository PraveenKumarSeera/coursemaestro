
'use server';

import { generateResume } from "@/ai/flows/ai-resume-builder";
import type { GradedSubmission, User } from "@/lib/types";
import type { ResumeBuilderOutput } from '@/lib/ai-types';

type ActionState = {
  resumeMarkdown: string | null;
  message: string | null;
};

export async function generateResumeAction(
  { user, gradedSubmissions }: { user: User, gradedSubmissions: GradedSubmission[] }
): Promise<ActionState> {
  
  if (!gradedSubmissions || gradedSubmissions.length === 0) {
    return {
      resumeMarkdown: null,
      message: 'You need at least one graded assignment to build a resume.',
    };
  }

  const studentPerformanceData = gradedSubmissions
      .filter(sub => sub.grade && sub.grade >= 85)
      .map(sub => `Course: "${sub.course.title}", Assignment: "${sub.assignment.title}", Grade: ${sub.grade}%`)
      .join('\n');

  if (!studentPerformanceData) {
    return {
      resumeMarkdown: null,
      message: 'You need at least one assignment with a grade of 85% or higher to build a resume.',
    };
  }

  try {
    const result = await generateResume({
        studentName: user.name,
        studentEmail: user.email,
        studentPerformanceData,
    });
    return {
        resumeMarkdown: result.resumeMarkdown,
        message: 'Resume generated successfully.',
    };
  } catch (error) {
    console.error('AI Resume Builder Error:', error);
    return {
        resumeMarkdown: null,
        message: 'There was an error generating your resume. Please try again later.',
    };
  }
}
