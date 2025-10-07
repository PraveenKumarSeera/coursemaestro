

import { placeholderImages } from './placeholder-images.json';
import type { Course, Enrollment, User, Assignment, Submission, GradedSubmission, DiscussionThread, DiscussionPost, Material } from './types';
import { format } from 'date-fns';

// In-memory "database"
let users: User[] = [
  { id: '1', name: 'Alice Teacher', email: 'teacher@example.com', password: 'password', role: 'teacher' },
  { id: '2', name: 'Bob Student', email: 'student@example.com', password: 'password', role: 'student' },
  { id: '3', name: 'Charlie Student', email: 'charlie@example.com', password: 'password', role: 'student' },
];

let courses: Course[] = [
  { id: '101', title: 'Introduction to Web Development', description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites. This course covers everything from basic syntax to responsive design and DOM manipulation.', teacherId: '1', duration: '8 Weeks', imageUrl: placeholderImages[0].imageUrl },
  { id: '102', title: 'Advanced React Patterns', description: 'Dive deep into React and learn about hooks, context, performance optimization, and advanced patterns for building large-scale applications.', teacherId: '1', duration: '6 Weeks', imageUrl: placeholderImages[1].imageUrl },
  { id: '103', title: 'Data Structures & Algorithms', description: 'Understand the core concepts of data structures and algorithms. A fundamental course for any aspiring software engineer.', teacherId: '1', duration: '10 Weeks', imageUrl: placeholderImages[2].imageUrl },
];

let enrollments: Enrollment[] = [
  { id: '1001', studentId: '2', courseId: '101' },
  { id: '1002', studentId: '2', courseId: '103' },
  { id: '1003', studentId: '3', courseId: '101' },
];

let assignments: Assignment[] = [
    { id: '201', courseId: '101', title: 'HTML & CSS Basics', description: 'Create a simple personal portfolio page.', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '202', courseId: '101', title: 'JavaScript DOM Manipulation', description: 'Build an interactive todo list app.', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '203', courseId: '102', title: 'React Hooks Project', description: 'Refactor a class-based component to use hooks.', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() },
];

let submissions: Submission[] = [
    { id: '301', assignmentId: '201', studentId: '2', content: 'Submitted portfolio link.', submittedAt: new Date().toISOString(), grade: 95, feedback: 'Great job on the design!' },
];

let discussionThreads: DiscussionThread[] = [
    { id: '401', courseId: '101', title: 'Question about CSS Flexbox', authorId: '2', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

let discussionPosts: DiscussionPost[] = [
    { id: '501', threadId: '401', authorId: '2', content: "I'm having trouble centering a div. Can anyone help?", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '502', threadId: '401', authorId: '1', content: 'Sure! Have you tried using `display: flex; justify-content: center; align-items: center;` on the parent container?', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

let materials: Material[] = [];


// --- User Functions ---
export async function findUserByEmail(email: string): Promise<User | undefined> {
  return users.find(user => user.email === email);
}

export async function findUserById(id: string): Promise<User | undefined> {
  return users.find(user => user.id === id);
}

export async function createUser(data: Omit<User, 'id'>): Promise<User> {
  const newUser: User = { ...data, id: String(Date.now()) };
  users.push(newUser);

  // Add sample data for new users
  if (newUser.role === 'teacher') {
    const newCourse: Course = {
        id: String(Date.now() + 1),
        title: `Your First Course: ${newUser.name.split(' ')[0]}'s Class`,
        description: 'This is a sample course created just for you. You can edit or delete it.',
        teacherId: newUser.id,
        duration: '4 Weeks',
        imageUrl: placeholderImages[Math.floor(Math.random() * placeholderImages.length)].imageUrl,
    };
    courses.push(newCourse);
  } else if (newUser.role === 'student' && courses.length > 0) {
      // Enroll in the first course if it exists
      const courseToEnroll = courses[0];
      const newEnrollment: Enrollment = {
          id: String(Date.now() + 1),
          studentId: newUser.id,
          courseId: courseToEnroll.id,
      };
      enrollments.push(newEnrollment);
  }

  return newUser;
}

// --- Course Functions ---
export async function getAllCourses(query?: string): Promise<Course[]> {
  if (!query) return courses;
  return courses.filter(course =>
    course.title.toLowerCase().includes(query.toLowerCase()) ||
    course.description.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getCourseById(id: string): Promise<(Course & { teacher: User }) | undefined> {
  const course = courses.find(c => c.id === id);
  if (!course) return undefined;
  const teacher = await findUserById(course.teacherId);
  if (!teacher) throw new Error("Teacher not found for course");
  return { ...course, teacher };
}

export async function createCourse(data: Omit<Course, 'id' | 'teacherId' | 'imageUrl'>, teacherId: string): Promise<Course> {
    const newCourse: Course = {
        ...data,
        id: String(Date.now()),
        teacherId,
        imageUrl: placeholderImages[Math.floor(Math.random() * placeholderImages.length)].imageUrl,
    };
    courses.push(newCourse);
    return newCourse;
}

export async function updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'teacherId' | 'imageUrl'>>): Promise<Course | undefined> {
    const courseIndex = courses.findIndex(c => c.id === id);
    if (courseIndex === -1) return undefined;
    
    courses[courseIndex] = { ...courses[courseIndex], ...data };
    return courses[courseIndex];
}

export async function deleteCourse(id: string): Promise<boolean> {
    const initialLength = courses.length;
    courses = courses.filter(c => c.id !== id);
    // Also delete associated enrollments, assignments, submissions, and discussions
    enrollments = enrollments.filter(e => e.courseId !== id);
    assignments = assignments.filter(a => a.courseId !== id);
    
    const assignmentIdsToDelete = assignments.filter(a => a.courseId === id).map(a => a.id);
    submissions = submissions.filter(s => !assignmentIdsToDelete.includes(s.assignmentId));

    const threadIdsToDelete = discussionThreads.filter(t => t.courseId === id).map(t => t.id);
    discussionThreads = discussionThreads.filter(t => t.courseId !== id);
    discussionPosts = discussionPosts.filter(p => !threadIdsToDelete.includes(p.threadId));

    return courses.length < initialLength;
}


export async function getTeacherById(id: string): Promise<User | undefined> {
    return users.find(user => user.id === id && user.role === 'teacher');
}

export async function getTeacherCourses(teacherId: string): Promise<(Course & { enrollments: Enrollment[] })[]> {
    const teacherCourses = courses.filter(c => c.teacherId === teacherId);
    return teacherCourses.map(course => ({
        ...course,
        enrollments: enrollments.filter(e => e.courseId === course.id)
    }));
}


// --- Enrollment Functions ---
export async function getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
  return enrollments.filter(e => e.studentId === studentId);
}

export async function getStudentsByCourse(courseId: string): Promise<User[]> {
    const courseEnrollments = enrollments.filter(e => e.courseId === courseId);
    const studentIds = courseEnrollments.map(e => e.studentId);
    return users.filter(user => studentIds.includes(user.id));
}

export async function enrollInCourse(studentId: string, courseId: string): Promise<Enrollment | null> {
    const alreadyEnrolled = enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
    if (alreadyEnrolled) {
        return null;
    }
    const newEnrollment: Enrollment = {
        id: String(Date.now()),
        studentId,
        courseId,
    };
    enrollments.push(newEnrollment);
    return newEnrollment;
}

export async function isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    return enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
}


// --- Assignment Functions ---
export async function getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    return assignments.filter(a => a.courseId === courseId);
}

export async function getAssignmentsByTeacher(teacherId: string): Promise<(Assignment & { courseTitle: string, submissions: number })[]> {
    const teacherCourses = await getTeacherCourses(teacherId);
    const courseIds = teacherCourses.map(c => c.id);
    const teacherAssignments = assignments.filter(a => courseIds.includes(a.courseId));
    
    return teacherAssignments.map(assignment => {
        const course = courses.find(c => c.id === assignment.courseId);
        const submissionCount = submissions.filter(s => s.assignmentId === assignment.id).length;
        return {
            ...assignment,
            courseTitle: course?.title || 'Unknown Course',
            submissions: submissionCount,
        };
    });
}

export async function createAssignment(data: Omit<Assignment, 'id'>): Promise<Assignment> {
    const newAssignment: Assignment = { ...data, id: String(Date.now()) };
    assignments.push(newAssignment);
return newAssignment;
}

export async function getAssignmentById(id: string): Promise<(Assignment & { submissions: (Submission & { student: User })[] }) | undefined> {
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return undefined;

    const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
    const submissionsWithStudents = await Promise.all(
        assignmentSubmissions.map(async sub => {
            const student = await findUserById(sub.studentId);
            if (!student) {
                // In a real app, you might want to handle this case more gracefully
                throw new Error(`Student with id ${sub.studentId} not found`);
            }
            return { ...sub, student };
        })
    );

    return { ...assignment, submissions: submissionsWithStudents };
}


// --- Submission Functions ---
export async function getStudentSubmission(studentId: string, assignmentId: string): Promise<Submission | undefined> {
    return submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
}

export async function createSubmission(data: Omit<Submission, 'id' | 'submittedAt' | 'grade' | 'feedback'>): Promise<Submission> {
    const newSubmission: Submission = { 
        ...data, 
        id: String(Date.now()), 
        submittedAt: new Date().toISOString(),
        grade: null,
        feedback: null
    };
    submissions.push(newSubmission);
    return newSubmission;
}

export async function gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission | undefined> {
    const submissionIndex = submissions.findIndex(s => s.id === submissionId);
    if (submissionIndex === -1) return undefined;

    submissions[submissionIndex] = {
        ...submissions[submissionIndex],
        grade,
        feedback,
    };
    return submissions[submissionIndex];
}

export async function getStudentGrades(studentId: string): Promise<GradedSubmission[]> {
    const studentSubmissions = submissions.filter(s => s.studentId === studentId && s.grade !== null);
    
    return Promise.all(studentSubmissions.map(async sub => {
        const assignment = assignments.find(a => a.id === sub.assignmentId);
        if (!assignment) throw new Error("Assignment not found");
        const course = courses.find(c => c.id === assignment.courseId);
        if (!course) throw new Error("Course not found");
        return { ...sub, assignment, course };
    }));
}


// --- Discussion Functions ---
export async function getThreadsByCourse(courseId: string): Promise<(DiscussionThread & { author: User, postCount: number })[]> {
    const threads = discussionThreads.filter(t => t.courseId === courseId);
    return Promise.all(threads.map(async thread => {
        const author = await findUserById(thread.authorId);
        const postCount = discussionPosts.filter(p => p.threadId === thread.id).length;
        if (!author) throw new Error("Author not found for thread");
        return { ...thread, author, postCount };
    }));
}

export async function getThreadById(threadId: string): Promise<(DiscussionThread & { author: User }) | undefined> {
    const thread = discussionThreads.find(t => t.id === threadId);
    if (!thread) return undefined;
    const author = await findUserById(thread.authorId);
    if (!author) throw new Error("Author not found for thread");
    return { ...thread, author };
}

export async function getPostsByThread(threadId: string): Promise<(DiscussionPost & { author: User })[]> {
    const posts = discussionPosts.filter(p => p.threadId === threadId);
    return Promise.all(posts.map(async post => {
        const author = await findUserById(post.authorId);
        if (!author) throw new Error("Author not found for post");
        return { ...post, author };
    }));
}

export async function createThread(data: Omit<DiscussionThread, 'id' | 'createdAt'>): Promise<DiscussionThread> {
    const newThread: DiscussionThread = { ...data, id: String(Date.now()), createdAt: new Date().toISOString() };
    discussionThreads.push(newThread);
    return newThread;
}

export async function createPost(data: Omit<DiscussionPost, 'id' | 'createdAt'>): Promise<DiscussionPost> {
    const newPost: DiscussionPost = { ...data, id: String(Date.now()), createdAt: new Date().toISOString() };
    discussionPosts.push(newPost);
    return newPost;
}

// --- Material Functions ---
export async function addMaterial(data: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
  const newMaterial: Material = {
    ...data,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
  };
  materials.push(newMaterial);
  return newMaterial;
}

export async function getMaterialsByCourse(courseId: string): Promise<Material[]> {
    return materials.filter(m => m.courseId === courseId);
}
