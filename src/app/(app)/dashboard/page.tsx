

import { getSession } from '@/lib/session';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Users, GraduationCap, ArrowRight, ClipboardList, Flame, Award, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDashboardData, type StudentDashboardStats, type TeacherDashboardStats, getTeacherCourses } from '@/lib/data';
import type { LucideIcon } from 'lucide-react';
import TeacherPerformanceChart from '@/components/dashboard/teacher-performance-chart';
import LearningEfficiencyMeter from '@/components/dashboard/learning-efficiency-meter';
import TeacherDashboardClient from '@/components/dashboard/teacher-dashboard-client';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const iconMap: { [key: string]: LucideIcon } = {
    BookOpen,
    Users,
    GraduationCap,
    ClipboardList,
    Flame,
};


export default async function DashboardPage() {
    const { user } = await getSession();

    if (!user) {
        return null; // Or redirect, though layout should handle this
    }

    const dashboardData = await getDashboardData(user.id, user.role);
    const teacherCourses = user.role === 'teacher' ? await getTeacherCourses(user.id) : [];

    return (
        <div>
            <h1 className="text-3xl font-bold font-headline mb-6">
                Welcome back, {user.name.split(' ')[0]}!
            </h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {user.role === 'student' && 'streak' in dashboardData && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
                             <Flame className={cn("h-4 w-4 text-muted-foreground", dashboardData.streak > 0 && "text-orange-500 fill-orange-400")} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.streak} Day{dashboardData.streak !== 1 && 's'}</div>
                            <p className="text-xs text-muted-foreground">Keep it going by checking in daily!</p>
                        </CardContent>
                    </Card>
                )}
                 {user.role === 'teacher' && 'studentOfTheWeek' in dashboardData && (dashboardData as TeacherDashboardStats).studentOfTheWeek && (
                    <Card className="bg-gradient-to-tr from-primary/10 via-background to-background">
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Student Spotlight</CardTitle>
                             <Award className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{(dashboardData as TeacherDashboardStats).studentOfTheWeek!.studentName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-lg font-bold font-headline">{(dashboardData as TeacherDashboardStats).studentOfTheWeek!.studentName}</p>
                                    <p className="text-xs text-primary font-semibold">{(dashboardData as TeacherDashboardStats).studentOfTheWeek!.reason}</p>
                                </div>
                            </div>
                             <p className="text-xs text-muted-foreground mt-2">Weekly Average Grade: <strong>{(dashboardData as TeacherDashboardStats).studentOfTheWeek!.averageGrade}%</strong></p>
                        </CardContent>
                    </Card>
                )}
                {dashboardData.stats.map((stat, index) => {
                    const Icon = iconMap[stat.icon];
                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
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
                    )
                })}

                 {user.role === 'student' && 'learningEfficiency' in dashboardData && (
                    <LearningEfficiencyMeter 
                        efficiencyData={(dashboardData as StudentDashboardStats).learningEfficiency} 
                    />
                )}
            </div>
            
            {user.role === 'teacher' && (
                <>
                    <TeacherDashboardClient user={user} teacherCourses={teacherCourses} />
                    {'coursePerformances' in dashboardData && dashboardData.coursePerformances && dashboardData.coursePerformances.length > 0 && (
                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            {(dashboardData as TeacherDashboardStats).coursePerformances.map((performance) => (
                                <TeacherPerformanceChart 
                                    key={performance.courseId} 
                                    data={performance.gradeDistribution} 
                                    courseTitle={performance.courseTitle}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
