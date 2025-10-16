
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import StudyRoomsLobby from '@/components/study-rooms/study-rooms-lobby';
import { getStudentEnrollments, getAllCourses } from '@/lib/data';
import type { Course } from '@/lib/types';


export default async function StudyRoomsPage() {
    const { user } = await getSession();
    if (!user || user.role !== 'student') {
        notFound();
    }

    const enrollments = await getStudentEnrollments(user.id);
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    const allCourses = await getAllCourses();
    const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id));


    return <StudyRoomsLobby user={user} enrolledCourses={enrolledCourses} />;
}
