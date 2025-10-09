
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createAssignment, createSubmission, gradeSubmission, getStudentsByCourse, getCourseById, getAssignmentById, getSubmissionById, getStudentGrades, findUserById, createNotification } from '@/lib/data';
import { getSession } from '@/lib/session';
import { motivationalMessageFlow } from '@/ai/flows/ai-motivation-bot';
import type { MotivationBotOutput } from '@/lib/ai-types';

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
    revalidatePath('/', 'layout');
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
        revalidatePath('/', 'layout');
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
        const { submissionId, assignmentId, grade, feedback } = validatedFields.data;
        
        const submission = await getSubmissionById(submissionId);
        if (!submission) {
            return { message: 'Submission not found.', success: false };
        }
        
        // --- Motivation Bot Logic ---
        const allGrades = await getStudentGrades(submission.studentId);
        const previousGrades = allGrades.filter(s => s.id !== submission.id);


        if (previousGrades.length > 0) {
            const total = previousGrades.reduce((acc, sub) => acc + (sub.grade || 0), 0);
            const averageGrade = total / previousGrades.length;

            // Trigger if new grade is more than 10 points lower than average
            if (averageGrade > grade && (averageGrade - grade > 10)) {
                const student = await findUserById(submission.studentId);
                const assignment = await getAssignmentById(assignmentId);
                const course = assignment ? await getCourseById(assignment.courseId) : null;
                
                if (student && course) {
                    try {
                        const result: MotivationBotOutput = await motivationalMessageFlow({
                            studentName: student.name.split(' ')[0],
                            courseTitle: course.title,
                        });

                        await createNotification({
                            userId: student.id,
                            message: result.message,
                            link: '/my-grades',
                        });
                    } catch (aiError) {
                        console.error("AI Motivation Bot failed:", aiError);
                        // Don't block the grading process if AI fails
                    }
                }
            }
        }
        // --- End Motivation Bot Logic ---

        await gradeSubmission(
            submissionId,
            grade,
            feedback || ''
        );

        // Create notification for the student
        const assignmentForNotification = await getAssignmentById(assignmentId);
        if (submission && assignmentForNotification) {
            await createNotification({
                userId: submission.studentId,
                message: `Your submission for "${assignmentForNotification.title}" has been graded.`,
                link: '/my-grades',
            });
        }

        revalidatePath(`/assignments/${assignmentId}`);
        revalidatePath('/my-grades');
        revalidatePath('/', 'layout');
        return { message: 'Grade saved successfully.', success: true };
    } catch (e) {
        console.error(e);
        return { message: 'Failed to save grade.', success: false };
    }
}
