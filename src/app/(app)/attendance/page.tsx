
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import { getAllAttendance } from '@/lib/data';
import AttendanceClient from '@/components/attendance/attendance-client';

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
            <AttendanceClient attendanceRecords={attendanceRecords} />
        </div>
    );
}
