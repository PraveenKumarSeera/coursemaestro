'use client';

import { useEffect, useRef, useState } from 'react';
import type { User } from '@/lib/types';
import { useStudyRooms, type Room, type Message, type Participant } from '@/hooks/use-study-rooms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Crown, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function StudyRoomClient({ roomId, currentUser }: { roomId: string; currentUser: User }) {
  const { getRoom, joinRoom, leaveRoom, sendMessage, room, messages, participants } = useStudyRooms();
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getRoom(roomId);
    joinRoom(roomId, currentUser);

    return () => {
      leaveRoom(roomId, currentUser.id);
    };
  }, [roomId, currentUser.id]);

   useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            setTimeout(() => {
                viewport.scrollTop = viewport.scrollHeight;
            }, 100);
        }
    }
  }, [messages]);


  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(roomId, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: message,
        isTeacher: currentUser.role === 'teacher',
      });
      setMessage('');
    }
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading room...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[calc(100vh-100px)]">
      <div className="lg:col-span-2 flex flex-col h-full">
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle>{room.name}</CardTitle>
            <CardDescription>Course: {room.course.title}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
             <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-start gap-3',
                        msg.senderId === currentUser.id ? 'flex-row-reverse' : '',
                        msg.isSystem && 'justify-center'
                      )}
                    >
                      {!msg.isSystem && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm max-w-sm',
                          msg.isSystem && 'bg-transparent text-muted-foreground text-xs italic',
                          !msg.isSystem && msg.senderId === currentUser.id && 'bg-primary text-primary-foreground',
                          !msg.isSystem && msg.senderId !== currentUser.id && !msg.isTeacher && 'bg-muted',
                          !msg.isSystem && msg.senderId !== currentUser.id && msg.isTeacher && 'bg-secondary border-2 border-primary/50'
                        )}
                      >
                        {!msg.isSystem && (
                           <p className="font-semibold text-xs mb-1">
                            {msg.senderName} {msg.isTeacher && <span className="text-primary font-bold">(Instructor)</span>}
                           </p>
                        )}
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
            </ScrollArea>
          </CardContent>
          <CardContent className="border-t pt-4">
            <div className="flex w-full items-center space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                autoFocus
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Participants ({participants.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow space-y-4 overflow-y-auto">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="font-medium">
                <p>{p.name}</p>
                 {p.isTeacher && <p className="text-xs text-primary font-bold">Instructor</p>}
              </div>
              {p.id === room.host.id && (
                <Crown className="h-5 w-5 text-yellow-500 ml-auto" title="Host" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
