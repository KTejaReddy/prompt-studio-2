import type { Difficulty } from "@/lib/types";
import type { SeedPrompt } from "./promptTypes";

/**
 * Procedural prompt generator.
 *
 * Composes SeedPrompts deterministically from curated vocabulary banks:
 * per-category deliverables × verb families × contexts × audiences × tones ×
 * output formats. Same item index always yields the same prompt, so reseeding
 * is stable and IDs never collide.
 *
 * Volume knob: PROMPTLY_GEN_TARGET env var (read by the seeder).
 */

// ---------- Deterministic randomness ----------

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Rng {
  r(): number;
  pick<T>(arr: readonly T[]): T;
  int(minIncl: number, maxExcl: number): number;
}

function rngFor(...seeds: (string | number)[]): Rng {
  let h = 2166136261;
  for (const s of seeds) {
    h ^= typeof s === "number" ? s : hashStr(s);
    h = Math.imul(h, 16777619);
  }
  const next = mulberry32(h >>> 0);
  return {
    r: next,
    pick<T>(arr: readonly T[]): T {
      return arr[Math.floor(next() * arr.length) % arr.length];
    },
    int(minIncl: number, maxExcl: number): number {
      return minIncl + (Math.floor(next() * (maxExcl - minIncl)) % (maxExcl - minIncl));
    },
  };
}

// ---------- Verb families (aligned with intentService canonical tasks) ----------

interface Family {
  /** canonical task ids matching TASK_RULES */
  tasks: string[];
  inputType: string;
  outputType: string;
  verb: string; // description phrase, e.g. "Map out"
  goal: (object: string) => string;
  steps: [string, string]; // two family-specific working steps
  quality: string[]; // quality-bar bullets
}

const FAMILIES: Record<string, Family> = {
  produce: {
    tasks: ["write"],
    inputType: "text",
    outputType: "document",
    verb: "Produce",
    goal: (o) => `Deliver a complete, ready-to-use ${o}.`,
    steps: [
      "Clarify the core objective in one sentence before writing anything else.",
      "Draft fast, then revise once for structure and once for wording.",
    ],
    quality: [
      "No filler sentences — every paragraph earns its place.",
      "Concrete over abstract: examples and numbers beat adjectives.",
    ],
  },
  analyze: {
    tasks: ["analyze"],
    inputType: "document",
    outputType: "report",
    verb: "Analyze",
    goal: (o) => `Produce a rigorous analysis that turns raw material into an actionable ${o}.`,
    steps: [
      "Inventory what the material actually says before interpreting it.",
      "Separate observations, interpretations and recommendations into distinct layers.",
    ],
    quality: [
      "Flag confidence level (high / medium / low) on every major claim.",
      "Quantify wherever the material allows; say 'unknown' rather than guessing.",
    ],
  },
  distill: {
    tasks: ["summarize", "extract"],
    inputType: "document",
    outputType: "summary",
    verb: "Distill",
    goal: (o) => `Compress long input into a sharp ${o} that preserves decisions, numbers and owners.`,
    steps: [
      "Skim once for structure, then re-read for facts worth keeping.",
      "Rank points by decision impact, not by order of appearance.",
    ],
    quality: [
      "Nothing important lost, nothing trivial kept.",
      "Every bullet stands alone without needing surrounding context.",
    ],
  },
  plan: {
    tasks: ["plan", "organize"],
    inputType: "text",
    outputType: "plan",
    verb: "Map out",
    goal: (o) => `Build a realistic ${o} with phases, owners and checkpoints.`,
    steps: [
      "Work backwards from the end state to today.",
      "Sequence steps by dependency, then mark the critical path.",
    ],
    quality: [
      "Each step is small enough to finish in one focused sitting.",
      "Include explicit 'done when' criteria per phase.",
    ],
  },
  explain: {
    tasks: ["explain"],
    inputType: "text",
    outputType: "explanation",
    verb: "Explain",
    goal: (o) => `Teach ${o} so a motivated newcomer fully gets it in one read.`,
    steps: [
      "Anchor the explanation in something the audience already knows.",
      "Build one idea at a time; each section may only use earlier ideas.",
    ],
    quality: [
      "At least one concrete example or analogy per major concept.",
      "Zero unexplained jargon; define terms on first use.",
    ],
  },
  brainstorm: {
    tasks: ["brainstorm", "write"],
    inputType: "text",
    outputType: "ideas",
    verb: "Brainstorm",
    goal: (o) => `Generate a wide, genuinely differentiated set of options for ${o}.`,
    steps: [
      "First pass for quantity — no filtering, no repeats of the same idea in new words.",
      "Second pass to group, name and stress-test the strongest candidates.",
    ],
    quality: [
      "At least one third of ideas must be non-obvious (not the first thing anyone would suggest).",
      "Kill every idea that could not survive a skeptical stakeholder's first question.",
    ],
  },
  convert: {
    tasks: ["convert", "rewrite"],
    inputType: "document",
    outputType: "table",
    verb: "Convert",
    goal: (o) => `Transform the provided material into a clean, structured ${o}.`,
    steps: [
      "Define the target schema before touching the source material.",
      "Preserve meaning exactly; note anything that does not fit instead of forcing it.",
    ],
    quality: [
      "Lossless: nothing from the source silently disappears.",
      "Consistent formatting — same field types, same granularity throughout.",
    ],
  },
  improve: {
    tasks: ["optimize", "rewrite", "edit"],
    inputType: "document",
    outputType: "document",
    verb: "Improve",
    goal: (o) => `Upgrade an existing ${o} measurably — not just cosmetically.`,
    steps: [
      "Diagnose first: list what specifically underperforms and why.",
      "Fix structural issues before surface polish; show before/after for key edits.",
    ],
    quality: [
      "Every change traces to a diagnosed problem, stated in one line.",
      "The result must survive the question: 'would a busy expert approve this?'",
    ],
  },
  compare: {
    tasks: ["compare"],
    inputType: "document",
    outputType: "table",
    verb: "Compare",
    goal: (o) => `Deliver a balanced side-by-side ${o} that makes the trade-offs impossible to miss.`,
    steps: [
      "Fix comparison dimensions up front; apply identical criteria to every option.",
      "Steelman each option before evaluating it.",
    ],
    quality: [
      "No option wins on every axis — if one does, the axes are wrong.",
      "End with a recommendation tied to stated priorities, plus when to choose otherwise.",
    ],
  },
  review: {
    tasks: ["review", "detect"],
    inputType: "document",
    outputType: "report",
    verb: "Review",
    goal: (o) => `Audit the material against professional standards and return a prioritized ${o}.`,
    steps: [
      "Sweep systematically category by category rather than opportunistically.",
      "Classify findings by severity with evidence for each.",
    ],
    quality: [
      "Findings cite the exact line or passage they concern.",
      "Top issues come with concrete, minimal fixes — not just criticism.",
    ],
  },
} as const;

