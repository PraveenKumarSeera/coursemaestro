
'use client';
import type { Material } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Link2 } from 'lucide-react';
import Link from 'next/link';

type MaterialListProps = {
  materials: Material[];
};

export default function MaterialList({ materials }: MaterialListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Materials</CardTitle>
        <CardDescription>
          Shared links and resources from your teacher.
        </CardDescription>
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
