import type { WorkflowStep } from "@/lib/types";

export interface SeedWorkflow {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  isFeatured?: boolean;
  usageCount: number;
}

export const SEED_WORKFLOWS: SeedWorkflow[] = [
  {
    id: "exam-mastery",
    name: "Exam Mastery",
    description:
      "Turn raw study material into a full preparation system: summary, explanations, exam questions, interactive quizzing and flashcards.",
    category: "education",
    isFeatured: true,
    usageCount: 1840,
    steps: [
      { order: 1, title: "Upload your material", instruction: "Paste or attach the PDF/notes you are studying." },
      { order: 2, title: "Summarize the material", promptId: "document-summarizer", instruction: "Get the three-level summary so you know the territory before drilling." },
      { order: 3, title: "Explain difficult concepts", promptId: "concept-explainer", instruction: "Run every concept you didn't fully grasp through the explainer." },
      { order: 4, title: "Build revision guide", promptId: "pdf-exam-question-generator", instruction: "Use Part 1 output: ranked concepts + common traps." },
      { order: 5, title: "Generate exam questions", promptId: "pdf-exam-question-generator", instruction: "Use Part 2 output with model answers and rubrics." },
      { order: 6, title: "Interactive quiz round", promptId: "quiz-generator", instruction: "Adaptive questioning on your weakest topics until stable." },
      { order: 7, title: "Make flashcards", promptId: "flashcard-maker", instruction: "Convert remaining weak spots into spaced-repetition cards." },
    ],
  },
  {
    id: "research-digest",
    name: "Research Digest",
    description:
      "From a pile of academic papers to a synthesized brief you can present — without drowning in PDFs.",
    category: "research",
    isFeatured: true,
    usageCount: 1210,
    steps: [
      { order: 1, title: "Collect papers", instruction: "Gather abstracts or full texts of the papers in scope." },
      { order: 2, title: "Paper → simple notes", promptId: "research-paper-to-notes", instruction: "One pass per paper; keep all note files together." },
      { order: 3, title: "Synthesize themes", promptId: "literature-review-scaffold", instruction: "Cluster the notes into claims, agreements and gaps." },
      { order: 4, title: "Present findings", promptId: "slide-deck-storyboarder", instruction: "Storyboard a deck from the synthesis for stakeholders." },
    ],
  },
  {
    id: "competitor-analysis-sprint",
    name: "Competitor Analysis Sprint",
    description:
      "A one-day competitive intelligence sprint ending in a decision-ready executive briefing.",
    category: "business",
    usageCount: 860,
    steps: [
      { order: 1, title: "Scope competitors", instruction: "List 3–5 competitors and the decision this analysis informs." },
      { order: 2, title: "Research brief", promptId: "competitor-research-brief", instruction: "Profiles, matrix and exploitable gaps per competitor set." },
      { order: 3, title: "SWOT our position", promptId: "swot-analyst", instruction: "Place ourselves in the landscape honestly." },
      { order: 4, title: "Executive briefing", promptId: "executive-presentation-condenser", instruction: "Condense everything into an ask-first leadership deck." },
    ],
  },
  {
    id: "job-hunt-copilot",
    name: "Job Hunt Copilot",
    description:
      "Tailor your resume to a role, then rehearse with a realistic mock interview and scorecard.",
    category: "career",
    isFeatured: true,
    usageCount: 1490,
    steps: [
      { order: 1, title: "Pick target role", instruction: "Save the exact job description text." },
      { order: 2, title: "Tailor resume", promptId: "resume-tailor", instruction: "Match-map + rewritten bullets against this specific posting." },
      { order: 3, title: "Rehearse interview", promptId: "mock-interviewer", instruction: "Full mock with follow-up probes; keep answers to 90 seconds." },
      { order: 4, title: "Fix weak spots", instruction: "Redo the scorecard's lowest-scoring questions until each rates 4+." },
    ],
  },
  {
    id: "content-engine",
    name: "Content Engine",
    description:
      "One idea becomes a week of content: article, social thread and short-form video hooks.",
    category: "content-creation",
    usageCount: 970,
    steps: [
      { order: 1, title: "Pick one idea", instruction: "Choose a single topic worth repurposing everywhere." },
      { order: 2, title: "Write the pillar post", promptId: "blog-post-architect", instruction: "The long-form anchor piece with a strong angle." },
      { order: 3, title: "Spin into a thread", promptId: "thread-composer", instruction: "Distill the post's sharpest points into a native thread." },
      { order: 4, title: "Cut video hooks", promptId: "video-hook-workshop", instruction: "Ten scroll-stopping openers derived from the same idea." },
    ],
  },
];
