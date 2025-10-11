'use client';
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

type SubNodeData = {
  label: string;
  icon: keyof typeof LucideIcons;
  courseId: string;
  tab: string;
};

const SubNode = memo(({ data, selected }: NodeProps<SubNodeData>) => {
  const Icon = LucideIcons[data.icon] as React.ElementType;
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <Button variant="outline" className={cn("shadow-lg", selected && "ring-2 ring-ring")}>
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        {data.label}
      </Button>
    </>
  );
});

SubNode.displayName = 'SubNode';

export default SubNode;
