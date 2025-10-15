'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, FileDown, Clipboard, ArrowLeft, ArrowRight, Check, Briefcase, GraduationCap, User as UserIcon } from 'lucide-react';
import { generateResumeAction } from '@/app/actions/resume-builder';
import type { GradedSubmission, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';

const templates = [
  { id: 'modern', name: 'Modern', imageUrl: 'https://picsum.photos/seed/resume1/400/566' },
  { id: 'professional', name: 'Professional', imageUrl: 'https://picsum.photos/seed/resume2/400/566' },
  { id: 'creative', name: 'Creative', imageUrl: 'https://picsum.photos/seed/resume3/400/566' },
];

export default function ResumeBuilderClient({ user, gradedSubmissions }: { user: User, gradedSubmissions: GradedSubmission[] }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: '',
    experience: '',
    education: [...new Set(gradedSubmissions.map(s => s.course.title))].join(', '),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resume, setResume] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeneration = async () => {
    if (!selectedTemplate) return;
    setIsLoading(true);
    setError(null);
    setResume(null);

    const actionResult = await generateResumeAction(user, gradedSubmissions, formData, selectedTemplate);

    if (actionResult.resumeMarkdown) {
        setResume(actionResult.resumeMarkdown);
        setStep(3);
    } else {
        setError(actionResult.message || 'An unknown error occurred.');
    }

    setIsLoading(false);
  };

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && resume) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>Resume</title>
                    <style>
                        @import url('https://rsms.me/inter/inter.css');
                        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
                        .prose { max-width: 800px; margin: 2rem auto; font-size: 14px; line-height: 1.6; }
                        .prose h1, .prose h2, .prose h3 { margin: 0; }
                        .prose h1 { font-size: 2em; }
                        .prose h2 { font-size: 1.5em; border-bottom: 1px solid #ccc; padding-bottom: 0.25em; margin-top: 1em; }
                        .prose ul { padding-left: 1.5em; margin-top: 0.5em; }
                        .prose p { margin-top: 0.5em; }
                        @media print {
                            @page { margin: 20mm; }
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <div class="prose">${resume}</div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
  };

  const steps = ["Select Template", "Enter Information", "Preview & Download"];
  const currentStepInfo = steps[step - 1];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">AI Resume Builder</h1>
        <p className="text-muted-foreground">
          Generate a professional resume from your coursework and grades.
        </p>
      </div>

       <Card>
        <CardHeader>
            <Progress value={(step / 3) * 100} className="mb-4" />
            <div className="flex justify-between items-center">
                <div>
                    <CardDescription>Step {step} of 3</CardDescription>
                    <CardTitle className="font-headline">{currentStepInfo}</CardTitle>
                </div>
                {step > 1 && (
                    <Button variant="ghost" onClick={() => setStep(step - 1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
            {step === 1 && (
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {templates.map(template => (
                            <Card 
                                key={template.id} 
                                className={cn(
                                    "cursor-pointer hover:border-primary transition-all",
                                    selectedTemplate === template.id && "border-primary ring-2 ring-primary"
                                )}
                                onClick={() => setSelectedTemplate(template.id)}
                            >
                                <CardContent className="p-0">
                                    <Image src={template.imageUrl} alt={template.name} width={400} height={566} className="rounded-t-lg" data-ai-hint="resume template" />
                                </CardContent>
                                <CardFooter className="p-4 flex items-center justify-between">
                                    <p className="font-semibold">{template.name}</p>
                                    {selectedTemplate === template.id && <Check className="h-5 w-5 text-primary" />}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                     <div className="text-center mt-6">
                        <Button size="lg" disabled={!selectedTemplate} onClick={() => setStep(2)}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {step === 2 && (
                 <div className="max-w-2xl mx-auto space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2"><UserIcon className="h-4 w-4" /> Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="(123) 456-7890" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="education" className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Education / Courses</Label>
                        <Textarea id="education" name="education" value={formData.education} onChange={handleInputChange} placeholder="List your degrees and relevant courses" />
                         <p className="text-xs text-muted-foreground">We've pre-filled this with your completed courses.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="experience" className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Professional Experience</Label>
                        <Textarea id="experience" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="Describe your work experience..." className="min-h-32" />
                    </div>
                     <div className="text-center mt-6">
                        <Button size="lg" onClick={handleGeneration} disabled={isLoading}>
                             {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Resume...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Generate Resume
                                </>
                            )}
                        </Button>
                        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                    </div>
                 </div>
            )}

            {step === 3 && resume && (
                <div>
                     <div className="flex gap-2 justify-end mb-4">
                        <Button onClick={handleDownload} variant="default">
                            <FileDown className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                    <ScrollArea className="h-[600px] w-full rounded-md border p-6 bg-muted/20">
                        <article className="prose dark:prose-invert max-w-none bg-background p-8 shadow-md" dangerouslySetInnerHTML={{ __html: resume.replace(/\\n/g, '<br />') }} />
                    </ScrollArea>
                </div>
            )}
        </CardContent>
       </Card>
    </div>
  );
}