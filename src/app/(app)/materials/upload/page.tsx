
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import UploadMaterialsClient from '@/components/materials/upload-materials-client';
import { getTeacherCourses } from '@/lib/data';

export default async function UploadMaterialsPage() {
    const { user } = await getSession();
    if (!user || user.role !== 'teacher') {
        notFound();
    }
    const courses = await getTeacherCourses(user.id);

    return <UploadMaterialsClient courses={courses} />;
}
