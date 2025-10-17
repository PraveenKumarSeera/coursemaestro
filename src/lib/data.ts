
'use server';

import { randomUUID } from 'crypto';
import { unstable_cache } from 'next/cache';
import { differenceInDays, parseISO, isSameDay, subDays } from 'date-fns';
import { getSession } from './session';
import { PlaceHolderImages } from './placeholder-images';
import type { Course, Enrollment, User, Assignment, Submission, GradedSubmission, DiscussionThread, DiscussionPost, Material, Notification, Attendance, Certificate, Challenge, ChallengeSubmission, ChallengeVote, Project, InternshipDomain } from './types';


const unknownUser: User = { id: '0', name: 'Unknown User', email: '', role: 'student' };

// In a real app, this would be a proper database. For this demo, we'll use a global in-memory object.
// This ensures data persists across server-side renders during development.
type Db = {
    users: Record<string, User>;
    courses: Record<string, Course>;
    enrollments: Record<string, Enrollment>;
    assignments: Record<string, Assignment>;
    submissions: Record<string, Submission>;
    discussion_threads: Record<string, DiscussionThread>;
    discussion_posts: Record<string, DiscussionPost>;
    materials: Record<string, Material>;
    notifications: Record<string, Notification>;
    attendance: Record<string, Attendance>;
    certificates: Record<string, Certificate>;
    challenges: Record<string, Challenge>;
    challenge_submissions: Record<string, ChallengeSubmission>;
    challenge_votes: Record<string, ChallengeVote>;
    projects: Record<string, Project>;
    internship_domains: Record<string, InternshipDomain>;
};

declare global {
  var __db: Db | undefined;
}

