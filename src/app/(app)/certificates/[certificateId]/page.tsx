
import { getCertificateById } from "@/lib/data";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, GraduationCap } from "lucide-react";
import Link from 'next/link';

export default async function CertificatePage({ params }: { params: { certificateId: string } }) {
    const certificate = await getCertificateById(params.certificateId);

    if (!certificate) {
        notFound();
    }

    return (
        <div className="bg-muted min-h-screen py-12 px-4 flex items-center justify-center">
            <div className="w-full max-w-4xl bg-background border-4 border-primary rounded-lg shadow-2xl p-8 relative aspect-[1.414/1]">
                 <div className="absolute top-8 right-8">
                    <Link href="/my-certificates" className="text-muted-foreground hover:text-primary text-sm">
                        Back to My Certificates
                    </Link>
                </div>

                <div className="text-center space-y-4">
                    <GraduationCap className="h-16 w-16 mx-auto text-accent" />
                    <h1 className="text-4xl font-bold font-headline text-primary">Certificate of Completion</h1>
                    <p className="text-lg text-muted-foreground">This certifies that</p>
                </div>

                <div className="my-12 text-center">
                    <h2 className="text-5xl font-bold font-headline tracking-wider">{certificate.student.name}</h2>
                </div>

                <div className="text-center space-y-4">
                    <p className="text-lg text-muted-foreground">has successfully completed the course</p>
                    <h3 className="text-3xl font-semibold font-headline">{certificate.course.title}</h3>
                </div>

                <div className="mt-16 flex justify-between items-end">
                    <div className="text-left">
                        <p className="font-semibold border-t-2 border-muted-foreground pt-2">{certificate.course.teacher.name}</p>
                        <p className="text-sm text-muted-foreground">Lead Instructor</p>
                    </div>
                     <div className="text-center">
                        <p className="font-semibold border-t-2 border-muted-foreground pt-2">{format(new Date(certificate.issuedAt), 'PPP')}</p>
                        <p className="text-sm text-muted-foreground">Date of Completion</p>
                    </div>
                </div>
                 <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
                    Verification ID: {certificate.verificationId}
                </div>
            </div>
        </div>
    );
}
