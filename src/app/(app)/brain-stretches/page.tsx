
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import { getStudentEnrollments, getAllCourses } from '@/lib/data';
import BrainStretchClient from '@/components/brain-stretches/brain-stretch-client';

export default async function BrainStretchesPage() {
    const { user } = await getSession();
    if (!user || user.role !== 'student') {
        notFound();
    }

    const enrollments = await getStudentEnrollments(user.id);
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    const allCourses = await getAllCourses();
    const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id));

    return <BrainStretchClient courses={enrolledCourses} />;
}
