
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

// This component has been temporarily disabled due to a persistent bug.
export default function TeacherDashboardClient({ teacherCourses, user }: { teacherCourses: any[], user: any }) {
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Active Study Rooms</CardTitle>
                 <CardDescription>
                    This feature is currently undergoing maintenance.
                </CardDescription>
            </CardHeader>
             <CardContent>
                 <div className="text-center py-10">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Feature Under Maintenance</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        We are working hard to resolve an issue with real-time updates.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
