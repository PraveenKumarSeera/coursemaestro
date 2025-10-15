

'use server';

import { placeholderImages } from './placeholder-images.json';
import type { Course, Enrollment, User, Assignment, Submission, GradedSubmission, DiscussionThread, DiscussionPost, Material, Notification, Attendance, Certificate, Challenge, ChallengeSubmission, ChallengeVote } from './types';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { unstable_cache } from 'next/cache';
import { differenceInDays, parseISO, isSameDay, subDays } from 'date-fns';
import { getSession } from './session';


// In-memory "database" has been replaced with a file-based one.
// The data is now persisted in `src/lib/db.json`

const dbPath = path.join(process.cwd(), 'src', 'lib', 'db.json');

type Db = {
    users: User[];
    courses: Course[];
    enrollments: Enrollment[];
    assignments: Assignment[];
    submissions: Submission[];
    discussionThreads: DiscussionThread[];
    discussionPosts: DiscussionPost[];
    materials: Material[];
    notifications: Notification[];
    attendance: Attendance[];
    certificates: Certificate[];
    challenges: Challenge[];
    challengeSubmissions: ChallengeSubmission[];
    challengeVotes: ChallengeVote[];
}

const defaultDb: Db = {
    users: [],
    courses: [
        { id: '101', title: 'Introduction to Web Development', description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites. This course covers everything from basic syntax to responsive design and DOM manipulation.', teacherId: '1', duration: '8 Weeks', imageUrl: placeholderImages[0].imageUrl },
        { id: '102', title: 'Advanced React Patterns', description: 'Dive deep into React and learn about hooks, context, performance optimization, and advanced patterns for building large-scale applications.', teacherId: '1', duration: '6 Weeks', imageUrl: placeholderImages[1].imageUrl },
        { id: '103', title: 'Data Structures & Algorithms', description: 'Understand the core concepts of data structures and algorithms. A fundamental course for any aspiring software engineer.', teacherId: '1', duration: '10 Weeks', imageUrl: placeholderImages[2].imageUrl },
    ],
    enrollments: [],
    assignments: [],
    submissions: [],
    discussionThreads: [],
    discussionPosts: [],
    materials: [],
    notifications: [],
    attendance: [],
    certificates: [],
    challenges: [
      { id: 'ch1', title: 'E-commerce Search Component', description: 'Build a reusable search component for an e-commerce platform that allows filtering by category, price range, and rating. The component should be performant and accessible.', company: 'Shopify', points: 150, icon: 'ShoppingCart' },
      { id: 'ch2', title: 'Social Media Dashboard UI', description: 'Design and implement a responsive UI for a social media analytics dashboard. It should display key metrics like follower growth, engagement rate, and top posts in a visually appealing way.', company: 'Meta', points: 200, icon: 'Users' },
      { id: 'ch3', title: 'API for a Simple To-Do App', description: 'Develop a RESTful API for a to-do list application. The API should support creating, reading, updating, and deleting tasks, and include user authentication.', company: 'Google', points: 250, icon: 'Code' },
      { id: 'ch4', title: 'Real-time Chat Application', description: 'Build a real-time chat application using WebSockets. Users should be able to join rooms and send messages that are instantly visible to other users in the same room.', company: 'Slack', points: 300, icon: 'MessageSquare' },
      { id: 'ch5', title: 'CI/CD Pipeline for a Node.js App', description: 'Set up a complete CI/CD pipeline for a simple Node.js application using GitHub Actions. The pipeline should automatically test, build, and deploy the application to a cloud service.', company: 'GitHub', points: 280, icon: 'GitMerge' },
      { id: 'ch6', title: 'Database Schema for a Booking System', description: 'Design a normalized SQL database schema for a hotel booking system. It should handle rooms, bookings, users, and payments efficiently.', company: 'Booking.com', points: 220, icon: 'Database' },
      { id: 'ch7', title: 'Dynamic OG Image Generator', description: 'Create a service that dynamically generates social media preview images (Open Graph images) based on an article title and author. This is a common requirement for blogs and news sites.', company: 'Vercel', points: 260, icon: 'Code' },
      { id: 'ch8', title: 'Webhook Handler Service', description: 'Develop a robust webhook handler that can receive and process events from a third-party service like Stripe. The handler needs to be secure, reliable, and able to handle retries.', company: 'Stripe', points: 270, icon: 'GitMerge' },
      { id: 'ch9', title: 'Serverless Image Processing Pipeline', description: 'Using AWS Lambda and S3, create a pipeline that automatically resizes uploaded images into multiple formats (e.g., thumbnail, medium, large).', company: 'Amazon Web Services', points: 320, icon: 'Code' },
    ],
    challengeSubmissions: [],
    challengeVotes: []
};

// --- Caching Layer for DB Reads ---
const getDb = async (): Promise<Db> => {
    try {
        await fs.access(dbPath);
    } catch (error) {
        // If the file doesn't exist, create it with default data
         await fs.writeFile(dbPath, JSON.stringify(defaultDb, null, 2));
    }
    const data = await fs.readFile(dbPath, 'utf-8');
    const dbContent = JSON.parse(data);

    // Ensure all data arrays exist
    return { ...defaultDb, ...dbContent } as Db;
};


async function writeDb(data: Db): Promise<void> {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

const unknownUser: User = { id: '0', name: 'Unknown User', email: '', role: 'student' };


// --- User Functions ---
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  return db.users.find(user => user.email === email);
}

export async function findUserById(id: string): Promise<User> {
  const db = await getDb();
  return db.users.find(user => user.id === id) || unknownUser;
}

export async function createUser(data: Omit<User, 'id'>): Promise<User> {
  const db = await getDb();
  const newUser: User = { id: String(Date.now()), ...data };
  db.users.push(newUser);
  await writeDb(db);
  return newUser;
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'email' | 'role'>>): Promise<User | undefined> {
    const db = await getDb();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;
    
    // Merge data, but don't allow changing email or role
    const { email, role, ...updatableData } = data;
    db.users[userIndex] = { ...db.users[userIndex], ...updatableData };
    await writeDb(db);
    return db.users[userIndex];
}

export async function getAuthenticatedUser(): Promise<User | null> {
    const { user } = await getSession();
    return user;
}

// --- Course Functions ---
export async function getAllCourses(query?: string): Promise<Course[]> {
  const db = await getDb();
  if (!query) return db.courses;
  return db.courses.filter(course =>
    course.title.toLowerCase().includes(query.toLowerCase()) ||
    course.description.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getCourseById(id: string): Promise<(Course & { teacher: User }) | undefined> {
  const db = await getDb();
  const course = db.courses.find(c => c.id === id);
  if (!course) return undefined;
  
  const teacher = await findUserById(course.teacherId);
  // If teacher is not found, we should not return a course object as it's incomplete.
  if (teacher.id === '0') return undefined;

  return { ...course, teacher };
}

export async function createCourse(data: Omit<Course, 'id' | 'teacherId' | 'imageUrl'>, teacherId: string): Promise<Course> {
    const db = await getDb();
    const newCourse: Course = {
        ...data,
        id: String(Date.now()),
        teacherId,
        imageUrl: placeholderImages[Math.floor(Math.random() * placeholderImages.length)].imageUrl,
    };
    db.courses.push(newCourse);
    await writeDb(db);
    return newCourse;
}

export async function updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'teacherId' | 'imageUrl'>>): Promise<Course | undefined> {
    const db = await getDb();
    const courseIndex = db.courses.findIndex(c => c.id === id);
    if (courseIndex === -1) return undefined;
    
    db.courses[courseIndex] = { ...db.courses[courseIndex], ...data };
    await writeDb(db);
    return db.courses[courseIndex];
}

export async function deleteCourse(id: string): Promise<boolean> {
    const db = await getDb();
    const initialLength = db.courses.length;
    db.courses = db.courses.filter(c => c.id !== id);
    // Also delete associated enrollments, assignments, submissions, and discussions
    db.enrollments = db.enrollments.filter(e => e.courseId !== id);
    
    const assignmentIdsToDelete = db.assignments.filter(a => a.courseId === id).map(a => a.id);
    db.submissions = db.submissions.filter(s => !assignmentIdsToDelete.includes(s.assignmentId));
    db.assignments = db.assignments.filter(a => a.courseId !== id);


    const threadIdsToDelete = db.discussionThreads.filter(t => t.courseId === id).map(t => t.id);
    db.discussionThreads = db.discussionThreads.filter(t => t.courseId !== id);
    db.discussionPosts = db.discussionPosts.filter(p => !threadIdsToDelete.includes(p.threadId));

    await writeDb(db);
    return db.courses.length < initialLength;
}


export async function getTeacherById(id: string): Promise<User> {
    return findUserById(id);
}

export async function getTeacherCourses(teacherId: string, query?: string): Promise<Course[]> {
    const db = await getDb();
    let teacherCourses = db.courses.filter(c => c.teacherId === teacherId);

    if (query) {
        teacherCourses = teacherCourses.filter(course =>
            course.title.toLowerCase().includes(query.toLowerCase()) ||
            course.description.toLowerCase().includes(query.toLowerCase())
        );
    }
    return teacherCourses;
}


// --- Enrollment Functions ---
export async function getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
  const db = await getDb();
  return db.enrollments.filter(e => e.studentId === studentId);
}

export async function getStudentsByCourse(courseId: string): Promise<User[]> {
    const db = await getDb();
    const courseEnrollments = db.enrollments.filter(e => e.courseId === courseId);
    const studentIds = courseEnrollments.map(e => e.studentId);
    
    const students = await Promise.all(studentIds.map(id => findUserById(id)));
    return students.filter(s => s.id !== '0');
}

export async function enrollInCourse(studentId: string, courseId: string): Promise<Enrollment | null> {
    const db = await getDb();
    const alreadyEnrolled = db.enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
    if (alreadyEnrolled) {
        return null;
    }
    const newEnrollment: Enrollment = {
        id: String(Date.now()),
        studentId,
        courseId,
    };
    db.enrollments.push(newEnrollment);
await writeDb(db);
    return newEnrollment;
}

export async function isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const db = await getDb();
    return db.enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
}

