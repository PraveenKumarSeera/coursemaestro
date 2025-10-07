'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { askAppGuide } from '@/app/actions/app-guide';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Sparkles, User, Bot, GraduationCap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import type { AppGuideInput } from '@/ai/flows/ai-app-guide';

type Message = {
  role: 'user' | 'model';
  content: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      <span className="sr-only">Send</span>
    </Button>
  );
}

const suggestedQuestions = [
    "What is CourseMaestro?",
    "What features are there for students?",
    "How can teachers use this app?",
    "Tell me about the AI features."
];

export default function AppGuideChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [state, dispatch] = useActionState(askAppGuide, {
    answer: '',
    question: '',
    history: [],
  });

  useEffect(() => {
    if (state.answer) {
      setMessages((prev) => {
        // Prevent duplicating the user's message if it was already added
        if (prev.length > 0 && prev[prev.length - 1].role === 'user' && prev[prev.length - 1].content === state.question) {
             return [...prev, { role: 'model', content: state.answer }];
        }
        return [
            ...prev,
            { role: 'user', content: state.question },
            { role: 'model', content: state.answer },
        ];
      });
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [state]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);

  const handleSuggestedQuestion = (question: string) => {
    if (inputRef.current) {
        inputRef.current.value = question;
        const formData = new FormData(formRef.current!);
        setMessages(prev => [...prev, { role: 'user', content: question }]);
        dispatch(formData);
    }
  }

  return (
    <Card className="w-full max-w-2xl h-[70vh] flex flex-col shadow-2xl">
        <CardHeader className='text-center'>
            <GraduationCap className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="font-headline bg-gradient-to-r from-primary via-accent to-primary text-transparent bg-clip-text">
                Welcome to CourseMaestro
            </CardTitle>
        </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm prose dark:prose-invert max-w-none">
                <p>Hello! I'm Maestro, your guide to this application. I can tell you about our features. What would you like to know?</p>
              </div>
            </div>

            {messages.map((message, index) => (
              <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
                 {message.role === 'user' ? (
                    <>
                        <div className="bg-primary/10 rounded-lg p-3 text-sm prose dark:prose-invert max-w-none">
                            <p>{message.content}</p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                    </>
                 ) : (
                    <>
                        <div className="p-2 bg-muted rounded-full">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg p-3 text-sm prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
                    </>
                 )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
         {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
                {suggestedQuestions.map(q => (
                    <Button key={q} variant="outline" size="sm" onClick={() => handleSuggestedQuestion(q)}>
                        {q}
                    </Button>
                ))}
            </div>
        )}
        <form ref={formRef} action={dispatch} className="flex w-full items-center space-x-2">
          <Input
            ref={inputRef}
            name="question"
            placeholder="Ask about our features..."
            autoComplete="off"
            required
          />
          <SubmitButton />
        </form>
      </CardFooter>
    </Card>
  );
}
