
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
    },
    {
        id: 'nasa',
        name: 'NASA',
        description: 'Tackle a hypothetical problem related to space exploration, data analysis from probes, or mission planning.',
        icon: 'rocket',
    },
    {
        id: 'do-e',
        name: 'Department of Energy',
        description: 'Propose a solution for a national-level energy crisis, focusing on renewable sources and grid stability.',
        icon: 'wind',
    },
     {
        id: 'openai',
        name: 'OpenAI',
        description: 'Design a novel application of a large language model to solve a common real-world problem in an innovative way.',
        icon: 'bot',
    }
];

export default async function InternshipSimulatorPage() {
    const { user } = await getSession();
    if (!user || user.role !== 'student') {
        notFound();
    }

    return <InternshipSimulatorClient domains={internshipDomains} />;
}
