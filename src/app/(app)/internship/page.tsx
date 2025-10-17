
import InternshipSimulatorClient from '@/components/internship/internship-simulator-client';
import { getInternshipDomains } from '@/lib/data';

export default async function InternshipSimulatorPage() {
    const domains = await getInternshipDomains();
    return <InternshipSimulatorClient domains={domains} />;
}
