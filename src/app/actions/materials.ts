'use server';

import { revalidatePath } from 'next/cache';
import { parseMaterial } from "@/ai/flows/ai-material-parser";
import { addMaterial } from "@/lib/data";

type FormState = {
  message: string;
  success: boolean;
};

export async function uploadMaterialAction(
  courseId: string,
  title: string,
  fileName: string,
  fileType: string,
  fileDataUri: string,
): Promise<FormState> {

  if (!courseId || !title || !fileDataUri) {
    return {
        message: 'Please select a course, provide a title, and choose a file.',
        success: false,
    };
  }
  
  try {
    const { textContent } = await parseMaterial({ fileDataUri });
    
    await addMaterial({
      courseId,
      title,
      fileName: fileName,
      fileType: fileType,
      content: textContent,
    });
    
    // In a real app with a persistent DB, you would likely revalidate a path here
    // e.g., revalidatePath(`/courses/${courseId}?tab=materials`);

    return {
      message: 'Successfully uploaded and parsed material.',
      success: true,
    };
  } catch (error) {
    console.error('Material upload error:', error);
    return {
      message: 'Sorry, I encountered an error processing the document. Please try again.',
      success: false
    };
  }
}
