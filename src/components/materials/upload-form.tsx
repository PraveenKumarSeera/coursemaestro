
'use client';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { uploadMaterialAction } from '@/app/actions/materials';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud } from 'lucide-react';
import type { Course } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} size="lg">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                </>
            ) : (
                <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload and Process
                </>
            )}
        </Button>
    );
}

const initialState = {
    message: '',
    success: false,
};

export default function UploadForm({ courses }: { courses: Course[] }) {
    const [state, formAction] = useActionState(uploadMaterialAction, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                formRef.current?.reset();
            }
        }
    }, [state, toast]);

    return (
        <form ref={formRef} action={formAction} className="space-y-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Material Details</CardTitle>
                    <CardDescription>Select a course, give your material a title, and upload the file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="courseId">Course</Label>
                        <Select name="courseId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Material Title</Label>
                        <Input id="title" name="title" required placeholder="e.g., Chapter 1: Introduction" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="file">File</Label>
                        <Input
                            id="file"
                            name="file"
                            type="file"
                            required
                            accept=".pdf,.docx,.pptx,.doc"
                        />
                         <p className="text-sm text-muted-foreground">Supported formats: PDF, DOCX, PPTX.</p>
                    </div>
                </CardContent>
            </Card>
            <SubmitButton />
        </form>
    );
}
