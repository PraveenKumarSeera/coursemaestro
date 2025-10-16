
'use client';

import type { User, Course, Attendance } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

type AttendanceRecord = Attendance & { student: User, course: Course };

type AttendanceClientProps = {
  attendanceRecords: AttendanceRecord[];
};

export default function AttendanceClient({ attendanceRecords }: AttendanceClientProps) {

    const convertToCSV = (data: AttendanceRecord[]) => {
        const headers = ['Student Name', 'Student Email', 'Course Title', 'Date', 'Status'];
        const rows = data.map(record => [
            `"${record.student.name}"`,
            `"${record.student.email}"`,
            `"${record.course.title}"`,
            format(parseISO(record.date), 'yyyy-MM-dd'),
            record.isPresent ? 'Present' : 'Absent'
        ].join(','));
        return [headers.join(','), ...rows].join('\n');
    };

    const handleDownload = () => {
        const csvData = convertToCSV(attendanceRecords);
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', 'attendance_log.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>All Records</CardTitle>
                    <CardDescription>
                        Students are automatically marked as "Present" when they visit a course page for the first time on a given day.
                    </CardDescription>
                </div>
                <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                </Button>
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
    );
}
