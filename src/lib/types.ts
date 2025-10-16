

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be sent to client
  role: 'student' | 'teacher';
};

export type Course = {
  id:string;
  title: string;
  description: string;
  duration: string; // e.g., "8 weeks"
  teacherId: string;
  imageUrl: string;
  videoUrl?: string;
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
    link: string; 
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

export type Attendance = {
    id: string;
    studentId: string;
    courseId: string;
    date: string; // YYYY-MM-DD
    isPresent: boolean;
};

export type Certificate = {
    id: string;
    studentId: string;
    courseId: string;
    issuedAt: string;
    verificationId: string;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  company: string;
  points: number;
  icon: string;
};

export type ChallengeSubmission = {
  id: string;
  challengeId: string;
  studentId: string;
  content: string;
  submittedAt: string;
};

export type ChallengeVote = {
  id: string;
  submissionId: string;
  voterId: string;
};

export type Project = {
  id: string;
  studentId: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  tags: string[];
  createdAt: string;
};

// Internship Simulator Types
export type InternshipTask = {
  title: string;
  scenario: string;
  task: string;
  deliverables: string[];
};

export type InternshipDomain = {
  id: string;
  name: string;
  description: string;
  icon: string;
  task: InternshipTask;
};

export type InternshipGrade = {
    problemSolving: number;
    creativity: number;
    overall: number;
    feedback: string;
}

// Timeline Types
export type TimelineEvent = {
  id: string;
  timestamp: string;
  type: 'course_enrolled' | 'lesson_completed' | 'assignment_submitted' | 'grade_received';
  title: string;
  details: string;
  icon: string;
  duration?: string;
  referenceId?: string; // e.g., submissionId to avoid duplicates
};
