
'use server';

import type { TargetedPracticeOutput } from '@/lib/ai-types';

type ActionState = {
  microLesson: string | null;
  message: string | null;
};

// --- System-Generated Targeted Practice Logic ---
function generateSystemPractice({
  courseTitle,
  assignmentTitle,
  grade,
}: {
  courseTitle: string;
  assignmentTitle: string;
  grade: number;
}): TargetedPracticeOutput {
  // Infer concept from assignment title (simple keyword matching)
  let coreConcept = "Key Concepts";
  const titleLower = assignmentTitle.toLowerCase();
  if (titleLower.includes('react')) coreConcept = "React Hooks";
  if (titleLower.includes('flexbox') || titleLower.includes('css')) coreConcept = "CSS Flexbox";
  if (titleLower.includes('data structures') || titleLower.includes('algorithm')) coreConcept = "Data Structures";
  if (titleLower.includes('api')) coreConcept = "REST APIs";


  const microLesson = `
### Let's Review: ${coreConcept}

It looks like you had some trouble with the last assignment, but don't worry, that's a normal part of learning! Let's quickly review the main ideas.

A key principle of **${coreConcept}** is understanding how components interact and manage state. For instance, in React, passing props down and lifting state up is crucial. When working with APIs, it's all about the request/response cycle. Taking a moment to diagram the data flow before coding can be incredibly helpful.

---

### Your Turn: New Practice Problem

Here’s a small problem to help solidify the concept:

**Question:** Imagine you have a component that needs to fetch user data from an API endpoint \`/api/user/1\`. How would you use the \`useEffect\` hook to fetch this data when the component first renders? Write a small pseudo-code snippet.

---

### Step-by-Step Solution

Let's walk through it together.

1.  **Import \`useEffect\` and \`useState\`:** You need these hooks to manage side effects (like fetching data) and to store the data once it arrives.
2.  **Set up State:** Create a state variable to hold the user data, e.g., \`const [user, setUser] = useState(null);\`.
3.  **Create the \`useEffect\` Hook:** Inside the component, call \`useEffect\`. The first argument is a function that will run after the component renders.
4.  **Fetch the Data:** Inside the effect, use \`fetch('/api/user/1')\` to make the request.
5.  **Handle the Response:** Use \`.then(res => res.json())\` to parse the JSON and \`.then(data => setUser(data))\` to update your state.
6.  **Add the Dependency Array:** The second argument to \`useEffect\` should be an empty array (\`[]\`). This tells React to only run the effect once, when the component mounts.

**Pseudo-code:**
\`\`\`javascript
useEffect(() => {
  fetch('/api/user/1')
    .then(response => response.json())
    .then(data => setUser(data));
}, []); // Empty array means this runs only once.
\`\`\`

Great job working through this! Every attempt is a step forward.
`;

  return { microLesson };
}
// --- End System-Generated Logic ---

export async function generateTargetedPracticeAction({
  courseTitle,
  assignmentTitle,
  grade,
}: {
  courseTitle: string;
  assignmentTitle: string;
  grade: number;
}): Promise<ActionState> {
  try {
    const result = generateSystemPractice({ courseTitle, assignmentTitle, grade });
    
    // Simulate a short delay to make it feel like it's processing
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      microLesson: result.microLesson,
      message: 'Practice session generated successfully.',
    };
  } catch (error: any) {
    return {
      microLesson: null,
      message: `Failed to generate practice session: ${error.message || 'Please try again.'}`,
    };
  }
}
