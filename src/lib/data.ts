

'use server';

import { placeholderImages } from './placeholder-images.json';
import type { Course, Enrollment, User, Assignment, Submission, GradedSubmission, DiscussionThread, DiscussionPost, Material, Notification, Attendance, Certificate, Challenge, ChallengeSubmission, ChallengeVote, Project, InternshipDomain } from './types';
import { randomUUID } from 'crypto';
import { unstable_cache } from 'next/cache';
import { differenceInDays, parseISO, isSameDay, subDays } from 'date-fns';
import { getSession } from './session';


const unknownUser: User = { id: '0', name: 'Unknown User', email: '', role: 'student' };


// In a real app, this would be a database. For this demo, we'll use a simple in-memory store.
// To make this work across server requests in a development environment, we'll attach it to the global object.
type Db = {
    users: User[];
    courses: Course[];
    enrollments: Enrollment[];
    assignments: Assignment[];
    submissions: Submission[];
    discussion_threads: DiscussionThread[];
    discussion_posts: DiscussionPost[];
    materials: Material[];
    notifications: Notification[];
    attendance: Attendance[];
    certificates: Certificate[];
    challenges: Challenge[];
    challenge_submissions: ChallengeSubmission[];
    challenge_votes: ChallengeVote[];
    projects: Project[];
    internship_domains: InternshipDomain[];
};

declare global {
  var __db: Db | undefined;
}

