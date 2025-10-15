
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import InternshipSimulatorClient from '@/components/internship/internship-simulator-client';
import { InternshipDomain } from '@/lib/types';

const internshipDomains: InternshipDomain[] = [
    {
        id: 'google',
        name: 'Google',
        description: 'Solve a challenging problem in software engineering, focusing on scalability and performance, typical of a Google tech challenge.',
        icon: 'google',
        task: {
            title: 'Scalable URL Shortener Service',
            scenario: 'Your team at Google is tasked with creating a new, highly scalable URL shortening service (like goo.gl). The service needs to handle millions of requests per day and provide basic analytics.',
            task: 'Design the system architecture for the URL shortener. Consider the database schema, API endpoints, and how you would handle potential hash collisions. You do not need to write production code, but your design should be clear and well-reasoned.',
            deliverables: [
                'A high-level system architecture diagram.',
                'Pseudo-code for generating a unique short URL from a long URL.',
                'A brief explanation of your database schema choice (e.g., SQL vs. NoSQL).',
            ],
        },
    },
    {
        id: 'nasa',
        name: 'NASA',
        description: 'Tackle a hypothetical problem related to space exploration, data analysis from probes, or mission planning.',
        icon: 'rocket',
        task: {
            title: 'Mars Rover Anomaly Detection',
            scenario: 'You are an engineer on the Mars Rover team. A rover has been sending back a stream of telemetry data (temperature, battery level, wheel motor current). There\'s a concern that intermittent hardware issues might be occurring.',
            task: 'Propose a method for automatically detecting anomalies in the rover\'s telemetry data stream. Your solution should be able to identify unusual patterns that might indicate a potential failure.',
            deliverables: [
                'A 1-page proposal outlining your chosen anomaly detection algorithm (e.g., statistical methods, machine learning).',
                'Pseudo-code for processing the incoming data stream and flagging potential anomalies.',
                'A description of how you would test your system before deploying it to the rover.',
            ],
        },
    },
    {
        id: 'do-e',
        name: 'Department of Energy',
        description: 'Propose a solution for a national-level energy crisis, focusing on renewable sources and grid stability.',
        icon: 'wind',
        task: {
            title: 'Smart Grid Load Balancing Strategy',
            scenario: 'As a strategist for the Department of Energy, you are addressing the challenge of integrating volatile renewable energy sources (like solar and wind) into the national power grid without causing blackouts.',
            task: 'Develop a strategic proposal for a software-based system that helps balance the power grid in real-time. The system should intelligently manage energy from different sources and control distribution.',
            deliverables: [
                'A summary of your proposed "Smart Grid" software strategy.',
                'A list of key data inputs your system would need (e.g., weather forecasts, energy demand).',
                'An explanation of how your system would decide when to store energy (e.g., in batteries) versus when to draw from them.',
            ],
        },
    },
     {
        id: 'openai',
        name: 'OpenAI',
        description: 'Design a novel application of a large language model to solve a common real-world problem in an innovative way.',
        icon: 'bot',
        task: {
            title: 'AI-Powered Email Assistant',
            scenario: 'At OpenAI, your team is exploring new ways to improve productivity using LLMs. The goal is to create an intelligent email assistant that goes beyond simple grammar checks.',
            task: 'Design a feature for an email client that uses an LLM to help users manage their inbox. The feature should be able to categorize incoming emails, summarize long threads, and suggest draft replies based on the user\'s intent.',
            deliverables: [
                'A description of the three main features (categorization, summarization, drafting).',
                'A high-level plan for how you would handle user privacy and data security.',
                'An example of a prompt you might use to ask the LLM to draft a reply to a meeting request.',
            ],
        },
    }
];

export default async function InternshipSimulatorPage() {
    const { user } = await getSession();
    if (!user || user.role !== 'student') {
        notFound();
    }

    return <InternshipSimulatorClient domains={internshipDomains} />;
}
