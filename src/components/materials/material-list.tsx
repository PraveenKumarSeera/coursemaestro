'use client';
import type { Material } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '../ui/scroll-area';

type MaterialListProps = {
  materials: Material[];
};

export default function MaterialList({ materials }: MaterialListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Materials</CardTitle>
        <CardDescription>
          Documents and notes uploaded by your teacher.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {materials.length > 0 ? (
          <div className="space-y-4">
            {materials.map((material) => (
                <AlertDialog key={material.id}>
                    <AlertDialogTrigger asChild>
                        <div className="block hover:bg-muted/50 rounded-lg p-4 border cursor-pointer">
                            <div className="flex items-center gap-4">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">{material.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {material.fileName} &middot; Uploaded on {format(new Date(material.createdAt), 'PPP')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-3xl">
                        <AlertDialogHeader>
                        <AlertDialogTitle>{material.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Parsed text content from: {material.fileName}
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <ScrollArea className="h-96 w-full rounded-md border p-4">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{material.content}</p>
                        </ScrollArea>
                        <AlertDialogFooter>
                            <AlertDialogAction>Close</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No materials have been uploaded for this course yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
