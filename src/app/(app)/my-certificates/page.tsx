
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import { getCompletedCoursesForStudent, getStudentCertificates } from '@/lib/data';
import type { Course, Certificate } from '@/lib/types';
import CertificateClientPage from '@/components/certificates/certificate-client-page';

export default async function MyCertificatesPage() {
    const { user } = await getSession();
    if (!user || user.role !== 'student') {
        notFound();
    }

    const completedCourses = await getCompletedCoursesForStudent(user.id);
    const existingCertificates = await getStudentCertificates(user.id);
    
    return (
        <CertificateClientPage
            studentId={user.id}
            completedCourses={completedCourses}
            existingCertificates={existingCertificates}
        />
    );
}
