'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users } from 'lucide-react';
import type { Course, User } from '@/lib/types';
import { useStudyRooms } from '@/hooks/use-study-rooms';
import { useMemo } from 'react';
import Link from 'next/link';

export default function TeacherDashboardClient({ teacherCourses }: { teacherCourses: Course[], user: User }) {
    const { rooms } = useStudyRooms();
    
    const teacherCourseIds = useMemo(() => new Set(teacherCourses.map(c => c.id)), [teacherCourses]);
    
    const relevantRooms = useMemo(() => {
        return rooms.filter(room => teacherCourseIds.has(room.course.id));
    }, [rooms, teacherCourseIds]);

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Active Study Rooms</CardTitle>
                 <CardDescription>
                    Students have created these rooms for your courses. You can join to supervise.
                </CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                 {relevantRooms.length > 0 ? (
                    relevantRooms.map(room => (
                         <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-semibold">{room.name}</p>
                                <p className="text-sm text-muted-foreground">Course: {room.course.title} | Host: {room.host.name}</p>
                            </div>
                            <Button variant="secondary" asChild>
                                <Link href={`/study-rooms/${room.id}`}>
                                    Join to Supervise <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    ))
                 ) : (
                    <div className="text-center py-10">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Active Rooms</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            When students create study rooms for your courses, they will appear here.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