const FAMILY_KEYS = Object.keys(FAMILIES);

/** Per-family deep-prompt building blocks (technique steps, structure, edges). */
const FAMILY_EXTRA: Record<
  string,
  { method: [string, string, string]; structure: string; edge: string; constraint: string }
> = {
  produce: {
    method: [
      "Apply first-principles thinking: break the deliverable into its irreducible components before drafting any of it.",
      "Use a Jobs-to-be-Done lens: for each section, name the reader's job that section completes.",
      "Run a premortem: imagine the output failed in production; add whatever is missing to prevent that failure.",
    ],
    structure:
      "Opening summary (3-4 sentences), then clearly titled sections in logical order, ending with the NEXT STEPS list.",
    edge: "build the full skeleton anyway from best practice and mark every placeholder as [TO CONFIRM]",
    constraint:
      "Prefer concrete nouns and numbers over adjectives; every paragraph must earn its place.",
  },
  analyze: {
    method: [
      "Separate observations from interpretations: list the raw facts first, then layer meaning on top of each.",
      "Use MECE grouping so no finding sits in two buckets and no finding is orphaned.",
      "Steel-man the strongest alternative explanation before rejecting it.",
    ],
    structure:
      "Executive summary (5 sentences max), findings ranked by impact with evidence per finding, then recommendations.",
    edge: "state exactly what is missing, analyze what exists, and flag confidence as low on every affected claim",
    constraint: "Quantify wherever the material allows; never round away nuance.",
  },
  distill: {
    method: [
      "Skim once for structure, then re-read marking every decision-relevant fact.",
      "Rank points by decision impact using an impact/effort lens, not by order of appearance.",
      "Compress each point until it survives on its own without surrounding context.",
    ],
    structure:
      "TL;DR (3 bullets), then themed sections — each carrying the fact, its implication, and the owner/deadline if present.",
    edge: "summarize only what exists and list the gaps explicitly as 'not covered in material'",
    constraint:
      "Nothing important lost, nothing trivial kept — if a detail would not change a decision, cut it.",
  },
  plan: {
    method: [
      "Work backwards from the end state to today, naming the finish line precisely.",
      "Sequence steps by dependency, then mark the critical path explicitly.",
      "Run a premortem: assume the plan failed midway; add mitigations for the top two risks.",
    ],
    structure:
      "Objective, phase-by-phase breakdown with 'done when' criteria per phase, owners, checkpoints, and a risk register.",
    edge: "produce two variants — a full plan and a minimum viable path — and note what the cut version trades away",
    constraint: "Each step must be small enough to finish in one focused sitting.",
  },
  explain: {
    method: [
      "Anchor in what the audience already knows, then build exactly one idea at a time.",
      "Attach a concrete analogy or worked example to every major concept.",
      "Invert once: state the classic misconception, then correct it — the error-then-repair pattern sticks.",
    ],
    structure:
      "One-line big idea, building blocks in order, a worked example, the common misconception, and a recap.",
    edge: "explain at the simplest possible level first, then add one layer of depth per pass",
    constraint: "Zero unexplained jargon; define every term on first use.",
  },
  brainstorm: {
    method: [
      "Diverge hard: hit an idea quota before any filtering, and no repeats of the same idea in new words.",
      "Group ideas by underlying mechanism, then name each cluster.",
      "Invert the problem once ('how would we guarantee failure?') and mine the answers for ideas.",
    ],
    structure:
      "Idea clusters with a one-line rationale each, then a top-3 shortlist with explicit trade-offs.",
    edge: "generate along multiple constraint axes (cheaper, faster, bolder) instead of a single direction",
    constraint:
      "At least one third of ideas must be non-obvious; kill any idea that dies on the first skeptical question.",
  },
  convert: {
    method: [
      "Define the target schema before touching the source material.",
      "Map field by field; note anything that does not fit instead of forcing it.",
      "Reconcile totals and counts at the end as a losslessness check.",
    ],
    structure:
      "The transformed artifact first, then a short mapping-notes table (source → target, decisions made).",
    edge: "carry the anomaly into the output with a [REVIEW] flag rather than silently dropping it",
    constraint: "Lossless: nothing from the source silently disappears.",
  },
  improve: {
    method: [
      "Diagnose first: list what specifically underperforms and why, one line each.",
      "Fix structural issues before surface polish; order edits by impact.",
      "Show before/after for the three biggest changes with a one-line rationale each.",
    ],
    structure: "Diagnosis list, the fully revised version, then a change log.",
    edge:
      "if the material is already strong, say so and optimize toward a higher bar instead of inventing problems",
    constraint: "Every change must trace back to a diagnosed problem.",
  },
  compare: {
    method: [
      "Fix the comparison dimensions up front; apply identical criteria to every option.",
      "Steel-man each option before evaluating it.",
      "Weight the dimensions by the stated goal, then score — show the reasoning, not just the totals.",
    ],
    structure:
      "Dimension table first, a short narrative per option second, recommendation with 'choose otherwise when' conditions last.",
    edge: "add an 'insufficient data' row instead of scoring blind",
    constraint: "No option wins on every axis — if one does, the axes are wrong.",
  },
  review: {
    method: [
      "Sweep systematically category by category rather than opportunistically.",
      "Classify every finding by severity with the exact evidence attached.",
      "For each top issue, draft the minimal concrete fix — criticism never ships without one.",
    ],
    structure:
      "Verdict up front, findings by severity (blocker / major / minor) with evidence quotes, fixes, then pass/fail per category.",
    edge: "if the material is too short to judge, return the checklist of what you would need instead",
    constraint: "Findings must cite the exact line or passage they concern.",
  },
};

