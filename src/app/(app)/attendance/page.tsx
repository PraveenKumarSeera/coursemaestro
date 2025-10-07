
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import { getAllAttendance } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function AttendancePage() {
    const { user } = await getSession();
    if (!user || user.role !== 'teacher') {
        notFound();
    }

    const attendanceRecords = await getAllAttendance();

    return (
        <div className="space-y-6">
            <div className='space-y-1'>
                <h1 className="text-3xl font-bold font-headline">Attendance Log</h1>
                <p className="text-muted-foreground">
                    A complete log of student check-ins for all courses.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Records</CardTitle>
                    <CardDescription>
                        Students are automatically marked as "Present" when they visit a course page for the first time on a given day.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {attendanceRecords.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendanceRecords.map(record => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className='h-8 w-8'>
                                                    <AvatarFallback>{record.student.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{record.student.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/courses/${record.course.id}`} className="hover:underline text-muted-foreground">
                                                {record.course.title}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{format(parseISO(record.date), 'PPP')}</TableCell>
                                        <TableCell className="text-center">
                                            {record.isPresent && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Present</Badge>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No attendance records have been created yet.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
