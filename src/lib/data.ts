

'use server';

import { placeholderImages } from './placeholder-images.json';
import type { Course, Enrollment, User, Assignment, Submission, GradedSubmission, DiscussionThread, DiscussionPost, Material, Notification, Attendance, Certificate, Challenge, ChallengeSubmission, ChallengeVote, Project, InternshipDomain } from './types';
import { sql } from '@vercel/postgres';
import { randomUUID } from 'crypto';
import { unstable_cache } from 'next/cache';
import { differenceInDays, parseISO, isSameDay, subDays } from 'date-fns';
import { getSession } from './session';


const unknownUser: User = { id: '0', name: 'Unknown User', email: '', role: 'student' };


// --- User Functions ---
export async function findUserByEmail(email: string): Promise<User | undefined> {
    const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
    return rows[0] as User | undefined;
}

export const findUserById = unstable_cache(
    async (id: string): Promise<User> => {
        if (!id || id === '0') return unknownUser;
        const { rows } = await sql`SELECT * FROM users WHERE id = ${id}`;
        return (rows[0] as User) || unknownUser;
    },
    ['user'],
    { tags: ['users'], revalidate: 3600 }
);


export async function createUser(data: Omit<User, 'id'>): Promise<User> {
    const id = randomUUID();
    await sql`
        INSERT INTO users (id, name, email, password, role)
        VALUES (${id}, ${data.name}, ${data.email}, ${data.password}, ${data.role})
    `;
    return { id, ...data };
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'email' | 'role'>>): Promise<User | undefined> {
    const user = await findUserById(id);
    if (!user || user.id === '0') return undefined;

    const updatedUser = { ...user, ...data };
    
    await sql`
        UPDATE users
        SET name = ${updatedUser.name}, password = ${updatedUser.password}
        WHERE id = ${id}
    `;
    return updatedUser;
}

export async function getAuthenticatedUser(): Promise<User | null> {
    const { user } = await getSession();
    return user;
}

// --- Course Functions ---
export async function getAllCourses(query?: string): Promise<Course[]> {
    let coursesQuery = sql`SELECT * FROM courses`;
    if (query) {
       coursesQuery = sql`SELECT * FROM courses WHERE title ILIKE ${'%' + query + '%'} OR description ILIKE ${'%' + query + '%'}`;
    }
    const { rows } = await coursesQuery;
    return rows as Course[];
}

export const getCourseById = unstable_cache(
    async (id: string): Promise<(Course & { teacher: User }) | undefined> => {
        const { rows } = await sql`SELECT * FROM courses WHERE id = ${id}`;
        const course = rows[0] as Course | undefined;
        if (!course) return undefined;
        
        const teacher = await findUserById(course.teacherId);
        if (teacher.id === '0') return undefined;

        return { ...course, teacher };
    },
    ['course'],
    { tags: ['courses'], revalidate: 3600 }
);


export async function createCourse(data: Omit<Course, 'id' | 'teacherId' | 'imageUrl'>, teacherId: string): Promise<Course> {
    const id = randomUUID();
    const newCourse: Course = {
        ...data,
        id,
        teacherId,
        imageUrl: placeholderImages[Math.floor(Math.random() * placeholderImages.length)].imageUrl,
    };
    await sql`
        INSERT INTO courses (id, title, description, duration, "teacherId", "imageUrl", "videoUrl")
        VALUES (${newCourse.id}, ${newCourse.title}, ${newCourse.description}, ${newCourse.duration}, ${newCourse.teacherId}, ${newCourse.imageUrl}, ${newCourse.videoUrl || null})
    `;
    return newCourse;
}

export async function updateCourse(id: string, data: Partial<Omit<Course, 'id' | 'teacherId' | 'imageUrl'>>): Promise<Course | undefined> {
    const course = await getCourseById(id);
    if (!course) return undefined;

    const updatedCourse = { ...course, ...data };

    await sql`
        UPDATE courses
        SET title = ${updatedCourse.title}, description = ${updatedCourse.description}, duration = ${updatedCourse.duration}, "videoUrl" = ${updatedCourse.videoUrl || null}
        WHERE id = ${id}
    `;
    return updatedCourse;
}