const db: Db = global.__db || {
    users: {},
    courses: {},
    enrollments: {},
    assignments: {},
    submissions: {},
    discussion_threads: {},
    discussion_posts: {},
    materials: {},
    notifications: {},
    attendance: {},
    certificates: {},
    projects: {},
    challenges: {
        "challenge-1": {
            "id": "challenge-1",
            "title": "E-commerce Recommendation API",
            "description": "Design a REST API for an e-commerce platform that provides personalized product recommendations based on a user's browsing history and past purchases. Focus on the API endpoints, request/response schemas, and data model.",
            "company": "Shopify",
            "points": 100,
            "icon": "ShoppingCart"
        },
        "challenge-2": {
            "id": "challenge-2",
            "title": "Social Media Feed Algorithm",
            "description": "Propose an algorithm for a social media feed that balances recency, user engagement, and content diversity. Explain how you would handle potential echo chambers and misinformation.",
            "company": "Meta",
            "points": 120,
            "icon": "Users"
        },
        "challenge-3": {
            "id": "challenge-3",
            "title": "Real-time Collaborative Editor",
            "description": "Outline the architecture for a real-time collaborative text editor, similar to Google Docs. Describe how you would handle concurrent edits and maintain consistency across all clients.",
            "company": "Google",
            "points": 150,
            "icon": "Code"
        },
        "challenge-4": {
            "id": "challenge-4",
            "title": "Chat Application System Design",
            "description": "Design the system architecture for a scalable chat application like WhatsApp or Slack. Consider message delivery, online presence, and storage of chat history.",
            "company": "Slack",
            "points": 130,
            "icon": "MessageSquare"
        },
        "challenge-5": {
            "id": "challenge-5",
            "title": "CI/CD Pipeline for Microservices",
            "description": "Design a CI/CD pipeline for a microservices-based application. Your design should include steps for building, testing (unit, integration, E2E), and deploying services independently.",
            "company": "GitHub",
            "points": 110,
            "icon": "GitMerge"
        },
        "challenge-6": {
            "id": "challenge-6",
            "title": "NoSQL Database Schema Design",
            "description": "You are building a social network. Design the NoSQL (document-based) database schema for user profiles, posts, comments, and followers. Justify your design choices regarding data duplication and access patterns.",
            "company": "MongoDB",
            "points": 90,
            "icon": "Database"
        }
    },
    internship_domains: {
        "google": {
            "id": "google",
            "name": "Google",
            "description": "Tackle a problem at the scale of a global tech giant, focusing on algorithms and system design.",
            "icon": "google",
            "task": {
                "title": "Design a Scalable URL Shortener",
                "scenario": "As an intern on the Google Cloud Platform team, you've been tasked with designing a new URL shortening service similar to bit.ly. The service needs to handle millions of requests per day and must be highly available and scalable.",
                "task": "Your task is to create a high-level technical design for this service. You should consider the API design (how users create and retrieve URLs), the data model for storing the mappings, and the overall system architecture. How would you generate unique short codes? How would you handle custom URLs?",
                "deliverables": [
                    "A 1-page technical proposal outlining your design.",
                    "API endpoint definitions (e.g., POST /shorten, GET /{shortCode}).",
                    "A schema for your chosen database (SQL or NoSQL)."
                ]
            }
        },
        "openai": {
            "id": "openai",
            "name": "OpenAI",
            "description": "Work on a challenge at the intersection of AI, product design, and responsible innovation.",
            "icon": "openai",
            "task": {
                "title": "Develop a Moderation System for AI-Generated Content",
                "scenario": "The OpenAI safety team is developing a new tool to help developers moderate content generated by their AI models. The goal is to detect and flag potentially harmful or biased content before it reaches end-users.",
                "task": "Propose a multi-layered moderation system. Think beyond simple keyword filtering. How could you use AI to understand context and nuance? What categories of harmful content would you prioritize? How would you design a system that is both effective and fair, minimizing false positives?",
                "deliverables": [
                    "A policy document defining content categories and moderation criteria.",
                    "A high-level diagram of your proposed system architecture.",
                    "An explanation of how you would handle appeals and edge cases."
                ]
            }
        },
        "netflix": {
            "id": "netflix",
            "name": "Netflix",
            "description": "Solve a complex engineering challenge related to content delivery and user experience at a massive scale.",
            "icon": "netflix",
            "task": {
              "title": "Design a 'Skip Intro' Feature",
              "scenario": "The content platform team at Netflix wants to expand the 'Skip Intro' feature. Currently, it's a manual process. They want you to design an automated system that can detect intro sequences in TV shows.",
              "task": "Propose a technical solution to automatically identify the start and end times of intro sequences. Consider audio fingerprints, visual cues (like recurring title cards), and machine learning approaches. How would your system handle variations in intro length or placement?",
              "deliverables": [
                "A technical proposal detailing your proposed method.",
                "A description of the data you would need to train a potential model.",
                "A plan for how to handle potential errors or inaccuracies."
              ]
            }
        },
        "microsoft": {
            "id": "microsoft",
            "name": "Microsoft",
            "description": "Engage with enterprise-level software challenges, focusing on cloud computing, productivity, and developer tools.",
            "icon": "microsoft",
            "task": {
              "title": "Architect a Cloud-Based Document Syncing Service",
              "scenario": "The Microsoft 365 team is re-architecting the sync engine for OneDrive. They need a robust system that can handle billions of files and provide near-instantaneous updates across multiple devices (desktop, web, mobile).",
              "task": "Design the high-level architecture for this file-syncing service. How would you efficiently detect changes? What strategy would you use for handling large files (e.g., chunking)? How would you resolve sync conflicts when a file is edited offline on two different devices?",
              "deliverables": [
                "A system architecture diagram (components, databases, APIs).",
                "An explanation of your conflict resolution strategy.",
                "A proposal for the client-side database schema to track file state."
              ]
            }
        },
        "aws": {
            "id": "aws",
            "name": "Amazon Web Services",
            "description": "Design and architect a new cloud service focusing on reliability, scalability, and cost-effectiveness.",
            "icon": "aws",
            "task": {
                "title": "Design a Serverless Image Processing Service",
                "scenario": "As an intern on the AWS Lambda team, you are tasked with designing a new, fully-managed service for on-the-fly image transformations. The service should take an image URL and a set of transformations (e.g., resize, crop, apply filter) and return a new image.",
                "task": "Architect this service using AWS components. How would you ensure low latency? How would you handle caching of original and transformed images to reduce cost and improve performance? What is the API design for this service?",
                "deliverables": [
                    "An architecture diagram using AWS service icons (e.g., API Gateway, Lambda, S3, CloudFront).",
                    "API endpoint definitions with request/response examples.",
                    "A description of your caching strategy."
                ]
            }
        },
        "apple": {
            "id": "apple",
            "name": "Apple",
            "description": "Focus on a challenge related to user experience, privacy, and seamless integration across an ecosystem of devices.",
            "icon": "apple",
            "task": {
                "title": "Design a Privacy-Preserving Health Feature",
                "scenario": "The Apple Health team wants to introduce a new feature that allows users to share anonymized health data with researchers to contribute to medical studies. User privacy is the absolute top priority.",
                "task": "Propose a system that allows users to opt-in and share their data while guaranteeing their anonymity. How would you use on-device processing and techniques like differential privacy to protect user identity? How would the data be collected, aggregated, and provided to researchers securely?",
                "deliverables": [
                    "A proposal on how to use differential privacy in this context.",
                    "A user-flow diagram for the opt-in process.",
                    "A high-level diagram of the data pipeline from device to researcher."
                ]
            }
        },
        "meta": {
            "id": "meta",
            "name": "Meta",
            "description": "Work on a product challenge that involves social graphs, user engagement, and building communities at a global scale.",
            "icon": "meta",
            "task": {
                "title": "Develop a 'Group Recommendations' Feature",
                "scenario": "The Facebook Groups team wants to improve how they recommend new groups to users. The goal is to suggest relevant and healthy communities, not just groups their friends have joined.",
                "task": "Design an algorithm to recommend groups. What signals would you use (e.g., user's interests from their profile, page likes, past group activity, content of posts they engage with)? How would you identify 'healthy' or high-quality groups versus spammy or toxic ones?",
                "deliverables": [
                    "A list of signals and their proposed weights for your algorithm.",
                    "A strategy for identifying and down-ranking low-quality groups.",
                    "A plan for A/B testing your new recommendation algorithm."
                ]
            }
        }
    },
    challenge_submissions: {},
    challenge_votes: {},
};

