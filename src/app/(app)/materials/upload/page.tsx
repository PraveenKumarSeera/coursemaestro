
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import { getTeacherCourses } from '@/lib/data';
import UploadForm from '@/components/materials/upload-form';

export default async function UploadMaterialsPage() {
    const { user } = await getSession();
    if (!user || user.role !== 'teacher') {
        notFound();
    }

    const courses = await getTeacherCourses(user.id);

    return (
        <div className="space-y-6">
            <div className='space-y-1'>
                <h1 className="text-3xl font-bold font-headline">Upload Course Materials</h1>
                <p className="text-muted-foreground">
                    Upload documents for your courses. These can be used later for students to view or for generating AI content.
                </p>
            </div>

            <UploadForm courses={courses} />
        </div>
    );
}