const CONTEXT_WHY = [
  "The cost of getting this wrong compounds over the whole quarter.",
  "Decisions made here shape what ships next.",
  "Everyone downstream inherits the quality of this work.",
  "Second attempts are expensive; the first one should hold.",
] as const;

const EXTRA_METHOD_STEPS = [
  "Sanity-check the draft against the original ask: every requirement in GOAL must have a matching section in the output.",
  "Cut the weakest 10%: remove anything that would not survive a skeptical second reading.",
  "Strengthen with specifics: add one concrete number, example or quote from the provided material to each major section.",
  "Read it back as the audience would; fix every place where they would need to ask a follow-up question.",
] as const;

const FAILURE_MODES = [
  "Generic output that could belong to anyone — prevented by anchoring every section in {TOPIC} and the provided details.",
  "Answering a narrower question than asked — prevented by re-reading GOAL before drafting and again before finalizing.",
  "Invented facts, numbers or quotes — prevented by the uncertainty-labeling rule; when unsure, write 'uncertain' and move on.",
  "Walls of text with no structure — prevented by the exact section order and format rules in OUTPUT.",
] as const;

// ---------- Shared banks ----------

interface ContextSpec {
  clause: string; // appended mid-sentence
  short: string; // title variant tag
  rule: string; // imperative constraint for the body
}

const CONTEXTS: ContextSpec[] = [
  { clause: "under a tight deadline", short: "Tight Deadline", rule: "Optimize for speed of execution over perfection." },
  { clause: "for a first-time user", short: "First-Timer", rule: "Assume zero background knowledge; remove any step that needs it." },
  { clause: "with limited data available", short: "Low Data", rule: "Say explicitly where you are extrapolating from thin evidence." },
  { clause: "for a distributed remote team", short: "Remote Team", rule: "Make every artifact async-friendly: no step should require a live meeting." },
  { clause: "on a shoestring budget", short: "Shoestring", rule: "Prefer free tools and manual workarounds; flag anything that costs money." },
  { clause: "as part of a quarterly initiative", short: "Quarterly Push", rule: "Tie the outcome to a measurable quarterly objective." },
  { clause: "before a major launch", short: "Pre-Launch", rule: "Treat anything reversible as cheap and anything irreversible as risky." },
  { clause: "in a regulated industry", short: "Regulated", rule: "Note compliance considerations inline wherever they apply." },
  { clause: "in a highly competitive market", short: "Competitive Market", rule: "Sharpen differentiation: generic output is worthless here." },
  { clause: "for non-technical stakeholders", short: "Non-Technical", rule: "Translate any technical term into plain language on first use." },
  { clause: "across multiple time zones", short: "Multi-TZ", rule: "Include explicit handoff points suitable for async work across time zones." },
  { clause: "with a small team of three", short: "Tiny Team", rule: "Assume no dedicated specialists; keep roles fluid and workload even." },
  { clause: "for an enterprise audience", short: "Enterprise", rule: "Add governance and security considerations as first-class sections." },
  { clause: "during rapid growth", short: "Hypergrowth", rule: "Design for the scale of six months out, not just today." },
  { clause: "after negative feedback", short: "Recovery", rule: "Address what likely caused the negative feedback head-on." },
  { clause: "for a bilingual audience", short: "Bilingual", rule: "Keep sentences short and idioms out, so translation stays easy." },
];

const AUDIENCES = [
  "startup founders",
  "product managers",
  "engineering teams",
  "marketing teams",
  "freelancers",
  "small-business owners",
  "students",
  "teachers",
  "executives",
  "HR managers",
  "customer success teams",
  "content creators",
  "nonprofit coordinators",
  "agency clients",
] as const;

