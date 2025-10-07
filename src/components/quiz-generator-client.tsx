'use client';
import { useState, useActionState, useRef, useCallback, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { generateQuizAndFlashcardsAction } from '@/app/actions/quiz-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Wand2, UploadCloud, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import type { Quiz, Flashcard } from '@/app/actions/quiz-generator';
import { cn } from '@/lib/utils';


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} size="lg">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Quiz & Flashcards
                </>
            )}
        </Button>
    );
}

function QuizDisplay({ quiz }: { quiz: Quiz }) {
    return (
        <Accordion type="single" collapsible className="w-full">
            {quiz.questions.map((q, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>
                        <div className="flex items-center justify-between w-full pr-4">
                            <span className="text-left font-medium">
                                {index + 1}. {q.question}
                            </span>
                            <Badge variant="outline">{q.type}</Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 pl-4">
                            {q.options.map((option, i) => (
                                <div key={i} className={`p-2 rounded-md ${option === q.answer ? 'bg-green-100 dark:bg-green-900/50' : 'bg-muted/50'}`}>
                                    <p className={option === q.answer ? 'font-bold text-green-700 dark:text-green-400' : ''}>{option}</p>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}


function FlashcardDisplay({ flashcards }: { flashcards: Flashcard[] }) {
    const [flippedCard, setFlippedCard] = useState<number | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((card, index) => (
                <div
                    key={index}
                    className="relative w-full h-40 cursor-pointer"
                    onClick={() => setFlippedCard(flippedCard === index ? null : index)}
                    style={{ perspective: '1000px' }}
                >
                    <div
                        className="relative w-full h-full text-center transition-transform duration-700"
                        style={{ transformStyle: 'preserve-3d', transform: flippedCard === index ? 'rotateY(180deg)' : 'none' }}
                    >
                        {/* Front of card */}
                        <div className="absolute w-full h-full flex items-center justify-center p-4 bg-card border rounded-lg shadow-sm" style={{ backfaceVisibility: 'hidden' }}>
                            <p className="font-semibold">{card.term}</p>
                        </div>
                        {/* Back of card */}
                        <div className="absolute w-full h-full flex items-center justify-center p-4 bg-muted border rounded-lg shadow-sm" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <p className="text-sm">{card.definition}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

const initialState = {
    quiz: null,
    flashcards: null,
    message: '',
};

export default function QuizGeneratorClient() {
    const [state, formAction] = useActionState(generateQuizAndFlashcardsAction, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

    if (!isMounted) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className='space-y-1'>
                <h1 className="text-3xl font-bold font-headline">AI Quiz Generator</h1>
                <p className="text-muted-foreground">
                    Paste your course notes, or upload a file to let AI create a quiz and flashcards for you.
                </p>
            </div>

            <form ref={formRef} action={formAction} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Course Material</CardTitle>
                        <CardDescription>Enter text, or upload a .pdf, .docx, or .pptx file.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            name="courseMaterial"
                            placeholder="Paste your notes here..."
                            className="h-24"
                        />

                        <div className="text-center text-muted-foreground my-2">OR</div>

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

            {state.quiz || state.flashcards ? (
                <Tabs defaultValue="quiz">
                    <TabsList>
                        <TabsTrigger value="quiz">Quiz</TabsTrigger>
                        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                    </TabsList>
                    <TabsContent value="quiz">
                        <Card>
                            <CardHeader>
                                <CardTitle>{state.quiz?.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {state.quiz && <QuizDisplay quiz={state.quiz} />}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="flashcards">
                        <Card>
                            <CardHeader>
                                <CardTitle>Generated Flashcards</CardTitle>
                                <CardDescription>Click on a card to flip it.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {state.flashcards && <FlashcardDisplay flashcards={state.flashcards} />}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[200px]">
                    <CardHeader>
                        <div className='p-4 bg-muted rounded-full mx-auto'>
                            <FileText className="h-8 w-8 text-accent" />
                        </div>
                        <CardTitle>Waiting for Content</CardTitle>
                        <CardDescription>Your generated quiz and flashcards will appear here.</CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}