export async function deleteCourse(id: string): Promise<boolean> {
     await sql.query(`
        DELETE FROM enrollments WHERE "courseId" = $1;
        DELETE FROM assignments WHERE "courseId" = $1;
        DELETE FROM discussion_threads WHERE "courseId" = $1;
        DELETE FROM materials WHERE "courseId" = $1;
        DELETE FROM attendance WHERE "courseId" = $1;
        DELETE FROM courses WHERE id = $1;
    `, [id]);
    return true;
}


export async function getTeacherById(id: string): Promise<User> {
    return findUserById(id);
}

export async function getTeacherCourses(teacherId: string, query?: string): Promise<Course[]> {
    let querySql = sql`SELECT * FROM courses WHERE "teacherId" = ${teacherId}`;
    if (query) {
        querySql = sql`SELECT * FROM courses WHERE "teacherId" = ${teacherId} AND (title ILIKE ${'%' + query + '%'} OR description ILIKE ${'%' + query + '%'})`;
    }
    const { rows } = await querySql;
    return rows as Course[];
}


// --- Enrollment Functions ---
export async function getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    const { rows } = await sql`SELECT * FROM enrollments WHERE "studentId" = ${studentId}`;
    return rows as Enrollment[];
}

export async function getStudentsByCourse(courseId: string): Promise<User[]> {
    const { rows } = await sql`
        SELECT u.* FROM users u
        JOIN enrollments e ON u.id = e."studentId"
        WHERE e."courseId" = ${courseId}
    `;
    return rows as User[];
}

export async function enrollInCourse(studentId: string, courseId: string): Promise<Enrollment | null> {
    const { rows } = await sql`SELECT * FROM enrollments WHERE "studentId" = ${studentId} AND "courseId" = ${courseId}`;
    if (rows.length > 0) return null;

    const id = randomUUID();
    const newEnrollment: Enrollment = { id, studentId, courseId };
    await sql`
        INSERT INTO enrollments (id, "studentId", "courseId")
        VALUES (${id}, ${studentId}, ${courseId})
    `;
    return newEnrollment;
}

export async function isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const { rows } = await sql`SELECT 1 FROM enrollments WHERE "studentId" = ${studentId} AND "courseId" = ${courseId}`;
    return rows.length > 0;
}

export async function getTeacherStudents(teacherId: string) {
    const { rows } = await sql`
        SELECT DISTINCT u.id, u.name, u.email
        FROM users u
        JOIN enrollments e ON u.id = e."studentId"
        JOIN courses c ON e."courseId" = c.id
        WHERE c."teacherId" = ${teacherId}
    `;

    const studentStats = await Promise.all(rows.map(async (student) => {
        const { rows: courseRows } = await sql`
            SELECT c.title FROM courses c
            JOIN enrollments e ON c.id = e."courseId"
            WHERE e."studentId" = ${student.id} AND c."teacherId" = ${teacherId}
        `;
        const studentCourses = courseRows.map(r => r.title);

        const { rows: submissionRows } = await sql`
            SELECT grade FROM submissions
            WHERE "studentId" = ${student.id} AND grade IS NOT NULL
            ORDER BY "submittedAt" ASC
        `;
        
        const grades = submissionRows.map(r => r.grade);
        const totalGrade = grades.reduce((acc, grade) => acc + grade, 0);
        const averageGrade = grades.length > 0 ? Math.round(totalGrade / grades.length) : 0;

        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (grades.length >= 3) {
            const lastThreeGrades = grades.slice(-3);
            const lastThreeAverage = lastThreeGrades.reduce((acc, grade) => acc + grade, 0) / 3;
            if (lastThreeAverage > averageGrade + 5) trend = 'improving';
            else if (lastThreeAverage < averageGrade - 5) trend = 'declining';
        }

        return {
            id: student.id,
            name: student.name,
            email: student.email,
            courses: studentCourses,
            averageGrade,
            assignmentsCompleted: grades.length,
            trend,
        };
    }));
    return studentStats;
}