const TONES = [
  "pragmatic and direct",
  "warm and encouraging",
  "analytical and precise",
  "playful but professional",
  "formal and polished",
  "conversational",
  "authoritative",
  "empathetic",
] as const;

const FORMATS = [
  { label: "markdown sections", sentence: "Structured markdown with clear H2 sections.", instruction: "Format the answer in markdown with H2 section headers." },
  { label: "numbered guide", sentence: "A numbered step-by-step guide, exactly one action per step.", instruction: "Number every step; one action per step, no nested walls of text." },
  { label: "bulleted brief", sentence: "A tight bulleted brief of at most 25 bullets.", instruction: "Use bullets only — no long paragraphs anywhere in the output." },
  { label: "table-driven breakdown", sentence: "Markdown tables for everything comparative or enumerable.", instruction: "Wherever items can be tabulated, use a markdown table." },
  { label: "narrative memo", sentence: "A flowing memo: context first, then findings, then a clear recommendation.", instruction: "Write it as a memo with a bottom-line-up-front opening line." },
  { label: "phase checklist", sentence: "A checkbox-style checklist grouped by phase.", instruction: "Group output as phases, each phase a checkbox checklist." },
] as const;

const AUTHORS = ["Promptly Studio", "Promptly Studio", "Promptly Studio", "Promptly Community", "Promptly Labs"] as const;

// ---------- Per-category specs ----------

interface CatSpec {
  id: string;
  subcats: string[];
  expert: string;
  objects: string[];
  families: string[];
}

