import { placeholderImages } from './placeholder-images.json';
import type { Course, Enrollment, User } from './types';

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