const db: Db = global.__db || {
    users: [
        { id: '1', name: 'Albus Dumbledore', email: 'teacher@school.com', password: 'password', role: 'teacher' },
        { id: '2', name: 'Harry Potter', email: 'student@school.com', password: 'password', role: 'student' },
        { id: '3', name: 'Hermione Granger', email: 'student2@school.com', password: 'password', role: 'student' },
        { id: '4', name: 'Ron Weasley', email: 'student3@school.com', password: 'password', role: 'student' },
    ],
    courses: [
        { id: '101', title: 'Introduction to Web Development', description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.', teacherId: '1', duration: '8 Weeks', imageUrl: 'https://picsum.photos/seed/1/600/400' },
        { id: '102', title: 'Advanced React Patterns', description: 'Dive deep into React and learn about hooks, context, performance optimization, and advanced patterns.', teacherId: '1', duration: '6 Weeks', imageUrl: 'https://picsum.photos/seed/2/600/400' },
        { id: '103', title: 'Data Structures & Algorithms', description: 'Understand the core concepts of data structures and algorithms. A fundamental course for any aspiring software engineer.', teacherId: '1', duration: '10 Weeks', imageUrl: 'https://picsum.photos/seed/3/600/400' },
    ],
    enrollments: [
        { id: 'en1', studentId: '2', courseId: '101' },
        { id: 'en2', studentId: '2', courseId: '102' },
        { id: 'en3', studentId: '3', courseId: '101' },
        { id: 'en4', studentId: '3', courseId: '103' },
        { id: 'en5', studentId: '4', courseId: '101' },
    ],
    assignments: [
        { id: 'as1', courseId: '101', title: 'HTML & CSS Basics', description: 'Create a simple personal portfolio page.', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'as2', courseId: '101', title: 'JavaScript Fundamentals', description: 'Build a simple calculator application.', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'as3', courseId: '102', title: 'React Hooks', description: 'Refactor a class component to use functional components and hooks.', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'as4', courseId: '103', title: 'Big O Notation', description: 'Analyze the time complexity of three different sorting algorithms.', dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    submissions: [
        { id: 'sub1', assignmentId: 'as1', studentId: '2', content: 'Here is my submission for the portfolio page.', submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), grade: 92, feedback: 'Great job on the structure and styling! Consider adding a bit more content.' },
        { id: 'sub2', assignmentId: 'as4', studentId: '2', content: 'Here is my analysis of the sorting algorithms.', submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), grade: 78, feedback: 'Good start, but your analysis of bubble sort could be more detailed.' },
        { id: 'sub3', assignmentId: 'as1', studentId: '3', content: 'My portfolio page submission.', submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), grade: 98, feedback: 'Excellent work! Very clean code and a beautiful design.' },
    ],
    discussion_threads: [
        { id: 'th1', courseId: '101', title: 'Question about Flexbox', authorId: '2', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    discussion_posts: [
        { id: 'po1', threadId: 'th1', authorId: '2', content: 'I\'m having trouble centering a div. Can anyone help?', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'po2', threadId: 'th1', authorId: '1', content: 'Sure! Have you tried using `display: flex; justify-content: center; align-items: center;` on the parent container?', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    materials: [
        { id: 'mat1', courseId: '101', title: 'MDN Web Docs', link: 'https://developer.mozilla.org', createdAt: new Date().toISOString() },
    ],
    notifications: [],
    attendance: [
        { id: 'att1', studentId: '2', courseId: '101', date: new Date().toISOString().split('T')[0], isPresent: true },
        { id: 'att2', studentId: '3', courseId: '101', date: new Date().toISOString().split('T')[0], isPresent: true },
    ],
    certificates: [],
    challenges: [
      { id: 'ch1', title: 'E-commerce Search Component', description: 'Build a reusable search component for an e-commerce platform that allows filtering by category, price range, and rating. The component should be performant and accessible.', company: 'Shopify', points: 150, icon: 'ShoppingCart' },
      { id: 'ch2', title: 'Social Media Dashboard UI', description: 'Design and implement a responsive UI for a social media analytics dashboard. It should display key metrics like follower growth, engagement rate, and top posts in a visually appealing way.', company: 'Meta', points: 200, icon: 'Users' },
    ],
    challenge_submissions: [],
    challenge_votes: [],
    projects: [],
    internship_domains: [
        {
            id: 'google',
            name: 'Google',
            description: 'A multinational technology company focusing on search engine technology, online advertising, cloud computing, and more.',
            icon: 'google',
            task: {
                title: 'Design a Scalable Ad-Targeting Algorithm',
                scenario: 'The Ads team is looking to improve the relevance of ads served on its content network. Your task is to design a high-level algorithm that can personalize ad delivery based on a user\'s recent search history and the content of the page they are viewing. Performance and privacy are key considerations.',
                task: 'Propose a system architecture that can process user data in near real-time to select the most relevant ad from a large inventory. Consider how you would balance personalization with user privacy concerns.',
                deliverables: [
                    'A high-level system diagram.',
                    'Pseudo-code for your core ad-selection logic.',
                    'A brief (1-2 paragraphs) explanation of your approach to privacy.'
                ]
            }
        },
        {
            id: 'openai',
            name: 'OpenAI',
            description: 'An AI research and deployment company. Their mission is to ensure that artificial general intelligence benefits all of humanity.',
            icon: 'openai',
            task: {
                title: 'Develop a Safety Filter for a Language Model',
                scenario: 'As part of the safety alignment team, you are tasked with developing a new pre-processing filter for a large language model. This filter should identify and flag potentially harmful or biased content in user prompts before they are sent to the model.',
                task: 'Design a multi-layered approach to detect harmful content. This could involve keyword matching, sentiment analysis, and even a smaller, specialized classification model. How would you handle ambiguous cases?',
                deliverables: [
                    'A description of at least three layers of your filter.',
                    'An example of a prompt that would be flagged and one that would pass, with explanations.',
                    'A strategy for minimizing false positives (flagging safe content).',
                ]
            }
        },
    ]
};

if (process.env.NODE_ENV !== 'production') {
  global.__db = db;
}


// --- User Functions ---
export async function findUserByEmail(email: string): Promise<User | undefined> {
    return db.users.find(user => user.email === email);
}

export const findUserById = unstable_cache(
    async (id: string): Promise<User> => {
        if (!id || id === '0') return unknownUser;
        return db.users.find(user => user.id === id) || unknownUser;
    },
    ['user'],
    { tags: ['users'], revalidate: 3600 }
);


export async function createUser(data: Omit<User, 'id'>): Promise<User> {
    const newUser = { id: randomUUID(), ...data };
    db.users.push(newUser);
    return newUser;
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'email' | 'role'>>): Promise<User | undefined> {
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;

    db.users[userIndex] = { ...db.users[userIndex], ...data };
    return db.users[userIndex];
}

export async function getAuthenticatedUser(): Promise<User | null> {
    const { user } = await getSession();
    return user;
}

// --- Course Functions ---
export async function getAllCourses(query?: string): Promise<Course[]> {
    if (query) {
        const lowercasedQuery = query.toLowerCase();
        return db.courses.filter(course =>
            course.title.toLowerCase().includes(lowercasedQuery) ||
            course.description.toLowerCase().includes(lowercasedQuery)
        );
    }
    return db.courses;
}

export const getCourseById = unstable_cache(
    async (id: string): Promise<(Course & { teacher: User }) | undefined> => {
        const course = db.courses.find(c => c.id === id);
        if (!course) return undefined;
        
        const teacher = await findUserById(course.teacherId);
        if (teacher.id === '0') return undefined;

        return { ...course, teacher };
    },
    ['course'],
    { tags: ['courses'], revalidate: 3600 }
);


export async function createCourse(data: Omit<Course, 'id' | 'teacherId' | 'imageUrl'>, teacherId: string): Promise<Course> {
    const newCourse: Course = {
        ...data,
        id: randomUUID(),
        teacherId,
        imageUrl: placeholderImages[Math.floor(Math.random() * placeholderImages.length)].imageUrl,
    };
    db.courses.push(newCourse);
    return newCourse;
}

export async function updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'teacherId' | 'imageUrl'>>): Promise<Course | undefined> {
    const courseIndex = db.courses.findIndex(c => c.id === id);
    if (courseIndex === -1) return undefined;

    db.courses[courseIndex] = { ...db.courses[courseIndex], ...data };
    return db.courses[courseIndex];
}

export async function deleteCourse(id: string): Promise<boolean> {
     db.courses = db.courses.filter(c => c.id !== id);
     db.enrollments = db.enrollments.filter(e => e.courseId !== id);
     db.assignments = db.assignments.filter(a => a.courseId !== id);
    return true;
}


export async function getTeacherById(id: string): Promise<User> {
    return findUserById(id);
}

export async function getTeacherCourses(teacherId: string, query?: string): Promise<Course[]> {
    const courses = db.courses.filter(course => course.teacherId === teacherId);
    if (query) {
        const lowercasedQuery = query.toLowerCase();
        return courses.filter(course =>
            course.title.toLowerCase().includes(lowercasedQuery) ||
            course.description.toLowerCase().includes(lowercasedQuery)
        );
    }
    return courses;
}


// --- Enrollment Functions ---
export async function getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    return db.enrollments.filter(e => e.studentId === studentId);
}

export async function getStudentsByCourse(courseId: string): Promise<User[]> {
    const studentIds = db.enrollments.filter(e => e.courseId === courseId).map(e => e.studentId);
    return db.users.filter(u => studentIds.includes(u.id));
}

export async function enrollInCourse(studentId: string, courseId: string): Promise<Enrollment | null> {
    const alreadyEnrolled = db.enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
    if (alreadyEnrolled) return null;

    const newEnrollment: Enrollment = { id: randomUUID(), studentId, courseId };
    db.enrollments.push(newEnrollment);
    return newEnrollment;
}

export async function isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    return db.enrollments.some(e => e.studentId === studentId && e.courseId === courseId);
}

export async function getTeacherStudents(teacherId: string) {
    const teacherCourseIds = new Set(db.courses.filter(c => c.teacherId === teacherId).map(c => c.id));
    const studentIds = new Set(db.enrollments.filter(e => teacherCourseIds.has(e.courseId)).map(e => e.studentId));
    
    return Promise.all(Array.from(studentIds).map(async (studentId) => {
        const student = await findUserById(studentId);
        const enrolledCourseIds = db.enrollments
            .filter(e => e.studentId === studentId && teacherCourseIds.has(e.courseId))
            .map(e => e.courseId);
        
        const courses = db.courses
            .filter(c => enrolledCourseIds.includes(c.id))
            .map(c => c.title);

        const submissions = db.submissions.filter(s => s.studentId === studentId && s.grade !== null);
        const totalGrade = submissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
        const averageGrade = submissions.length > 0 ? Math.round(totalGrade / submissions.length) : 0;

        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (submissions.length >= 3) {
            const lastThreeGrades = submissions.slice(-3).map(s => s.grade || 0);
            const lastThreeAverage = lastThreeGrades.reduce((acc, grade) => acc + grade, 0) / 3;
            if (lastThreeAverage > averageGrade + 5) trend = 'improving';
            else if (lastThreeAverage < averageGrade - 5) trend = 'declining';
        }

        return {
            id: student.id,
            name: student.name,
            email: student.email,
            courses,
            averageGrade,
            assignmentsCompleted: submissions.length,
            trend,
        };
    }));
}


// --- Assignment Functions ---
export async function getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    return db.assignments.filter(a => a.courseId === courseId);
}