const CATS: CatSpec[] = [
  {
    id: "coding", expert: "staff software engineer",
    subcats: ["Code Review", "Debugging", "Refactoring", "Documentation", "Testing", "Databases"],
    objects: ["code review checklist", "refactoring plan", "debugging playbook", "API design doc", "unit test suite outline", "database migration plan", "regex cookbook entry", "performance optimization plan", "on-call runbook", "pull request description template", "error-handling standard", "technical debt register", "CI pipeline blueprint", "feature flag rollout plan", "incident post-mortem template", "code style guide excerpt"],
    families: ["review", "plan", "produce", "improve", "analyze", "explain"],
  },
  {
    id: "writing", expert: "editor-in-chief",
    subcats: ["Blogging", "Editing", "Storytelling", "Copywriting", "Technical Writing"],
    objects: ["blog post outline", "narrative essay", "short story opening chapter", "newsletter issue", "case study draft", "white paper section", "personal essay", "LinkedIn article draft", "story arc treatment", "dialogue polish pass", "worldbuilding bible entry", "book blurb"],
    families: ["produce", "improve", "brainstorm", "convert", "distill"],
  },
  {
    id: "research", expert: "research librarian",
    subcats: ["Literature Review", "Fact Checking", "Summarization", "Study Design"],
    objects: ["literature review matrix", "fact-check dossier", "source evaluation worksheet", "research question refiner", "survey instrument draft", "interview protocol", "annotated bibliography", "systematic review protocol", "hypothesis worksheet", "citation audit", "evidence table", "gap analysis memo"],
    families: ["analyze", "distill", "produce", "compare", "review"],
  },
  {
    id: "education", expert: "instructional designer",
    subcats: ["Exam Prep", "Explainers", "Quizzing", "Lesson Planning", "Flashcards"],
    objects: ["lesson plan", "study schedule", "practice quiz set", "flashcard deck outline", "concept explainer script", "exam revision guide", "syllabus module", "homework walkthrough", "grading rubric", "spaced repetition planner", "misconception diagnostic", "project brief for learners"],
    families: ["plan", "explain", "produce", "brainstorm", "convert"],
  },
  {
    id: "business", expert: "management consultant",
    subcats: ["Strategy", "Operations", "Decision Making", "Reporting"],
    objects: ["go-to-market brief", "SWOT analysis", "operating cadence doc", "decision memo", "quarterly OKR set", "process improvement proposal", "stakeholder update", "vendor evaluation scorecard", "meeting agenda pack", "risk register", "postmortem action tracker", "annual strategy summary"],
    families: ["produce", "analyze", "plan", "compare", "review"],
  },
  {
    id: "marketing", expert: "growth marketing lead",
    subcats: ["Campaigns", "SEO", "Ad Copy", "Social Media"],
    objects: ["campaign brief", "SEO content cluster plan", "ad copy variants", "landing page wireframe copy", "email nurture sequence", "brand voice guide", "competitor teardown", "positioning statement", "content calendar", "referral program spec", "product launch announcement", "customer testimonial kit"],
    families: ["produce", "brainstorm", "plan", "improve", "analyze"],
  },
  {
    id: "productivity", expert: "productivity coach",
    subcats: ["Summarization", "Email", "Task Management", "Meetings"],
    objects: ["inbox zero routine", "daily planning ritual", "weekly review template", "meeting notes digest", "task triage system", "time-blocking schedule", "focus session protocol", "project kickoff checklist", "waiting-on tracker", "end-of-day shutdown routine", "email template pack", "priority matrix worksheet"],
    families: ["plan", "produce", "distill", "improve", "brainstorm"],
  },
  {
    id: "design", expert: "product design lead",
    subcats: ["UX Research", "Critique", "Branding"],
    objects: ["UX interview script", "usability test plan", "design critique framework", "persona draft", "journey map", "design token sheet", "accessibility audit checklist", "wireframe annotation set", "brand mood board brief", "onboarding flow blueprint", "information architecture outline", "design handoff checklist"],
    families: ["produce", "review", "plan", "brainstorm", "analyze"],
  },
  {
    id: "data-analysis", expert: "data analyst",
    subcats: ["Exploration", "Visualization", "Statistics", "Cleaning"],
    objects: ["exploratory data analysis plan", "data cleaning checklist", "chart selection guide", "statistical test decision tree", "dashboard spec", "cohort analysis walkthrough", "SQL pattern library entry", "anomaly investigation log", "KPI definition sheet", "data dictionary draft", "sampling strategy memo", "forecast assumptions sheet"],
    families: ["analyze", "plan", "produce", "convert", "explain"],
  },
  {
    id: "career", expert: "career coach",
    subcats: ["Resumes", "Cover Letters", "Interviews", "LinkedIn"],
    objects: ["resume bullet rewrite", "cover letter", "interview STAR story bank", "LinkedIn profile overhaul", "salary negotiation script", "career pivot roadmap", "networking outreach message", "performance self-review", "portfolio case study", "job application tracking setup", "informational interview request", "90-day onboarding plan"],
    families: ["improve", "produce", "plan", "brainstorm", "review"],
  },
  {
    id: "finance", expert: "financial planner",
    subcats: ["Personal Finance", "Investing", "Analysis"],
    objects: ["monthly budget plan", "expense audit worksheet", "savings goal ladder", "investment policy statement", "net worth tracker setup", "subscription purge list", "retirement contribution plan", "debt payoff schedule", "tax season prep checklist", "big purchase decision framework", "emergency fund planner", "cash flow forecast"],
    families: ["plan", "analyze", "produce", "compare", "improve"],
  },
  {
    id: "legal", expert: "contracts analyst",
    subcats: ["Contract Analysis", "Plain Language", "Compliance"],
    objects: ["contract risk summary", "plain-language clause explainer", "NDA review checklist", "terms-of-service digest", "compliance requirements list", "dispute response outline", "freelance agreement skeleton", "privacy policy section draft", "IP assignment explainer", "lease review notes", "vendor contract negotiation prep", "policy gap checklist"],
    families: ["review", "distill", "explain", "produce", "compare"],
  },
  {
    id: "content-creation", expert: "creative producer",
    subcats: ["Video Scripts", "Newsletters", "Podcasts"],
    objects: ["YouTube video script", "podcast episode outline", "newsletter welcome series", "video hook variations", "b-roll shot list", "series content pipeline", "collab pitch packet", "thumbnail concept brief", "community post batch", "episode shownotes digest", "guest outreach message", "content repurposing map"],
    families: ["produce", "brainstorm", "plan", "convert", "improve"],
  },
  {
    id: "presentations", expert: "presentation strategist",
    subcats: ["Slide Design", "Talks", "Executive Decks"],
    objects: ["conference talk outline", "executive deck skeleton", "slide-by-slide storyboard", "demo day pitch narrative", "keynote opening minutes", "webinar rundown", "Q&A prep sheet", "data slide simplification pass", "speaker notes draft", "audience poll set", "closing call-to-action script", "handout one-pager"],
    families: ["produce", "plan", "improve", "distill", "brainstorm"],
  },
  {
    id: "customer-support", expert: "support operations lead",
    subcats: ["Ticket Handling", "Response Writing"],
    objects: ["ticket response template", "escalation protocol note", "macro library entry", "customer apology letter", "knowledge base article", "CSAT follow-up email", "refund request handling flow", "onboarding support sequence", "bug report intake form copy", "churn save play", "status update cadence template", "angry customer de-escalation script"],
    families: ["produce", "improve", "plan", "distill", "brainstorm"],
  },
  {
    id: "management", expert: "people operations manager",
    subcats: ["One-on-Ones", "Performance Reviews", "Hiring"],
    objects: ["one-on-one agenda", "performance review narrative", "feedback delivery script", "team retro facilitation guide", "hiring scorecard", "onboarding buddy plan", "delegation brief", "conflict resolution playbook", "promotion case memo", "team health check survey", "expectations setting doc", "difficult conversation prep sheet"],
    families: ["plan", "produce", "improve", "analyze", "brainstorm"],
  },
  {
    id: "entrepreneurship", expert: "startup advisor",
    subcats: ["Idea Validation", "Pitching", "Growth"],
    objects: ["idea validation experiment plan", "MVP scope cut list", "pitch deck narrative", "customer discovery script", "pricing experiment design", "founder story narrative", "competitive moat map", "launch day checklist", "early adopter outreach plan", "unit economics worksheet", "advisor update template", "pivot decision memo"],
    families: ["plan", "produce", "brainstorm", "analyze", "compare"],
  },
  {
    id: "personal-development", expert: "behavior design coach",
    subcats: ["Habits", "Reflection", "Learning"],
    objects: ["habit stacking plan", "weekly reflection journal prompt set", "morning routine blueprint", "digital declutter protocol", "goal setting worksheet", "energy audit", "learning sprint plan", "gratitude practice script", "screen time reduction plan", "reading habit builder", "monthly review ritual", "comfort zone ladder"],
    families: ["plan", "produce", "brainstorm", "explain", "improve"],
  },
  {
    id: "image-generation", expert: "visual art director",
    subcats: ["Photography", "Illustration", "Logos"],
    objects: ["photorealistic portrait scene", "product photography setup", "editorial illustration brief", "logo exploration sheet", "character concept sheet", "architectural render scene", "pattern tile concept", "storybook page illustration", "app icon exploration grid", "album cover concept", "packaging mockup scene", "isometric scene composition"],
    families: ["produce", "brainstorm", "improve", "compare"],
  },
  {
    id: "video", expert: "video director",
    subcats: ["Scripting", "Storyboards", "Hooks"],
    objects: ["explainer video script", "short-form hook stack", "documentary interview outline", "product demo storyboard", "cinematic b-roll plan", "tutorial screencast script", "channel trailer beat sheet", "talking-head edit plan", "testimonial video structure", "unboxing sequence script", "video series pilot outline", "retention-optimized cut plan"],
    families: ["produce", "plan", "brainstorm", "improve", "convert"],
  },
  {
    id: "social-media", expert: "social media strategist",
    subcats: ["Threads", "Hooks", "Calendars"],
    objects: ["Twitter/X thread", "Instagram carousel outline", "TikTok script beats", "LinkedIn thought-leadership post", "community engagement calendar", "viral hook variations", "UGC campaign brief", "cross-post adaptation kit", "comment reply playbook", "giveaway mechanics plan", "story poll set", "creator collaboration brief"],
    families: ["produce", "brainstorm", "plan", "convert", "improve"],
  },
  {
    id: "automation", expert: "workflow architect",
    subcats: ["Workflow Design", "Integrations"],
    objects: ["Zapier automation blueprint", "email triage automation spec", "CRM sync pipeline plan", "report generation bot design", "webhook handler checklist", "no-code integration map", "data backup routine", "notification fan-out design", "invoice processing flow", "lead routing system blueprint", "social posting scheduler spec", "error alerting setup plan"],
    families: ["plan", "produce", "review", "improve", "convert"],
  },
];

