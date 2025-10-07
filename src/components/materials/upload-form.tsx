'use client';
import { useState, useRef, useEffect } from 'react';
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

type FormState = {
    message: string;
    success: boolean;
};

export default function UploadForm({ courses }: { courses: Course[] }) {
    const [state, setState] = useState<FormState>({ message: '', success: false });
    const [pending, setPending] = useState(false);
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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPending(true);

        const formData = new FormData(event.currentTarget);
        const courseId = formData.get('courseId') as string;
        const title = formData.get('title') as string;
        const file = formData.get('file') as File | null;

        if (!courseId || !title || !file || file.size === 0) {
            setState({
                message: 'Please select a course, provide a title, and choose a file.',
                success: false,
            });
            setPending(false);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const fileDataUri = reader.result as string;
            const result = await uploadMaterialAction(courseId, title, file.name, file.type, fileDataUri);
            setState(result);
            setPending(false);
        };
        reader.onerror = () => {
            setState({ message: 'Failed to read file.', success: false });
            setPending(false);
        };
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
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
                            accept=".pdf,.docx,.pptx"
                        />
                         <p className="text-sm text-muted-foreground">Supported formats: PDF, DOCX, PPTX.</p>
                    </div>
                </CardContent>
            </Card>
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
        </form>
    );
}