

import { initializeFirebase } from '@/firebase';
import { notFound } from 'next/navigation';
import { getStudentEnrollments } from '@/lib/data';
import AiAssistantPageClient from '@/components/ai-assistant-page-client';
import { getAllCourses, findUserById } from '@/lib/data';
import type { Course } from '@/lib/types';


export default async function AiAssistantPage() {
    const { auth } = initializeFirebase();
    const firebaseUser = auth.currentUser;
    if(!firebaseUser) {
        notFound();
    }
    const user = await findUserById(firebaseUser.uid);
    if (!user || user.role !== 'student') {
        notFound();
    }

    const enrollments = await getStudentEnrollments(user.id);
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    const allCourses = await getAllCourses();
    const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id));

    return <AiAssistantPageClient courses={enrolledCourses} />;
}
