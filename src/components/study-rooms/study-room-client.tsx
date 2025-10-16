
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Bold, Italic, List, Send, LogOut, ClipboardCopy, School, Users, Crown, User as UserIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '../theme-toggle';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface Participant extends User {
    isOnline: boolean;
}

interface Message {
    id: string;
    userId: string;
    userName: string;
    userRole: 'student' | 'teacher';
    text: string;
    timestamp: string;
    isSystemMessage?: boolean;
}

interface StudyRoomState {
    name: string;
    topic?: string;
    hostId: string;
    participants: Participant[];
    messages: Message[];
    notes: string;
}

export default function StudyRoomClient({ roomId, currentUser }: { roomId: string; currentUser: User }) {
    const router = useRouter();
    const { toast } = useToast();
    const [roomState, setRoomState] = useState<StudyRoomState | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const notesRef = useRef<HTMLTextAreaElement>(null);
    const chatScrollAreaRef = useRef<HTMLDivElement>(null);

    const getStorageKey = (id: string) => `study-room-${id}`;

    const addSystemMessage = useCallback((text: string) => {
        const systemMessage: Message = {
            id: Date.now().toString(),
            userId: 'system',
            userName: 'System',
            userRole: 'student', // placeholder
            text,
            timestamp: new Date().toISOString(),
            isSystemMessage: true,
        };
        const storageKey = getStorageKey(roomId);
        const storedData = localStorage.getItem(storageKey);
        if (!storedData) return;
        const currentState = JSON.parse(storedData) as StudyRoomState;
        const newState = {...currentState, messages: [...currentState.messages, systemMessage]};
        localStorage.setItem(storageKey, JSON.stringify(newState));
        setRoomState(newState);
    }, [roomId]);


    // Function to handle all state updates and persist to localStorage
    const updateRoomState = useCallback((updater: (prevState: StudyRoomState) => StudyRoomState) => {
        const storageKey = getStorageKey(roomId);
        const storedData = localStorage.getItem(storageKey);
        if (!storedData) return;

        const currentState = JSON.parse(storedData) as StudyRoomState;
        const newState = updater(currentState);
        
        localStorage.setItem(storageKey, JSON.stringify(newState));
        setRoomState(newState);
    }, [roomId]);


    // Initial setup and joining logic
    useEffect(() => {
        const allRooms = JSON.parse(localStorage.getItem('study-rooms') || '{}');
        const roomInfo = allRooms[roomId];
        if (!roomInfo) {
            toast({ variant: 'destructive', title: 'Room not found', description: 'This study room no longer exists.' });
            router.push(currentUser.role === 'teacher' ? '/dashboard' : '/study-rooms');
            return;
        }

        const storageKey = getStorageKey(roomId);
        let currentRoomState: StudyRoomState;

        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            currentRoomState = JSON.parse(storedData);
        } else {
            currentRoomState = {
                name: roomInfo.name,
                topic: roomInfo.topic,
                hostId: roomInfo.hostId,
                participants: [],
                messages: [],
                notes: `Welcome to the shared notes for ${roomInfo.name}!\n\n`,
            };
        }

        const userInRoom = currentRoomState.participants.find(p => p.id === currentUser.id);
        const userJustJoined = !userInRoom;
        
        if (!userInRoom) {
            currentRoomState.participants.push({ ...currentUser, isOnline: true });
        } else {
            currentRoomState.participants = currentRoomState.participants.map(p =>
                p.id === currentUser.id ? { ...p, isOnline: true } : p
            );
        }
        
        localStorage.setItem(storageKey, JSON.stringify(currentRoomState));
        setRoomState(currentRoomState);
        
        if (userJustJoined) {
            const message = currentUser.role === 'teacher' 
                ? 'Instructor has joined the room.' 
                : `${currentUser.name} has joined the room.`;
            addSystemMessage(message);
        }


    }, [roomId, currentUser, router, toast, addSystemMessage]);

    // Listener for storage events to sync state across tabs
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === getStorageKey(roomId) && event.newValue) {
                setRoomState(JSON.parse(event.newValue));
            }
            if (event.key === 'study-rooms' && event.newValue) {
                const allRooms = JSON.parse(event.newValue);
                if (!allRooms[roomId]) {
                    toast({ title: 'Room Closed', description: 'The host has ended the session.' });
                    router.push(currentUser.role === 'teacher' ? '/dashboard' : '/study-rooms');
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [roomId, router, toast, currentUser.role]);
    
    // Scroll chat to bottom
    useEffect(() => {
        if (chatScrollAreaRef.current) {
            const viewport = chatScrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                setTimeout(() => {
                    viewport.scrollTop = viewport.scrollHeight;
                }, 100);
            }
        }
    }, [roomState?.messages]);

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            text: messageInput,
            timestamp: new Date().toISOString(),
        };
        updateRoomState(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
        setMessageInput('');
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newNotes = e.target.value;
        updateRoomState(prev => ({ ...prev, notes: newNotes }));
    };

    const formatText = (formatType: 'bold' | 'italic' | 'bullet') => {
        const textarea = notesRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let newText;

        if (formatType === 'bold') {
            newText = `**${selectedText}**`;
        } else if (formatType === 'italic') {
            newText = `*${selectedText}*`;
        } else if (formatType === 'bullet') {
            newText = `\n- ${selectedText}`;
        } else {
            return;
        }
        
        const updatedValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
        updateRoomState(prev => ({ ...prev, notes: updatedValue }));
        
        // Focus and select for better UX
        textarea.focus();
        setTimeout(() => {
            textarea.setSelectionRange(start + (formatType === 'bullet' ? 3 : 2), end + (formatType === 'bullet' ? 3 : 2));
        }, 0);
    };

    const handleLeaveRoom = (isHostClosing = false) => {
        const redirectPath = currentUser.role === 'teacher' ? '/dashboard' : '/study-rooms';

        if (isHostClosing) {
            const allRooms = JSON.parse(localStorage.getItem('study-rooms') || '{}');
            delete allRooms[roomId];
            localStorage.setItem('study-rooms', JSON.stringify(allRooms));
            localStorage.removeItem(getStorageKey(roomId));
            toast({ title: 'Room Closed', description: 'You have ended the study session.' });
        } else {
             addSystemMessage(currentUser.role === 'teacher' ? 'Instructor left the room.' : `${currentUser.name} has left the room.`);
             updateRoomState(prev => ({
                ...prev,
                participants: prev.participants.map(p => p.id === currentUser.id ? { ...p, isOnline: false } : p)
            }));
            toast({ title: 'You have left the room' });
        }
        router.push(redirectPath);
    };
    
    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomId);
        toast({ title: 'Copied!', description: 'Room code copied to clipboard.' });
    };

    if (!roomState) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Loading study room...</p>
            </div>
        );
    }

    const isHost = roomState.hostId === currentUser.id;

    return (
        <div className="h-full flex flex-col gap-4">
            <header className="flex items-center justify-between p-4 border-b bg-card rounded-lg">
                <div className='flex items-center gap-4'>
                    <School className="h-6 w-6 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold font-headline">{roomState.name}</h1>
                        <p className="text-sm text-muted-foreground">{roomState.topic || 'General Discussion'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={copyRoomCode}>
                        <ClipboardCopy className="mr-2 h-4 w-4" /> Code: {roomId}
                    </Button>
                    <ThemeToggle />
                    {isHost ? (
                        <Button variant="destructive" size="sm" onClick={() => handleLeaveRoom(true)}>
                            <LogOut className="mr-2 h-4 w-4" /> End Room
                        </Button>
                    ) : (
                        <Button variant="secondary" size="sm" onClick={() => handleLeaveRoom(false)}>
                            <LogOut className="mr-2 h-4 w-4" /> Leave Room
                        </Button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-grow min-h-0">
                {/* Left Panel: Participants */}
                <Card className="lg:col-span-1 flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className='h-5 w-5' /> Participants ({roomState.participants.filter(p => p.isOnline).length})</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-auto">
                        <ul className="space-y-3">
                            {roomState.participants.filter(p => p.isOnline).map(p => (
                                <li key={p.id} className="flex items-center gap-3 text-sm">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{p.name}</span>
                                    {p.id === roomState.hostId && <Crown className="h-4 w-4 text-amber-500" title='Host'/>}
                                    {p.role === 'teacher' && <Badge variant="secondary">Instructor</Badge>}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Center Panel: Shared Notes */}
                <Card className="lg:col-span-2 flex flex-col">
                    <CardHeader>
                        <CardTitle>Shared Notes</CardTitle>
                        <div className="flex items-center gap-1 border rounded-md p-1 mt-2">
                            <Button variant="ghost" size="icon" onClick={() => formatText('bold')}><Bold className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => formatText('italic')}><Italic className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => formatText('bullet')}><List className="h-4 w-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <Textarea
                            ref={notesRef}
                            value={roomState.notes}
                            onChange={handleNotesChange}
                            placeholder="Start typing your shared notes here..."
                            className="h-full resize-none bg-muted/30"
                            readOnly={currentUser.role === 'teacher'}
                        />
                    </CardContent>
                </Card>

                {/* Right Panel: Chat */}
                <Card className="lg:col-span-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>Live Chat</CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-grow h-0 px-6" ref={chatScrollAreaRef}>
                        <div className="space-y-4">
                            {roomState.messages.map(msg => (
                                 msg.isSystemMessage ? (
                                    <div key={msg.id} className="text-center text-xs text-muted-foreground italic py-1">
                                        {msg.text}
                                    </div>
                                ) : (
                                    <div key={msg.id} className={cn("flex flex-col", msg.userId === currentUser.id ? "items-end" : "items-start")}>
                                        <div className="flex items-baseline gap-2 text-xs">
                                            <span className="font-bold">{msg.userName}</span>
                                            <span className="text-muted-foreground">{format(new Date(msg.timestamp), 'h:mm a')}</span>
                                        </div>
                                        <div className={cn(
                                            "text-sm p-2 rounded-md max-w-[90%]",
                                            msg.userId === currentUser.id ? "bg-primary text-primary-foreground" : "bg-muted",
                                            msg.userRole === 'teacher' && "bg-amber-100 dark:bg-amber-900/50 text-foreground"
                                        )}>
                                            {msg.userRole === 'teacher' && <p className="text-xs font-bold text-amber-600 dark:text-amber-400">INSTRUCTOR</p>}
                                            <p>{msg.text}</p>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t">
                        <div className="flex items-center gap-2">
                            <Input
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                            />
                            <Button onClick={handleSendMessage} size="icon" variant="secondary">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

    