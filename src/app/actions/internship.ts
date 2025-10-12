
'use server';

import { generateInternshipTask } from '@/ai/flows/ai-internship-task-generator';
import { gradeInternshipSubmission } from '@/ai/flows/ai-internship-grader';
import type { InternshipTask, InternshipDomain, InternshipGrade } from '@/lib/types';
import { InternshipTaskGeneratorOutputSchema } from '@/lib/ai-types';

type TaskActionState = {
  task: InternshipTask | null;
  message: string | null;
};

type GradeActionState = {
  grade: InternshipGrade | null;
  message: string | null;
};

export async function generateInternshipTaskAction(
  domain: InternshipDomain
): Promise<TaskActionState> {
  if (!domain) {
    return { task: null, message: 'Please select a domain.' };
  }

  try {
    const result = await generateInternshipTask({
      domainName: domain.name,
      domainDescription: domain.description,
    });
    return {
      task: result,
      message: 'Task generated successfully.',
    };
  } catch (error: any) {
    return {
      task: null,
      message: `Failed to generate task: ${error.message || 'Please try again.'}`,
    };
  }
}

export async function gradeInternshipSubmissionAction(
    { taskTitle, taskDescription, submissionText }: { taskTitle: string, taskDescription: string, submissionText: string }
): Promise<GradeActionState> {
    if (!submissionText) {
        return { grade: null, message: 'Submission cannot be empty.' };
    }

    try {
        const result = await gradeInternshipSubmission({
            taskTitle,
            taskDescription,
            submissionText,
        });
        return {
            grade: result,
            message: 'Submission graded successfully.',
        };
    } catch (error: any) {
        return {
            grade: null,
            message: `Failed to grade submission: ${error.message || 'Please try again.'}`,
        };
    }
}
