'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, FileDown, Clipboard } from 'lucide-react';
import { generateResumeAction } from '@/app/actions/resume-builder';
import type { GradedSubmission, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

export default function ResumeBuilderClient({ user, gradedSubmissions }: { user: User, gradedSubmissions: GradedSubmission[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [resume, setResume] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGeneration = async () => {
    setIsLoading(true);
    setError(null);
    setResume(null);

    const actionResult = await generateResumeAction({ user, gradedSubmissions });

    if (actionResult.resumeMarkdown) {
        setResume(actionResult.resumeMarkdown);
    } else {
        setError(actionResult.message || 'An unknown error occurred.');
    }

    setIsLoading(false);
  };
  
  const handleCopy = () => {
    if (resume) {
        navigator.clipboard.writeText(resume);
        toast({
            title: 'Copied to Clipboard',
            description: 'Your resume content has been copied.',
        });
    }
  }

  const hasEnoughData = gradedSubmissions.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">AI Resume Builder</h1>
        <p className="text-muted-foreground">
          Generate a professional resume from your coursework and grades.
        </p>
      </div>

      {!resume && (
        <Card>
            <CardHeader>
            <CardTitle>Generate Your Resume</CardTitle>
            <CardDescription>
                Our AI will create a resume highlighting your skills and accomplishments based on your academic performance.
            </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
            {!hasEnoughData ? (
                <Alert>
                    <FileDown className="h-4 w-4" />
                    <AlertTitle>More Data Needed</AlertTitle>
                    <AlertDescription>
                        You need at least one graded assignment before the AI can build your resume. Keep up the great work!
                    </AlertDescription>
                </Alert>
            ) : (
                <Button onClick={handleGeneration} disabled={isLoading} size="lg">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Building Your Resume...
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate My Resume
                        </>
                    )}
                </Button>
            )}
            {error && <p className="text-destructive text-sm text-center mt-4">{error}</p>}
            </CardContent>
        </Card>
      )}
      
      {resume && (
        <Card>
            <CardHeader className='flex-row items-center justify-between'>
                <div className='space-y-1'>
                    <CardTitle>Your Generated Resume</CardTitle>
                    <CardDescription>
                       Here is your AI-generated resume. You can copy the content and paste it into any Markdown editor.
                    </CardDescription>
                </div>
                <Button onClick={handleCopy} variant="outline">
                    <Clipboard className="mr-2 h-4 w-4" />
                    Copy
                </Button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px] w-full rounded-md border p-4 bg-muted/20">
                     <article className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: resume.replace(/\\n/g, '<br />') }} />
                </ScrollArea>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
