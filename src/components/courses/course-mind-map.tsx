'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useRouter } from 'next/navigation';

import type { Course, User } from '@/lib/types';
import CourseNode from './course-node';
import SubNode from './sub-node';

const nodeTypes: NodeTypes = {
  course: CourseNode,
  subNode: SubNode,
};

type CourseMindMapProps = {
  courses: Course[];
  user: User;
  enrolledCourseIds: Set<string>;
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function CourseMindMap({ courses, user, enrolledCourseIds }: CourseMindMapProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const courseNodes: Node[] = courses.map((course, index) => ({
      id: course.id,
      type: 'course',
      position: { x: (index % 4) * 300, y: Math.floor(index / 4) * 200 },
      data: {
        course,
        isEnrolled: enrolledCourseIds.has(course.id),
        isTeacher: user.role === 'teacher',
      },
    }));
    setNodes(courseNodes);
    setEdges([]);
    setExpandedCourse(null);
  }, [courses, enrolledCourseIds, user.role]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.type === 'course') {
      if (expandedCourse === node.id) {
        // Collapse
        const courseNodes = nodes.filter(n => n.type === 'course');
        setNodes(courseNodes);
        setEdges([]);
        setExpandedCourse(null);
      } else {
        // Expand
        const courseNode = nodes.find(n => n.id === node.id);
        if (!courseNode) return;
        
        const subNodes: Node[] = [
          { id: `${node.id}-assignments`, type: 'subNode', position: { x: courseNode.position.x - 120, y: courseNode.position.y + 100 }, data: { label: 'Assignments', icon: 'ClipboardList', courseId: node.id, tab: 'assignments' } },
          { id: `${node.id}-materials`, type: 'subNode', position: { x: courseNode.position.x, y: courseNode.position.y + 150 }, data: { label: 'Materials', icon: 'FileText', courseId: node.id, tab: 'materials' } },
          { id: `${node.id}-discussions`, type: 'subNode', position: { x: courseNode.position.x + 120, y: courseNode.position.y + 100 }, data: { label: 'Discussions', icon: 'MessageSquare', courseId: node.id, tab: 'discussions' } },
        ];
        
        const newEdges: Edge[] = subNodes.map(subNode => ({
          id: `e-${node.id}-${subNode.id}`,
          source: node.id,
          target: subNode.id,
          animated: true,
          style: { stroke: 'hsl(var(--primary))' },
        }));

        const otherCourseNodes = nodes.filter(n => n.type === 'course' && n.id !== node.id);
        
        setNodes([courseNode, ...subNodes, ...otherCourseNodes]);
        setEdges(newEdges);
        setExpandedCourse(node.id);
      }
    } else if (node.type === 'subNode') {
        const { courseId, tab } = node.data;
        router.push(`/courses/${courseId}?tab=${tab}`);
    }
  };

  return (
    <div className="w-full h-full rounded-lg border bg-card text-card-foreground shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
