
'use client';
import { useState, useActionState, useRef, useCallback, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { uploadMaterialAction } from '@/app/actions/materials';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, X } from 'lucide-react';
import type { Course } from '@/lib/types';
import { cn } from '@/lib/utils';
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
import { getTeacherCourses } from '@/lib/data';


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

export default function UploadMaterialsPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [state, formAction] = useActionState(uploadMaterialAction, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Since this is now a client component, we fetch the courses on the client.
        // This is a temporary measure. In a real app with a logged-in user context,
        // you might pass the user ID from a client-side session hook.
        // For now, we assume a teacher ID of '1' to fetch courses.
        getTeacherCourses('1').then(setCourses);
    }, []);

    useEffect(() => {
        if(state.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                formRef.current?.reset();
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    }, [state, toast]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            if(fileInputRef.current) {
                fileInputRef.current.files = e.dataTransfer.files;
            }
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    return (
        <div className="space-y-6">
            <div className='space-y-1'>
                <h1 className="text-3xl font-bold font-headline">Upload Course Materials</h1>
                <p className="text-muted-foreground">
                    Upload documents for your courses. These can be used later for students to view or for generating AI content.
                </p>
            </div>

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
                        <div
                            className={cn(
                                'border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors',
                                isDragging && 'bg-accent/10 border-accent',
                                file && 'border-primary/50'
                            )}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                name="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.docx,.pptx,.doc"
                            />
                            <UploadCloud className={cn("h-10 w-10 mb-4", file ? 'text-primary' : 'text-muted-foreground')} />
                            
                            {file ? (
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-primary">{file.name}</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 rounded-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-semibold">Drag & drop a file here, or click to select</p>
                                    <p className="text-sm text-muted-foreground">PDF, DOCX, or PPTX</p>
                                </div>
                            )}
                        </div>

                    </CardContent>
                </Card>
                <SubmitButton />
            </form>

        </div>
    );
}