// --- Assignment Functions ---
export async function getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    const { rows } = await sql`SELECT * FROM assignments WHERE "courseId" = ${courseId}`;
    return rows as Assignment[];
}

export async function getAssignmentsByTeacher(teacherId: string): Promise<(Assignment & { courseTitle: string, submissions: number })[]> {
    const { rows } = await sql`
        SELECT a.*, c.title as "courseTitle", COUNT(s.id) as submissions
        FROM assignments a
        JOIN courses c ON a."courseId" = c.id
        LEFT JOIN submissions s ON a.id = s."assignmentId"
        WHERE c."teacherId" = ${teacherId}
        GROUP BY a.id, c.title
    `;
    return rows.map(r => ({...r, submissions: parseInt(r.submissions, 10)})) as (Assignment & { courseTitle: string, submissions: number })[];
}

export async function createAssignment(data: Omit<Assignment, 'id'>): Promise<Assignment> {
    const id = randomUUID();
    const newAssignment = { id, ...data };
    await sql`
        INSERT INTO assignments (id, "courseId", title, description, "dueDate")
        VALUES (${id}, ${data.courseId}, ${data.title}, ${data.description}, ${data.dueDate})
    `;
    return newAssignment;
}

export async function getAssignmentById(id: string): Promise<(Assignment & { submissions: (Submission & { student: User })[] }) | undefined> {
    const { rows: assignmentRows } = await sql`SELECT * FROM assignments WHERE id = ${id}`;
    const assignment = assignmentRows[0] as Assignment | undefined;
    if (!assignment) return undefined;

    const { rows: submissionRows } = await sql`
        SELECT s.*, u.name as "studentName", u.email as "studentEmail"
        FROM submissions s
        JOIN users u ON s."studentId" = u.id
        WHERE s."assignmentId" = ${id}
    `;

    const submissionsWithStudents = submissionRows.map(sub => ({
        ...sub,
        student: { id: sub.studentId, name: sub.studentName, email: sub.studentEmail, role: 'student' }
    })) as (Submission & { student: User })[];

    return { ...assignment, submissions: submissionsWithStudents };
}


// --- Submission Functions ---
export async function getSubmissionById(id: string): Promise<Submission | undefined> {
    const { rows } = await sql`SELECT * FROM submissions WHERE id = ${id}`;
    return rows[0] as Submission | undefined;
}

export async function getStudentSubmission(studentId: string, assignmentId: string): Promise<Submission | undefined> {
    const { rows } = await sql`SELECT * FROM submissions WHERE "studentId" = ${studentId} AND "assignmentId" = ${assignmentId}`;
    return rows[0] as Submission | undefined;
}

export async function createSubmission(data: Omit<Submission, 'id' | 'submittedAt' | 'grade' | 'feedback'>): Promise<Submission> {
    const id = randomUUID();
    const newSubmission: Submission = { 
        ...data, 
        id, 
        submittedAt: new Date().toISOString(),
        grade: null,
        feedback: null
    };
    await sql`
        INSERT INTO submissions (id, "assignmentId", "studentId", content, "submittedAt")
        VALUES (${id}, ${data.assignmentId}, ${data.studentId}, ${data.content}, ${newSubmission.submittedAt})
    `;
    return newSubmission;
}

export async function gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission | undefined> {
    const { rows } = await sql`
        UPDATE submissions
        SET grade = ${grade}, feedback = ${feedback}
        WHERE id = ${submissionId}
        RETURNING *
    `;
    return rows[0] as Submission | undefined;
}

export async function getStudentGrades(studentId: string): Promise<GradedSubmission[]> {
    const { rows } = await sql`
        SELECT s.*, a.title as "assignmentTitle", a.description as "assignmentDescription", a."dueDate" as "assignmentDueDate", c.id as "courseId", c.title as "courseTitle", c.description as "courseDescription", c.duration as "courseDuration"
        FROM submissions s
        JOIN assignments a ON s."assignmentId" = a.id
        JOIN courses c ON a."courseId" = c.id
        WHERE s."studentId" = ${studentId} AND s.grade IS NOT NULL
    `;
    
    return rows.map(r => ({
        ...r,
        assignment: { id: r.assignmentId, title: r.assignmentTitle, description: r.assignmentDescription, dueDate: r.assignmentDueDate, courseId: r.courseId },
        course: { id: r.courseId, title: r.courseTitle, description: r.courseDescription, duration: r.courseDuration }
    })) as GradedSubmission[];
}


