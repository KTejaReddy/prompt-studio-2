import type { CommandRecord } from "@/lib/types";

/**
 * Universal command system. Power-user shortcuts that pre-fill intent on the
 * Find experience. Natural language remains the primary interface — commands
 * are optional sugar.
 */
export const SEED_COMMANDS: CommandRecord[] = [
  { cmd: "/summarize", label: "Summarize", description: "Condense any document into key points", intentPatch: { tasks: [{ task: "summarize", phrase: "/summarize" }], outputType: "summary" } },
  { cmd: "/pdf", label: "Work with PDFs", description: "Extract, summarize or question a PDF", intentPatch: { inputType: "pdf", tasks: [{ task: "summarize", phrase: "/pdf" }] } },
  { cmd: "/research", label: "Research", description: "Deep research and literature synthesis", intentPatch: { category: "research", tasks: [{ task: "analyze", phrase: "/research" }], outputType: "report" } },
  { cmd: "/code-review", label: "Code review", description: "Review code for quality and issues", intentPatch: { category: "coding", tasks: [{ task: "review", phrase: "/code-review" }], inputType: "code" } },
  { cmd: "/debug", label: "Debug", description: "Find root causes of bugs", intentPatch: { category: "coding", tasks: [{ task: "debug", phrase: "/debug" }], inputType: "code" } },
  { cmd: "/humanize", label: "Humanize", description: "Make AI text sound natural and human", intentPatch: { category: "writing", tasks: [{ task: "rewrite", phrase: "/humanize" }] } },
  { cmd: "/explain", label: "Explain", description: "Explain any concept at any level", intentPatch: { category: "education", tasks: [{ task: "explain", phrase: "/explain" }], outputType: "explanation" } },
  { cmd: "/quiz", label: "Quiz me", description: "Generate quizzes from material", intentPatch: { category: "education", tasks: [{ task: "quiz", phrase: "/quiz" }], outputType: "questions" } },
  { cmd: "/flashcards", label: "Flashcards", description: "Turn notes into spaced-repetition cards", intentPatch: { category: "education", outputType: "flashcards", tasks: [{ task: "convert", phrase: "/flashcards" }] } },
  { cmd: "/translate", label: "Translate", description: "Translate with tone preserved", intentPatch: { tasks: [{ task: "translate", phrase: "/translate" }] } },
  { cmd: "/marketing", label: "Marketing", description: "Campaigns, copy and positioning", intentPatch: { category: "marketing" } },
  { cmd: "/resume", label: "Resume", description: "Tailor resumes to job descriptions", intentPatch: { category: "career", tasks: [{ task: "rewrite", phrase: "/resume" }], outputType: "document" } },
  { cmd: "/interview", label: "Interview prep", description: "Practice with realistic interview questions", intentPatch: { category: "career", tasks: [{ task: "quiz", phrase: "/interview" }] } },
  { cmd: "/image", label: "Image prompt", description: "Craft image-generation prompts", intentPatch: { category: "image-generation", outputType: "image-prompt" } },
  { cmd: "/presentation", label: "Presentation", description: "Structure talks and slide decks", intentPatch: { category: "presentations", outputType: "slides" } },
  { cmd: "/analyze", label: "Analyze", description: "Structured analysis of anything", intentPatch: { tasks: [{ task: "analyze", phrase: "/analyze" }], outputType: "report" } },
  { cmd: "/compare", label: "Compare", description: "Side-by-side comparison with criteria", intentPatch: { tasks: [{ task: "compare", phrase: "/compare" }], outputType: "table" } },
  { cmd: "/write", label: "Write", description: "Draft high-quality written content", intentPatch: { category: "writing", tasks: [{ task: "write", phrase: "/write" }] } },
  { cmd: "/learn", label: "Learn", description: "Build a study plan for any topic", intentPatch: { category: "education", tasks: [{ task: "plan", phrase: "/learn" }] } },
];
