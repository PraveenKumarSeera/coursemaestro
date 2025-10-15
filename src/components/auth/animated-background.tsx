'use client';

import { Book, Code, GraduationCap, Lightbulb, PenTool } from 'lucide-react';

const icons = [
    { icon: <GraduationCap className="h-8 w-8" />, style: { top: '10%', left: '20%', animationDuration: '15s' } },
    { icon: <Book className="h-8 w-8" />, style: { top: '20%', left: '80%', animationDuration: '18s' } },
    { icon: <Code className="h-8 w-8" />, style: { top: '70%', left: '10%', animationDuration: '20s' } },
    { icon: <Lightbulb className="h-8 w-8" />, style: { top: '80%', left: '75%', animationDuration: '16s' } },
    { icon: <PenTool className="h-8 w-8" />, style: { top: '40%', left: '50%', animationDuration: '22s' } },
];

export default function AnimatedBackground() {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
            <style jsx>{`
                .floating-icon {
                    position: absolute;
                    display: block;
                    animation: float 20s ease-in-out infinite;
                    color: hsl(var(--primary) / 0.1));
                }

                @keyframes float {
                    0% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(45deg);
                    }
                    100% {
                        transform: translateY(0) rotate(0deg);
                    }
                }
            `}</style>
            {icons.map((item, index) => (
                <span key={index} className="floating-icon" style={item.style}>
                    {item.icon}
                </span>
            ))}
        </div>
    );
}