// --- Discussion Functions ---
export async function getThreadsByCourse(courseId: string): Promise<(DiscussionThread & { author: User, postCount: number })[]> {
    const { rows } = await sql`
        SELECT dt.*, u.name as "authorName", u.email as "authorEmail", COUNT(dp.id) as "postCount"
        FROM discussion_threads dt
        JOIN users u ON dt."authorId" = u.id
        LEFT JOIN discussion_posts dp ON dt.id = dp."threadId"
        WHERE dt."courseId" = ${courseId}
        GROUP BY dt.id, u.name, u.email
    `;
    return rows.map(r => ({
        ...r,
        author: { id: r.authorId, name: r.authorName, email: r.authorEmail, role: 'student'}, // Role is a guess, but not critical here
        postCount: parseInt(r.postCount, 10)
    })) as (DiscussionThread & { author: User, postCount: number })[];
}

export async function getThreadById(threadId: string): Promise<(DiscussionThread & { author: User }) | undefined> {
    const { rows } = await sql`
        SELECT dt.*, u.name as "authorName", u.email as "authorEmail"
        FROM discussion_threads dt
        JOIN users u ON dt."authorId" = u.id
        WHERE dt.id = ${threadId}
    `;
    const thread = rows[0];
    if (!thread) return undefined;
    
    return {
        ...thread,
        author: { id: thread.authorId, name: thread.authorName, email: thread.authorEmail, role: 'student' }
    } as DiscussionThread & { author: User };
}

export async function getPostsByThread(threadId: string): Promise<(DiscussionPost & { author: User })[]> {
    const { rows } = await sql`
        SELECT dp.*, u.name as "authorName", u.email as "authorEmail"
        FROM discussion_posts dp
        JOIN users u ON dp."authorId" = u.id
        WHERE dp."threadId" = ${threadId}
        ORDER BY dp."createdAt" ASC
    `;
    return rows.map(r => ({
        ...r,
        author: { id: r.authorId, name: r.authorName, email: r.authorEmail, role: 'student' }
    })) as (DiscussionPost & { author: User })[];
}

export async function createThread(data: Omit<DiscussionThread, 'id' | 'createdAt'>): Promise<DiscussionThread> {
    const id = randomUUID();
    const newThread: DiscussionThread = { ...data, id, createdAt: new Date().toISOString() };
    await sql`
        INSERT INTO discussion_threads (id, "courseId", title, "authorId", "createdAt")
        VALUES (${id}, ${data.courseId}, ${data.title}, ${data.authorId}, ${newThread.createdAt})
    `;
    return newThread;
}

export async function createPost(data: Omit<DiscussionPost, 'id' | 'createdAt'>): Promise<DiscussionPost> {
    const id = randomUUID();
    const newPost: DiscussionPost = { ...data, id, createdAt: new Date().toISOString() };
    await sql`
        INSERT INTO discussion_posts (id, "threadId", "authorId", content, "createdAt")
        VALUES (${id}, ${data.threadId}, ${data.authorId}, ${data.content}, ${newPost.createdAt})
    `;
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
    await sql`
        INSERT INTO materials (id, "courseId", title, link, "createdAt")
        VALUES (${id}, ${data.courseId}, ${data.title}, ${data.link}, ${newMaterial.createdAt})
    `;
  return newMaterial;
}

export async function getMaterialsByCourse(courseId: string): Promise<Material[]> {
    const { rows } = await sql`SELECT * FROM materials WHERE "courseId" = ${courseId}`;
    return rows as Material[];
}

