'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types';

export type Participant = {
  id: string;
  name: string;
  isTeacher: boolean;
};

export type Room = {
  id: string;
  name: string;
  course: {
    id: string;
    title: string;
  };
  host: {
    id: string;
    name: string;
  };
  participants: Participant[];
  createdAt: any;
  active: boolean;
};

export type Message = {
  senderId: string;
  senderName: string;
  text: string;
  isTeacher: boolean;
  isSystem?: boolean;
  timestamp?: any;
};

const roomsCollection = collection(db, 'studyRooms');
const getMessagesCollection = (roomId: string) => collection(db, `studyRooms/${roomId}/messages`);

export function useStudyRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Listen for active rooms
  useEffect(() => {
    const q = query(roomsCollection, where('active', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeRooms = snapshot.docs.map(doc => doc.data() as Room);
      setRooms(activeRooms);
    });
    return () => unsubscribe();
  }, []);

  // Listen for single room, its messages, and participants
  useEffect(() => {
    if (!room?.id) return;

    // Listen for room document changes (for participants)
    const roomUnsubscribe = onSnapshot(doc(db, 'studyRooms', room.id), (doc) => {
      if (doc.exists()) {
        const roomData = doc.data() as Room;
        setRoom(roomData);
        setParticipants(roomData.participants || []);
      }
    });

    // Listen for messages subcollection
    const messagesUnsubscribe = onSnapshot(getMessagesCollection(room.id), (snapshot) => {
      const newMessages = snapshot.docs.map(doc => doc.data() as Message).sort((a,b) => a.timestamp?.toMillis() - b.timestamp?.toMillis());
      setMessages(newMessages);
    });

    return () => {
      roomUnsubscribe();
      messagesUnsubscribe();
    };
  }, [room?.id]);


  const createRoom = async ({ name, course, host }: { name: string; course: {id: string, title: string}; host: {id: string, name: string} }) => {
    const newRoomRef = doc(roomsCollection);
    const newRoom: Room = {
      id: newRoomRef.id,
      name,
      course,
      host,
      participants: [],
      createdAt: serverTimestamp(),
      active: true,
    };
    await setDoc(newRoomRef, newRoom);
    return newRoom.id;
  };
  
  const getRoom = async (roomId: string) => {
    const roomDoc = await getDoc(doc(db, 'studyRooms', roomId));
    if (roomDoc.exists()) {
        setRoom(roomDoc.data() as Room);
    }
  }
  
  const addSystemMessage = async (roomId: string, text: string) => {
    const messageRef = doc(getMessagesCollection(roomId));
    await setDoc(messageRef, {
        text,
        isSystem: true,
        timestamp: serverTimestamp(),
    });
  }

  const joinRoom = async (roomId: string, user: User) => {
    const roomRef = doc(db, 'studyRooms', roomId);
    await updateDoc(roomRef, {
        participants: arrayUnion({ id: user.id, name: user.name, isTeacher: user.role === 'teacher' })
    });
    const messageText = user.role === 'teacher' ? 'Instructor has joined the room.' : `${user.name} has joined.`;
    await addSystemMessage(roomId, messageText);
  };

  const leaveRoom = async (roomId: string, userId: string) => {
    const roomRef = doc(db, 'studyRooms', roomId);
    const roomDoc = await getDoc(roomRef);

    if (roomDoc.exists()) {
        const roomData = roomDoc.data() as Room;
        const user = roomData.participants.find(p => p.id === userId);
        const messageText = user?.isTeacher ? 'Instructor has left the room.' : `${user?.name} has left.`;
        await addSystemMessage(roomId, messageText);
        
        // Remove participant
        await updateDoc(roomRef, {
            participants: arrayRemove(user)
        });

        // If host leaves, make someone else host or close room
        if (roomData.host.id === userId && roomData.participants.length > 1) {
            const nextHost = roomData.participants.find(p => p.id !== userId);
            if (nextHost) {
                 await updateDoc(roomRef, { host: { id: nextHost.id, name: nextHost.name } });
            }
        } else if (roomData.participants.length <= 1) {
            // Last person left
            await updateDoc(roomRef, { active: false });
        }
    }
  };

  const sendMessage = async (roomId: string, message: Partial<Message>) => {
    const messageRef = doc(getMessagesCollection(roomId));
    await setDoc(messageRef, {
        ...message,
        timestamp: serverTimestamp(),
    });
  };

  return { rooms, room, messages, participants, createRoom, getRoom, joinRoom, leaveRoom, sendMessage };
}
