

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createAssignment, createSubmission, gradeSubmission, getStudentsByCourse, getCourseById, getAssignmentById, getSubmissionById } from '@/lib/data';
import { getSession } from '@/lib/session';
import { createNotification } from '@/lib/data';

const createAssignmentSchema = z.object({
  courseId: z.string(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date',
  }),
});

type FormState = {
  message: string;
  success: boolean;
};

export async function createAssignmentAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = createAssignmentSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check your inputs.',
      success: false,
    };
  }
  
  try {
    const newAssignment = await createAssignment({
        ...validatedFields.data,
        dueDate: new Date(validatedFields.data.dueDate).toISOString(),
    });

    // Create notifications for all enrolled students
    const students = await getStudentsByCourse(newAssignment.courseId);
    for (const student of students) {
        await createNotification({
            userId: student.id,
            message: `New assignment posted: "${newAssignment.title}"`,
            link: `/courses/${newAssignment.courseId}?tab=assignments`,
        });
    }

    revalidatePath('/assignments');
    revalidatePath(`/courses/${newAssignment.courseId}`);
    return { message: 'Assignment created successfully.', success: true };
  } catch (error) {
    return { message: 'Failed to create assignment.', success: false };
  }
}

const submitAssignmentSchema = z.object({
    assignmentId: z.string(),
    courseId: z.string(),
    content: z.string().min(10, 'Submission content must be at least 10 characters.'),
});

export async function submitAssignmentAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const { user } = await getSession();
    if (!user) {
        return { message: 'You must be logged in to submit an assignment.', success: false };
    }

    const validatedFields = submitAssignmentSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return { message: 'Invalid submission data.', success: false };
    }

    try {
        const submission = await createSubmission({
            ...validatedFields.data,
            studentId: user.id,
        });

        // Create notification for the teacher
        const course = await getCourseById(submission.courseId);
        const assignment = await getAssignmentById(submission.assignmentId);
        if (course && assignment) {
            await createNotification({
                userId: course.teacherId,
                message: `${user.name} submitted "${assignment.title}"`,
                link: `/assignments/${submission.assignmentId}`,
            });
        }

        revalidatePath(`/courses/${validatedFields.data.courseId}`);
        return { message: 'Assignment submitted successfully!', success: true };
    } catch (e) {
        return { message: 'Failed to submit assignment.', success: false };
    }
}

const gradeSubmissionSchema = z.object({
    submissionId: z.string(),
    assignmentId: z.string(),
    grade: z.coerce.number().min(0).max(100),
    feedback: z.string().optional(),
});

export async function gradeSubmissionAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = gradeSubmissionSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return { message: 'Invalid grading data.', success: false };
    }
    
    try {
        await gradeSubmission(
            validatedFields.data.submissionId,
            validatedFields.data.grade,
            validatedFields.data.feedback || ''
        );

        // Create notification for the student
        const submission = await getSubmissionById(validatedFields.data.submissionId);
        const assignment = await getAssignmentById(validatedFields.data.assignmentId);

        if (submission && assignment) {
            await createNotification({
                userId: submission.studentId,
                message: `Your submission for "${assignment.title}" has been graded.`,
                link: '/my-grades',
            });
        }

        revalidatePath(`/assignments/${validatedFields.data.assignmentId}`);
        revalidatePath('/my-grades');
        return { message: 'Grade saved successfully.', success: true };
    } catch (e) {
        return { message: 'Failed to save grade.', success: false };
    }
}
