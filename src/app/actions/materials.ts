
'use server';

import { revalidatePath } from 'next/cache';
import { addMaterial } from "@/lib/data";

type FormState = {
  message: string;
  success: boolean;
};

export async function addMaterialLinkAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {

  const courseId = formData.get('courseId') as string;
  const title = formData.get('title') as string;
  const link = formData.get('link') as string;

  if (!courseId || !title || !link) {
    return {
        message: 'Please select a course, provide a title, and paste a link.',
        success: false,
    };
  }
  
  // Basic URL validation
  try {
    new URL(link);
  } catch (_) {
    return { message: 'Please provide a valid URL.', success: false };
  }
  
  try {
    await addMaterial({
      courseId,
      title,
      link,
    });
    
    // Revalidate the course detail page and the main courses page
    revalidatePath(`/courses/${courseId}`);
    revalidatePath('/courses');

    return {
      message: 'Successfully added material link.',
      success: true,
    };
  } catch (error) {
    console.error('Material upload error:', error);
    return {
      message: 'Sorry, I encountered an error adding the link. Please try again.',
      success: false
    };
  }
}
