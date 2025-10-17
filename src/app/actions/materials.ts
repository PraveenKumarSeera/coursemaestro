
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
        message: 'Please provide a title and a link.',
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
    
    // This server-side revalidation is still good practice as a fallback
    revalidatePath(`/courses/${courseId}`);

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