export async function getAssignmentsByTeacher(teacherId: string): Promise<(Assignment & { courseTitle: string, submissions: number })[]> {
    const teacherCourses = db.courses.filter(c => c.teacherId === teacherId);
    const teacherCourseIds = teacherCourses.map(c => c.id);
    
    const assignments = db.assignments.filter(a => teacherCourseIds.includes(a.courseId));

    return assignments.map(assignment => {
        const course = teacherCourses.find(c => c.id === assignment.courseId);
        const submissions = db.submissions.filter(s => s.assignmentId === assignment.id).length;
        return {
            ...assignment,
            courseTitle: course?.title || 'Unknown Course',
            submissions
        }
    });
}

export async function createAssignment(data: Omit<Assignment, 'id'>): Promise<Assignment> {
    const newAssignment = { id: randomUUID(), ...data };
    db.assignments.push(newAssignment);
    return newAssignment;
}

export async function getAssignmentById(id: string): Promise<(Assignment & { submissions: (Submission & { student: User })[] }) | undefined> {
    const assignment = db.assignments.find(a => a.id === id);
    if (!assignment) return undefined;

    const submissions = await Promise.all(
        db.submissions
        .filter(s => s.assignmentId === id)
        .map(async (sub) => {
            const student = await findUserById(sub.studentId);
            return { ...sub, student };
        })
    );

    return { ...assignment, submissions };
}


