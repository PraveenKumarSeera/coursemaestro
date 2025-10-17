

'use server';

import { revalidatePath } from 'next/cache';
import { enrollInCourse } from '@/lib/data';
import { getSession } from '@/lib/session';

type FormState = {
  message: string;
  success: boolean;
};

export async function enrollInCourseAction(
  courseId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    return { message: 'Only students can enroll in courses.', success: false };
  }

  try {
    const result = await enrollInCourse(user.id, courseId);
    if (!result) {
      return { message: 'You are already enrolled in this course.', success: false };
    }
    revalidatePath('/courses');
    revalidatePath(`/courses/${courseId}`); // Revalidate the specific course page
    return { message: 'Successfully enrolled!', success: true };
  } catch (error) {
    return { message: 'Failed to enroll in course.', success: false };
  }
}
