

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be sent to client
  role: 'student' | 'teacher';
};

export type Course = {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "8 weeks"
  teacherId: string;
  imageUrl: string;
};

export type Enrollment = {
  id: string;
  studentId: string;
  courseId: string;
};

export type Assignment = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
};

export type Submission = {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string; // or file URL
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
};

export type GradedSubmission = Submission & { assignment: Assignment, course: Course };

export type DiscussionThread = {
    id: string;
    courseId: string;
    title: string;
    authorId: string;
    createdAt: string;
};

export type DiscussionPost = {
    id: string;
    threadId: string;
    authorId: string;
    content: string;
    createdAt: string;
};
    
export type Material = {
    id: string;
    courseId: string;
    title: string;
    fileName: string;
    fileType: string;
    content: string; // The parsed text content
    createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
};
