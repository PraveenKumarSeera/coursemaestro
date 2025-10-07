'use client';
import { useState, useRef, useCallback, FormEvent, useTransition } from 'react';
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

function SubmitButton({ disabled, isPending }: { disabled: boolean, isPending: boolean }) {
    return (
        <Button type="submit" disabled={isPending || disabled} size="lg">
            {isPending ? (
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

export default function UploadForm({ courses }: { courses: Course[] }) {
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [title, setTitle] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        if (!file || !selectedCourse || !title) {
            toast({
                title: 'Error',
                description: 'Please fill out all fields and select a file.',
                variant: 'destructive',
            });
            return;
        }
        
        // We need to append the file manually as it's managed by state
        formData.append('file', file);

        startTransition(async () => {
            const result = await uploadMaterialAction(formData);

            toast({
                title: result.success ? 'Success' : 'Error',
                description: result.message,
                variant: result.success ? 'default' : 'destructive',
            });

            if (result.success) {
                formRef.current?.reset();
                setFile(null);
                setSelectedCourse('');
                setTitle('');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
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
        <form ref={formRef} onSubmit={handleSubmit} id="upload-form" className="space-y-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Material Details</CardTitle>
                    <CardDescription>Select a course, give your material a title, and upload the file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="courseId">Course</Label>
                        <Select name="courseId" required onValueChange={setSelectedCourse} value={selectedCourse}>
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
                        <Input id="title" name="title" required placeholder="e.g., Chapter 1: Introduction" value={title} onChange={(e) => setTitle(e.target.value)} />
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
                                    onClick={clearFile}
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
            <SubmitButton isPending={isPending} disabled={!selectedCourse || !file || !title} />
        </form>
    );
}
