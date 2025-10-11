
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createCourse, updateCourse, deleteCourse } from '@/lib/data';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration: z.string().min(1, 'Duration is required'),
  videoUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

type FormState = {
  message: string;
  success: boolean;
};

export async function createCourseAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { user } = await getSession();
  if (!user || user.role !== 'teacher') {
    return { message: 'Permission denied', success: false };
  }

  const validatedFields = courseSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check your inputs.',
      success: false,
    };
  }
  
  try {
    await createCourse(validatedFields.data, user.id);
    revalidatePath('/courses');
    return { message: 'Course created successfully.', success: true };
  } catch (error) {
    return { message: 'Failed to create course.', success: false };
  }
}

export async function updateCourseAction(
  courseId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
    const { user } = await getSession();
    if (!user || user.role !== 'teacher') {
        return { message: 'Permission denied', success: false };
    }

    const validatedFields = courseSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
        message: 'Invalid form data. Please check your inputs.',
        success: false,
        };
    }

    try {
        await updateCourse(courseId, validatedFields.data);
        revalidatePath('/courses');
        revalidatePath(`/courses/${courseId}`);
        return { message: 'Course updated successfully.', success: true };
    } catch (error) {
        return { message: 'Failed to update course.', success: false };
    }
}

export async function deleteCourseAction(courseId: string): Promise<void> {
    const { user } = await getSession();
    if (!user || user.role !== 'teacher') {
        throw new Error('Permission denied');
    }
    
    // In a real app, you'd also check if the user is the owner of the course
    await deleteCourse(courseId);
    revalidatePath('/courses');
    redirect('/courses');
}
