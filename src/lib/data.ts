
'use server';

import dbData from './db.json';
import { randomUUID } from 'crypto';
import { unstable_cache } from 'next/cache';
import { differenceInDays, parseISO, isSameDay, subDays } from 'date-fns';
import { getSession } from './session';
import { PlaceHolderImages } from './placeholder-images';
import type { Course, Enrollment, User, Assignment, Submission, GradedSubmission, DiscussionThread, DiscussionPost, Material, Notification, Attendance, Certificate, Challenge, ChallengeSubmission, ChallengeVote, Project, InternshipDomain } from './types';


const unknownUser: User = { id: '0', name: 'Unknown User', email: '', role: 'student' };

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

const now = new Date();
dbData.assignments['as1'].dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
dbData.assignments['as2'].dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
dbData.assignments['as3'].dueDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
dbData.assignments['as4'].dueDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
dbData.submissions['sub1'].submittedAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
dbData.submissions['sub2'].submittedAt = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();
dbData.submissions['sub3'].submittedAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
dbData.discussion_threads['th1'].createdAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
dbData.discussion_posts['po1'].createdAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
dbData.discussion_posts['po2'].createdAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
dbData.materials['mat1'].createdAt = now.toISOString();
dbData.attendance['att1'].date = now.toISOString().split('T')[0];
dbData.attendance['att2'].date = now.toISOString().split('T')[0];

const db: Db = global.__db || dbData;

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
        return studentIds.map(id => db.users[id]).filter(Boolean);
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
        const teacherCourseIds = new Set(Object.keys(db.courses).filter(id => db.courses[id].teacherId === teacherId));
        
        const studentIds = new Set(
            Object.values(db.enrollments)
                .filter(e => teacherCourseIds.has(e.courseId))
                .map(e => e.studentId)
        );
        
        return Promise.all(Array.from(studentIds).map(async (studentId) => {
            const student = await findUserById(studentId);
            const enrolledCourseIds = Object.keys(db.enrollments).filter(id => db.enrollments[id].studentId === studentId && teacherCourseIds.has(db.enrollments[id].courseId)).map(id => db.enrollments[id].courseId);
            
            const courses = enrolledCourseIds.map(id => db.courses[id]?.title).filter(Boolean);

            const submissions = Object.values(db.submissions).filter(s => s.studentId === studentId && s.grade !== null);
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
        const teacherCourseIds = new Set(Object.keys(db.courses).filter(id => db.courses[id].teacherId === teacherId));
        
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
            const course = db.courses[assignment?.courseId];
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
        const projects = Object.values(db.projects);
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
                    { title: 'Pending Submissions', value: pendingSubmissions, subtitle: 'Awaiting grading', icon: 'GraduationCap' },
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

            const sortedAttendance = Object.values(db.attendance).filter(a => a.studentId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    },
    ['dashboard-data'],
    { tags: ['users', 'courses', 'enrollments', 'assignments', 'submissions', 'attendance'] }
);