if (process.env.NODE_ENV !== 'production') {
  global.__db = db;
}

// --- User Functions ---
export const findUserByEmail = unstable_cache(
    async (email: string): Promise<User | undefined> => {
        return Object.values(db.users).find(user => user.email === email);
    },
    ['user-by-email'],
    { tags: ['users'] }
);

export const findUserById = unstable_cache(
    async (id: string): Promise<User> => {
        if (!id || id === '0') return unknownUser;
        return db.users[id] || unknownUser;
    },
    ['user'],
    { tags: ['users'], revalidate: 3600 }
);

export async function createUser(data: Omit<User, 'id'>): Promise<User> {
    const id = randomUUID();
    const newUser = { id, ...data };
    db.users[id] = newUser;
    return newUser;
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'email' | 'role'>>): Promise<User | undefined> {
    if (!db.users[id]) return undefined;

    db.users[id] = { ...db.users[id], ...data };
    return db.users[id];
}

export async function getAuthenticatedUser(): Promise<User | null> {
    const { user } = await getSession();
    return user;
}

// --- Course Functions ---
export const getAllCourses = unstable_cache(
    async (query?: string): Promise<Course[]> => {
        let courses = Object.values(db.courses);
        if (query) {
            const lowercasedQuery = query.toLowerCase();
            courses = courses.filter(course =>
                course.title.toLowerCase().includes(lowercasedQuery) ||
                course.description.toLowerCase().includes(lowercasedQuery)
            );
        }
        return courses;
    },
    ['all-courses'],
    { tags: ['courses'] }
);

export const getCourseById = unstable_cache(
    async (id: string): Promise<(Course & { teacher: User }) | undefined> => {
        const course = db.courses[id];
        if (!course) return undefined;
        
        const teacher = await findUserById(course.teacherId);
        if (teacher.id === '0') return undefined;

        return { ...course, teacher };
    },
    ['course'],
    { tags: ['courses'] }
);

export async function createCourse(data: Omit<Course, 'id' | 'teacherId' | 'imageUrl'>, teacherId: string): Promise<Course> {
    const id = randomUUID();
    const placeholder = PlaceHolderImages.find(p => p.imageHint.includes('course')) || PlaceHolderImages[0];
    const newCourse: Course = {
        ...data,
        id,
        teacherId,
        imageUrl: placeholder.imageUrl,
    };
    db.courses[id] = newCourse;
    return newCourse;
}

export async function updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'teacherId' | 'imageUrl'>>): Promise<Course | undefined> {
    if (!db.courses[id]) return undefined;
    db.courses[id] = { ...db.courses[id], ...data };
    return db.courses[id];
}

export async function deleteCourse(id: string): Promise<boolean> {
     if (!db.courses[id]) return false;
     delete db.courses[id];
     
     Object.keys(db.enrollments).forEach(enrollmentId => {
        if (db.enrollments[enrollmentId].courseId === id) {
            delete db.enrollments[enrollmentId];
        }
     });

     Object.keys(db.assignments).forEach(assignmentId => {
         if (db.assignments[assignmentId].courseId === id) {
             delete db.assignments[assignmentId];
         }
     });

    return true;
}

export const getTeacherById = unstable_cache(
    async (id: string): Promise<User> => {
        return findUserById(id);
    },
    ['teacher-by-id'],
    { tags: ['users'] }
);

export const getTeacherCourses = unstable_cache(
    async (teacherId: string, query?: string): Promise<Course[]> => {
        let courses = Object.values(db.courses).filter(course => course.teacherId === teacherId);
        if (query) {
            const lowercasedQuery = query.toLowerCase();
            return courses.filter(course =>
                course.title.toLowerCase().includes(lowercasedQuery) ||
                course.description.toLowerCase().includes(lowercasedQuery)
            );
        }
        return courses;
    },
    ['teacher-courses'],
    { tags: ['courses'] }
);


// --- Enrollment Functions ---
export const getStudentEnrollments = unstable_cache(
    async (studentId: string): Promise<Enrollment[]> => {
        return Object.values(db.enrollments).filter(e => e.studentId === studentId);
    },
    ['student-enrollments'],
    { tags: ['enrollments'] }
);

export const getStudentsByCourse = unstable_cache(
    async (courseId: string): Promise<User[]> => {
        const studentIds = Object.values(db.enrollments).filter(e => e.courseId === courseId).map(e => e.studentId);
        return Promise.all(studentIds.map(id => findUserById(id)));
    },
    ['students-by-course'],
    { tags: ['enrollments', 'users'] }
);