// --- Notification Functions ---
export async function createNotification(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = {
        ...data,
        id,
        isRead: false,
        createdAt: new Date().toISOString(),
    };
    await sql`
        INSERT INTO notifications (id, "userId", message, link, "isRead", "createdAt")
        VALUES (${id}, ${data.userId}, ${data.message}, ${data.link}, ${newNotification.isRead}, ${newNotification.createdAt})
    `;
    return newNotification;
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
    const { rows } = await sql`SELECT * FROM notifications WHERE "userId" = ${userId} ORDER BY "createdAt" DESC`;
    return rows as Notification[];
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
    const result = await sql`
        UPDATE notifications
        SET "isRead" = true
        WHERE id = ${notificationId}
    `;
    return result.rowCount > 0;
}

// --- Leaderboard Functions ---
export async function getStudentRankings(): Promise<{ user: User, averageGrade: number, assignmentsCompleted: number, credibilityPoints: number }[]> {
    const { rows: students } = await sql`SELECT * FROM users WHERE role = 'student'`;
    
    const studentStats = await Promise.all(students.map(async (student: User) => {
        const { rows: submissions } = await sql`SELECT grade FROM submissions WHERE "studentId" = ${student.id} AND grade IS NOT NULL`;
        const totalGrade = submissions.reduce((acc, sub) => acc + sub.grade, 0);
        const averageGrade = submissions.length > 0 ? totalGrade / submissions.length : 0;
        
        const { rows: challengeSubmissions } = await sql`
            SELECT cs.id, c.points FROM challenge_submissions cs
            JOIN challenges c ON cs."challengeId" = c.id
            WHERE cs."studentId" = ${student.id}
        `;

        let credibilityPoints = 0;
        for (const cs of challengeSubmissions) {
            const votes = await getVotesForSubmission(cs.id);
            credibilityPoints += (votes * 10) + cs.points;
        }
        
        return {
            user: student,
            averageGrade: Math.round(averageGrade),
            assignmentsCompleted: submissions.length,
            credibilityPoints
        };
    }));

    return studentStats.sort((a, b) => {
        if (b.averageGrade !== a.averageGrade) return b.averageGrade - a.averageGrade;
        return b.assignmentsCompleted - a.assignmentsCompleted;
    });
}

// --- Attendance Functions ---
export async function markAttendance(studentId: string, courseId: string): Promise<Attendance | null> {
    const today = new Date().toISOString().split('T')[0];
    const { rows } = await sql`SELECT * FROM attendance WHERE "studentId" = ${studentId} AND "courseId" = ${courseId} AND date = ${today}`;
    if (rows.length > 0) return null;

    const id = randomUUID();
    const newRecord: Attendance = { id, studentId, courseId, date: today, isPresent: true };
    await sql`
        INSERT INTO attendance (id, "studentId", "courseId", date, "isPresent")
        VALUES (${id}, ${studentId}, ${courseId}, ${today}, true)
    `;
    return newRecord;
}

export async function getAllAttendance(): Promise<(Attendance & { student: User, course: Course })[]> {
    const { rows } = await sql`
        SELECT att.*, u.name as "studentName", u.email as "studentEmail", c.title as "courseTitle"
        FROM attendance att
        JOIN users u ON att."studentId" = u.id
        JOIN courses c ON att."courseId" = c.id
        ORDER BY att.date DESC
    `;
    return rows.map(r => ({
        ...r,
        student: { id: r.studentId, name: r.studentName, email: r.studentEmail, role: 'student' },
        course: { id: r.courseId, title: r.courseTitle }
    })) as (Attendance & { student: User, course: Course })[];
}

// --- Certificate Functions ---
const PASSING_GRADE = 70;

export async function getCompletedCoursesForStudent(studentId: string): Promise<Course[]> {
    const { rows: enrollments } = await sql`SELECT "courseId" FROM enrollments WHERE "studentId" = ${studentId}`;
    const completedCourses: Course[] = [];

    for (const enrollment of enrollments) {
        const courseId = enrollment.courseId;
        const { rows: assignments } = await sql`SELECT id FROM assignments WHERE "courseId" = ${courseId}`;
        if (assignments.length === 0) continue;

        const { rows: submissions } = await sql`
            SELECT grade FROM submissions
            WHERE "studentId" = ${studentId} AND "assignmentId" = ANY(ARRAY[${assignments.map(a => a.id).join(',')}]::uuid[])
        `;

        const allPassed = assignments.every(a => {
            const sub = submissions.find(s => s.assignmentId === a.id);
            return sub && sub.grade >= PASSING_GRADE;
        });

        if (allPassed) {
            const { rows: courseRows } = await sql`SELECT * FROM courses WHERE id = ${courseId}`;
            if (courseRows.length > 0) completedCourses.push(courseRows[0] as Course);
        }
    }
    return completedCourses;
}