// --- Submission Functions ---
export async function getSubmissionById(id: string): Promise<Submission | undefined> {
    return db.submissions.find(s => s.id === id);
}

export async function getStudentSubmission(studentId: string, assignmentId: string): Promise<Submission | undefined> {
    return db.submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
}

export async function createSubmission(data: Omit<Submission, 'id' | 'submittedAt' | 'grade' | 'feedback'>): Promise<Submission> {
    const newSubmission: Submission = { 
        ...data, 
        id: randomUUID(), 
        submittedAt: new Date().toISOString(),
        grade: null,
        feedback: null
    };
    db.submissions.push(newSubmission);
    return newSubmission;
}

export async function gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission | undefined> {
    const subIndex = db.submissions.findIndex(s => s.id === submissionId);
    if (subIndex === -1) return undefined;

    db.submissions[subIndex] = { ...db.submissions[subIndex], grade, feedback };
    return db.submissions[subIndex];
}

export async function getStudentGrades(studentId: string): Promise<GradedSubmission[]> {
    const studentSubmissions = db.submissions.filter(s => s.studentId === studentId && s.grade !== null);
    
    return studentSubmissions.map(sub => {
        const assignment = db.assignments.find(a => a.id === sub.assignmentId);
        const course = db.courses.find(c => c.id === assignment?.courseId);
        return {
            ...sub,
            assignment: assignment!,
            course: course!
        }
    }).filter(s => s.assignment && s.course) as GradedSubmission[];
}


// --- Discussion Functions ---
export async function getThreadsByCourse(courseId: string): Promise<(DiscussionThread & { author: User, postCount: number })[]> {
    const threads = db.discussion_threads.filter(t => t.courseId === courseId);
    return Promise.all(threads.map(async (thread) => {
        const author = await findUserById(thread.authorId);
        const postCount = db.discussion_posts.filter(p => p.threadId === thread.id).length;
        return { ...thread, author, postCount };
    }));
}

