
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2, Bot, User, Wand2, Sparkles, Send } from 'lucide-react';
import { chat, type ChatInput } from '@/ai/flows/ai-chat-bot';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePathname } from 'next/navigation';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [courseContext, setCourseContext] = useState('');

  useEffect(() => {
    // Basic context sniffing from URL
    const pathParts = pathname.split('/');
    if (pathParts.includes('courses') && pathParts.length > 2) {
        const courseId = pathParts[pathParts.indexOf('courses') + 1];
        setCourseContext(`The user is on the course page for course ID: ${courseId}.`);
    } else {
        setCourseContext('');
    }

    // Reset chat on navigation
    setMessages([]);
  }, [pathname]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            setTimeout(() => {
                viewport.scrollTop = viewport.scrollHeight;
            }, 100);
        }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const chatInput: ChatInput = { history: newMessages, courseContext };
      const result = await chat(chatInput);
      setMessages((prev) => [...prev, { role: 'model', content: result.content }]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: error.message || 'An unexpected error occurred.',
      });
      setMessages(prev => [...prev, {role: 'model', content: "Sorry, I ran into an error. Please try again."}]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Sparkles className="h-8 w-8" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <span>AI Study Assistant</span>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-grow px-6" ref={scrollAreaRef}>
             <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-full">
                        <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-sm">
                        <p>Hello! I'm Maestro, your AI study assistant. How can I help you today?</p>
                    </div>
                </div>
                {messages.map((message, index) => (
                    <div key={index} className="flex items-start gap-3">
                        {message.role === 'user' ? (
                            <>
                                <div className="p-2 bg-primary/10 rounded-full ml-auto">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div className="bg-primary/10 rounded-lg p-3 text-sm">
                                    <p>{message.content}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-2 bg-muted rounded-full">
                                    <Bot className="h-5 w-5 text-primary" />
                                </div>
                                <div className="bg-muted rounded-lg p-3 text-sm prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: message.content.replace(/\\n/g, '<br />') }} />
                            </>
                        )}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-full">
                           <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        </div>
                        <div className="bg-muted rounded-lg p-3 text-sm">
                            <p>Thinking...</p>
                        </div>
                    </div>
                )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-2 border-t">
            <div className="flex w-full items-center space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                className="min-h-12 max-h-24"
                autoFocus
              />
              <Button type="submit" onClick={handleSend} disabled={isLoading} size="icon">
                <Send className="h-4 w-4" />
                <span className='sr-only'>Send</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