export async function enrollInCourse(studentId: string, courseId: string): Promise<Enrollment | null> {
    const alreadyEnrolled = Object.values(db.enrollments).some(e => e.studentId === studentId && e.courseId === courseId);
    if (alreadyEnrolled) return null;

    const id = randomUUID();
    const newEnrollment: Enrollment = { id, studentId, courseId };
    db.enrollments[id] = newEnrollment;
    return newEnrollment;
}

export const isEnrolled = unstable_cache(
    async (studentId: string, courseId: string): Promise<boolean> => {
        return Object.values(db.enrollments).some(e => e.studentId === studentId && e.courseId === courseId);
    },
    ['is-enrolled'],
    { tags: ['enrollments'] }
);

export const getTeacherStudents = unstable_cache(
    async (teacherId: string) => {
        const teacherCourseIds = new Set(Object.values(db.courses).filter(c => c.teacherId === teacherId).map(c => c.id));
        
        const studentEnrollments = Object.values(db.enrollments).filter(e => teacherCourseIds.has(e.courseId));
        const studentIds = new Set(studentEnrollments.map(e => e.studentId));
        
        const allStudentSubmissions = Object.values(db.submissions);

        return Promise.all(Array.from(studentIds).map(async (studentId) => {
            const student = await findUserById(studentId);
            const enrolledCourseIds = studentEnrollments.filter(e => e.studentId === studentId).map(e => e.courseId);
            const courses = enrolledCourseIds.map(id => db.courses[id]?.title).filter(Boolean);

            const submissions = allStudentSubmissions.filter(s => s.studentId === studentId && s.grade !== null);
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
    },
    ['teacher-students'],
    { tags: ['users', 'enrollments', 'courses', 'submissions'] }
);

// --- Assignment Functions ---
export const getAssignmentsByCourse = unstable_cache(
    async (courseId: string): Promise<Assignment[]> => {
        return Object.values(db.assignments).filter(a => a.courseId === courseId);
    },
    ['assignments-by-course'],
    { tags: ['assignments'] }
);

export const getAssignmentsByTeacher = unstable_cache(
    async (teacherId: string): Promise<(Assignment & { courseTitle: string, submissions: number })[]> => {
        const teacherCourseIds = new Set(Object.values(db.courses).filter(c => c.teacherId === teacherId).map(c => c.id));
        const assignments = Object.values(db.assignments).filter(a => teacherCourseIds.has(a.courseId));

        return assignments.map(assignment => {
            const course = db.courses[assignment.courseId];
            const submissions = Object.values(db.submissions).filter(s => s.assignmentId === assignment.id).length;
            return {
                ...assignment,
                courseTitle: course?.title || 'Unknown Course',
                submissions
            }
        });
    },
    ['assignments-by-teacher'],
    { tags: ['assignments', 'courses', 'submissions'] }
);

export async function createAssignment(data: Omit<Assignment, 'id'>): Promise<Assignment> {
    const id = randomUUID();
    const newAssignment = { id, ...data };
    db.assignments[id] = newAssignment;
    return newAssignment;
}

export const getAssignmentById = unstable_cache(
    async (id: string): Promise<(Assignment & { submissions: (Submission & { student: User })[] }) | undefined> => {
        const assignment = db.assignments[id];
        if (!assignment) return undefined;

        const submissions = await Promise.all(
            Object.values(db.submissions)
            .filter(s => s.assignmentId === id)
            .map(async (sub) => {
                const student = await findUserById(sub.studentId);
                return { ...sub, student };
            })
        );

        return { ...assignment, submissions };
    },
    ['assignment-by-id'],
    { tags: ['assignments', 'submissions', 'users'] }
);

// --- Submission Functions ---
export const getSubmissionById = unstable_cache(
    async (id: string): Promise<Submission | undefined> => {
        return db.submissions[id];
    },
    ['submission-by-id'],
    { tags: ['submissions'] }
);

export const getStudentSubmission = unstable_cache(
    async (studentId: string, assignmentId: string): Promise<Submission | undefined> => {
        return Object.values(db.submissions).find(s => s.studentId === studentId && s.assignmentId === assignmentId);
    },
    ['student-submission'],
    { tags: ['submissions'] }
);

export async function createSubmission(data: Omit<Submission, 'id' | 'submittedAt' | 'grade' | 'feedback'>): Promise<Submission> {
    const id = randomUUID();
    const newSubmission: Submission = { 
        ...data, 
        id, 
        submittedAt: new Date().toISOString(),
        grade: null,
        feedback: null
    };
    db.submissions[id] = newSubmission;
    return newSubmission;
}

export async function gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission | undefined> {
    if (!db.submissions[submissionId]) return undefined;
    db.submissions[submissionId] = { ...db.submissions[submissionId], grade, feedback };
    return db.submissions[submissionId];
}

export const getStudentGrades = unstable_cache(
    async (studentId: string): Promise<GradedSubmission[]> => {
        const studentSubmissions = Object.values(db.submissions).filter(s => s.studentId === studentId && s.grade !== null);
        
        return studentSubmissions.map(sub => {
            const assignment = db.assignments[sub.assignmentId];
            const course = assignment ? db.courses[assignment.courseId] : undefined;
            return {
                ...sub,
                assignment: assignment!,
                course: course!
            }
        }).filter(s => s.assignment && s.course) as GradedSubmission[];
    },
    ['student-grades'],
    { tags: ['submissions', 'assignments', 'courses'] }
);

// --- Discussion Functions ---
export const getThreadsByCourse = unstable_cache(
    async (courseId: string): Promise<(DiscussionThread & { author: User, postCount: number })[]> => {
        const threads = Object.values(db.discussion_threads).filter(t => t.courseId === courseId);
        return Promise.all(threads.map(async (thread) => {
            const author = await findUserById(thread.authorId);
            const postCount = Object.values(db.discussion_posts).filter(p => p.threadId === thread.id).length;
            return { ...thread, author, postCount };
        }));
    },
    ['threads-by-course'],
    { tags: ['discussions'] }
);

export const getThreadById = unstable_cache(
    async (threadId: string): Promise<(DiscussionThread & { author: User }) | undefined> => {
        const thread = db.discussion_threads[threadId];
        if (!thread) return undefined;
        const author = await findUserById(thread.authorId);
        return { ...thread, author };
    },
    ['thread-by-id'],
    { tags: ['discussions', 'users'] }
);

export const getPostsByThread = unstable_cache(
    async (threadId: string): Promise<(DiscussionPost & { author: User })[]> => {
        const posts = Object.values(db.discussion_posts).filter(p => p.threadId === threadId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return Promise.all(posts.map(async (post) => {
            const author = await findUserById(post.authorId);
            return { ...post, author };
        }));
    },
    ['posts-by-thread'],
    { tags: ['discussions', 'users'] }
);

export async function createThread(data: Omit<DiscussionThread, 'id' | 'createdAt'>): Promise<DiscussionThread> {
    const id = randomUUID();
    const newThread: DiscussionThread = { ...data, id, createdAt: new Date().toISOString() };
    db.discussion_threads[id] = newThread;
    return newThread;
}

export async function createPost(data: Omit<DiscussionPost, 'id' | 'createdAt'>): Promise<DiscussionPost> {
    const id = randomUUID();
    const newPost: DiscussionPost = { ...data, id, createdAt: new Date().toISOString() };
    db.discussion_posts[id] = newPost;
    return newPost;
}

// --- Material Functions ---
export async function addMaterial(data: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
  const id = randomUUID();
  const newMaterial: Material = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  db.materials[id] = newMaterial;
  return newMaterial;
}

export const getMaterialsByCourse = unstable_cache(
    async (courseId: string): Promise<Material[]> => {
        return Object.values(db.materials).filter(m => m.courseId === courseId);
    },
    ['materials-by-course'],
    { tags: ['materials'] }
);

// --- Notification Functions ---
export async function createNotification(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = {
        ...data,
        id,
        isRead: false,
        createdAt: new Date().toISOString(),
    };
    db.notifications[id] = newNotification;
    return newNotification;
}

export const getNotificationsForUser = unstable_cache(
    async (userId: string): Promise<Notification[]> => {
        return Object.values(db.notifications).filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    ['notifications-for-user'],
    { tags: ['notifications'] }
);

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
    if (!db.notifications[notificationId]) return false;
    db.notifications[notificationId].isRead = true;
    return true;
}

// --- Leaderboard Functions ---
export const getStudentRankings = unstable_cache(
    async (): Promise<{ user: User, averageGrade: number, assignmentsCompleted: number, credibilityPoints: number }[]> => {
        const students = Object.values(db.users).filter(u => u.role === 'student');
        
        return Promise.all(students.map(async (student) => {
            const submissions = Object.values(db.submissions).filter(s => s.studentId === student.id && s.grade !== null);
            const totalGrade = submissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
            const averageGrade = submissions.length > 0 ? totalGrade / submissions.length : 0;
            
            const challengeSubmissions = Object.values(db.challenge_submissions).filter(cs => cs.studentId === student.id);
            let credibilityPoints = 0;
            for (const cs of challengeSubmissions) {
                const challenge = db.challenges[cs.challengeId];
                const votes = Object.values(db.challenge_votes).filter(v => v.submissionId === cs.id).length;
                credibilityPoints += (votes * 10) + (challenge?.points || 0);
            }
            
            return {
                user: student,
                averageGrade: Math.round(averageGrade),
                assignmentsCompleted: submissions.length,
                credibilityPoints
            };
        }));
    },
    ['student-rankings'],
    { tags: ['users', 'submissions', 'challenges'] }
);

// --- Attendance Functions ---
export async function markAttendance(studentId: string, courseId: string): Promise<Attendance | null> {
    const today = new Date().toISOString().split('T')[0];
    const existing = Object.values(db.attendance).find(a => a.studentId === studentId && a.courseId === courseId && a.date === today);
    if (existing) return null;

    const id = randomUUID();
    const newRecord: Attendance = { id, studentId, courseId, date: today, isPresent: true };
    db.attendance[id] = newRecord;
    return newRecord;
}

export const getAllAttendance = unstable_cache(
    async (): Promise<(Attendance & { student: User, course: Course })[]> => {
        return Object.values(db.attendance)
            .map(att => {
                const student = db.users[att.studentId];
                const course = db.courses[att.courseId];
                if (!student || !course) return null;
                return { ...att, student, course };
            })
            .filter(Boolean) as (Attendance & { student: User, course: Course })[];
    },
    ['all-attendance'],
    { tags: ['attendance', 'users', 'courses'] }
);

// --- Certificate Functions ---
const PASSING_GRADE = 70;

export const getCompletedCoursesForStudent = unstable_cache(
    async (studentId: string): Promise<Course[]> => {
        const enrollments = Object.values(db.enrollments).filter(e => e.studentId === studentId);
        const completedCourses: Course[] = [];

        for (const enrollment of enrollments) {
            const courseId = enrollment.courseId;
            const assignments = Object.values(db.assignments).filter(a => a.courseId === courseId);
            if (assignments.length === 0) continue;

            const allPassed = assignments.every(a => {
                const sub = Object.values(db.submissions).find(s => s.studentId === studentId && s.assignmentId === a.id);
                return sub && sub.grade !== null && sub.grade >= PASSING_GRADE;
            });

            if (allPassed) {
                const course = db.courses[courseId];
                if (course) completedCourses.push(course);
            }
        }
        return completedCourses;
    },
    ['completed-courses'],
    { tags: ['enrollments', 'assignments', 'submissions'] }
);

export const getStudentCertificates = unstable_cache(
    async (studentId: string): Promise<(Certificate & { course: Course })[]> => {
        return Object.values(db.certificates)
            .filter(c => c.studentId === studentId)
            .map(cert => {
                const course = db.courses[cert.courseId];
                return { ...cert, course: course! };
            })
            .filter(c => c.course);
    },
    ['student-certificates'],
    { tags: ['certificates', 'courses'] }
);

export const getCertificateById = unstable_cache(
    async (id: string): Promise<(Certificate & { student: User; course: Course & { teacher: User } }) | undefined> => {
        const certificate = db.certificates[id];
        if (!certificate) return undefined;

        const student = await findUserById(certificate.studentId);
        if (student.id === '0') return undefined;

        const course = await getCourseById(certificate.courseId);
        if (!course || course.teacher.id === '0') return undefined;

        return { ...certificate, student, course };
    },
    ['certificate-by-id'],
    { tags: ['certificates', 'users', 'courses'] }
);

export async function generateCertificate(studentId: string, courseId: string): Promise<Certificate | null> {
    const existing = Object.values(db.certificates).find(c => c.studentId === studentId && c.courseId === courseId);
    if (existing) return null;

    const id = randomUUID();
    const newCertificate: Certificate = { id, studentId, courseId, issuedAt: new Date().toISOString(), verificationId: randomUUID() };
    db.certificates[id] = newCertificate;
    return newCertificate;
}

// --- Challenge Functions ---
export const getAllChallenges = unstable_cache(
    async (): Promise<Challenge[]> => {
        return Object.values(db.challenges);
    },
    ['all-challenges'],
    { tags: ['challenges'] }
);

export const getChallengeById = unstable_cache(
    async (id: string): Promise<Challenge | undefined> => {
        return db.challenges[id];
    },
    ['challenge-by-id'],
    { tags: ['challenges'] }
);

export const getSubmissionsForChallenge = unstable_cache(
    async (challengeId: string): Promise<(ChallengeSubmission & { student: User; votes: number })[]> => {
        const submissions = Object.values(db.challenge_submissions).filter(cs => cs.challengeId === challengeId);
        return Promise.all(submissions.map(async (sub) => {
            const student = await findUserById(sub.studentId);
            const votes = Object.values(db.challenge_votes).filter(v => v.submissionId === sub.id).length;
            return { ...sub, student, votes };
        }));
    },
    ['submissions-for-challenge'],
    { tags: ['challenges', 'users'] }
);

export async function createChallengeSubmission(data: Omit<ChallengeSubmission, 'id' | 'submittedAt'>): Promise<ChallengeSubmission> {
    const id = randomUUID();
    const newSubmission: ChallengeSubmission = { ...data, id, submittedAt: new Date().toISOString() };
    db.challenge_submissions[id] = newSubmission;
    return newSubmission;
}

export async function voteOnSubmission(submissionId: string, voterId: string): Promise<ChallengeVote | null> {
    const sub = db.challenge_submissions[submissionId];
    if (!sub || sub.studentId === voterId) return null;

    const existingVote = Object.values(db.challenge_votes).find(v => v.submissionId === submissionId && v.voterId === voterId);
    if (existingVote) return null;
    
    const id = randomUUID();
    const newVote: ChallengeVote = { id, submissionId, voterId };
    db.challenge_votes[id] = newVote;
    return newVote;
}

export const getVotesForSubmission = unstable_cache(
    async (submissionId: string): Promise<number> => {
        return Object.values(db.challenge_votes).filter(v => v.submissionId === submissionId).length;
    },
    ['votes-for-submission'],
    { tags: ['challenges'] }
);

// --- Project Showcase Functions ---
export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'imageUrl'>): Promise<Project> {
    const id = randomUUID();
    const placeholder = PlaceHolderImages.find(p => p.imageHint.includes('project')) || PlaceHolderImages[6];
    const newProject: Project = {
        ...data,
        id,
        imageUrl: placeholder.imageUrl,
        createdAt: new Date().toISOString(),
    };
    db.projects[id] = newProject;
    return newProject;
}

export const getAllProjects = unstable_cache(
    async (): Promise<(Project & { student: User })[]> => {
        const projects = Object.values(db.projects).map(p => ({
            ...p,
            tags: p.tags || [], // Ensure tags is always an array
        }));
        projects.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return Promise.all(
            projects.map(async p => {
                const student = await findUserById(p.studentId);
                return { ...p, student };
            })
        );
    },
    ['all-projects'],
    { tags: ['projects', 'users'] }
);

export const getProjectsByStudent = unstable_cache(
    async (studentId: string): Promise<Project[]> => {
        const projects = Object.values(db.projects).filter(p => p.studentId === studentId);
        projects.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return projects;
    },
    ['projects-by-student'],
    { tags: ['projects'] }
);

// --- Internship Functions ---
export const getInternshipDomains = unstable_cache(
    async (): Promise<InternshipDomain[]> => {
        return Object.values(db.internship_domains);
    },
    ['internship-domains'],
    { tags: ['internships'] }
);


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


export const getDashboardData = unstable_cache(
    async (userId: string, role: 'teacher' | 'student'): Promise<DashboardStats> => {
        if (role === 'teacher') {
            const courses = Object.values(db.courses).filter(c => c.teacherId === userId);
            const courseIds = courses.map(c => c.id);
            
            const studentIds = new Set(Object.values(db.enrollments).filter(e => courseIds.includes(e.courseId)).map(e => e.studentId));

            const assignments = Object.values(db.assignments).filter(a => courseIds.includes(a.courseId));
            const assignmentIds = assignments.map(a => a.id);

            const pendingSubmissions = Object.values(db.submissions).filter(s => assignmentIds.includes(s.assignmentId) && s.grade === null).length;

            const coursePerformances: CoursePerformance[] = await Promise.all(courses.map(async (course) => {
                const courseAssignments = Object.values(db.assignments).filter(a => a.courseId === course.id);
                const courseAssignmentIds = courseAssignments.map(a => a.id);
                const courseSubmissions = Object.values(db.submissions).filter(s => courseAssignmentIds.includes(s.assignmentId) && s.grade !== null);
                
                const gradeDistribution = [
                    { name: 'A (90+)', students: 0 }, { name: 'B (80-89)', students: 0 },
                    { name: 'C (70-79)', students: 0 }, { name: 'D (60-69)', students: 0 }, { name: 'F (<60)', students: 0 },
                ];
                
                const studentGrades: Record<string, number[]> = {};
                 courseSubmissions.forEach(sub => {
                    if (!studentGrades[sub.studentId]) {
                        studentGrades[sub.studentId] = [];
                    }
                    studentGrades[sub.studentId].push(sub.grade!);
                });

                Object.values(studentGrades).forEach(grades => {
                    const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
                    if (avg >= 90) gradeDistribution[0].students++;
                    else if (avg >= 80) gradeDistribution[1].students++;
                    else if (avg >= 70) gradeDistribution[2].students++;
                    else if (avg >= 60) gradeDistribution[3].students++;
                    else gradeDistribution[4].students++;
                });

                return { courseId: course.id, courseTitle: course.title, gradeDistribution };
            }));

            let studentOfTheWeek: StudentOfTheWeek = null;
            if (studentIds.size > 0) {
                const studentScores: { studentId: string; name: string; score: number; grade: number }[] = [];
                for (const studentId of Array.from(studentIds)) {
                    const student = await findUserById(studentId);
                    const studentSubmissions = Object.values(db.submissions).filter(s => s.studentId === studentId && s.grade !== null);
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
                    { title: 'Pending Submissions', value: pendingSubmissions, subtitle: 'Awaiting grading', icon: 'GraduationCap', link: { href: "/assignments", text: "Grade Now" } },
                ],
                coursePerformances,
                studentOfTheWeek
            };
        } else { // Student role
            const enrollments = Object.values(db.enrollments).filter(e => e.studentId === userId);
            const enrolledCourseIds = enrollments.map(e => e.courseId);

            const allAssignments = Object.values(db.assignments).filter(a => enrolledCourseIds.includes(a.courseId));
            
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            const studentSubmissions = Object.values(db.submissions).filter(s => s.studentId === userId);
            const submittedAssignmentIds = new Set(studentSubmissions.map(s => s.assignmentId));
            const assignmentsDueSoon = allAssignments.filter(a => new Date(a.dueDate) > new Date() && new Date(a.dueDate) <= sevenDaysFromNow && !submittedAssignmentIds.has(a.id)).length;
            
            const gradedSubmissions = studentSubmissions.filter(s => s.grade !== null);
            const totalGrade = gradedSubmissions.reduce((acc, sub) => acc + sub.grade!, 0);
            const averageGrade = gradedSubmissions.length > 0 ? Math.round(totalGrade / gradedSubmissions.length) : 0;
            
            const gradeToLetter = (grade: number) => {
                if (grade >= 90) return 'A'; if (grade >= 80) return 'B'; if (grade >= 70) return 'C'; if (grade >= 60) return 'D'; return grade > 0 ? 'F' : 'N/A';
            };

            const attendanceRows = Object.values(db.attendance).filter(a => a.studentId === userId);
            let totalAttention = 0, totalCompletion = 0;
            for (const enrollment of enrollments) {
                const courseAssignments = allAssignments.filter(a => a.courseId === enrollment.courseId);
                const firstAttendance = attendanceRows.find(a => a.courseId === enrollment.courseId);

                if (firstAttendance && courseAssignments.length > 0) {
                     const daysSinceEnrollment = differenceInDays(new Date(), new Date(firstAttendance.date)) + 1;
                     if (daysSinceEnrollment > 0) {
                         const attendanceDays = new Set(attendanceRows.filter(a => a.courseId === enrollment.courseId).map(a => a.date)).size;
                         totalAttention += (attendanceDays / daysSinceEnrollment);
                     }
                }
                
                if (courseAssignments.length > 0) {
                     const courseSubmissions = studentSubmissions.filter(s => courseAssignments.some(a => a.id === s.assignmentId));
                     totalCompletion += (courseSubmissions.length / courseAssignments.length);
                } else {
                    totalCompletion += 1; // if no assignments, completion is 100%
                }
            }
            
            const attentionScore = enrollments.length > 0 ? (totalAttention / enrollments.length) * 100 : 100;
            const completionScore = enrollments.length > 0 ? (totalCompletion / enrollments.length) * 100 : 100;
            const efficiencyScore = (attentionScore * 0.25) + (completionScore * 0.4) + (averageGrade * 0.35);

            const sortedAttendance = Object.values(db.attendance).filter(a => a.studentId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            let streak = 0;
            if (sortedAttendance.length > 0) {
                const uniqueDates = [...new Set(sortedAttendance.map(d => d.date))].map(d => parseISO(d)).sort((a,b) => b.getTime() - a.getTime());
                if (uniqueDates.length > 0) {
                     const lastDay = uniqueDates[0];
                     const today = new Date();
                     const yesterday = subDays(today, 1);
                     if (isSameDay(lastDay, today) || isSameDay(lastDay, yesterday)) {
                        streak = 1;
                        let expectedDate = isSameDay(lastDay, today) ? yesterday : subDays(yesterday, 1);
                        for (let i = 1; i < uniqueDates.length; i++) {
                            if (isSameDay(uniqueDates[i], expectedDate)) {
                                streak++;
                                expectedDate = subDays(expectedDate, 1);
                            } else {
                                break;
                            }
                        }
                     }
                }
            }

            return {
                stats: [
                    { title: 'Enrolled Courses', value: enrollments.length, subtitle: 'Ready to learn', icon: 'BookOpen', link: { href: "/courses", text: "View Courses"} },
                    { title: 'Assignments Due', value: assignmentsDueSoon, subtitle: 'In the next 7 days', icon: 'ClipboardList' },
                    { title: 'Overall Grade', value: gradeToLetter(averageGrade), subtitle: 'Across all courses', icon: 'GraduationCap', link: { href: '/my-grades', text: "View Grades"} },
                ],
                learningEfficiency: { score: Math.round(efficiencyScore), components: { attention: Math.round(attentionScore), completion: Math.round(completionScore), accuracy: Math.round(averageGrade) } },
                streak,
            };
        }
    },
    ['dashboard-data'],
    { tags: ['users', 'courses', 'enrollments', 'assignments', 'submissions', 'attendance'] }
);