// ---------- Title helpers ----------

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------- Item composer ----------

/** Global running index → fully composed seed prompt. Deterministic in `i`. */
export function generateSeedPrompt(i: number): SeedPrompt {
  const cat = CATS[i % CATS.length];
  const rnd = rngFor("promptly-gen-v1", cat.id, i);

  const object = cat.objects[i % cat.objects.length];
  const famKey = cat.families[(Math.floor(i / cat.objects.length) + (i % 3)) % cat.families.length];
  const fam = FAMILIES[famKey];
  const ctx = CONTEXTS[Math.floor(i / 7) % CONTEXTS.length];
  const audience = AUDIENCES[Math.floor(i / 3) % AUDIENCES.length];
  const tone = TONES[Math.floor(i / 11) % TONES.length];
  const format = FORMATS[Math.floor(i / 5) % FORMATS.length];
  const subcat = cat.subcats[Math.floor(i / 13) % cat.subcats.length];

  // ---- Metadata ----
  const usage = Math.floor(40 + Math.pow(rnd.r(), 2.6) * 38000);
  const rating = Math.min(5, Math.round((3.7 + Math.pow(rnd.r(), 0.7) * 1.3) * 10) / 10);
  const ratingCount = Math.max(3, Math.floor(usage * (0.02 + rnd.r() * 0.06)));
  const ageDays = 1 + rnd.int(0, 270);
  const diffRoll = rnd.r();
  const difficulty: Difficulty = diffRoll < 0.38 ? "beginner" : diffRoll < 0.82 ? "intermediate" : "advanced";

  const plats = [...DEFAULT_PLATFORM_ORDER];
  for (let k = plats.length - 1; k > 0; k--) {
    const j = rnd.int(0, k + 1);
    [plats[k], plats[j]] = [plats[j], plats[k]];
  }
  const platforms = plats.slice(0, 3 + rnd.int(0, 3));

  // ---- Copy ----
  const title = `${titleCase(object)} (${ctx.short})`;
  // Avoid "Review a code review checklist"-style verb/object echoes.
  const verbPhrase = object
    .toLowerCase()
    .startsWith(fam.verb.toLowerCase().slice(0, 5))
    ? "Work on"
    : fam.verb;
  const description =
    `${verbPhrase} ${article(object)} ${object} ${ctx.clause}, built for ${audience}. ` +
    `Output arrives as ${format.sentence.toLowerCase()}`;

  const hasAudienceVar = famKey !== "image-generation";
  const extra = FAMILY_EXTRA[famKey];
  const m1 = EXTRA_METHOD_STEPS[i % EXTRA_METHOD_STEPS.length];
  const m2 = EXTRA_METHOD_STEPS[(i + 2) % EXTRA_METHOD_STEPS.length];
  const fm1 = FAILURE_MODES[i % FAILURE_MODES.length];
  const fm2 = FAILURE_MODES[(i + 1) % FAILURE_MODES.length];
  const fm3 = FAILURE_MODES[(i + 2) % FAILURE_MODES.length];
  const body =
    `You are a ${cat.expert} with over a decade of hands-on experience. You have seen ${object}s succeed and fail across many teams and industries, and you serve ${audience} who need results, not theory. You are known for ${tone} work that survives contact with reality.\n\n` +
    `GOAL\n${fam.goal(object)} Success means the output could be used as-is tomorrow morning without further editing — every claim grounded, every section earning its place, nothing left vague.\n\n` +
    `CONTEXT\nThis work happens ${ctx.clause}. ${rnd.pick(CONTEXT_WHY)} Treat everything I provide as the single source of truth: the output must be traceable back to it or clearly labeled as a recommendation.\n\n` +
    `WHAT I'LL PROVIDE\n` +
    `- TOPIC: {TOPIC} — the specific ${headWords(object, 3)} to work on; name it precisely, scope it tightly.\n` +
    `- KEY DETAILS: {DETAILS} — paste the raw material, numbers, links or notes; the more concrete the input, the sharper the output.\n` +
    (hasAudienceVar
      ? `- AUDIENCE: {AUDIENCE} — who will read or use the result; this shapes vocabulary, depth and what needs explaining.\n`
      : "") +
    `\nMETHODOLOGY — work through these steps in order, do not skip or reorder:\n` +
    `1. ${fam.steps[0]}\n` +
    `2. ${fam.steps[1]}\n` +
    `3. ${extra.method[0]}\n` +
    `4. ${extra.method[1]}\n` +
    `5. ${extra.method[2]}\n` +
    `6. ${m1}\n` +
    `7. ${m2}\n` +
    `8. Draft the deliverable following the OUTPUT structure below, then revise once for structure and once for wording.\n` +
    `9. If something critical is missing, ask up to 3 clarifying questions; otherwise record your assumptions in an ASSUMPTIONS note at the top of the output.\n\n` +
    `EDGE CASES & ASSUMPTIONS\n` +
    `- If the provided material is incomplete, ${extra.edge}.\n` +
    `- If sources contradict each other, surface both readings side by side instead of averaging them into something nobody said.\n` +
    `- If the request conflicts with best practice, follow the request and note the tension in one line at the end.\n` +
    `- ${ctx.rule}\n` +
    `- Never invent facts, numbers or quotes; mark anything uncertain as "uncertain" with a one-line reason.\n\n` +
    `OUTPUT\n` +
    `- Format: ${format.sentence}\n` +
    `- Structure: ${extra.structure}\n` +
    `- Tone: ${tone.charAt(0).toUpperCase() + tone.slice(1)}.\n` +
    `- Length: depth over brevity — every section must carry new information; no section under three sentences.\n` +
    `- Close with "NEXT STEPS": exactly 3 immediate actions I can take, each with its expected payoff.\n\n` +
    `WORKED EXAMPLE (style reference — mirror the shape, never the content)\n` +
    `Input: a typical, slightly messy ${object} for ${audience}.\n` +
    `Expected opening: "Working from the material provided, ${fam.verb.toLowerCase() === "work on" ? "here is" : "the analysis shows"} three things that stand out…"\n` +
    `Expected middle: titled sections in the order given above, each opening with its strongest claim.\n` +
    `Expected close: "NEXT STEPS: 1) … 2) … 3) …" with owners and timing.\n\n` +
    `FAILURE MODES — avoid these known ways this kind of task goes wrong:\n` +
    `- ${fm1}\n` +
    `- ${fm2}\n` +
    `- ${fm3}\n\n` +
    `CONSTRAINTS\n` +
    `- ${extra.constraint}\n` +
    `- ${format.instruction}\n` +
    `- No filler phrases, no restating this prompt back to me, no apologies, no meta-commentary about being an AI.\n` +
    `- Keep every claim tied to the provided material or clearly labeled as a recommendation.\n` +
    `- If a section would be thinner than three sentences, merge it into a neighbor rather than padding it.\n\n` +
    `QUALITY RUBRIC — aim for 10/10 on each:\n` +
    `- ${fam.quality[0]}\n` +
    `- ${fam.quality[1]}\n` +
    `- A skeptical stakeholder could act on this without asking a single follow-up question.\n` +
    `- ${format.label.charAt(0).toUpperCase() + format.label.slice(1)} used consistently throughout.\n` +
    `- Every recommendation names its trigger: the condition under which it applies.\n\n` +
    `SELF-CHECK (silent, before answering)\nConfirm every {VARIABLE} above was actually used, every rubric criterion is satisfied, every section meets its minimum depth, and nothing contradicts the provided material. Fix gaps silently, then produce the final answer.`;

  const variables = [
    { key: "TOPIC", label: "Topic / subject", placeholder: object, required: true as const },
    { key: "DETAILS", label: "Key details & constraints", placeholder: "paste your raw material here" },
    ...(hasAudienceVar
      ? [{ key: "AUDIENCE", label: "Audience", placeholder: audience }]
      : []),
  ];

  const tags = dedupe([
    titleCase(cat.id.replace(/-/g, " ")),
    titleCase(headWords(object, 3)),
    ctx.short,
    famKey === "produce" ? "Creation" : titleCase(famKey),
    titleCase(audience),
  ]).slice(0, 5);

  return {
    id: `gen-${cat.id}-${String(i).padStart(6, "0")}`,
    title,
    description,
    category: cat.id,
    subcategory: subcat,
    author: AUTHORS[rnd.int(0, AUTHORS.length)],
    source: "generated",
    tasks: fam.tasks,
    tags,
    difficulty,
    inputType: fam.inputType,
    outputType: fam.outputType,
    purpose: `${verbPhrase} ${object} for ${audience}`,
    transformation: `${fam.inputType} → ${fam.outputType}`,
    tone,
    bestFor: [titleCase(audience), titleCase(ctx.short), `${titleCase(famKey)} work`],
    platforms,
    variables,
    body,
    ageDays,
    usageCount: usage,
    rating,
    ratingCount,
  };
}

