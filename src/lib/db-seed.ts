// A seeding script to initialize the database with some data.
import { sql } from '@vercel/postgres';

async function seedUsers() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL
    );
  `;

  // Seed with a default teacher and student
  const users = [
    { id: '1', name: 'Albus Dumbledore', email: 'teacher@school.com', password: 'password', role: 'teacher' },
    { id: '2', name: 'Harry Potter', email: 'student@school.com', password: 'password', role: 'student' }
  ];

  for (const user of users) {
    await sql`
      INSERT INTO users (id, name, email, password, role)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${user.password}, ${user.role})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
}

async function seedCourses() {
    await sql`
        CREATE TABLE IF NOT EXISTS courses (
            id UUID PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            duration VARCHAR(100),
            "teacherId" UUID REFERENCES users(id),
            "imageUrl" VARCHAR(255),
            "videoUrl" VARCHAR(255)
        );
    `;

    const courses = [
        { id: '101', title: 'Introduction to Web Development', description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.', teacherId: '1', duration: '8 Weeks', imageUrl: 'https://picsum.photos/seed/1/600/400' },
        { id: '102', title: 'Advanced React Patterns', description: 'Dive deep into React and learn about hooks, context, performance optimization, and advanced patterns.', teacherId: '1', duration: '6 Weeks', imageUrl: 'https://picsum.photos/seed/2/600/400' },
        { id: '103', title: 'Data Structures & Algorithms', description: 'Understand the core concepts of data structures and algorithms. A fundamental course for any aspiring software engineer.', teacherId: '1', duration: '10 Weeks', imageUrl: 'https://picsum.photos/seed/3/600/400' },
    ];

    for (const course of courses) {
        await sql`
            INSERT INTO courses (id, title, description, duration, "teacherId", "imageUrl")
            VALUES (${course.id}, ${course.title}, ${course.description}, ${course.duration}, ${course.teacherId}, ${course.imageUrl})
            ON CONFLICT (id) DO NOTHING;
        `;
    }
}

async function seedChallenges() {
    await sql`
        CREATE TABLE IF NOT EXISTS challenges (
            id UUID PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            company VARCHAR(255),
            points INTEGER,
            icon VARCHAR(100)
        );
    `;

     const challenges = [
      { id: 'ch1', title: 'E-commerce Search Component', description: 'Build a reusable search component for an e-commerce platform that allows filtering by category, price range, and rating. The component should be performant and accessible.', company: 'Shopify', points: 150, icon: 'ShoppingCart' },
      { id: 'ch2', title: 'Social Media Dashboard UI', description: 'Design and implement a responsive UI for a social media analytics dashboard. It should display key metrics like follower growth, engagement rate, and top posts in a visually appealing way.', company: 'Meta', points: 200, icon: 'Users' },
    ];

    for (const challenge of challenges) {
        await sql`
            INSERT INTO challenges (id, title, description, company, points, icon)
            VALUES (${challenge.id}, ${challenge.title}, ${challenge.description}, ${challenge.company}, ${challenge.points}, ${challenge.icon})
            ON CONFLICT (id) DO NOTHING;
        `;
    }
}


async function seedInternshipDomains() {
    await sql`
        CREATE TABLE IF NOT EXISTS internship_domains (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            icon VARCHAR(100),
            task JSONB
        );
    `;
    const domains = [
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
    ];

     for (const domain of domains) {
        await sql`
            INSERT INTO internship_domains (id, name, description, icon, task)
            VALUES (${domain.id}, ${domain.name}, ${domain.description}, ${domain.icon}, ${JSON.stringify(domain.task)})
            ON CONFLICT (id) DO NOTHING;
        `;
    }
}


async function main() {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

    await seedUsers();
    await seedCourses();
    await seedChallenges();
    await seedInternshipDomains();
    
    // Create other tables if they don't exist
    await sql`CREATE TABLE IF NOT EXISTS enrollments (id UUID PRIMARY KEY, "studentId" UUID REFERENCES users(id), "courseId" UUID REFERENCES courses(id), UNIQUE("studentId", "courseId"));`;
    await sql`CREATE TABLE IF NOT EXISTS assignments (id UUID PRIMARY KEY, "courseId" UUID REFERENCES courses(id), title VARCHAR(255), description TEXT, "dueDate" TIMESTAMPTZ);`;
    await sql`CREATE TABLE IF NOT EXISTS submissions (id UUID PRIMARY KEY, "assignmentId" UUID REFERENCES assignments(id), "studentId" UUID REFERENCES users(id), content TEXT, "submittedAt" TIMESTAMPTZ, grade INTEGER, feedback TEXT);`;
    await sql`CREATE TABLE IF NOT EXISTS discussion_threads (id UUID PRIMARY KEY, "courseId" UUID REFERENCES courses(id), title VARCHAR(255), "authorId" UUID REFERENCES users(id), "createdAt" TIMESTAMPTZ);`;
    await sql`CREATE TABLE IF NOT EXISTS discussion_posts (id UUID PRIMARY KEY, "threadId" UUID REFERENCES discussion_threads(id), "authorId" UUID REFERENCES users(id), content TEXT, "createdAt" TIMESTAMPTZ);`;
    await sql`CREATE TABLE IF NOT EXISTS materials (id UUID PRIMARY KEY, "courseId" UUID REFERENCES courses(id), title VARCHAR(255), link VARCHAR(255), "createdAt" TIMESTAMPTZ);`;
    await sql`CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY, "userId" UUID REFERENCES users(id), message TEXT, link VARCHAR(255), "isRead" BOOLEAN, "createdAt" TIMESTAMPTZ);`;
    await sql`CREATE TABLE IF NOT EXISTS attendance (id UUID PRIMARY KEY, "studentId" UUID REFERENCES users(id), "courseId" UUID REFERENCES courses(id), date DATE, "isPresent" BOOLEAN);`;
    await sql`CREATE TABLE IF NOT EXISTS certificates (id UUID PRIMARY KEY, "studentId" UUID REFERENCES users(id), "courseId" UUID REFERENCES courses(id), "issuedAt" TIMESTAMPTZ, "verificationId" UUID);`;
    await sql`CREATE TABLE IF NOT EXISTS challenge_submissions (id UUID PRIMARY KEY, "challengeId" UUID REFERENCES challenges(id), "studentId" UUID REFERENCES users(id), content TEXT, "submittedAt" TIMESTAMPTZ);`;
    await sql`CREATE TABLE IF NOT EXISTS challenge_votes (id UUID PRIMARY KEY, "submissionId" UUID REFERENCES challenge_submissions(id), "voterId" UUID REFERENCES users(id), UNIQUE("submissionId", "voterId"));`;
    await sql`CREATE TABLE IF NOT EXISTS projects (id UUID PRIMARY KEY, "studentId" UUID REFERENCES users(id), title VARCHAR(255), description TEXT, "imageUrl" VARCHAR(255), "projectUrl" VARCHAR(255), tags TEXT[], "createdAt" TIMESTAMPTZ);`;

    console.log('Database seeding completed.');
}

main().catch(err => {
    console.error('An error occurred while seeding the database:', err);
});