export async function getStudentCertificates(studentId: string): Promise<(Certificate & { course: Course })[]> {
    const { rows } = await sql`
        SELECT cert.*, c.title as "courseTitle", c.description as "courseDescription"
        FROM certificates cert
        JOIN courses c ON cert."courseId" = c.id
        WHERE cert."studentId" = ${studentId}
        ORDER BY cert."issuedAt" DESC
    `;
    return rows.map(r => ({...r, course: { title: r.courseTitle, description: r.courseDescription }})) as (Certificate & { course: Course })[];
}

export async function getCertificateById(id: string): Promise<(Certificate & { student: User; course: Course & { teacher: User } }) | undefined> {
    const { rows } = await sql`SELECT * FROM certificates WHERE id = ${id}`;
    const certificate = rows[0] as Certificate | undefined;
    if (!certificate) return undefined;

    const student = await findUserById(certificate.studentId);
    if (student.id === '0') return undefined;

    const course = await getCourseById(certificate.courseId);
    if (!course || course.teacher.id === '0') return undefined;

    return { ...certificate, student, course };
}


export async function generateCertificate(studentId: string, courseId: string): Promise<Certificate | null> {
    const { rows } = await sql`SELECT * FROM certificates WHERE "studentId" = ${studentId} AND "courseId" = ${courseId}`;
    if (rows.length > 0) return null;

    const id = randomUUID();
    const newCertificate: Certificate = { id, studentId, courseId, issuedAt: new Date().toISOString(), verificationId: randomUUID() };
    await sql`
        INSERT INTO certificates (id, "studentId", "courseId", "issuedAt", "verificationId")
        VALUES (${id}, ${studentId}, ${courseId}, ${newCertificate.issuedAt}, ${newCertificate.verificationId})
    `;
    return newCertificate;
}

// --- Challenge Functions ---
export async function getAllChallenges(): Promise<Challenge[]> {
    const { rows } = await sql`SELECT * FROM challenges`;
    return rows as Challenge[];
}

export async function getChallengeById(id: string): Promise<Challenge | undefined> {
    const { rows } = await sql`SELECT * FROM challenges WHERE id = ${id}`;
    return rows[0] as Challenge | undefined;
}

export async function getSubmissionsForChallenge(challengeId: string): Promise<(ChallengeSubmission & { student: User; votes: number })[]> {
    const { rows } = await sql`
        SELECT cs.*, u.name as "studentName", u.email as "studentEmail", COUNT(cv.id) as votes
        FROM challenge_submissions cs
        JOIN users u ON cs."studentId" = u.id
        LEFT JOIN challenge_votes cv ON cs.id = cv."submissionId"
        WHERE cs."challengeId" = ${challengeId}
        GROUP BY cs.id, u.name, u.email
    `;
    return rows.map(r => ({
        ...r,
        student: { id: r.studentId, name: r.studentName, email: r.studentEmail, role: 'student' },
        votes: parseInt(r.votes, 10)
    })) as (ChallengeSubmission & { student: User; votes: number })[];
}

export async function createChallengeSubmission(data: Omit<ChallengeSubmission, 'id' | 'submittedAt'>): Promise<ChallengeSubmission> {
    const id = randomUUID();
    const newSubmission: ChallengeSubmission = { ...data, id, submittedAt: new Date().toISOString() };
    await sql`
        INSERT INTO challenge_submissions (id, "challengeId", "studentId", content, "submittedAt")
        VALUES (${id}, ${data.challengeId}, ${data.studentId}, ${data.content}, ${newSubmission.submittedAt})
    `;
    return newSubmission;
}