export async function getThreadById(threadId: string): Promise<(DiscussionThread & { author: User }) | undefined> {
    const thread = db.discussion_threads.find(t => t.id === threadId);
    if (!thread) return undefined;
    const author = await findUserById(thread.authorId);
    return { ...thread, author };
}

export async function getPostsByThread(threadId: string): Promise<(DiscussionPost & { author: User })[]> {
    const posts = db.discussion_posts.filter(p => p.threadId === threadId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return Promise.all(posts.map(async (post) => {
        const author = await findUserById(post.authorId);
        return { ...post, author };
    }));
}

export async function createThread(data: Omit<DiscussionThread, 'id' | 'createdAt'>): Promise<DiscussionThread> {
    const newThread: DiscussionThread = { ...data, id: randomUUID(), createdAt: new Date().toISOString() };
    db.discussion_threads.push(newThread);
    return newThread;
}

export async function createPost(data: Omit<DiscussionPost, 'id' | 'createdAt'>): Promise<DiscussionPost> {
    const newPost: DiscussionPost = { ...data, id: randomUUID(), createdAt: new Date().toISOString() };
    db.discussion_posts.push(newPost);
    return newPost;
}

// --- Material Functions ---
export async function addMaterial(data: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
  const newMaterial: Material = {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  db.materials.push(newMaterial);
  return newMaterial;
}

export async function getMaterialsByCourse(courseId: string): Promise<Material[]> {
    return db.materials.filter(m => m.courseId === courseId);
}

// --- Notification Functions ---
export async function createNotification(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
        ...data,
        id: randomUUID(),
        isRead: false,
        createdAt: new Date().toISOString(),
    };
    db.notifications.push(newNotification);
    return newNotification;
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
    return db.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
    const notification = db.notifications.find(n => n.id === notificationId);
    if (!notification) return false;
    notification.isRead = true;
    return true;
}

// --- Leaderboard Functions ---
export async function getStudentRankings(): Promise<{ user: User, averageGrade: number, assignmentsCompleted: number, credibilityPoints: number }[]> {
    const students = db.users.filter(u => u.role === 'student');
    
    return Promise.all(students.map(async (student) => {
        const submissions = db.submissions.filter(s => s.studentId === student.id && s.grade !== null);
        const totalGrade = submissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
        const averageGrade = submissions.length > 0 ? totalGrade / submissions.length : 0;
        
        const challengeSubmissions = db.challenge_submissions.filter(cs => cs.studentId === student.id);
        const credibilityPoints = await challengeSubmissions.reduce(async (accPromise, cs) => {
            const acc = await accPromise;
            const challenge = db.challenges.find(c => c.id === cs.challengeId);
            const votes = db.challenge_votes.filter(v => v.submissionId === cs.id).length;
            return acc + (votes * 10) + (challenge?.points || 0);
        }, Promise.resolve(0));
        
        return {
            user: student,
            averageGrade: Math.round(averageGrade),
            assignmentsCompleted: submissions.length,
            credibilityPoints
        };
    }));
}

// --- Attendance Functions ---
export async function markAttendance(studentId: string, courseId: string): Promise<Attendance | null> {
    const today = new Date().toISOString().split('T')[0];
    const existing = db.attendance.find(a => a.studentId === studentId && a.courseId === courseId && a.date === today);
    if (existing) return null;

    const newRecord: Attendance = { id: randomUUID(), studentId, courseId, date: today, isPresent: true };
    db.attendance.push(newRecord);
    return newRecord;
}

export async function getAllAttendance(): Promise<(Attendance & { student: User, course: Course })[]> {
    return db.attendance
        .map(att => {
            const student = db.users.find(u => u.id === att.studentId);
            const course = db.courses.find(c => c.id === att.courseId);
            if (!student || !course) return null;
            return { ...att, student, course };
        })
        .filter(Boolean) as (Attendance & { student: User, course: Course })[];
}

// --- Certificate Functions ---
const PASSING_GRADE = 70;

export async function getCompletedCoursesForStudent(studentId: string): Promise<Course[]> {
    const enrollments = db.enrollments.filter(e => e.studentId === studentId);
    const completedCourses: Course[] = [];

    for (const enrollment of enrollments) {
        const courseId = enrollment.courseId;
        const assignments = db.assignments.filter(a => a.courseId === courseId);
        if (assignments.length === 0) continue;

        const allPassed = assignments.every(a => {
            const sub = db.submissions.find(s => s.studentId === studentId && s.assignmentId === a.id);
            return sub && sub.grade !== null && sub.grade >= PASSING_GRADE;
        });

        if (allPassed) {
            const course = db.courses.find(c => c.id === courseId);
            if (course) completedCourses.push(course);
        }
    }
    return completedCourses;
}

export async function getStudentCertificates(studentId: string): Promise<(Certificate & { course: Course })[]> {
    return db.certificates
        .filter(c => c.studentId === studentId)
        .map(cert => {
            const course = db.courses.find(c => c.id === cert.courseId);
            return { ...cert, course: course! };
        })
        .filter(c => c.course);
}

export async function getCertificateById(id: string): Promise<(Certificate & { student: User; course: Course & { teacher: User } }) | undefined> {
    const certificate = db.certificates.find(c => c.id === id);
    if (!certificate) return undefined;

    const student = await findUserById(certificate.studentId);
    if (student.id === '0') return undefined;

    const course = await getCourseById(certificate.courseId);
    if (!course || course.teacher.id === '0') return undefined;

    return { ...certificate, student, course };
}


export async function generateCertificate(studentId: string, courseId: string): Promise<Certificate | null> {
    const existing = db.certificates.find(c => c.studentId === studentId && c.courseId === courseId);
    if (existing) return null;

    const newCertificate: Certificate = { id: randomUUID(), studentId, courseId, issuedAt: new Date().toISOString(), verificationId: randomUUID() };
    db.certificates.push(newCertificate);
    return newCertificate;
}

// --- Challenge Functions ---
export async function getAllChallenges(): Promise<Challenge[]> {
    return db.challenges;
}

export async function getChallengeById(id: string): Promise<Challenge | undefined> {
    return db.challenges.find(c => c.id === id);
}

export async function getSubmissionsForChallenge(challengeId: string): Promise<(ChallengeSubmission & { student: User; votes: number })[]> {
    const submissions = db.challenge_submissions.filter(cs => cs.challengeId === challengeId);
    return Promise.all(submissions.map(async (sub) => {
        const student = await findUserById(sub.studentId);
        const votes = db.challenge_votes.filter(v => v.submissionId === sub.id).length;
        return { ...sub, student, votes };
    }));
}

export async function createChallengeSubmission(data: Omit<ChallengeSubmission, 'id' | 'submittedAt'>): Promise<ChallengeSubmission> {
    const newSubmission: ChallengeSubmission = { ...data, id: randomUUID(), submittedAt: new Date().toISOString() };
    db.challenge_submissions.push(newSubmission);
    return newSubmission;
}

export async function voteOnSubmission(submissionId: string, voterId: string): Promise<ChallengeVote | null> {
    const sub = db.challenge_submissions.find(cs => cs.id === submissionId);
    if (!sub || sub.studentId === voterId) return null;

    const existingVote = db.challenge_votes.find(v => v.submissionId === submissionId && v.voterId === voterId);
    if (existingVote) return null;

    const newVote: ChallengeVote = { id: randomUUID(), submissionId, voterId };
    db.challenge_votes.push(newVote);
    return newVote;
}

export async function getVotesForSubmission(submissionId: string): Promise<number> {
    return db.challenge_votes.filter(v => v.submissionId === submissionId).length;
}

// --- Project Showcase Functions ---
export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'imageUrl'>): Promise<Project> {
    const newProject: Project = {
        ...data,
        id: randomUUID(),
        imageUrl: `https://picsum.photos/seed/proj${Date.now()}/600/400`,
        createdAt: new Date().toISOString(),
    };
    db.projects.push(newProject);
    return newProject;
}