export async function getTeacherStudents(teacherId: string) {
    const db = await getDb();
    const courses = db.courses.filter(c => c.teacherId === teacherId);
    const studentMap = new Map<string, { user: User, courses: string[] }>();

    for (const course of courses) {
        const students = await getStudentsByCourse(course.id);
        for (const student of students) {
             if (student.id === '0') continue;
            if (!studentMap.has(student.id)) {
                studentMap.set(student.id, { user: student, courses: [] });
            }
            studentMap.get(student.id)!.courses.push(course.title);
        }
    }
    
    const studentList = Array.from(studentMap.values());

    const studentsWithStats = studentList.map(item => {
        const studentSubmissions = db.submissions
            .filter(s => s.studentId === item.user.id && s.grade !== null)
            .sort((a,b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
        
        const totalGrade = studentSubmissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
        const averageGrade = studentSubmissions.length > 0 ? Math.round(totalGrade / studentSubmissions.length) : 0;

        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (studentSubmissions.length >= 3) {
            const lastThreeGrades = studentSubmissions.slice(-3).map(s => s.grade || 0);
            const lastThreeAverage = lastThreeGrades.reduce((acc, grade) => acc + grade, 0) / 3;
            if (lastThreeAverage > averageGrade + 5) {
                trend = 'improving';
            } else if (lastThreeAverage < averageGrade - 5) {
                trend = 'declining';
            }
        }
        
        return {
            id: item.user.id,
            name: item.user.name,
            email: item.user.email,
            courses: item.courses,
            averageGrade,
            assignmentsCompleted: studentSubmissions.length,
            trend,
        };
    });

    return studentsWithStats;
}


// --- Assignment Functions ---
export async function getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    const db = await getDb();
    return db.assignments.filter(a => a.courseId === courseId);
}

export async function getAssignmentsByTeacher(teacherId: string): Promise<(Assignment & { courseTitle: string, submissions: number })[]> {
    const db = await getDb();
    const teacherCourses = db.courses.filter(c => c.teacherId === teacherId);
    const courseIds = teacherCourses.map(c => c.id);
    const teacherAssignments = db.assignments.filter(a => courseIds.includes(a.courseId));
    
    return teacherAssignments.map(assignment => {
        const course = db.courses.find(c => c.id === assignment.courseId);
        const submissionCount = db.submissions.filter(s => s.assignmentId === assignment.id).length;
        return {
            ...assignment,
            courseTitle: course?.title || 'Unknown Course',
            submissions: submissionCount,
        };
    });
}

export async function createAssignment(data: Omit<Assignment, 'id'>): Promise<Assignment> {
    const db = await getDb();
    const newAssignment: Assignment = { ...data, id: String(Date.now()) };
    db.assignments.push(newAssignment);
await writeDb(db);
    return newAssignment;
}

export async function getAssignmentById(id: string): Promise<(Assignment & { submissions: (Submission & { student: User })[] }) | undefined> {
    const db = await getDb();
    const assignment = db.assignments.find(a => a.id === id);
    if (!assignment) return undefined;

    const assignmentSubmissions = db.submissions.filter(s => s.assignmentId === assignment.id);
    
    const submissionsWithStudents = (await Promise.all(
        assignmentSubmissions.map(async sub => {
            const student = await findUserById(sub.studentId);
            if (student.id === '0') return null; // Filter out submissions from deleted students
            return { ...sub, student };
        })
    )).filter((sub): sub is (Submission & { student: User }) => sub !== null);

    return { ...assignment, submissions: submissionsWithStudents };
}


// --- Submission Functions ---
export async function getSubmissionById(id: string): Promise<Submission | undefined> {
    const db = await getDb();
    return db.submissions.find(s => s.id === id);
}

export async function getStudentSubmission(studentId: string, assignmentId: string): Promise<Submission | undefined> {
    const db = await getDb();
    return db.submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
}

export async function createSubmission(data: Omit<Submission, 'id' | 'submittedAt' | 'grade' | 'feedback'>): Promise<Submission> {
    const db = await getDb();
    const newSubmission: Submission = { 
        ...data, 
        id: String(Date.now()), 
        submittedAt: new Date().toISOString(),
        grade: null,
        feedback: null
    };
    db.submissions.push(newSubmission);
await writeDb(db);
    return newSubmission;
}

export async function gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission | undefined> {
    const db = await getDb();
    const submissionIndex = db.submissions.findIndex(s => s.id === submissionId);
    if (submissionIndex === -1) return undefined;

    db.submissions[submissionIndex] = {
        ...db.submissions[submissionIndex],
        grade,
        feedback,
    };
await writeDb(db);
    return db.submissions[submissionIndex];
}

export async function getStudentGrades(studentId: string): Promise<GradedSubmission[]> {
    const db = await getDb();
    const studentSubmissions = db.submissions.filter(s => s.studentId === studentId && s.grade !== null);
    
    const gradedSubmissions = await Promise.all(studentSubmissions.map(async sub => {
        const assignment = db.assignments.find(a => a.id === sub.assignmentId);
        if (!assignment) return null; // Assignment deleted
        const course = db.courses.find(c => c.id === assignment.courseId);
        if (!course) return null; // Course deleted
        return { ...sub, assignment, course };
    }));
    
    return gradedSubmissions.filter((sub): sub is GradedSubmission => sub !== null);
}


// --- Discussion Functions ---
export async function getThreadsByCourse(courseId: string): Promise<(DiscussionThread & { author: User, postCount: number })[]> {
    const db = await getDb();
    const threads = db.discussionThreads.filter(t => t.courseId === courseId);
    
    const threadsWithAuthors = (await Promise.all(threads.map(async thread => {
        const author = await findUserById(thread.authorId);
        if (author.id === '0') return null; 
        const postCount = db.discussionPosts.filter(p => p.threadId === thread.id).length;
        return { ...thread, author, postCount };
    }))).filter((thread): thread is (DiscussionThread & { author: User, postCount: number }) => thread !== null);
    
    return threadsWithAuthors;
}

export async function getThreadById(threadId: string): Promise<(DiscussionThread & { author: User }) | undefined> {
    const db = await getDb();
    const thread = db.discussionThreads.find(t => t.id === threadId);
    if (!thread) return undefined;

    const author = await findUserById(thread.authorId);
    if (author.id === '0') return undefined; 
    
    return { ...thread, author };
}

export async function getPostsByThread(threadId: string): Promise<(DiscussionPost & { author: User })[]> {
    const db = await getDb();
    const posts = db.discussionPosts.filter(p => p.threadId === threadId);

    const postsWithAuthors = (await Promise.all(posts.map(async post => {
        const author = await findUserById(post.authorId);
        if (author.id === '0') return null; 
        return { ...post, author };
    }))).filter((post): post is (DiscussionPost & { author: User }) => post !== null);

    return postsWithAuthors;
}

export async function createThread(data: Omit<DiscussionThread, 'id' | 'createdAt'>): Promise<DiscussionThread> {
    const db = await getDb();
    const newThread: DiscussionThread = { ...data, id: String(Date.now()), createdAt: new Date().toISOString() };
    db.discussionThreads.push(newThread);
await writeDb(db);
    return newThread;
}

export async function createPost(data: Omit<DiscussionPost, 'id' | 'createdAt'>): Promise<DiscussionPost> {
    const db = await getDb();
    const newPost: DiscussionPost = { ...data, id: String(Date.now()), createdAt: new Date().toISOString() };
    db.discussionPosts.push(newPost);
await writeDb(db);
    return newPost;
}

// --- Material Functions ---
export async function addMaterial(data: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
  const db = await getDb();
  const newMaterial: Material = {
    ...data,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
  };
  db.materials.push(newMaterial);
await writeDb(db);
  return newMaterial;
}

export async function getMaterialsByCourse(courseId: string): Promise<Material[]> {
    const db = await getDb();
    return db.materials.filter(m => m.courseId === courseId);
}

// --- Notification Functions ---
export async function createNotification(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification> {
    const db = await getDb();
    const newNotification: Notification = {
        ...data,
        id: String(Date.now()),
        isRead: false,
        createdAt: new Date().toISOString(),
    };
    db.notifications.unshift(newNotification); // Add to the beginning of the array
await writeDb(db);
    return newNotification;
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
    const db = await getDb();
    return db.notifications.filter(n => n.userId === userId);
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
    const db = await getDb();
    const notificationIndex = db.notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex > -1) {
        db.notifications[notificationIndex].isRead = true;
await writeDb(db);
        return true;
    }
    return false;
}

// --- Leaderboard Functions ---
export async function getStudentRankings(): Promise<{ user: User, averageGrade: number, assignmentsCompleted: number, credibilityPoints: number }[]> {
    const db = await getDb();
    const students = db.users.filter(u => u.role === 'student');
    const studentStats = await Promise.all(students.map(async student => {
        const studentSubmissions = db.submissions.filter(s => s.studentId === student.id && s.grade !== null);
        const totalGrade = studentSubmissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
        const averageGrade = studentSubmissions.length > 0 ? totalGrade / studentSubmissions.length : 0;
        
        const challengeSubmissions = db.challengeSubmissions.filter(cs => cs.studentId === student.id);
        let credibilityPoints = 0;
        for (const cs of challengeSubmissions) {
            const votes = await getVotesForSubmission(cs.id);
            const challenge = db.challenges.find(c => c.id === cs.challengeId);
            if (challenge) {
                credibilityPoints += (votes * 10) + challenge.points; // 10 points per vote + base points
            }
        }
        
        return {
            user: student,
            averageGrade: Math.round(averageGrade),
            assignmentsCompleted: studentSubmissions.length,
            credibilityPoints
        };
    }));

    // Sort by average grade descending, then by assignments completed descending
    return studentStats.sort((a, b) => {
        if (b.averageGrade !== a.averageGrade) {
            return b.averageGrade - a.averageGrade;
        }
        return b.assignmentsCompleted - a.assignmentsCompleted;
    });
}

// --- Attendance Functions ---
export async function markAttendance(studentId: string, courseId: string): Promise<Attendance | null> {
    const db = await getDb();
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    
    const existingRecord = db.attendance.find(a => 
        a.studentId === studentId && 
        a.courseId === courseId && 
        a.date === today
    );

    if (existingRecord) {
        return null; // Already marked for today
    }

    const newAttendanceRecord: Attendance = {
        id: String(Date.now()),
        studentId,
        courseId,
        date: today,
        isPresent: true,
    };
    db.attendance.push(newAttendanceRecord);
await writeDb(db);
    return newAttendanceRecord;
}

export async function getAllAttendance(): Promise<(Attendance & { student: User, course: Course })[]> {
    const db = await getDb();
    
    const attendanceWithDetails = (await Promise.all(db.attendance.map(async (record) => {
        const student = await findUserById(record.studentId);
        const course = db.courses.find(c => c.id === record.courseId);

        if (student.id !== '0' && course) {
            return { ...record, student, course };
        }
        return null;
    }))).filter((rec): rec is (Attendance & { student: User, course: Course }) => rec !== null);

    return attendanceWithDetails.sort((a,b) => new Date(b!.date).getTime() - new Date(a!.date).getTime());
}

// --- Certificate Functions ---

const PASSING_GRADE = 70;

export async function getCompletedCoursesForStudent(studentId: string): Promise<Course[]> {
    const db = await getDb();
    const enrollments = db.enrollments.filter(e => e.studentId === studentId);
    const completedCourses: Course[] = [];

    for (const enrollment of enrollments) {
        const course = db.courses.find(c => c.id === enrollment.courseId);
        if (!course) continue;

        const assignments = db.assignments.filter(a => a.courseId === course.id);
        if (assignments.length === 0) continue; // Cannot complete a course with no assignments

        const submissions = db.submissions.filter(s => s.studentId === studentId && assignments.some(a => a.id === s.assignmentId));

        const allAssignmentsSubmittedAndPassed = assignments.every(assignment => {
            const submission = submissions.find(s => s.assignmentId === assignment.id);
            return submission && submission.grade !== null && submission.grade >= PASSING_GRADE;
        });

        if (allAssignmentsSubmittedAndPassed) {
            completedCourses.push(course);
        }
    }
    return completedCourses;
}

export async function getStudentCertificates(studentId: string): Promise<(Certificate & { course: Course })[]> {
    const db = await getDb();
    const certificates = db.certificates.filter(c => c.studentId === studentId);
    
    const certificatesWithCourses = certificates.map(cert => {
        const course = db.courses.find(c => c.id === cert.courseId);
        if (!course) return null;
        return { ...cert, course };
    }).filter((cert): cert is (Certificate & { course: Course }) => cert !== null);

    return certificatesWithCourses.sort((a, b) => new Date(b!.issuedAt).getTime() - new Date(a!.issuedAt).getTime());
}

export async function getCertificateById(id: string): Promise<(Certificate & { student: User; course: Course & { teacher: User } }) | undefined> {
    const db = await getDb();
    const certificate = db.certificates.find(c => c.id === id);
    if (!certificate) return undefined;

    const student = await findUserById(certificate.studentId);
    if (student.id === '0') return undefined;

    const course = await getCourseById(certificate.courseId);
    if (!course) return undefined;
    
    // The teacher is already fetched inside getCourseById
    if (course.teacher.id === '0') return undefined;

    return { ...certificate, student, course };
}


export async function generateCertificate(studentId: string, courseId: string): Promise<Certificate | null> {
    const db = await getDb();
    const existingCertificate = db.certificates.find(c => c.studentId === studentId && c.courseId === courseId);
    if (existingCertificate) {
        return null; // Already generated
    }

    const newCertificate: Certificate = {
        id: String(Date.now()),
        studentId,
        courseId,
        issuedAt: new Date().toISOString(),
        verificationId: randomUUID(),
    };

    db.certificates.push(newCertificate);
await writeDb(db);
    return newCertificate;
}

// --- Challenge Functions ---
export async function getAllChallenges(): Promise<Challenge[]> {
    const db = await getDb();
    return db.challenges;
}

export async function getChallengeById(id: string): Promise<Challenge | undefined> {
    const db = await getDb();
    return db.challenges.find(c => c.id === id);
}

export async function getSubmissionsForChallenge(challengeId: string): Promise<(ChallengeSubmission & { student: User; votes: number })[]> {
    const db = await getDb();
    const submissions = db.challengeSubmissions.filter(s => s.challengeId === challengeId);
    
    const submissionsWithDetails = await Promise.all(submissions.map(async sub => {
        const student = await findUserById(sub.studentId);
        const votes = await getVotesForSubmission(sub.id);
        return { ...sub, student, votes };
    }));
    
    return submissionsWithDetails.filter(s => s.student.id !== '0');
}

export async function createChallengeSubmission(data: Omit<ChallengeSubmission, 'id' | 'submittedAt'>): Promise<ChallengeSubmission> {
    const db = await getDb();
    const newSubmission: ChallengeSubmission = { 
        ...data, 
        id: String(Date.now()), 
        submittedAt: new Date().toISOString(),
    };
    db.challengeSubmissions.push(newSubmission);
    await writeDb(db);
    return newSubmission;
}

export async function voteOnSubmission(submissionId: string, voterId: string): Promise<ChallengeVote | null> {
    const db = await getDb();
    const submission = db.challengeSubmissions.find(s => s.id === submissionId);
    if (!submission) return null;

    // Prevent user from voting on their own submission
    if (submission.studentId === voterId) {
        return null;
    }

    const existingVote = db.challengeVotes.find(v => v.submissionId === submissionId && v.voterId === voterId);
    if (existingVote) {
        return null; // Already voted
    }

    const newVote: ChallengeVote = {
        id: String(Date.now()),
        submissionId,
        voterId,
    };
    db.challengeVotes.push(newVote);
    await writeDb(db);
    return newVote;
}

export async function getVotesForSubmission(submissionId: string): Promise<number> {
    const db = await getDb();
    return db.challengeVotes.filter(v => v.submissionId === submissionId).length;
}


// --- Dashboard Functions ---
export type CoursePerformance = {
    courseId: string;
    courseTitle: string;
    gradeDistribution: { name: string; students: number }[];
};

export type StudentOfTheWeek = {
    studentId: string;
    studentName: string;
    averageGrade: number;
    reason: string;
} | null;

export type StudentDashboardStats = {
    stats: {
        title: string;
        value: string | number;
        subtitle: string;
        icon: string;
        link?: { href: string; text: string; };
    }[];
    learningEfficiency: {
        score: number;
        components: {
            attention: number;
            completion: number;
            accuracy: number;
        }
    };
    streak: number;
};

export type TeacherDashboardStats = {
    stats: {
        title: string;
        value: string | number;
        subtitle: string;
        icon: string;
        link?: { href: string; text: string; };
    }[];
    coursePerformances: CoursePerformance[];
    studentOfTheWeek: StudentOfTheWeek;
}

export type DashboardStats = StudentDashboardStats | TeacherDashboardStats;


export async function getDashboardData(userId: string, role: 'teacher' | 'student'): Promise<DashboardStats> {
    const db = await getDb();

    if (role === 'teacher') {
        const courses = db.courses.filter(c => c.teacherId === userId);
        const courseIds = courses.map(c => c.id);
        
        const enrollments = db.enrollments.filter(e => courseIds.includes(e.courseId));
        const studentIds = new Set(enrollments.map(e => e.studentId));

        const assignments = db.assignments.filter(a => courseIds.includes(a.courseId));
        const assignmentIds = assignments.map(a => a.id);

        const submissions = db.submissions.filter(s => assignmentIds.includes(s.assignmentId));
        const pendingSubmissions = submissions.filter(s => s.grade === null).length;

        const coursePerformances: CoursePerformance[] = courses.map(course => {
            const courseAssignments = db.assignments.filter(a => a.courseId === course.id);
            const courseAssignmentIds = courseAssignments.map(a => a.id);
            const courseSubmissions = db.submissions.filter(s => courseAssignmentIds.includes(s.assignmentId));
            
            const gradeDistribution = [
                { name: 'A (90+)', students: 0 },
                { name: 'B (80-89)', students: 0 },
                { name: 'C (70-79)', students: 0 },
                { name: 'D (60-69)', students: 0 },
                { name: 'F (<60)', students: 0 },
            ];

            const gradedSubmissions = courseSubmissions.filter(s => s.grade !== null);
            
            gradedSubmissions.forEach(sub => {
                if (sub.grade === null) return;
                if (sub.grade >= 90) gradeDistribution[0].students++;
                else if (sub.grade >= 80) gradeDistribution[1].students++;
                else if (sub.grade >= 70) gradeDistribution[2].students++;
                else if (sub.grade >= 60) gradeDistribution[3].students++;
                else gradeDistribution[4].students++;
            });

            return {
                courseId: course.id,
                courseTitle: course.title,
                gradeDistribution,
            };
        });

        // --- Student of the Week Logic ---
        let studentOfTheWeek: StudentOfTheWeek = null;
        const sevenDaysAgo = subDays(new Date(), 7);
        
        const weeklyScores: { studentId: string; name: string; score: number; grade: number }[] = [];

        for (const studentId of studentIds) {
            const student = db.users.find(u => u.id === studentId);
            if (!student) continue;

            const recentSubmissions = submissions.filter(s => 
                s.studentId === studentId && 
                s.grade !== null &&
                new Date(s.submittedAt) >= sevenDaysAgo
            );

            if (recentSubmissions.length > 0) {
                const totalGrade = recentSubmissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
                const averageGrade = totalGrade / recentSubmissions.length;
                
                // Simple score: average grade + bonus for number of submissions
                const score = averageGrade + (recentSubmissions.length * 5);
                weeklyScores.push({ studentId, name: student.name, score, grade: Math.round(averageGrade) });
            }
        }

        if (weeklyScores.length > 0) {
            weeklyScores.sort((a, b) => b.score - a.score);
            const topStudent = weeklyScores[0];
            studentOfTheWeek = {
                studentId: topStudent.studentId,
                studentName: topStudent.name,
                averageGrade: topStudent.grade,
                reason: 'Top Performer This Week',
            };
        }
        // --- End Student of the Week Logic ---

        return {
            stats: [
                { title: 'Courses Taught', value: courses.length, subtitle: 'Total active courses', icon: 'BookOpen', link: { href: "/courses", text: "Manage Courses"} },
                { title: 'Total Students', value: studentIds.size, subtitle: 'Across all courses', icon: 'Users', link: { href: "/students", text: "View Students"} },
                { title: 'Pending Submissions', value: pendingSubmissions, subtitle: 'Awaiting grading', icon: 'GraduationCap' },
            ],
            coursePerformances,
            studentOfTheWeek
        };
    } else { // role is 'student'
        const enrollments = await getStudentEnrollments(userId);
        const enrolledCourseIds = enrollments.map(e => e.courseId);

        const allAssignments = db.assignments.filter(a => enrolledCourseIds.includes(a.courseId));
        
        // --- Due Soon Calculation ---
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const studentSubmissions = db.submissions.filter(s => s.studentId === userId);
        const submittedAssignmentIds = new Set(studentSubmissions.map(s => s.assignmentId));
        const assignmentsDueSoon = allAssignments.filter(a => {
            const dueDate = new Date(a.dueDate);
            return dueDate > new Date() && dueDate <= sevenDaysFromNow && !submittedAssignmentIds.has(a.id);
        }).length;
        
        // --- Average Grade Calculation ---
        const gradedSubmissions = studentSubmissions.filter(s => s.grade !== null);
        const totalGrade = gradedSubmissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
        const averageGrade = gradedSubmissions.length > 0 ? Math.round(totalGrade / gradedSubmissions.length) : 0;
        
        const gradeToLetter = (grade: number) => {
            if (grade >= 90) return 'A';
            if (grade >= 80) return 'B';
            if (grade >= 70) return 'C';
            if (grade >= 60) return 'D';
            if (grade > 0) return 'F';
            return 'N/A';
        }

        // --- Learning Efficiency Score Calculation ---
        let totalAttention = 0;
        let totalCompletion = 0;

        for (const enrollment of enrollments) {
            const firstAttendance = db.attendance.find(a => a.studentId === userId && a.courseId === enrollment.courseId);
            if (!firstAttendance) continue;

            const daysSinceEnrollment = differenceInDays(new Date(), parseISO(firstAttendance.date)) + 1;
            const attendanceDays = db.attendance.filter(a => a.studentId === userId && a.courseId === enrollment.courseId).length;
            totalAttention += (attendanceDays / daysSinceEnrollment);

            const courseAssignments = allAssignments.filter(a => a.courseId === enrollment.courseId);
            if (courseAssignments.length > 0) {
                 const courseSubmissions = studentSubmissions.filter(s => courseAssignments.some(a => a.id === s.assignmentId));
                 totalCompletion += (courseSubmissions.length / courseAssignments.length);
            }
        }
        
        const attentionScore = enrollments.length > 0 ? (totalAttention / enrollments.length) * 100 : 0;
        const completionScore = enrollments.length > 0 ? (totalCompletion / enrollments.length) * 100 : 0;
        const accuracyScore = averageGrade;

        const efficiencyScore = (attentionScore * 0.25) + (completionScore * 0.4) + (accuracyScore * 0.35);

        // --- Streak Calculation ---
        const attendanceRecords = db.attendance
            .filter(a => a.studentId === userId)
            .map(a => parseISO(a.date))
            .sort((a, b) => b.getTime() - a.getTime());
        
        let streak = 0;
        if (attendanceRecords.length > 0) {
            const uniqueDates = [...new Set(attendanceRecords.map(d => d.toISOString().split('T')[0]))]
                .map(d => parseISO(d))
                .sort((a,b) => b.getTime() - a.getTime());

            let currentDate = new Date();
            if (uniqueDates.length > 0 && (isSameDay(uniqueDates[0], currentDate) || isSameDay(uniqueDates[0], subDays(currentDate, 1)))) {
                 streak = 1;
                 currentDate = uniqueDates[0];
                 for (let i = 1; i < uniqueDates.length; i++) {
                     const previousDate = subDays(currentDate, 1);
                     if (isSameDay(uniqueDates[i], previousDate)) {
                         streak++;
                         currentDate = uniqueDates[i];
                     } else {
                         break;
                     }
                 }
            }
             // If the last activity was yesterday, the streak is maintained. If it was today, it's also maintained. If it's older, streak is 0 unless today they log in.
            if (uniqueDates.length > 0) {
                 const lastDay = uniqueDates[0];
                 const today = new Date();
                 const yesterday = subDays(today, 1);
                 
                 if (isSameDay(lastDay, today) || isSameDay(lastDay, yesterday)) {
                    // Streak is active, calculate it
                    let currentStreak = 0;
                    let expectedDate = today;
                    
                    if (isSameDay(lastDay, today)) {
                        currentStreak = 1;
                        expectedDate = subDays(today, 1);
                    } else { // last day was yesterday
                         currentStreak = 1;
                         expectedDate = subDays(yesterday, 1);
                    }

                    let dateIndex = 1;
                    while(dateIndex < uniqueDates.length) {
                        if (isSameDay(uniqueDates[dateIndex], expectedDate)) {
                            currentStreak++;
                            expectedDate = subDays(expectedDate, 1);
                            dateIndex++;
                        } else if (uniqueDates[dateIndex] < expectedDate) {
                            // Gap in dates, stop counting
                            break;
                        } else {
                           // This can happen if there are multiple records for the same day, just skip
                           dateIndex++;
                        }
                    }
                    streak = currentStreak;

                 } else {
                    streak = 0;
                 }
            }


        }


        return {
            stats: [
                { title: 'Enrolled Courses', value: enrollments.length, subtitle: 'Ready to learn', icon: 'BookOpen', link: { href: "/courses", text: "View Courses"} },
                { title: 'Assignments Due', value: assignmentsDueSoon, subtitle: 'In the next 7 days', icon: 'ClipboardList' },
                { title: 'Overall Grade', value: gradeToLetter(averageGrade), subtitle: 'Keep it up!', icon: 'GraduationCap' },
            ],
            learningEfficiency: {
                score: Math.round(efficiencyScore),
                components: {
                    attention: Math.round(attentionScore),
                    completion: Math.round(completionScore),
                    accuracy: Math.round(accuracyScore),
                }
            },
            streak,
        };
    }
}

// One-time script to send welcome notifications to existing users
async function runOneTimeScripts() {
    const db = await getDb();

    // Check if a flag file exists. If not, run the script and create it.
    const flagPath = path.join(process.cwd(), 'src', 'lib', '.welcome-sent');
    try {
        await fs.access(flagPath);
        // If file exists, do nothing.
        return;
    } catch (error) {
        // File does not exist, proceed with script.
        const welcomeMessage = `Welcome to CourseMaestro! 🎉 We're excited to have you join our learning community. Whether you're here to master new skills, explore fresh ideas, or level up your career, you've come to the right place. Dive into your courses, track your progress, and let your learning journey begin! — Team CourseMaestro`;

        const existingNotificationSubjects = new Set(
            db.notifications
                .filter(n => n.message.startsWith("Welcome"))
                .map(n => n.userId)
        );

        for (const user of db.users) {
            if (!existingNotificationSubjects.has(user.id)) {
                await createNotification({
                    userId: user.id,
                    message: welcomeMessage,
                    link: '/dashboard',
                });
            }
        }

        // Create the flag file to prevent re-running
        await fs.writeFile(flagPath, 'done');
        console.log("One-time welcome notification script completed.");
    }
}

// Run the one-time script
runOneTimeScripts().catch(console.error);


    
