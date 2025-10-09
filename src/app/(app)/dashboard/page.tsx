import { getSession } from '@/lib/session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, GraduationCap, ArrowRight, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDashboardData } from '@/lib/data';
import type { LucideIcon } from 'lucide-react';
import TeacherPerformanceChart from '@/components/dashboard/teacher-performance-chart';

const iconMap: { [key: string]: LucideIcon } = {
    BookOpen,
    Users,
    GraduationCap,
    ClipboardList,
};


export default async function DashboardPage() {
    const { user } = await getSession();

    if (!user) {
        return null; // Or redirect, though layout should handle this
    }

    const { stats, gradeDistribution } = await getDashboardData(user.id, user.role);

    return (
        <div>
            <h1 className="text-3xl font-bold font-headline mb-6">
                Welcome back, {user.name.split(' ')[0]}!
            </h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => {
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
            </div>
            
            {user.role === 'teacher' && gradeDistribution && (
                <div className="mt-6">
                    <TeacherPerformanceChart data={gradeDistribution} />
                </div>
            )}
        </div>
    );
}