export async function getAllProjects(): Promise<(Project & { student: User })[]> {
    return Promise.all(
        db.projects.map(async p => {
            const student = await findUserById(p.studentId);
            return { ...p, student };
        })
    );
}

export async function getProjectsByStudent(studentId: string): Promise<Project[]> {
    return db.projects.filter(p => p.studentId === studentId);
}

// --- Internship Functions ---
export async function getInternshipDomains(): Promise<InternshipDomain[]> {
    return db.internship_domains;
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
    if (role === 'teacher') {
        const courses = db.courses.filter(c => c.teacherId === userId);
        const courseIds = courses.map(c => c.id);
        
        const studentIds = new Set(db.enrollments.filter(e => courseIds.includes(e.courseId)).map(e => e.studentId));

        const assignments = db.assignments.filter(a => courseIds.includes(a.courseId));
        const assignmentIds = assignments.map(a => a.id);

        const pendingSubmissions = db.submissions.filter(s => assignmentIds.includes(s.assignmentId) && s.grade === null).length;

        const coursePerformances: CoursePerformance[] = await Promise.all(courses.map(async (course) => {
            const courseAssignments = db.assignments.filter(a => a.courseId === course.id);
            const courseAssignmentIds = courseAssignments.map(a => a.id);
            const courseSubmissions = db.submissions.filter(s => courseAssignmentIds.includes(s.assignmentId) && s.grade !== null);
            
            const gradeDistribution = [
                { name: 'A (90+)', students: 0 }, { name: 'B (80-89)', students: 0 },
                { name: 'C (70-79)', students: 0 }, { name: 'D (60-69)', students: 0 }, { name: 'F (<60)', students: 0 },
            ];
            
            // This logic is simplified; it counts submissions, not unique students per grade bucket
            courseSubmissions.forEach(sub => {
                if (sub.grade! >= 90) gradeDistribution[0].students++;
                else if (sub.grade! >= 80) gradeDistribution[1].students++;
                else if (sub.grade! >= 70) gradeDistribution[2].students++;
                else if (sub.grade! >= 60) gradeDistribution[3].students++;
                else gradeDistribution[4].students++;
            });
            return { courseId: course.id, courseTitle: course.title, gradeDistribution };
        }));

        let studentOfTheWeek: StudentOfTheWeek = null;
        if (studentIds.size > 0) {
            const studentScores: { studentId: string; name: string; score: number; grade: number }[] = [];
            for (const studentId of Array.from(studentIds)) {
                const student = await findUserById(studentId);
                const studentSubmissions = db.submissions.filter(s => s.studentId === studentId && s.grade !== null);
                if (studentSubmissions.length > 0) {
                    const totalGrade = studentSubmissions.reduce((acc, sub) => acc + sub.grade!, 0);
                    const averageGrade = totalGrade / studentSubmissions.length;
                    studentScores.push({ studentId, name: student.name, score: averageGrade + (studentSubmissions.length * 2), grade: Math.round(averageGrade) });
                }
            }
            if (studentScores.length > 0) {
                studentScores.sort((a, b) => b.score - a.score);
                const topStudent = studentScores[0];
                studentOfTheWeek = { studentId: topStudent.studentId, studentName: topStudent.name, averageGrade: topStudent.grade, reason: 'Top Performer This Week' };
            }
        }

        return {
            stats: [
                { title: 'Courses Taught', value: courses.length, subtitle: 'Total active courses', icon: 'BookOpen', link: { href: "/courses", text: "Manage Courses"} },
                { title: 'Total Students', value: studentIds.size, subtitle: 'Across all courses', icon: 'Users', link: { href: "/students", text: "View Students"} },
                { title: 'Pending Submissions', value: pendingSubmissions, subtitle: 'Awaiting grading', icon: 'GraduationCap' },
            ],
            coursePerformances,
            studentOfTheWeek
        };
    } else { // Student role
        const enrollments = db.enrollments.filter(e => e.studentId === userId);
        const enrolledCourseIds = enrollments.map(e => e.courseId);

        const allAssignments = db.assignments.filter(a => enrolledCourseIds.includes(a.courseId));
        
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const studentSubmissions = db.submissions.filter(s => s.studentId === userId);
        const submittedAssignmentIds = new Set(studentSubmissions.map(s => s.assignmentId));
        const assignmentsDueSoon = allAssignments.filter(a => new Date(a.dueDate) > new Date() && new Date(a.dueDate) <= sevenDaysFromNow && !submittedAssignmentIds.has(a.id)).length;
        
        const gradedSubmissions = studentSubmissions.filter(s => s.grade !== null);
        const totalGrade = gradedSubmissions.reduce((acc, sub) => acc + sub.grade!, 0);
        const averageGrade = gradedSubmissions.length > 0 ? Math.round(totalGrade / gradedSubmissions.length) : 0;
        
        const gradeToLetter = (grade: number) => {
            if (grade >= 90) return 'A'; if (grade >= 80) return 'B'; if (grade >= 70) return 'C'; if (grade >= 60) return 'D'; return grade > 0 ? 'F' : 'N/A';
        };

        const attendanceRows = db.attendance.filter(a => a.studentId === userId);
        let totalAttention = 0, totalCompletion = 0;
        for (const enrollment of enrollments) {
            const firstAttendance = attendanceRows.find(a => a.courseId === enrollment.courseId);
            if (!firstAttendance) continue;

            const daysSinceEnrollment = differenceInDays(new Date(), new Date(firstAttendance.date)) + 1;
            const attendanceDays = new Set(attendanceRows.filter(a => a.courseId === enrollment.courseId).map(a => a.date)).size;
            totalAttention += (attendanceDays / daysSinceEnrollment);

            const courseAssignments = allAssignments.filter(a => a.courseId === enrollment.courseId);
            if (courseAssignments.length > 0) {
                 const courseSubmissions = studentSubmissions.filter(s => courseAssignments.some(a => a.id === s.assignmentId));
                 totalCompletion += (courseSubmissions.length / courseAssignments.length);
            }
        }
        
        const attentionScore = enrollments.length > 0 ? (totalAttention / enrollments.length) * 100 : 0;
        const completionScore = enrollments.length > 0 ? (totalCompletion / enrollments.length) * 100 : 0;
        const efficiencyScore = (attentionScore * 0.25) + (completionScore * 0.4) + (averageGrade * 0.35);

        const sortedAttendance = db.attendance.filter(a => a.studentId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        let streak = 0;
        if (sortedAttendance.length > 0) {
            const uniqueDates = [...new Set(sortedAttendance.map(d => d.date))].map(d => parseISO(d)).sort((a,b) => b.getTime() - a.getTime());
            if (uniqueDates.length > 0) {
                 const lastDay = uniqueDates[0];
                 const today = new Date();
                 const yesterday = subDays(today, 1);
                 if (isSameDay(lastDay, today) || isSameDay(lastDay, yesterday)) {
                    let currentStreak = 1;
                    let expectedDate = isSameDay(lastDay, today) ? yesterday : subDays(yesterday, 1);
                    for (let i = 1; i < uniqueDates.length; i++) {
                        if (isSameDay(uniqueDates[i], expectedDate)) {
                            currentStreak++;
                            expectedDate = subDays(expectedDate, 1);
                        } else {
                            break;
                        }
                    }
                    streak = currentStreak;
                 }
            }
        }

        return {
            stats: [
                { title: 'Enrolled Courses', value: enrollments.length, subtitle: 'Ready to learn', icon: 'BookOpen', link: { href: "/courses", text: "View Courses"} },
                { title: 'Assignments Due', value: assignmentsDueSoon, subtitle: 'In the next 7 days', icon: 'ClipboardList' },
                { title: 'Overall Grade', value: gradeToLetter(averageGrade), subtitle: 'Keep it up!', icon: 'GraduationCap' },
            ],
            learningEfficiency: { score: Math.round(efficiencyScore), components: { attention: Math.round(attentionScore), completion: Math.round(completionScore), accuracy: Math.round(averageGrade) } },
            streak,
        };
    }
}
