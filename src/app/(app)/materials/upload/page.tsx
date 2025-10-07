
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
                <h1 className="text-3xl font-bold font-headline">Add Course Materials</h1>
                <p className="text-muted-foreground">
                    Add a shareable link to a document (e.g., Google Drive) for your course.
                </p>
            </div>

            <UploadForm courses={courses} />
        </div>
    );
}
