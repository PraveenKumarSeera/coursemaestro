
/**
 * @fileoverview This file imports all AI flows and ensures they are registered with Genkit.
 * It is imported by the Next.js API route handler to guarantee that all flows
 * are available when the API is called. This separation breaks the circular
 * dependency between the `ai` object and the flow definitions.
 */
import './flows/ai-app-guide';
import './flows/ai-career-advisor';
import './flows/ai-material-parser';
import './flows/ai-motivation-bot';
import './flows/ai-performance-analyzer';
import './flows/ai-resume-builder';
import './flows/ai-study-assistant';
import './flows/ai-teaching-assistant';
import './flows/ai-timetable-generator';
import './flows/ai-internship-task-generator';
import './flows/ai-internship-grader';
import './flows/ai-brain-stretch-generator';
import './flows/ai-chat-bot';
