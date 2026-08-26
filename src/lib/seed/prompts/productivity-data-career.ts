import { DEFAULT_PLATFORMS, type SeedPrompt } from "../promptTypes";

export const PRODUCTIVITY_DATA_CAREER_PROMPTS: SeedPrompt[] = [
  // ---------------- Productivity ----------------
  {
    id: "document-summarizer",
    title: "Document Summarizer",
    description:
      "Summarizes any document at three zoom levels — one line, one paragraph, key points — with quotes you can trust.",
    category: "productivity",
    subcategory: "Summarization",
    tasks: ["summarize", "extract"],
    tags: ["Summary", "Documents", "Reading"],
    difficulty: "beginner",
    inputType: "document",
    outputType: "summary",
    purpose: "Fast document comprehension",
    transformation: "Scan → Distill → Layer → Cite",
    tone: "Neutral",
    bestFor: ["Busy professionals", "Students", "Researchers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "DOCUMENT", label: "Document text", required: true },
      { key: "READER_GOAL", label: "Why you're reading it", placeholder: "e.g. decide whether to sign" },
    ],
    body: `Summarize this document for a reader whose goal is: {READER_GOAL}

<document>
{DOCUMENT}
</document>

Three zoom levels, in order:
1. ONE LINE — The whole document in a single sentence.
2. ONE PARAGRAPH — Context, core claim or findings, and implication.
3. KEY POINTS — Up to seven bullets. Each bullet states a fact from the document; where it matters, quote the exact phrase in quotation marks.

Then:
- WHAT'S MISSING — Questions the reader's goal implies but the document doesn't answer.
- If the document contains numbers, reproduce them exactly as written — never round or estimate.`,
    featured: true,
    ageDays: 260,
    usageCount: 6120,
    rating: 4.8,
    ratingCount: 445,
  },
  {
    id: "email-triage-assistant",
    title: "Email Triage Assistant",
    description:
      "Sorts an inbox pile into act-now, respond-later, archive — with drafted replies for the urgent ones.",
    category: "productivity",
    subcategory: "Email",
    tasks: ["organize", "draft"],
    tags: ["Email", "Triage", "Inbox"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "list",
    purpose: "Inbox zero in minutes",
    transformation: "Classify → Prioritize → Draft → Defer",
    tone: "Efficient assistant",
    bestFor: ["Managers", "Founders", "Anyone drowning in email"],
    platforms: ["chatgpt", "copilot", "gemini", "claude"],
    variables: [{ key: "EMAILS", label: "Emails to triage", required: true }],
    body: `Triage these emails:

{EMAILS}

For each email output one row: sender | one-line gist | bucket (ACT NOW / RESPOND TODAY / WAITING / ARCHIVE) | why that bucket (≤ 8 words).

Bucket rules: ACT NOW = deadline < 48h or blocking someone; RESPOND TODAY = needs a reply, no urgency; WAITING = awaiting someone else; ARCHIVE = informational.

Then draft replies for every ACT NOW email: subject preserved, ≤ 5 sentences, clear ask or commitment with dates. Match each sender's formality level. Flag anything that looks like phishing or pressure tactics instead of replying.`,
    ageDays: 175,
    usageCount: 2860,
    rating: 4.5,
    ratingCount: 178,
  },
  {
    id: "meeting-notes-to-actions",
    title: "Meeting Notes → Action Items",
    description:
      "Converts messy meeting notes into decisions, owners, deadlines and follow-ups.",
    category: "productivity",
    subcategory: "Meetings",
    tasks: ["extract", "organize"],
    tags: ["Meetings", "Action Items", "Follow-up"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "list",
    purpose: "Meetings that produce motion",
    transformation: "Parse → Assign → Date → Chase",
    tone: "Chief of staff",
    bestFor: ["Team leads", "Project managers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [{ key: "NOTES", label: "Raw meeting notes / transcript" }],
    body: `Turn these raw notes into a structured meeting record:

<notes>
{NOTES}
</notes>

Output:
1. DECISIONS MADE — Each decision stated as an unambiguous sentence. Mark decisions that were only implied.
2. ACTION ITEMS TABLE — Task | Owner (name or "UNASSIGNED") | Due date ("UNSET" if none) | Depends on.
3. OPEN QUESTIONS — Unresolved items and who should answer them.
4. FOLLOW-UP MESSAGE — A short recap email ready to send: decisions, actions with owners and dates, next meeting trigger.

Never invent owners or dates. Where the notes are ambiguous, write your best interpretation followed by [confirm].`,
    ageDays: 118,
    usageCount: 2240,
    rating: 4.6,
    ratingCount: 132,
  },
  {
    id: "weekly-priority-planner",
    title: "Weekly Priority Planner",
    description:
      "Turns a sprawling task list into a realistic week plan using effort/impact sorting and honest time budgeting.",
    category: "productivity",
    subcategory: "Task Management",
    tasks: ["plan", "prioritize"],
    tags: ["Planning", "Prioritization", "Week"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "plan",
    purpose: "A week that survives contact with reality",
    transformation: "Dump → Sort → Budget → Buffer",
    tone: "Calm operator",
    bestFor: ["Overloaded professionals"],
    platforms: ["chatgpt", "claude", "gemini", "copilot"],
    variables: [
      { key: "TASKS", label: "Everything on your plate" },
      { key: "CAPACITY", label: "Realistic hours & fixed commitments" },
    ],
    body: `Plan my week. Everything on my plate:

{TASKS}

My real capacity: {CAPACITY}

Method:
1. SORT — Impact (high/med/low) × Effort (S/M/L) quadrants. Be honest about low-impact busywork.
2. BUDGET — Allocate tasks into actual hour blocks within capacity, scheduling deep work early. Leave ≥20% buffer; do not fill every slot.
3. CUT LIST — What explicitly does not happen this week, and the cost of delaying it (usually small).
4. DAILY THEMES — One focus per day so context-switching dies.
5. TRIPWIRES — If mid-week slips, which task gets sacrificed first? Decide now.`,
    ageDays: 80,
    usageCount: 1310,
    rating: 4.4,
    ratingCount: 71,
  },

  // ---------------- Data Analysis ----------------
  {
    id: "dataset-explorer",
    title: "Dataset Explorer",
    description:
      "First-pass analysis of any dataset: structure, quality issues, distributions and questions worth asking.",
    category: "data-analysis",
    subcategory: "Exploration",
    tasks: ["analyze", "explore"],
    tags: ["Data", "EDA", "Analysis"],
    difficulty: "intermediate",
    inputType: "data",
    outputType: "report",
    purpose: "Understand unfamiliar data fast",
    transformation: "Profile → Clean-flag → Distribute → Question",
    tone: "Data scientist",
    bestFor: ["Analysts", "PMs with CSVs", "Researchers"],
    platforms: ["chatgpt", "claude", "deepseek", "gemini"],
    variables: [
      { key: "SCHEMA_OR_SAMPLE", label: "Schema + sample rows", required: true },
      { key: "BUSINESS_QUESTION", label: "Business question behind the data" },
    ],
    body: `Explore this dataset. Business question it should answer: {BUSINESS_QUESTION}

{SCHEMA_OR_SAMPLE}

Deliver:
1. STRUCTURE — Rows meaning, grain (one row = ?), column types, primary key candidates.
2. QUALITY FLAGS — Missing values, suspicious ranges, duplicates, encoding oddities — each with how you'd verify and fix.
3. DISTRIBUTION NOTES — For key columns: shape, outliers worth eyes, skew that would break naive averages.
4. EARLY SIGNALS — Two patterns relevant to the business question visible even in this sample.
5. NEXT ANALYSES — Ranked list of the three analyses most likely to answer the business question, with the exact method for each.
Do not fabricate statistics for rows not shown; reason only from what's provided and mark extrapolations.`,
    ageDays: 142,
    usageCount: 1970,
    rating: 4.6,
    ratingCount: 108,
  },
  {
    id: "statistical-test-advisor",
    title: "Statistical Test Advisor",
    description:
      "Recommends the right statistical test for a question and data shape, then explains how to read the result honestly.",
    category: "data-analysis",
    subcategory: "Statistics",
    tasks: ["recommend", "explain"],
    tags: ["Statistics", "Testing", "Methods"],
    difficulty: "advanced",
    inputType: "text",
    outputType: "explanation",
    purpose: "Valid inference",
    transformation: "Frame → Match → Check → Interpret",
    tone: "Careful teacher",
    bestFor: ["Analysts", "Researchers", "Students"],
    platforms: ["chatgpt", "claude", "deepseek"],
    variables: [
      { key: "QUESTION", label: "Research question" },
      { key: "DATA_SHAPE", label: "Data description" },
    ],
    body: `Advise on statistics. Question: {QUESTION}. Data available: {DATA_SHAPE}

Provide:
1. FRAMING — Null hypothesis, alternative, and what "effect size" means here concretely.
2. TEST SELECTION — Primary test with justification via assumptions (normality, independence, variance). Name the runner-up if an assumption fails.
3. ASSUMPTION CHECKS — How to actually check each assumption on my data (plot name, test name).
4. SAMPLE SIZE — Rough n needed to detect a meaningful effect; state assumed effect size.
5. HONEST INTERPRETATION GUIDE — What a significant result does NOT mean here; common misreadings specific to this test.
No test-name bingo without justification. If the design is confounded, say so before anything else.`,
    ageDays: 92,
    usageCount: 860,
    rating: 4.5,
    ratingCount: 47,
  },

  // ---------------- Career ----------------
  {
    id: "resume-tailor",
    title: "Resume Tailor",
    description:
      "Rewrites your resume bullets against a specific job description — truthful, quantified, keyword-aligned.",
    category: "career",
    subcategory: "Resumes",
    tasks: ["rewrite", "optimize"],
    tags: ["Resume", "ATS", "Job Search"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "document",
    purpose: "Interview callbacks",
    transformation: "Map → Quantify → Align → Trim",
    tone: "Recruiter-facing",
    bestFor: ["Job seekers at any level"],
    platforms: ["chatgpt", "claude", "gemini", "copilot"],
    variables: [
      { key: "RESUME", label: "Current resume", required: true },
      { key: "JOB_DESCRIPTION", label: "Target job description", required: true },
    ],
    body: `Tailor my resume to this job description.

<resume>{RESUME}</resume>
<job>{JOB_DESCRIPTION}</job>

Process:
1. MATCH MAP — Table: top job requirement → where my resume evidences it → strength (strong/partial/missing).
2. REWRITTEN BULLETS — Rewrite experience bullets to lead with outcomes. Format: action verb + what I did + measurable result. Keep every claim truthful to the source material; if a number is unknown use "[X%]" placeholders I can fill — never invent figures.
3. KEYWORD ALIGNMENT — Terms from the posting I already cover naturally, plus ones missing entirely (so I can judge whether they're real gaps).
4. SUMMARY LINE — Three-sentence professional summary tuned to this role.
5. RED FLAGS — Anything in my current resume that hurts more than helps for THIS role.`,
    featured: true,
    ageDays: 200,
    usageCount: 4930,
    rating: 4.8,
    ratingCount: 356,
  },
  {
    id: "mock-interviewer",
    title: "Mock Interviewer",
    description:
      "Runs a realistic interview for a target role with probing follow-ups, then scores your answers.",
    category: "career",
    subcategory: "Interviews",
    tasks: ["quiz", "evaluate", "coach"],
    tags: ["Interview", "Practice", "Feedback"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "feedback",
    purpose: "Interview readiness",
    transformation: "Ask → Probe → Score → Coach",
    tone: "Warm but rigorous interviewer",
    bestFor: ["Candidates preparing for real interviews"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "ROLE", label: "Role / company style", required: true },
      { key: "BACKGROUND", label: "Your background", required: true },
      { key: "FORMAT", label: "Format", suggestions: ["Behavioral", "Technical", "Case", "Mixed"] },
    ],
    body: `Run a mock interview for a {ROLE} position ({FORMAT} format). My background: {BACKGROUND}

Conduct:
1. Open with a realistic opener, then ask ONE question at a time. Wait for my answers.
2. Ask natural follow-up probes the way a sharp interviewer would ("what was YOUR specific contribution?", "what broke?").
3. Cover 6–8 questions total across the format's standard areas.
4. Afterward, deliver the scorecard: per-question rating (1–5), what a great answer contained vs mine, and the strongest alternative framing.
5. End with the three highest-leverage things for me to rehearse before the real thing.

Stay in character during questioning; break character only for the scorecard.`,
    featured: true,
    ageDays: 158,
    usageCount: 3620,
    rating: 4.7,
    ratingCount: 239,
  },
];
