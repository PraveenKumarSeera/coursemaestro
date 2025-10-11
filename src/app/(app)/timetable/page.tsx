
import { getSession } from '@/lib/session';
import { getStudentEnrollments, getAssignmentsByCourse, getAllCourses } from '@/lib/data';
import { notFound } from 'next/navigation';
import TimetableClientPage from '@/components/timetable/timetable-client-page';

export default async function TimetablePage() {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    notFound();
  }

  const enrollments = await getStudentEnrollments(user.id);
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  
  const allCourses = await getAllCourses();
  const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id));

  let upcomingAssignments = [];
  for (const courseId of enrolledCourseIds) {
    const courseAssignments = await getAssignmentsByCourse(courseId);
    // Add courseTitle to each assignment for the AI context
    const assignmentsWithCourseTitle = courseAssignments.map(a => ({
        ...a,
        courseTitle: enrolledCourses.find(c => c.id === a.courseId)?.title || 'Unknown Course'
    }));
    upcomingAssignments.push(...assignmentsWithCourseTitle);
  }

  // Filter for assignments due in the future
  upcomingAssignments = upcomingAssignments
    .filter(a => new Date(a.dueDate) > new Date())
    .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());


  return <TimetableClientPage enrolledCourses={enrolledCourses} upcomingAssignments={upcomingAssignments} />;
}
