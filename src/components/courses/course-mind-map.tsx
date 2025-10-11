
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
  useReactFlow,
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
  const router = useRouter();
  const { fitView } = useReactFlow();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  
  const generateLayout = (courseNodes: Node[]) => {
    const nodesPerRow = Math.max(1, Math.floor(window.innerWidth / 350));
    return courseNodes.map((node, index) => ({
        ...node,
        position: { x: (index % nodesPerRow) * 350, y: Math.floor(index / nodesPerRow) * 250 },
    }));
  }

  useEffect(() => {
    const courseNodes: Node[] = courses.map((course) => ({
      id: course.id,
      type: 'course',
      position: { x: 0, y: 0 }, // Position will be set by layout
      data: {
        course,
        isEnrolled: enrolledCourseIds.has(course.id),
        isTeacher: user.role === 'teacher' && user.id === course.teacherId,
      },
    }));
    setNodes(generateLayout(courseNodes));
    setEdges([]);
    
    // Fit view after a short delay to ensure layout is calculated
    setTimeout(() => fitView({ padding: 0.1, duration: 300 }), 100);

  }, [courses, enrolledCourseIds, user.role, user.id, fitView]);
  

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.type === 'course') {
        const isEnrolled = enrolledCourseIds.has(node.id);
        const isTeacher = user.role === 'teacher' && user.id === node.data.course.teacherId;
        
        // If student is not enrolled, route them to the course page to enroll
        if(user.role === 'student' && !isEnrolled){
            router.push(`/courses/${node.id}`);
            return;
        }

        const subNodes: Node[] = [
          { id: `${node.id}-assignments`, type: 'subNode', position: { x: node.position.x - 150, y: node.position.y + 150 }, data: { label: 'Assignments', icon: 'ClipboardList', courseId: node.id, tab: 'assignments' } },
          { id: `${node.id}-materials`, type: 'subNode', position: { x: node.position.x, y: node.position.y + 180 }, data: { label: 'Materials', icon: 'FileText', courseId: node.id, tab: 'materials' } },
          { id: `${node.id}-discussions`, type: 'subNode', position: { x: node.position.x + 150, y: node.position.y + 150 }, data: { label: 'Discussions', icon: 'MessageSquare', courseId: node.id, tab: 'discussions' } },
        ];
        
        const newEdges: Edge[] = subNodes.map(subNode => ({
          id: `e-${node.id}-${subNode.id}`,
          source: node.id,
          target: subNode.id,
          type: 'smoothstep',
          animated: true,
          style: { strokeWidth: 2, stroke: 'hsl(var(--primary))' },
        }));

        setNodes(currentNodes => {
            const otherNodes = currentNodes.filter(n => n.type !== 'subNode' && n.id !== node.id);
            return [node, ...otherNodes, ...subNodes];
        });
        setEdges(newEdges);

        setTimeout(() => fitView({
            nodes: [node, ...subNodes],
            duration: 500,
            padding: 0.2
        }), 100);
    } else if (node.type === 'subNode') {
        const { courseId, tab } = node.data;
        router.push(`/courses/${courseId}?tab=${tab}`);
    }
  };

  const handlePaneClick = () => {
    // Reset to the main course view
    const courseNodes = nodes.filter(n => n.type === 'course');
    setNodes(generateLayout(courseNodes));
    setEdges([]);
    setTimeout(() => fitView({ padding: 0.1, duration: 300 }), 100);
  }

  return (
    <div className="w-full h-full rounded-lg border bg-card text-card-foreground shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
