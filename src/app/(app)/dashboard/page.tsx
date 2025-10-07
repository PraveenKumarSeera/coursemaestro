import { getSession } from '@/lib/session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, GraduationCap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    getTeacherCourses,
    getStudentEnrollments
} from '@/lib/data';

export default async function DashboardPage() {
    const { user } = await getSession();

    if (!user) {
        return null; // Or redirect, though layout should handle this
    }

    const isTeacher = user.role === 'teacher';

    const stats = isTeacher ?
        await getTeacherDashboardStats(user.id) :
        await getStudentDashboardStats(user.id);

    return (
        <div>
            <h1 className="text-3xl font-bold font-headline mb-6">
                Welcome back, {user.name.split(' ')[0]}!
            </h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                            {stat.link && (
                                <Button variant="outline" size="sm" asChild className="mt-4">
                                    <Link href={stat.link.href}>
                                        {stat.link.text} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

async function getTeacherDashboardStats(teacherId: string) {
    const courses = await getTeacherCourses(teacherId);
    const studentCount = courses.reduce((acc, course) => acc + (course.enrollments || []).length, 0);

    return [
        { title: 'Courses Taught', value: courses.length, subtitle: 'Total active courses', icon: BookOpen, link: { href: "/courses", text: "Manage Courses"} },
        { title: 'Total Students', value: studentCount, subtitle: 'Across all courses', icon: Users, link: { href: "/students", text: "View Students"} },
        { title: 'Pending Submissions', value: '12', subtitle: 'Awaiting grading', icon: GraduationCap },
    ];
}

async function getStudentDashboardStats(studentId: string) {
    const enrollments = await getStudentEnrollments(studentId);
    return [
        { title: 'Enrolled Courses', value: enrollments.length, subtitle: 'Ready to learn', icon: BookOpen, link: { href: "/courses", text: "View Courses"} },
        { title: 'Assignments Due', value: '3', subtitle: 'In the next 7 days', icon: ClipboardList },
        { title: 'Overall Grade', value: 'B+', subtitle: 'Keep it up!', icon: GraduationCap },
    ];
}