export async function voteOnSubmission(submissionId: string, voterId: string): Promise<ChallengeVote | null> {
    const { rows: subRows } = await sql`SELECT "studentId" FROM challenge_submissions WHERE id = ${submissionId}`;
    if (subRows.length === 0 || subRows[0].studentId === voterId) return null;

    try {
        const id = randomUUID();
        await sql`INSERT INTO challenge_votes (id, "submissionId", "voterId") VALUES (${id}, ${submissionId}, ${voterId})`;
        return { id, submissionId, voterId };
    } catch (error) {
        // This will fail if the unique constraint (submissionId, voterId) is violated
        return null;
    }
}

export async function getVotesForSubmission(submissionId: string): Promise<number> {
    const { rows } = await sql`SELECT COUNT(*) as count FROM challenge_votes WHERE "submissionId" = ${submissionId}`;
    return parseInt(rows[0].count, 10);
}

// --- Project Showcase Functions ---
export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'imageUrl'>): Promise<Project> {
    const id = randomUUID();
    const newProject: Project = {
        ...data,
        id,
        imageUrl: `https://picsum.photos/seed/proj${Date.now()}/600/400`,
        createdAt: new Date().toISOString(),
    };
    await sql`
        INSERT INTO projects (id, "studentId", title, description, "imageUrl", "projectUrl", tags, "createdAt")
        VALUES (${id}, ${data.studentId}, ${data.title}, ${data.description}, ${newProject.imageUrl}, ${data.projectUrl}, ${data.tags}, ${newProject.createdAt})
    `;
    return newProject;
}

export async function getAllProjects(): Promise<(Project & { student: User })[]> {
    const { rows } = await sql`
        SELECT p.*, u.name as "studentName", u.email as "studentEmail"
        FROM projects p
        JOIN users u ON p."studentId" = u.id
        ORDER BY p."createdAt" DESC
    `;
    return rows.map(r => ({
        ...r,
        student: { id: r.studentId, name: r.studentName, email: r.studentEmail, role: 'student' }
    })) as (Project & { student: User })[];
}

export async function getProjectsByStudent(studentId: string): Promise<Project[]> {
    const { rows } = await sql`SELECT * FROM projects WHERE "studentId" = ${studentId} ORDER BY "createdAt" DESC`;
    return rows as Project[];
}

