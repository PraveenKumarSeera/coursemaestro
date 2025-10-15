
'use server';

import { generateResume } from "@/ai/flows/ai-resume-builder";
import type { GradedSubmission, User } from "@/lib/types";

type ActionState = {
  resumeMarkdown: string | null;
  message: string | null;
};

export async function generateResumeAction(
  user: User, 
  gradedSubmissions: GradedSubmission[],
  formData: {
    name: string;
    email: string;
    phone: string;
    experience: string;
    education: string;
  },
  template: string,
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

  try {
    const result = await generateResume({
        studentName: formData.name,
        studentEmail: formData.email,
        studentPhone: formData.phone,
        education: formData.education,
        experience: formData.experience,
        studentPerformanceData,
        template,
    });
    return {
        resumeMarkdown: result.resumeMarkdown,
        message: 'Resume generated successfully.',
    };
  } catch (error: any) {
    return {
        resumeMarkdown: null,
        message: `Failed to generate resume: ${error.message || 'Please try again.'}`,
    };
  }
}
