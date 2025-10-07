'use server';

import { generateResume } from "@/ai/flows/ai-resume-builder";
import type { GradedSubmission, User } from "@/lib/types";

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

  try {
    const result = await generateResume({ 
        studentName: user.name,
        studentEmail: user.email,
        gradedSubmissions 
    });
    return {
      resumeMarkdown: result.resumeMarkdown,
      message: 'Resume generated successfully.',
    };
  } catch (error) {
    console.error('Resume builder error:', error);
    return {
      resumeMarkdown: null,
      message: 'Sorry, I encountered an error while generating your resume. Please try again.',
    };
  }
}