const DEFAULT_PLATFORM_ORDER = ["chatgpt", "claude", "gemini", "deepseek", "grok"];

/**
 * Deepen a hand-curated seed: the editorial body stays verbatim as the
 * opening, then the same deep sections the procedural corpus carries are
 * appended, personalized from this prompt's own tasks, variables, tone and
 * I/O types. Deterministic per id so reseeding is stable.
 */
export function deepenCuratedBody(s: SeedPrompt): string {
  const rnd = rngFor("curated-deepen", s.id);
  const pick = <T,>(bank: readonly T[], k = 0): T =>
    bank[(Math.floor(rnd.r() * bank.length) + k) % bank.length];

  const vars = (s.variables ?? []).map((v) => `{${v.key}}`);
  const varList = vars.length ? vars.join(", ") : "{TOPIC}, {DETAILS}";
  const taskList = s.tasks.slice(0, 3).join(", ");
  const audience = (s.bestFor?.[0] ?? "the target reader").toLowerCase();
  const m1 = pick(EXTRA_METHOD_STEPS);
  const m2 = pick(EXTRA_METHOD_STEPS, 1);
  const m3 = pick(EXTRA_METHOD_STEPS, 2);

  return `${s.body}\n\n` +
    `CONTEXT\nThis is ${s.subcategory ?? s.category} work for ${audience}. It rarely happens in ideal conditions: expect partial input, competing priorities and just enough time to do it right once.${s.purpose ? ` The purpose of the exercise: ${s.purpose.charAt(0).toLowerCase() + s.purpose.slice(1)}.` : ""}\n\n` +
    `BEYOND THE STEPS — after executing the numbered instructions above, deepen the result:\n` +
    `1. ${m1}\n` +
    `2. ${m2}\n` +
    `3. ${m3}\n` +
    `4. If something critical is missing from the provided material, ask up to 3 clarifying questions; otherwise record assumptions in an ASSUMPTIONS note at the top of the output.\n\n` +
    `EDGE CASES & ASSUMPTIONS\n` +
    `- If the provided ${s.inputType} is incomplete or ambiguous, state exactly what is missing and proceed with the best-supported reading, flagged as an assumption.\n` +
    `- If two parts of the material contradict each other, surface both readings side by side instead of averaging them into something neither side said.\n` +
    `- If the request conflicts with best practice for ${s.subcategory ?? s.category}, follow the request and note the tension in one line at the end.\n` +
    `- If the scope balloons mid-task, finish the original ${taskList} scope first and list the overflow under NEXT STEPS.\n` +
    `- Never invent facts, numbers or quotes; mark anything uncertain as "uncertain" with a one-line reason.\n\n` +
    `OUTPUT REQUIREMENTS\n` +
    `- Deliverable: a ${s.outputType} the reader can act on without follow-up questions.\n` +
    `- Tone: ${s.tone}, consistent from first line to last.\n` +
    `- Depth: every section must carry new information — no section under three sentences.\n` +
    `- Close with "NEXT STEPS": exactly 3 immediate actions, each with its expected payoff.\n\n` +
    `WORKED EXAMPLE (style reference — mirror the shape, never the content)\n` +
    `Input: a typical, slightly messy ${s.inputType} from someone in the ${audience} seat.\n` +
    `Expected opening: name the strongest finding or theme first, in one sentence.\n` +
    `Expected middle: sections in the order the instructions above establish, each opening with its claim, then its evidence.\n` +
    `Expected close: "NEXT STEPS: 1) ... 2) ... 3) ..." with owners and timing.\n\n` +
    `FAILURE MODES — known ways this kind of task goes wrong:\n` +
    `- ${pick(FAILURE_MODES)}\n` +
    `- ${pick(FAILURE_MODES, 1)}\n` +
    `- ${pick(FAILURE_MODES, 2)}\n\n` +
    `ADDITIONAL CONSTRAINTS\n` +
    `- No filler phrases, no restating this prompt back, no apologies, no meta-commentary about being an AI.\n` +
    `- Keep every claim tied to the provided material or clearly labeled as a recommendation.\n` +
    `- If a section would be thinner than three sentences, merge it into a neighbor rather than padding it.\n\n` +
    `QUALITY RUBRIC — aim for 10/10 on each:\n` +
    `- ${taskList}: each of these actually happened, visibly, in the output.\n` +
    `- A skeptical ${audience} could act on this without asking a single follow-up question.\n` +
    `- Every recommendation names its trigger: the condition under which it applies.\n` +
    `- Evidence beats assertion: every major claim points at something in the provided material.\n` +
    `- The ${s.outputType} would still make sense to someone who was not in the room.\n\n` +
    `SELF-CHECK (silent, before answering)\nConfirm every variable (${varList}) was actually used, every rubric criterion is satisfied, every section meets its minimum depth, and nothing contradicts the provided material. Fix gaps silently, then produce the final answer.`;
}

function article(s: string): string {
  return /^[aeiou]/i.test(s) ? "an" : "a";
}

function headWords(s: string, n: number): string {
  return s.split(" ").slice(0, n).join(" ");
}

function dedupe(arr: string[]): string[] {
  return [...new Set(arr)];
}
