'use client';

import type { Course, Certificate } from '@/lib/types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Award, Download, Loader2 } from 'lucide-react';
import { generateCertificateAction } from '@/app/actions/certificates';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

type CertificateWithCourse = Certificate & { course: Course };

function GenerateButton({ courseId, studentId }: { courseId: string, studentId: string }) {
    const [pending, setPending] = useState(false);
    const { toast } = useToast();

    const handleClick = async () => {
        setPending(true);
        const result = await generateCertificateAction(courseId, studentId);
        toast({
            title: result.success ? 'Success' : 'Error',
            description: result.message,
            variant: result.success ? 'default' : 'destructive',
        });
        setPending(false);
    }

    return (
        <Button onClick={handleClick} disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Award className="mr-2 h-4 w-4" />
                    Generate Certificate
                </>
            )}
        </Button>
    )
}


export default function CertificateClientPage({
  studentId,
  completedCourses,
  existingCertificates,
}: {
  studentId: string;
  completedCourses: Course[];
  existingCertificates: CertificateWithCourse[];
}) {

    const generatedCertificateCourseIds = new Set(existingCertificates.map(c => c.courseId));
    const newlyCompletedCourses = completedCourses.filter(c => !generatedCertificateCourseIds.has(c.id));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">My Certificates</h1>
        <p className="text-muted-foreground">
          Generate and view certificates for your completed courses.
        </p>
      </div>

      {newlyCompletedCourses.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Ready to Generate</CardTitle>
                  <CardDescription>You have completed the following courses. Generate your certificate to celebrate your achievement!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {newlyCompletedCourses.map(course => (
                      <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                              <p className="font-semibold">{course.title}</p>
                              <p className="text-sm text-muted-foreground">Congratulations on completing this course!</p>
                          </div>
                          <GenerateButton courseId={course.id} studentId={studentId} />
                      </div>
                  ))}
              </CardContent>
          </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Generated Certificates</CardTitle>
          <CardDescription>
            Here are the certificates you've already generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existingCertificates.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {existingCertificates.map((cert) => (
                <Card key={cert.id} className="flex flex-col justify-between">
                    <CardHeader>
                        <Award className="h-10 w-10 text-accent mb-4" />
                        <CardTitle className="font-headline">{cert.course.title}</CardTitle>
                        <CardDescription>Issued on {format(new Date(cert.issuedAt), 'PPP')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href={`/certificates/${cert.id}`}>
                                View Certificate
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              You haven't generated any certificates yet. Complete a course to get started!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
