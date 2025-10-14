

'use server';

import { revalidatePath } from 'next/cache';
import { enrollInCourse, findUserById } from '@/lib/data';
import { initializeFirebase } from '@/firebase';

type FormState = {
  message: string;
  success: boolean;
};

export async function enrollInCourseAction(
  courseId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { auth } = initializeFirebase();
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    return { message: 'You must be logged in to enroll.', success: false };
  }

  const user = await findUserById(firebaseUser.uid);
  if (!user || user.role !== 'student') {
    return { message: 'Only students can enroll in courses.', success: false };
  }

  try {
    const result = await enrollInCourse(user.id, courseId);
    if (!result) {
      return { message: 'You are already enrolled in this course.', success: false };
    }
    revalidatePath('/courses');
    revalidatePath('/courses/browse');
    revalidatePath(`/courses/${courseId}`);
    return { message: 'Successfully enrolled!', success: true };
  } catch (error) {
    return { message: 'Failed to enroll in course.', success: false };
  }
}
