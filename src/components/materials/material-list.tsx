
'use client';
import type { Material } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Link2, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { useState } from 'react';
import AddMaterialForm from './add-material-form';

type MaterialListProps = {
  materials: Material[];
  courseId: string;
  isTeacher: boolean;
};

export default function MaterialList({ materials, courseId, isTeacher }: MaterialListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Course Materials</CardTitle>
            <CardDescription>
            Shared links and resources from your teacher.
            </CardDescription>
        </div>
        {isTeacher && (
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Material
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Add New Material</DialogTitle>
                  <DialogDescription>
                    Provide a title and a shareable link for your new material.
                  </DialogDescription>
                </DialogHeader>
                <AddMaterialForm courseId={courseId} setDialogOpen={setIsDialogOpen} />
              </DialogContent>
            </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {materials.length > 0 ? (
          <div className="space-y-4">
            {materials.map((material) => (
                <Link
                    key={material.id}
                    href={material.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-muted/50 rounded-lg p-4 border"
                >
                    <div className="flex items-center gap-4">
                        <Link2 className="h-6 w-6 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">{material.title}</p>
                            <p className="text-sm text-muted-foreground">
                                Added on {format(new Date(material.createdAt), 'PPP')}
                            </p>
                        </div>
                    </div>
                </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No materials have been added for this course yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
