You are an expert AI programmer. Your task is to build a comprehensive, full-stack Learning Management System (LMS) called "CoursePilot". You must adhere strictly to the specified technology stack and implement all the features listed for both students and teachers.

## 1. Core Technology Stack

*   **Framework**: Next.js (using the App Router, Server Components, and TypeScript).
*   **UI Components**: `shadcn/ui`. You must use these components wherever possible (e.g., `Card`, `Button`, `Dialog`, `Table`).
*   **Styling**: Tailwind CSS for all styling. Use the HSL color variables defined in `src/app/globals.css`.
*   **AI Functionality**: Genkit for all generative AI features.
*   **Data Management**: Use a local `db.json` file for data persistence, accessed via functions in `src/lib/data.ts`. Do not use a real database.

## 2. Data Models (Entities)

Implement the following data models. All data will be stored in a single `db.json` file, organized by these entities.

*   **User**: `id`, `name`, `email`, `role` ('student' or 'teacher'), `password`.
*   **Course**: `id`, `title`, `description`, `duration`, `teacherId`, `imageUrl`, `videoUrl` (optional).
*   **Enrollment**: `id`, `studentId`, `courseId`.
*   **Assignment**: `id`, `courseId`, `title`, `description`, `dueDate`.
*   **Submission**: `id`, `assignmentId`, `studentId`, `content`, `submittedAt`, `grade` (nullable), `feedback` (nullable).
*   **DiscussionThread**: `id`, `courseId`, `title`, `authorId`, `createdAt`.
*   **DiscussionPost**: `id`, `threadId`, `authorId`, `content`, `createdAt`.
*   **Material**: `id`, `courseId`, `title`, `link`, `createdAt`.
*   **Notification**: `id`, `userId`, `message`, `link`, `isRead`, `createdAt`.
*   **Attendance**: `id`, `studentId`, `courseId`, `date`, `isPresent`.
*   **Certificate**: `id`, `studentId`, `courseId`, `issuedAt`, `verificationId`.
*   **Challenge**: `id`, `title`, `description`, `company`, `points`, `icon`.
*   **ChallengeSubmission**: `id`, `challengeId`, `studentId`, `content`, `submittedAt`.
*   **ChallengeVote**: `id`, `submissionId`, `voterId`.
*   **Project**: `id`, `studentId`, `title`, `description`, `imageUrl`, `projectUrl`, `tags` (array), `createdAt`.
*   **InternshipDomain**: `id`, `name`, `description`, `icon`, `task` (object containing `title`, `scenario`, `task`, `deliverables`).

## 3. Student Features

### Core Learning & Engagement
-   **Student Dashboard:** A personalized hub displaying enrolled courses, assignments due soon, and a daily login streak.
-   **My Courses:** A mind map view of all enrolled courses. Clicking a course reveals sub-nodes for Assignments, Materials, and Discussions.
-   **Browse Courses:** A mind map view of the full course catalog, with the ability to enroll.
-   **Course Details:** A tabbed interface for each course (`Overview`, `Assignments`, `Discussions`, `Materials`).
-   **Automatic Attendance:** Mark student as "Present" automatically when they visit a course page each day.

### AI-Powered Tools & Support
-   **AI Study Assistant:** A floating chatbot available on every page to answer questions about course material.
-   **Emotionally Intelligent Mentor (Wellness Check-in):** A feature that uses webcam interaction to provide supportive messages. If camera access is denied, provide a neutral message.
-   **AI Performance Analyzer:** A dialog that shows a summary of a student's grades, their strengths (high-scoring courses), and areas for improvement (low-scoring courses).
-   **AI Career Advisor:** Suggests potential career paths based on academic performance. Also show a static list of trending careers.
-   **AI Targeted Practice:** For assignments with scores below 80%, generate a "micro-lesson" with a concept review and a new practice problem with a solution.
-   **AI Smart Timetable:** Generate a personalized weekly study schedule based on enrolled courses, deadlines, and user-selected availability.
-   **AI Resume Builder:** Automatically generate a professional resume using coursework, grades, and personal information, with multiple templates to choose from.

### Skill & Portfolio Building
-   **My Projects:** A dedicated page to upload and manage personal projects, creating a portfolio.
-   **Public Project Showcase:** A public-facing, professionally designed gallery of all student projects.
-   **Real-World Challenges:** A board of industry-inspired challenges. Students can submit solutions and vote on others' work to earn "Credibility Points."

### Progress & Recognition
-   **My Grades:** A central page to view all graded assignments and teacher feedback.
-   **My Certificates:** Generate and download official PDF certificates for successfully completed courses.
-   **Leaderboard:** Two leaderboards: one for academic average and one for "Credibility Points."
-   **Notifications:** A notification bell in the header for new assignments, grades, discussion replies, and encouraging messages.

## 4. Teacher Features

### Course & Content Management
-   **Teacher Dashboard:** An overview of courses taught, total students, and submissions needing grading. It should also feature a "Student of the Week."
-   **Course Management:** Full CRUD (Create, Read, Update, Delete) for courses, including adding an optional welcome video URL.
-   **Assignment Management:** Create and manage assignments for courses. View all student submissions for a specific assignment.
-   **Material Uploads:** Easily add course materials by providing a title and a shareable link.

### Student Management & Insights
-   **Student Performance Heatmap:** A visual overview of all students, color-coded by average grade (High-Performing, Average, At-Risk).
-   **Grading Interface:** Grade student submissions, provide written feedback, and use an integrated AI Teaching Assistant.
-   **Attendance Log:** View a comprehensive log of student check-ins across all courses.
-   **Live Progress Dashboard:** A real-time view of student activity (e.g., 'Watching Lesson', 'Submitting Assignment', 'Idle') and a 'Class Focus Pulse' monitor.
-   **Instant Quiz:** A tool to launch a live, multiple-choice quiz to all active students and see results in real-time.

### AI-Powered Teaching Tools
-   **AI Teaching Assistant:** Integrated into the grading view, this tool can summarize a student's submission or check it for grammar and style.
-   **Automatic Motivation Bot:** The system automatically sends an encouraging notification to a student if it detects a significant drop in their grade.

## 5. Authentication and Layout

-   **Authentication**: Implement a simple email/password authentication system. Use a server-side session cookie.
-   **Middleware**: Create middleware (`src/middleware.ts`) to handle all routing logic. It should protect authenticated routes, allow access to public pages (`/showcase`), and redirect users appropriately.
-   **Layout**: Create a main authenticated layout with a persistent sidebar for navigation and a header containing the notification bell, theme toggle, and user profile menu. The layout must handle loading states gracefully.
-   **Public Pages**: The `/showcase` and login/signup pages must have their own distinct, public-facing layouts.
