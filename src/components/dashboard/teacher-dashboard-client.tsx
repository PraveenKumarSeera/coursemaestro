
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users } from 'lucide-react';
import type { Course, User } from '@/lib/types';
import { useMemo } from 'react';
import Link from 'next/link';

export default function TeacherDashboardClient({ teacherCourses }: { teacherCourses: Course[], user: User }) {
    
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Supervision Panel</CardTitle>
                 <CardDescription>
                    Monitor real-time student activities here.
                </CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                 
                <div className="text-center py-10">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Active Features</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Real-time supervision features will appear here when available.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