// --- Internship Functions ---
export async function getInternshipDomains(): Promise<InternshipDomain[]> {
    const { rows } = await sql`SELECT * FROM internship_domains`;
    return rows as InternshipDomain[];
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
        const { rows: courses } = await sql`SELECT id, title FROM courses WHERE "teacherId" = ${userId}`;
        const courseIds = courses.map(c => c.id);
        
        const { rows: enrollments } = await sql`SELECT DISTINCT "studentId" FROM enrollments WHERE "courseId" = ANY(ARRAY[${courseIds.join(',')}]::uuid[])`;
        const studentIds = new Set(enrollments.map(e => e.studentId));

        const { rows: assignments } = await sql`SELECT id FROM assignments WHERE "courseId" = ANY(ARRAY[${courseIds.join(',')}]::uuid[])`;
        const assignmentIds = assignments.map(a => a.id);

        const { rows: submissions } = await sql`SELECT grade FROM submissions WHERE "assignmentId" = ANY(ARRAY[${assignmentIds.join(',')}]::uuid[])`;
        const pendingSubmissions = submissions.filter(s => s.grade === null).length;

        const coursePerformances: CoursePerformance[] = await Promise.all(courses.map(async (course) => {
            const { rows: courseAssignments } = await sql`SELECT id FROM assignments WHERE "courseId" = ${course.id}`;
            const courseAssignmentIds = courseAssignments.map(a => a.id);
            const { rows: courseSubmissions } = await sql`SELECT grade FROM submissions WHERE "assignmentId" = ANY(ARRAY[${courseAssignmentIds.join(',')}]::uuid[]) AND grade IS NOT NULL`;
            
            const gradeDistribution = [
                { name: 'A (90+)', students: 0 }, { name: 'B (80-89)', students: 0 },
                { name: 'C (70-79)', students: 0 }, { name: 'D (60-69)', students: 0 }, { name: 'F (<60)', students: 0 },
            ];
            
            courseSubmissions.forEach(sub => {
                if (sub.grade >= 90) gradeDistribution[0].students++;
                else if (sub.grade >= 80) gradeDistribution[1].students++;
                else if (sub.grade >= 70) gradeDistribution[2].students++;
                else if (sub.grade >= 60) gradeDistribution[3].students++;
                else gradeDistribution[4].students++;
            });
            return { courseId: course.id, courseTitle: course.title, gradeDistribution };
        }));

        let studentOfTheWeek: StudentOfTheWeek = null;
        if (studentIds.size > 0) {
            const studentScores: { studentId: string; name: string; score: number; grade: number }[] = [];
            for (const studentId of Array.from(studentIds)) {
                const { rows: studentRows } = await sql`SELECT name FROM users WHERE id = ${studentId}`;
                if (studentRows.length === 0) continue;
                const { rows: studentSubmissions } = await sql`SELECT grade FROM submissions WHERE "studentId" = ${studentId} AND grade IS NOT NULL`;
                if (studentSubmissions.length > 0) {
                    const totalGrade = studentSubmissions.reduce((acc, sub) => acc + sub.grade, 0);
                    const averageGrade = totalGrade / studentSubmissions.length;
                    studentScores.push({ studentId, name: studentRows[0].name, score: averageGrade + (studentSubmissions.length * 2), grade: Math.round(averageGrade) });
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
        const { rows: enrollments } = await sql`SELECT "courseId" FROM enrollments WHERE "studentId" = ${userId}`;
        const enrolledCourseIds = enrollments.map(e => e.courseId);

        const { rows: allAssignments } = await sql`SELECT id, "dueDate" FROM assignments WHERE "courseId" = ANY(ARRAY[${enrolledCourseIds.join(',')}]::uuid[])`;
        
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const { rows: studentSubmissions } = await sql`SELECT "assignmentId", grade FROM submissions WHERE "studentId" = ${userId}`;
        const submittedAssignmentIds = new Set(studentSubmissions.map(s => s.assignmentId));
        const assignmentsDueSoon = allAssignments.filter(a => new Date(a.dueDate) > new Date() && new Date(a.dueDate) <= sevenDaysFromNow && !submittedAssignmentIds.has(a.id)).length;
        
        const gradedSubmissions = studentSubmissions.filter(s => s.grade !== null);
        const totalGrade = gradedSubmissions.reduce((acc, sub) => acc + sub.grade, 0);
        const averageGrade = gradedSubmissions.length > 0 ? Math.round(totalGrade / gradedSubmissions.length) : 0;
        
        const gradeToLetter = (grade: number) => {
            if (grade >= 90) return 'A'; if (grade >= 80) return 'B'; if (grade >= 70) return 'C'; if (grade >= 60) return 'D'; return grade > 0 ? 'F' : 'N/A';
        };

        const { rows: attendanceRows } = await sql`SELECT date, "courseId" FROM attendance WHERE "studentId" = ${userId}`;
        let totalAttention = 0, totalCompletion = 0;
        for (const enrollment of enrollments) {
            const firstAttendance = attendanceRows.find(a => a.courseId === enrollment.courseId);
            if (!firstAttendance) continue;

            const daysSinceEnrollment = differenceInDays(new Date(), new Date(firstAttendance.date)) + 1;
            const attendanceDays = new Set(attendanceRows.filter(a => a.courseId === enrollment.courseId).map(a => new Date(a.date).toDateString())).size;
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

        const { rows: sortedAttendance } = await sql`SELECT date FROM attendance WHERE "studentId" = ${userId} ORDER BY date DESC`;
        let streak = 0;
        if (sortedAttendance.length > 0) {
            const uniqueDates = [...new Set(sortedAttendance.map(d => d.date.toISOString().split('T')[0]))].map(d => parseISO(d)).sort((a,b) => b.getTime() - a.getTime());
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
