import { DEFAULT_PLATFORMS, type SeedPrompt } from "../promptTypes";

/**
 * Coverage expansion, part 2 — automation, legal, finance, data-analysis
 * plus second-wave depth for the largest existing categories.
 */
export const COVERAGE_WORK_PROMPTS: SeedPrompt[] = [
  // ================= AUTOMATION =================
  {
    id: "workflow-blueprint-designer",
    title: "Workflow Blueprint Designer",
    description:
      "Turn a repetitive process description into a step-by-step automation blueprint with triggers, guards and failure handling.",
    category: "automation",
    subcategory: "Workflow Design",
    tasks: ["plan", "analyze"],
    tags: ["Automation", "Workflows", "Ops", "Blueprint"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "plan",
    purpose: "Design before you automate",
    transformation: "Process description → Automation blueprint",
    tone: "Systematic",
    bestFor: ["Ops", "Solo Founders", "No-code Builders"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "PROCESS", label: "Describe the manual process today", required: true },
      { key: "TOOLS", label: "Tools available", placeholder: "Google Sheets + Gmail + Make.com" },
      { key: "VOLUME", label: "How often it happens", placeholder: "~40 times/week" },
    ],
    body: `Act as an automation architect. Process: {PROCESS}. Tools available: {TOOLS}. Volume: {VOLUME}.

Produce a blueprint:
1. PROCESS MAP — current steps as numbered list; mark each as [AUTOMATE], [HUMAN], or [CUT] (steps nobody needs).
2. TRIGGER — what starts it; note any unreliable trigger and a safer alternative.
3. FLOW SPEC — each automated step: input → transformation → output → where errors go. Name the exact tool action where possible given {TOOLS}.
4. GUARDRAILS — validation before irreversible actions (sending, paying, deleting), plus a dry-run mode.
5. FAILURE PLAN — what happens when step N fails silently, and the weekly health-check query.
6. ROI MATH — minutes saved per week at {VOLUME}, minus realistic maintenance cost.
Flag any step where automation would be legal/compliance-risky.`,
    ageDays: 17,
    usageCount: 2340,
    rating: 4.6,
    ratingCount: 171,
  },
  {
    id: "integration-recipe-writer",
    title: "Integration Recipe Writer",
    description:
      "Convert plain-English automation wishes into exact Zapier/Make/n8n recipes with field mappings.",
    category: "automation",
    subcategory: "Integrations",
    tasks: ["convert", "write"],
    tags: ["Zapier", "Make", "n8n", "Integration"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "document",
    purpose: "From wish to working recipe",
    transformation: "Plain English → Node-by-node recipe",
    tone: "Precise, instructional",
    bestFor: ["No-coders", "Ops", "VA Teams"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "WISH", label: "What should happen automatically", required: true },
      { key: "PLATFORM", label: "Tool", placeholder: "Make.com", suggestions: ["Make.com", "Zapier", "n8n"] },
    ],
    body: `You are an integration specialist writing for {PLATFORM}.

The wish: "{WISH}"

Write the recipe:
1. MODULE LIST — every module in order: trigger first. For each: module name (as it appears in {PLATFORM}), operation, and why it's there.
2. FIELD MAPPINGS — table of | Module | Field | Value / mapped variable |. Use the platform's mapping syntax (e.g. {{1.email}}) exactly.
3. ROUTER/FILTERS — conditions that branch or stop the flow, written as precise expressions.
4. TEST PLAN — how to fire the trigger safely and what to check after each run.
5. GOTCHAS — rate limits, pagination, timezone traps specific to these apps.
If a required app has no native module, say so and propose the webhook workaround.`,
    ageDays: 25,
    usageCount: 1890,
    rating: 4.5,
    ratingCount: 124,
  },
  {
    id: "prompt-chain-orchestrator",
    title: "Prompt Chain Orchestrator",
    description:
      "Split one big AI task into a reliable chain of small prompts with handoff contracts between stages.",
    category: "automation",
    subcategory: "Workflow Design",
    tasks: ["plan", "write"],
    tags: ["Prompt Chaining", "LLM Ops", "Architecture", "Reliability"],
    difficulty: "advanced",
    inputType: "text",
    outputType: "document",
    purpose: "Big tasks fail; chains don't",
    transformation: "Mega-prompt → Stage pipeline",
    tone: "Engineering-minded",
    bestFor: ["AI Builders", "Devs", "Power Users"],
    platforms: ["chatgpt", "claude", "gemini", "deepseek"],
    variables: [
      { key: "TASK", label: "The big task that fails in one prompt", required: true },
      { key: "QUALITY_BAR", label: "What 'good output' means" },
    ],
    body: `Act as an LLM systems architect. Task that fails as one mega-prompt: {TASK}. Quality bar: {QUALITY_BAR}.

Design a chain:
1. STAGE SPLIT — decompose into 3–6 single-responsibility stages. For each: name, job in one sentence, why it must be separate.
2. HANDOFF CONTRACT — per boundary: the exact JSON shape stage N emits and stage N+1 consumes. Contracts beat prose handoffs.
3. STAGE PROMPTS — write each stage's full system prompt (role, rules, output format). Keep each under 200 words.
4. VALIDATORS — per stage: a cheap check that catches garbage before it propagates (e.g. schema match, length, no new facts).
5. FALLBACKS — retry policy and the human-review trigger.
6. COST NOTE — rough token multiplier vs one big prompt, and where to cache.`,
    featured: true,
    ageDays: 5,
    usageCount: 3120,
    rating: 4.9,
    ratingCount: 247,
  },

  // ================= LEGAL =================
  {
    id: "privacy-policy-translator",
    title: "Privacy Policy Translator",
    description:
      "Rewrite dense privacy policies into plain language a normal person can act on — section by section.",
    category: "legal",
    subcategory: "Plain Language",
    tasks: ["rewrite", "explain"],
    tags: ["Privacy", "Plain Language", "GDPR", "Compliance"],
    difficulty: "intermediate",
    inputType: "document",
    outputType: "summary",
    purpose: "Know what you actually agreed to",
    transformation: "Legalese → Plain-language map",
    tone: "Clear, neutral",
    bestFor: ["Consumers", "PMs", "Founders"],
    platforms: [...DEFAULT_PLATFORMS, "perplexity"],
    variables: [
      { key: "POLICY", label: "Paste policy text (or key sections)", required: true },
      { key: "ROLE", label: "Whose perspective?", placeholder: "a user deciding whether to sign up", suggestions: ["a user deciding whether to sign up", "a company publishing it", "an auditor"] },
    ],
    body: `Act as a plain-language legal editor writing for: {ROLE}.

Policy text:
<policy>
{POLICY}
</policy>

For each major section produce:
- IN PLAIN ENGLISH — ≤2 sentences at a 9th-grade reading level.
- WHAT THEY GET — rights/licenses/data they take.
- WHAT YOU GIVE UP — obligations, arbitration, class-action waivers.
- 🚩 FLAGS — unusual or aggressive clauses worth negotiating.

Close with: TOP 5 FACTS anyone signing should know, and 3 questions to ask the provider. Never invent law — if a clause is ambiguous, say so instead of guessing jurisdiction-specific meaning.`,
    ageDays: 34,
    usageCount: 2780,
    rating: 4.7,
    ratingCount: 214,
  },
  {
    id: "contract-risk-radar",
    title: "Contract Risk Radar",
    description:
      "Scan vendor/customer contracts for one-sided terms, missing protections and negotiation leverage.",
    category: "legal",
    subcategory: "Contract Analysis",
    tasks: ["detect", "recommend", "compare"],
    tags: ["Contracts", "Risk", "Negotiation", "Procurement"],
    difficulty: "advanced",
    inputType: "document",
    outputType: "report",
    purpose: "See who the contract really favors",
    transformation: "Contract → Risk map + redlines",
    tone: "Sharp, commercial",
    bestFor: ["Freelancers", "Small Businesses", "Procurement"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "CONTRACT", label: "Paste contract text", required: true },
      { key: "SIDE", label: "Which side am I on?", placeholder: "the contractor", suggestions: ["the contractor", "the client", "the SaaS vendor", "the buyer"] },
    ],
    body: `Act as a commercial contracts analyst protecting: {SIDE}.

Contract:
<contract>
{CONTRACT}
</contract>

1. BALANCE SCORECARD — for each cluster (payment, IP, liability, termination, confidentiality, non-compete, indemnity): favors me / balanced / favors them, quoting the clause.
2. RISK REGISTER — top risks ordered by likelihood × impact; each tied to section numbers.
3. MISSING PROTECTIONS — what a contract for {SIDE} should contain but doesn't (late-payment interest? liability cap? kill fee?).
4. REDLINE ASKS — the 5 edits to request, phrased diplomatically, each with the business justification and a fallback position.
Add a disclaimer line: informational analysis, not legal advice.`,
    ageDays: 52,
    usageCount: 3260,
    rating: 4.6,
    ratingCount: 238,
  },

  // ================= FINANCE =================
  {
    id: "budget-doctor",
    title: "Budget Doctor",
    description:
      "Diagnose a monthly budget: leak detection, category benchmarks and a realistic rebalancing plan.",
    category: "finance",
    subcategory: "Personal Finance",
    tasks: ["analyze", "recommend"],
    tags: ["Budgeting", "Personal Finance", "Money", "Planning"],
    difficulty: "beginner",
    inputType: "data",
    outputType: "report",
    purpose: "Find where money actually goes",
    transformation: "Income/expenses → Diagnosis + plan",
    tone: "Non-judgmental, concrete",
    bestFor: ["Anyone", "Couples", "Financial Newbies"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "BUDGET", label: "Monthly income + expenses by category", required: true },
      { key: "GOAL", label: "Money goal", placeholder: "save €5k in 12 months", suggestions: ["build emergency fund", "save €5k in 12 months", "pay off credit card", "invest more monthly"] },
    ],
    body: `Act as a pragmatic money coach (no product pitches, ever).

Budget:
<budget>
{BUDGET}
</budget>
Goal: {GOAL}

1. SNAPSHOT — savings rate, fixed-vs-variable split, biggest three categories by share of income.
2. LEAK DETECTIVE — categories that are outliers vs typical ranges (state the benchmark range you're using); estimate annualized cost of each leak.
3. REBALANCE PLAN — reallocate to hit {GOAL}: show old → new amounts per category and the math proving the goal is reachable. If it isn't reachable, say so and offer two honest options (earn more vs extend timeline).
4. FIRST THREE MOVES — this week, ranked by effort-to-impact.
Use only numbers I gave you; never invent fees or returns.`,
    ageDays: 20,
    usageCount: 2960,
    rating: 4.5,
    ratingCount: 227,
  },
  {
    id: "investment-thesis-teardown",
    title: "Investment Thesis Teardown",
    description:
      "Stress-test an investment thesis: bull case, bear case, falsifiers and what evidence would change your mind.",
    category: "finance",
    subcategory: "Analysis",
    tasks: ["analyze", "compare", "detect"],
    tags: ["Investing", "Thesis", "Risk", "Research"],
    difficulty: "advanced",
    inputType: "text",
    outputType: "report",
    purpose: "Separate conviction from hope",
    transformation: "Thesis → Steel/bear/falsifiers",
    tone: "Dispassionate",
    bestFor: ["Investors", "Analysts", "Curious Skeptics"],
    platforms: [...DEFAULT_PLATFORMS, "perplexity"],
    variables: [
      { key: "THESIS", label: "Your investment thesis", required: true },
      { key: "HORIZON", label: "Time horizon", placeholder: "5 years", suggestions: ["1 year", "5 years", "10+ years"] },
    ],
    body: `Act as a buy-side analyst reviewing my thesis over {HORIZON}:

"{THESIS}"

Deliver:
1. STEELMAN — strongest coherent version, including the mechanism (why does the money get made?).
2. BEAR CASE — the smartest opposing view; name who is on the other side of this trade and why they might be right.
3. KEY ASSUMPTIONS — ranked by fragility; mark which are checkable with public data.
4. FALSIFIERS — 3 observable events that would disprove the thesis, with rough dates/thresholds.
5. PRE-MORTEM — it's {HORIZON} later and I lost money; the most plausible story of what happened.
6. POSITION-SIZING NOTES — what thesis strength implies for concentration (educationally, not personalized advice).
No price targets. No fabricated numbers.`,
    ageDays: 39,
    usageCount: 1740,
    rating: 4.7,
    ratingCount: 129,
  },

  // ================= DATA ANALYSIS =================
  {
    id: "dataset-first-look",
    title: "Dataset First Look",
    description:
      "Profile any pasted dataset: structure, quality issues, distributions to check and questions worth asking.",
    category: "data-analysis",
    subcategory: "Exploration",
    tasks: ["analyze", "detect"],
    tags: ["EDA", "Data Quality", "Pandas", "Profiling"],
    difficulty: "beginner",
    inputType: "data",
    outputType: "report",
    purpose: "Understand data before touching models",
    transformation: "Raw sample → Profile + question list",
    tone: "Methodical",
    bestFor: ["Analysts", "Students", "PMs"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "DATA", label: "Paste rows / column descriptions", required: true },
      { key: "GOAL", label: "What the data is for" },
    ],
    body: `Act as a senior data analyst doing first-pass EDA. Purpose: {GOAL}.

Data:
<data>
{DATA}
</data>

Report:
1. STRUCTURE — grain (one row = ?), columns typed as categorical/numeric/date/text/ID, apparent primary key.
2. QUALITY FLAGS — nulls, duplicates, impossible values, mixed formats, suspicious cardinality. For each: the check that confirmed it.
3. DISTRIBUTIONS TO PLOT — top 5 charts (chart type + column + why), including at least one relationship test.
4. QUESTIONS THIS DATA CAN ANSWER — 5, ranked by value; mark any question the grain makes unanswerable.
5. NEXT STEP — pandas snippet for the single most important cleaning operation.
Infer nothing about individuals; treat text columns as opaque unless needed.`,
    ageDays: 28,
    usageCount: 3540,
    rating: 4.6,
    ratingCount: 265,
  },
  {
    id: "sql-explainer-optimizer",
    title: "SQL Explainer & Optimizer",
    description:
      "Explain any SQL query in plain English, flag smells, and rewrite it faster with reasoning shown.",
    category: "data-analysis",
    tasks: ["explain", "refactor"],
    tags: ["SQL", "Performance", "Query Tuning", "Databases"],
    difficulty: "intermediate",
    inputType: "code",
    outputType: "report",
    purpose: "Understand and speed up queries",
    transformation: "Query → Explanation + optimized rewrite",
    tone: "Technical, clear",
    bestFor: ["Analysts", "Backend Devs", "DB-curious PMs"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "QUERY", label: "SQL query", required: true },
      { key: "DIALECT", label: "Dialect", placeholder: "PostgreSQL", suggestions: ["PostgreSQL", "MySQL", "SQLite", "BigQuery", "SQL Server"] },
      { key: "SYMPTOM", label: "Performance symptom (if any)", placeholder: "takes 40s on 2M rows" },
    ],
    body: `Act as a database performance expert for {DIALECT}. Symptom: {SYMPTOM}.

<sql>
{QUERY}
</sql>

1. PLAIN-ENGLISH EXPLAIN — what it returns, row by row logic, in 4 sentences max. State the grain of the result.
2. SMELL CHECK — SELECT *, correlated subqueries, functions on indexed columns, implicit casts, DISTINCT band-aids, N+1 patterns. Quote each smell from the query.
3. OPTIMIZED REWRITE — improved version with inline comments on each change.
4. WHY IT'S FASTER — the mechanics (index usage, join order, set-based vs row-by-row) in plain language.
5. INDEX ADVICE — DDL for indexes that would help, and the read/write trade-off.
Only promise improvements that hold logically; note anything dependent on data distribution.`,
    ageDays: 43,
    usageCount: 4120,
    rating: 4.8,
    ratingCount: 331,
  },
  {
    id: "chart-choice-advisor",
    title: "Chart Choice Advisor",
    description:
      "Pick the right visualization for your message and audience — with encoding rationale and anti-patterns to avoid.",
    category: "data-analysis",
    subcategory: "Visualization",
    tasks: ["recommend"],
    tags: ["Dataviz", "Charts", "Storytelling", "Reporting"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "recommendation",
    purpose: "Charts that carry the message",
    transformation: "Message + data → Chart spec",
    tone: "Editorial, practical",
    bestFor: ["Analysts", "Consultants", "Students"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "MESSAGE", label: "The point you need to make", required: true },
      { key: "DATA_SHAPE", label: "Data available (columns, size)", required: true },
      { key: "AUDIENCE", label: "Audience & setting", placeholder: "exec review, 5 min slot" },
    ],
    body: `Act as a dataviz editor. Message: {MESSAGE}. Data: {DATA_SHAPE}. Audience: {AUDIENCE}.

1. PRIMARY CHART — recommended type with a sketch spec: x/y encodings, sort order, color rule (one accent max), annotations, and the exact title written as the takeaway sentence.
2. WHY THIS CHART — the perceptual reason (position > length > area > color) tying chart choice to {MESSAGE}.
3. RUNNER-UP — second-best option and when it would win instead.
4. ANTI-PATTERNS — what a default Excel/chart-wizard would do wrong here, specifically.
5. SOLO AXIS TEST — if the audience only remembers one thing, confirm the chart shows exactly that; adjust spec until it passes.`,
    ageDays: 55,
    usageCount: 1620,
    rating: 4.4,
    ratingCount: 98,
  },

  // ================= CODING (depth) =================
  {
    id: "api-doc-from-code",
    title: "API Docs from Code",
    description:
      "Generate accurate reference docs straight from handler code: endpoints, params, errors and examples.",
    category: "coding",
    subcategory: "Documentation",
    tasks: ["extract", "write"],
    tags: ["API", "Documentation", "OpenAPI", "Reference"],
    difficulty: "intermediate",
    inputType: "code",
    outputType: "document",
    purpose: "Docs that match the code",
    transformation: "Handler code → Reference doc",
    tone: "Technical, terse",
    bestFor: ["Backend Devs", "DevRel", "Tech Writers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "CODE", label: "Route/handler code", required: true },
      { key: "AUDIENCE", label: "Reader assumption", placeholder: "knows REST, not our domain" },
    ],
    body: `Act as a developer-experience writer documenting for readers who {AUDIENCE}.

Code:
<code>
{CODE}
</code>

Document each endpoint:
### METHOD /path
- WHAT IT DOES — one sentence starting with a verb.
- PARAMS — table: name | location | type | required | constraints | example.
- SUCCESS — status code + response schema + a realistic example response.
- ERRORS — every error path visible in the code: code, cause, example body.
- GOTCHAS — idempotency, rate limits, ordering guarantees implied by the implementation.

Rules: document ONLY what the code shows; mark inferred behavior with ⚠ inference. End with an OpenAPI 3.1 skeleton for these endpoints.`,
    ageDays: 23,
    usageCount: 3390,
    rating: 4.6,
    ratingCount: 254,
  },
  {
    id: "test-case-stormer",
    title: "Test Case Stormer",
    description:
      "Enumerate the tests you're forgetting: happy paths, boundaries, adversarial inputs and state traps.",
    category: "coding",
    subcategory: "Testing",
    tasks: ["write", "detect"],
    tags: ["Testing", "Edge Cases", "QA", "Unit Tests"],
    difficulty: "intermediate",
    inputType: "code",
    outputType: "questions",
    purpose: "Coverage beyond the obvious",
    transformation: "Function → Prioritized test matrix",
    tone: "Rigorous",
    bestFor: ["Developers", "QA Engineers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "CODE", label: "Function/component to test", required: true },
      { key: "CONTEXT", label: "Where it runs / who calls it" },
      { key: "FRAMEWORK", label: "Test framework", placeholder: "Vitest", suggestions: ["Jest", "Vitest", "pytest", "JUnit", "Go testing"] },
    ],
    body: `Act as a test engineer. Target runs in context: {CONTEXT}. Framework: {FRAMEWORK}.

<code>
{CODE}
</code>

1. BEHAVIOR CONTRACT — what this unit promises, in bullets. Any ambiguity = future bug; flag it.
2. TEST MATRIX — table: | # | Category | Input | Expected | Why it matters |. Categories: happy path, boundaries (0, 1, max, empty), invalid input, unicode/emoji, concurrency/idempotency, time-dependence, failure injection.
3. THE FORGETTING CURVE — 3 cases teams almost always miss for code shaped like this.
4. SKELETON SUITE — the five highest-value tests as runnable {FRAMEWORK} stubs with arrange/act/assert comments.
Prioritize ruthlessly: mark the minimum suite someone should write today.`,
    ageDays: 31,
    usageCount: 3870,
    rating: 4.7,
    ratingCount: 302,
  },

  // ================= WRITING (depth) =================
  {
    id: "headline-split-forge",
    title: "Headline Split-Forge",
    description:
      "Ten headline variants across proven mechanisms, each labeled with its psychology and best venue.",
    category: "writing",
    subcategory: "Copywriting",
    tasks: ["write", "brainstorm"],
    tags: ["Headlines", "Titles", "Copywriting", "CTR"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "text",
    purpose: "Titles that earn the click honestly",
    transformation: "Topic → Mechanism-labeled headline menu",
    tone: "Ad-sharp",
    bestFor: ["Bloggers", "Newsletter Writers", "Marketers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "CONTENT", label: "What the piece delivers", required: true },
      { key: "VENUE", label: "Where it runs", placeholder: "newsletter subject line", suggestions: ["blog post", "newsletter subject line", "YouTube title", "landing page H1"] },
      { key: "READER", label: "Who it's for" },
    ],
    body: `Act as a direct-response copywriter with taste. Piece: {CONTENT}. Venue: {VENUE}. Reader: {READER}.

Write 10 headlines:
- 2× specificity (numbers/outcomes) · 2× curiosity gap (honest!) · 2× pain agitation · 2× contrarian · 1× how-to clarity · 1× story tease.

Label each: [mechanism] + one clause on why it fits {VENUE}.
Rules: no clickbait the content can't cash; ≤60 characters where venue allows; strong first two words.
Then: your top pick for A/B test and the ONE variable to test against it (not ten).`,
    ageDays: 37,
    usageCount: 2980,
    rating: 4.5,
    ratingCount: 213,
  },
  {
    id: "style-guide-enforcer",
    title: "Style Guide Enforcer",
    description:
      "Edit any text to comply with your style rules — every deviation flagged with the rule it broke.",
    category: "writing",
    subcategory: "Editing",
    tasks: ["rewrite"],
    tags: ["Style Guide", "Editing", "Consistency", "Brand Voice"],
    difficulty: "intermediate",
    inputType: "document",
    outputType: "document",
    purpose: "Consistency without a human editor",
    transformation: "Draft + rules → Compliant draft + changelog",
    tone: "Editorial",
    bestFor: ["Content Teams", "Docs Maintainers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "TEXT", label: "Text to edit", required: true },
      { key: "RULES", label: "Your style rules (voice, terms, formatting)", required: true },
    ],
    body: `Act as a managing editor enforcing this style guide:

<rules>
{RULES}
</rules>

Text to edit:
<text>
{TEXT}
</text>

1. COMPLIANT VERSION — the edited text. Change nothing the rules don't require.
2. CHANGELOG — table: | Original | Edited | Rule violated (quote it) |.
3. JUDGMENT CALLS — places where rules conflict or run out; state both readings and what you chose.
4. SYSTEMIC NOTES — patterns suggesting the author needs coaching, not just edits (max 3, kind but candid).
If the rules are silent on something important, ask one clarifying question at the end rather than guessing.`,
    ageDays: 49,
    usageCount: 1450,
    rating: 4.4,
    ratingCount: 87,
  },

  // ================= EDUCATION (depth) =================
  {
    id: "socratic-tutor-mode",
    title: "Socratic Tutor Mode",
    description:
      "Learn anything by questions instead of answers — the tutor never gives it away, only leads.",
    category: "education",
    subcategory: "Explainers",
    tasks: ["explain", "quiz"],
    tags: ["Socratic", "Tutoring", "Active Learning", "Understanding"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "questions",
    purpose: "Understanding you built yourself sticks",
    transformation: "Topic → Guided question ladder",
    tone: "Patient, probing",
    bestFor: ["Students", "Autodidacts", "Parents"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "TOPIC", label: "Concept to learn", required: true },
      { key: "LEVEL", label: "Current understanding", placeholder: "heard the word, know nothing", suggestions: ["complete novice", "heard the word, know nothing", "some fragments, shaky", "solid basics, want depth"] },
      { key: "SESSION", label: "Session length", placeholder: "15 min", suggestions: ["10 min", "15 min", "30 min"] },
    ],
    body: `Be my Socratic tutor for: {TOPIC}. My level: {LEVEL}. Session: {SESSION}.

Operating rules:
- NEVER state the answer directly while a question could lead me to it.
- Ask exactly ONE question per turn; wait for my reply before continuing.
- Calibrate: start below my level to find solid ground, then climb.
- If I'm wrong, don't correct — ask the question that exposes the contradiction.
- If I stall twice on the same step, give the smallest possible hint, then rebuild momentum with a winnable question.
Open by diagnosing what I already know with one concrete question. Track my progress silently; end the session with a 2-question mastery check and an honest assessment.`,
    ageDays: 18,
    usageCount: 4720,
    rating: 4.8,
    ratingCount: 396,
  },
  {
    id: "spaced-repetition-scheduler",
    title: "Spaced Repetition Scheduler",
    description:
      "Convert study material into well-formed flashcards AND a review calendar based on forgetting curves.",
    category: "education",
    subcategory: "Flashcards",
    tasks: ["convert", "plan"],
    tags: ["Flashcards", "Spaced Repetition", "Anki", "Memory"],
    difficulty: "beginner",
    inputType: "document",
    outputType: "flashcards",
    purpose: "Cards that respect how memory works",
    transformation: "Notes → Card deck + review schedule",
    tone: "Structured",
    bestFor: ["Students", "Exam Preppers", "Language Learners"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "NOTES", label: "Study material", required: true },
      { key: "EXAM", label: "Exam/goal date", placeholder: "in 6 weeks" },
    ],
    body: `Act as a learning scientist building my deck for {EXAM}.

Material:
<notes>
{NOTES}
</notes>

1. CARD SET — atomic Q→A cards following the 21 rules: one fact per card, no orphans (every term defined before used), cloze where natural, images described in brackets where they'd help. Mark each card foundational/elaboration/trivia.
2. DELETION PASS — list material NOT worth memorizing (understanding topics, derivations) with what to do instead.
3. SCHEDULE — review calendar to {EXAM}: initial intervals (1d, 3d, 7d, 14d…) adjusted so the final review lands 3 days pre-exam; daily new-card cap sized to the deck.
4. LEECH PROTOCOL — what to do with cards I keep failing (rewrite, split, or make a mnemonic).`,
    ageDays: 42,
    usageCount: 2560,
    rating: 4.6,
    ratingCount: 188,
  },

  // ================= RESEARCH (depth) =================
  {
    id: "search-strategy-designer",
    title: "Search Strategy Designer",
    description:
      "Design a systematic search: query ladders, synonyms, exclusion filters and saturation criteria.",
    category: "research",
    subcategory: "Study Design",
    tasks: ["plan"],
    tags: ["Systematic Review", "Search Strategy", "Sources", "Methodology"],
    difficulty: "advanced",
    inputType: "text",
    outputType: "plan",
    purpose: "Find what exists without drowning",
    transformation: "Question → Executable search protocol",
    tone: "Academic-practical",
    bestFor: ["Researchers", "Analysts", "Grad Students"],
    platforms: [...DEFAULT_PLATFORMS, "perplexity"],
    variables: [
      { key: "QUESTION", label: "Research question", required: true },
      { key: "DATABASES", label: "Where you'll search", placeholder: "Google Scholar, arXiv, industry press", suggestions: ["Google Scholar + arXiv", "PubMed", "industry press + LinkedIn", "court records + news archives"] },
      { key: "TIMEBOX", label: "Time budget", placeholder: "one afternoon" },
    ],
    body: `Act as a research librarian. Question: {QUESTION}. Sources: {DATABASES}. Budget: {TIMEBOX}.

Protocol:
1. CONCEPT BLOCKS — break the question into 2–4 concept blocks; list synonyms/variants per block (include adjacent jargon and antonyms).
2. QUERY LADDER — from narrowest (all blocks ANDed) to broadest, with expected-result-count guidance per rung for each source in {DATABASES}.
3. FILTERS — inclusion/exclusion criteria decidable in <30s per item (date, geography, source type); phrase them as checklist lines.
4. SNOWBALLING — citation-chasing rules: which seeds qualify, forward vs backward.
5. SATURATION CRITERIA — how I'll know to stop (e.g. 2 consecutive searches yielding <10% new sources).
6. LOG TEMPLATE — capture sheet so searches are reproducible.`,
    ageDays: 61,
    usageCount: 1380,
    rating: 4.7,
    ratingCount: 84,
  },
  {
    id: "counterargument-mapper",
    title: "Counterargument Mapper",
    description:
      "Map the strongest objections to any position — steelmanned, evidenced, and ranked by threat level.",
    category: "research",
    subcategory: "Fact Checking",
    tasks: ["analyze", "compare"],
    tags: ["Critical Thinking", "Debate", "Steelman", "Analysis"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "report",
    purpose: "Know the other side better than they do",
    transformation: "Claim → Threat-ranked objection map",
    tone: "Intellectually honest",
    bestFor: ["Writers", "Debaters", "Decision Makers"],
    platforms: [...DEFAULT_PLATFORMS, "perplexity"],
    variables: [
      { key: "CLAIM", label: "The position/claim to stress-test", required: true },
      { key: "STAKES", label: "Why this matters / decision it feeds" },
    ],
    body: `Map counterarguments to: "{CLAIM}". Context: {STAKES}.

1. STEELMAN SUMMARY — the claim at its strongest, 3 sentences.
2. OBJECTION MAP — 5 strongest objections, grouped by TYPE: factual, causal, definitional, values-based, feasibility. Each gets: the argument at ITS strongest, the evidence it rests on (name the type of source needed), and threat level (fatal / serious / nuisance).
3. INTERACTION — which objections compound each other? Which cancel out?
4. REBUTTAL BUDGET — where would responding be wasted effort vs essential?
5. RESIDUAL RISK — what remains true in the objections even after my best rebuttals.
Charity is mandatory: no strawmen, no motte-and-bailey exposure games.`,
    ageDays: 46,
    usageCount: 2110,
    rating: 4.6,
    ratingCount: 149,
  },

  // ================= PRODUCTIVITY (depth) =================
  {
    id: "inbox-triage-surgeon",
    title: "Inbox Triage Surgeon",
    description:
      "Sort a scary inbox into do/delegate/delete/defer batches with drafted replies ready to send.",
    category: "productivity",
    subcategory: "Email",
    tasks: ["extract", "recommend"],
    tags: ["Email", "Inbox Zero", "Triage", "Batching"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "email",
    purpose: "Inbox from dread to done in 20 minutes",
    transformation: "Message pile → Action batches",
    tone: "Efficient, calm",
    bestFor: ["Managers", "Anyone with 200 unread"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "MESSAGES", label: "Paste senders + subjects + first lines (or full emails)", required: true },
      { key: "DELEGATES", label: "Who you can delegate to" },
    ],
    body: `Act as my inbox surgeon. Available delegates: {DELEGATES}.

Messages:
<messages>
{MESSAGES}
</messages>

Triage into batches:
1. DELETE/POLITE-IGNORE — with one-line justifications (no FOMO mercy).
2. DO NOW (≤2min replies) — include the actual drafted reply for each, ready to paste. Match the sender's brevity.
3. DEFER WITH A DATE — what day/block, and the one-line note future-me needs.
4. DELEGATE — to whom, with the handoff message drafted (context + deadline + definition of done).
5. PROJECT-IFY — anything that's secretly a task list; convert to checklist.
End with stats: counts per batch + estimated total time saved vs answering serially.`,
    ageDays: 26,
    usageCount: 3230,
    rating: 4.5,
    ratingCount: 241,
  },
  {
    id: "minutes-machine",
    title: "Minutes Machine",
    description:
      "Transcripts in, board-quality minutes out: decisions, owners, deadlines and dissent recorded faithfully.",
    category: "productivity",
    subcategory: "Meetings",
    tasks: ["summarize", "extract"],
    tags: ["Meeting Minutes", "Governance", "Action Items", "Summaries"],
    difficulty: "beginner",
    inputType: "document",
    outputType: "notes",
    purpose: "Minutes people actually rely on",
    transformation: "Transcript → Decision-grade minutes",
    tone: "Neutral, crisp",
    bestFor: ["Chiefs of Staff", "PMs", "Board Secretaries"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "TRANSCRIPT", label: "Meeting transcript/recording notes", required: true },
      { key: "STYLE", label: "Minutes style", placeholder: "formal governance", suggestions: ["formal governance", "internal team memo", "client-facing recap"] },
    ],
    body: `Produce {STYLE} minutes from:

<transcript>
{TRANSCRIPT}
</transcript>

Structure:
1. ATTENDEES & APOLOGIES — names only as given; mark unclear spellings [?].
2. DECISIONS — numbered. Each: what was decided, by whom (consensus/vote/person), and dissent noted if voiced. Decisions ONLY here — discussion lives in §3.
3. DISCUSSION SUMMARY — 1–2 sentences per agenda item: tension + resolution direction. Attribute positions accurately, not theatrically.
4. ACTIONS — table: | # | Action | Owner | Deadline | From item # |. No owner = flagged UNASSIGNED.
5. PARKED — items explicitly deferred, with the stated revisit date.
Fidelity rules: never invent consensus; if the transcript is ambiguous, quote it verbatim and mark AMBIGUOUS.`,
    ageDays: 33,
    usageCount: 3670,
    rating: 4.7,
    ratingCount: 279,
  },

  // ================= CAREER (depth) =================
  {
    id: "star-interview-drill",
    title: "STAR Interview Drill Sergeant",
    description:
      "Practice behavioral interviews: you answer, the coach interrogates, then rebuilds your story to land.",
    category: "career",
    subcategory: "Interviews",
    tasks: ["quiz", "rewrite"],
    tags: ["Behavioral Interview", "STAR", "Coaching", "Practice"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "questions",
    purpose: "Stories that survive follow-up questions",
    transformation: "Rough story → Drilled STAR narrative",
    tone: "Coach: demanding but warm",
    bestFor: ["Candidates", "Career Switchers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "QUESTION", label: "Behavioral question (or 'pick for my role')", placeholder: "tell me about a conflict with a coworker" },
      { key: "RAW_STORY", label: "Your messy recollection of a real example", required: true },
      { key: "TARGET_ROLE", label: "Role/company interviewing for" },
    ],
    body: `Act as an interview coach for {TARGET_ROLE}. Question: {QUESTION}.

My raw story:
<story>
{RAW_STORY}
</story>

Run the drill:
ROUND 1 — Interrogate like a skeptical interviewer: 4 follow-ups targeting vagueness (what did YOU do? what was the metric? what went wrong first?). Wait for answers between each.
ROUND 2 — Rebuild my answer as tight STAR: Situation 2 sentences, Task 1, Action 3–4 (first person, verbs), Result with number. Mark [NEEDS METRIC] where I lacked one and suggest which metric would belong there.
ROUND 3 — Stress test: the 2 hardest follow-ups an interviewer would ask next, with guidance for handling them honestly.`,
    ageDays: 24,
    usageCount: 4410,
    rating: 4.8,
    ratingCount: 356,
  },
  {
    id: "linkedin-profile-audit",
    title: "LinkedIn Profile Audit",
    description:
      "Section-by-section rewrite of your profile toward one target role — headline, about, and experience bullets.",
    category: "career",
    subcategory: "LinkedIn",
    tasks: ["rewrite", "recommend"],
    tags: ["LinkedIn", "Personal Brand", "Job Search", "Profile"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "document",
    purpose: "Recruiter-ready profile positioning",
    transformation: "Current profile → Target-role profile",
    tone: "Confident, human",
    bestFor: ["Job Seekers", "Career Switchers", "Freelancers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "PROFILE", label: "Paste current profile sections", required: true },
      { key: "TARGET", label: "Target role/industry", required: true },
    ],
    body: `Act as a personal-brand strategist targeting: {TARGET}.

Current profile:
<profile>
{PROFILE}
</profile>

1. AUDIT — score headline, about, experience, skills for {TARGET} fit (x/10 each) with the one biggest miss per section.
2. HEADLINE OPTIONS — 3 rewrites (≤120 chars): role clarity + proof + spark. No "passionate".
3. ABOUT SECTION — rewritten in first person: hook line, 3 proof points (metrics from their history), clear "what I want next" close. ≤180 words.
4. EXPERIENCE BULLETS — top 5 roles rewritten: verb + scope + metric. Where metrics are missing, insert [X%] placeholders and say what to go find.
5. KEYWORDS — the 8 search terms recruiters use for {TARGET} that must appear naturally.
No fabricated achievements anywhere — placeholders over lies.`,
    ageDays: 48,
    usageCount: 3980,
    rating: 4.6,
    ratingCount: 301,
  },

  // ================= BUSINESS (depth) =================
  {
    id: "rapid-swot-with-teeth",
    title: "Rapid SWOT with Teeth",
    description:
      "A SWOT that ends in strategy: cross-matrix plays, ranked priorities and what to stop doing.",
    category: "business",
    subcategory: "Strategy",
    tasks: ["analyze", "brainstorm", "plan"],
    tags: ["SWOT", "Strategy", "Planning", "Workshop"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "report",
    purpose: "SWOT as a decision tool, not wallpaper",
    transformation: "Situation → Cross-strategy matrix",
    tone: "Consultant-grade, brisk",
    bestFor: ["Founders", "MBAs", "Team Offsites"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "SUBJECT", label: "Business/product/unit + situation", required: true },
      { key: "KNOWN_FACTS", label: "Facts you already know (metrics, market, competitors)" },
      { key: "HORIZON", label: "Planning horizon", placeholder: "next 12 months" },
    ],
    body: `Strategic review of {SUBJECT} over {HORIZON}. Known facts: {KNOWN_FACTS}.

1. SWOT — max 4 items per quadrant; each specific and falsifiable (not "brand reputation"). Mark assumptions with (?) since facts weren't given.
2. CROSS MATRIX — the part everyone skips:
   - SO plays: which strengths attack which opportunities?
   - ST plays: which strengths neutralize which threats?
   - WT honesty: which weaknesses make certain threats fatal — and does that demand exit/avoidance?
3. PRIORITIES — top 3 moves for {HORIZON}, each with owner-type, resource ask, and the leading indicator to watch quarterly.
4. STOP LIST — 2 things to deliberately stop doing to fund the above.
Flag where more data would change the conclusion.`,
    ageDays: 57,
    usageCount: 2890,
    rating: 4.5,
    ratingCount: 196,
  },
  {
    id: "decision-matrix-builder",
    title: "Decision Matrix Builder",
    description:
      "Weighted scoring for hard choices: criteria coaxed out properly, weights challenged, sensitivity tested.",
    category: "business",
    subcategory: "Decision Making",
    tasks: ["compare", "recommend"],
    tags: ["Decisions", "Weighted Matrix", "Frameworks", "Trade-offs"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "table",
    purpose: "Major decisions made defensibly",
    transformation: "Options + gut feelings → Scored matrix",
    tone: "Analytical, fair",
    bestFor: ["Leaders", "Teams", "Anyone torn between options"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "DECISION", label: "The decision + your options", required: true },
      { key: "VALUES", label: "What matters to you (even vaguely)" },
      { key: "CONSTRAINTS", label: "Hard constraints (money, time, reversibility)" },
    ],
    body: `Facilitate my decision: {DECISION}. What matters to me: {VALUES}. Hard constraints: {CONSTRAINTS}.

1. CRITERIA EXTRACTION — turn my vague values into 5 measurable criteria; challenge each ("you said growth matters — how would you even know by December?").
2. WEIGHTS — assign weights summing to 100. Then argue AGAINST my weights once: which criterion is probably overweighted and why?
3. SCORING — score each option 1–10 per criterion with one-line justification per cell (no naked numbers).
4. RESULT — weighted totals, but report BOTH: raw winner and winner-if-top-criterion-doubled (sensitivity check).
5. REGRET TEST — which option loses if my biggest stated priority turns out not to matter in a year?
6. VERDICT + the single fact that would flip it.`,
    ageDays: 63,
    usageCount: 1980,
    rating: 4.6,
    ratingCount: 127,
  },

  // ================= MARKETING (depth) =================
  {
    id: "persona-excavator",
    title: "Persona Excavator",
    description:
      "Build research-grounded personas from whatever evidence you have — with confidence labels, not stereotypes.",
    category: "marketing",
    subcategory: "Campaigns",
    tasks: ["brainstorm", "analyze"],
    tags: ["Personas", "ICP", "Customer Research", "Positioning"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "document",
    purpose: "Personas grounded in evidence, not fiction",
    transformation: "Evidence scraps → Confidence-labeled personas",
    tone: "Evidence-first",
    bestFor: ["Marketers", "Founders", "Product Managers"],
    platforms: [...DEFAULT_PLATFORMS, "perplexity"],
    variables: [
      { key: "EVIDENCE", label: "Whatever you have: reviews, interview notes, survey data, analytics observations", required: true },
      { key: "PRODUCT", label: "Product + price point", required: true },
    ],
    body: `Act as a customer researcher. Product & price: {PRODUCT}.

Evidence:
<evidence>
{EVIDENCE}
</evidence>

1. EVIDENCE INVENTORY — what I actually have vs don't; separate observed behavior from stated opinion from pure guesswork.
2. PERSONAS (2–3) — each with: goal behind the goal (the emotional job), trigger moment, objections in their own likely words, waterings holes, buying role. EVERY claim tagged [observed], [inferred], or [assumed].
3. TENSION MAP — where personas conflict (messaging that delights one repels another) and the sequencing implication.
4. VALIDATION PLAN — cheapest next research step per persona; what single question would most upgrade [assumed]→[observed]?
Refuse to invent demographic details the evidence can't support.`,
    ageDays: 30,
    usageCount: 2450,
    rating: 4.5,
    ratingCount: 167,
  },
  {
    id: "landing-copy-critic",
    title: "Landing Page Copy Critic",
    description:
      "Hero-to-CTA teardown of landing page copy against conversion principles, with rewritten sections.",
    category: "marketing",
    subcategory: "Ad Copy",
    tasks: ["review", "rewrite"],
    tags: ["Landing Page", "Conversion", "Copywriting", "CRO"],
    difficulty: "intermediate",
    inputType: "url",
    outputType: "report",
    purpose: "Copy that converts because it's clear",
    transformation: "Page copy → Section rewrites",
    tone: "Direct-response editor",
    bestFor: ["Marketers", "Founders", "Growth Teams"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "COPY", label: "Paste page copy (hero, benefits, social proof, CTA…)", required: true },
      { key: "OFFER", label: "Exact offer + price" },
      { key: "TRAFFIC", label: "Traffic source & temperature", placeholder: "cold Google Ads", suggestions: ["cold Google Ads", "warm referral", "existing email list", "organic SEO"] },
    ],
    body: `Act as a conversion copy chief. Offer: {OFFER}. Traffic: {TRAFFIC}.

Page copy:
<copy>
{COPY}
</copy>

Section by section:
1. DIAGNOSIS — for hero, problem agitation, benefits, proof, objection handling, CTA: what works (keep!), what's foggy, what's doing nothing. Reference principles: clarity>cleverness, one idea per screen, specifics sell, proof adjacency.
2. REWRITES — replacement copy per weak section, matched to {TRAFFIC} temperature (cold needs more context; hot needs less).
3. PROOF GAP — claims currently unsupported; what evidence type belongs next to each (number, logo, testimonial structure).
4. CTA LAB — 3 button+microcopy variants and the psychological difference between them.
5. FIRST TEST — the single highest-information A/B test to run.`,
    ageDays: 41,
    usageCount: 3150,
    rating: 4.6,
    ratingCount: 228,
  },

  // ================= PRESENTATIONS (depth) =================
  {
    id: "conference-talk-architect",
    title: "Conference Talk Architect",
    description:
      "Structure a memorable talk around one idea: arc, callbacks, demo placement and slide discipline.",
    category: "presentations",
    subcategory: "Talks",
    tasks: ["plan", "write"],
    tags: ["Conference Talk", "Public Speaking", "Storytelling", "Structure"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "slides",
    purpose: "Talks audiences retell afterwards",
    transformation: "Expertise → Narrative talk skeleton",
    tone: "Speaker-coach energy",
    bestFor: ["Speakers", "DevRel", "Team Leads"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "IDEA", label: "Your core idea + what you know about it", required: true },
      { key: "AUDIENCE", label: "Audience + event vibe", placeholder: "300 backend devs at a practitioner conf" },
      { key: "LENGTH", label: "Slot length", placeholder: "25 min", suggestions: ["10 min lightning", "25 min", "45 min keynote"] },
    ],
    body: `Act as a speaking coach. Idea: {IDEA}. Room: {AUDIENCE}. Slot: {LENGTH}.

1. ONE THING — compress the talk to a single sentence a listener repeats to a colleague. Everything else serves it.
2. ARC — minute-by-minute outline: cold open (concrete scene, no throat-clearing), stakes, tension, 2–3 beats of substance, resolution, callback to the opener, CTA. Allocate minutes within {LENGTH}.
3. SLIDE DISCIPLINE — which beats get slides vs black screen; max words per slide; where the ONE diagram lives.
4. DEMO/PROPS — if showing something live: placement (after tension, before resolution), rehearsal failure-mode plan.
5. RETENTION INSURANCE — the 3 moments engineered to be quotable/tweetable.
6. REHEARSAL CUT LIST — what to drop first when practice runs long (mark sections [CUT-1], [CUT-2]).`,
    ageDays: 53,
    usageCount: 1720,
    rating: 4.7,
    ratingCount: 112,
  },
  {
    id: "exec-deck-condenser",
    title: "Executive Deck Condenser",
    description:
      "Compress a bloated deck into the 5 slides executives remember — assertion titles, appendix discipline.",
    category: "presentations",
    subcategory: "Executive Decks",
    tasks: ["summarize", "rewrite"],
    tags: ["Executive Summary", "Deck", "Communication", "Leadership"],
    difficulty: "intermediate",
    inputType: "document",
    outputType: "slides",
    purpose: "Respect the room's attention",
    transformation: "N-slide deck → 5-slide decision brief",
    tone: "Boardroom-tight",
    bestFor: ["Managers", "Consultants", "Startup Operators"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "DECK", label: "Current deck contents (paste slide titles + content)", required: true },
      { key: "ASK", label: "The decision/approval you need", required: true },
      { key: "ROOM", label: "Who's in the room" },
    ],
    body: `Condense for {ROOM}. The ask: {ASK}.

Current deck:
<deck>
{DECK}
</deck>

1. KILL LIST — slides that exist for the presenter's comfort, not the room's understanding. Delete without mercy; each gets one line of defense if challenged.
2. FIVE SLIDES — assertion-title format (title IS the takeaway sentence):
   ① Context in 3 facts ② The problem/opportunity quantified ③ Options considered + why rejected ones lose ④ Recommendation + resources + risks with mitigations ⑤ The ask + decision date.
   Bullet specs per slide: max 3 bullets, max 12 words each.
3. APPENDIX MAP — demoted slides listed with trigger phrases ("if asked about timeline → appendix 3").
4. PRE-READ PARAGRAPH — 100 words sent ahead so the meeting starts at slide 4.`,
    ageDays: 66,
    usageCount: 1560,
    rating: 4.6,
    ratingCount: 94,
  },

  // ================= CONTENT CREATION (depth) =================
  {
    id: "newsletter-issue-factory",
    title: "Newsletter Issue Factory",
    description:
      "A complete newsletter issue: hook, one big idea, scannable body, and a subject line pair to A/B.",
    category: "content-creation",
    subcategory: "Newsletters",
    tasks: ["write"],
    tags: ["Newsletter", "Email", "Writing", "Audience Growth"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "email",
    purpose: "Issues that get opened, read, forwarded",
    transformation: "Topic + notes → Full issue",
    tone: "Smart friend",
    bestFor: ["Newsletter Writers", "Creators"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "TOPIC", label: "This issue's topic + your angle/notes", required: true },
      { key: "AUDIENCE", label: "Who reads it", required: true },
      { key: "PAST_ISSUES", label: "1 past issue you liked (for voice matching)" },
    ],
    body: `Act as my newsletter ghostwriter. Topic & my notes: {TOPIC}. Readers: {AUDIENCE}. Voice reference: {PAST_ISSUES}.

Write the issue:
1. SUBJECT LINE PAIR — A/B candidates: one curiosity-driven, one utility-driven. ≤45 chars.
2. PREHEADER — completes the subject, doesn't repeat it.
3. OPENING HOOK — 3 sentences max; start in the middle of the interesting part.
4. BODY — one big idea developed in ~350 words: short paragraphs, bolded key sentences, one concrete example with numbers, one "how to apply this Monday" box.
5. FORWARD TRIGGER — one line specifically worth sending to a colleague, placed naturally.
6. SIGN-OFF — matches voice reference; zero engagement-begging.
Match the reference voice if given; otherwise keep it plainspoken and confident.`,
    ageDays: 35,
    usageCount: 2670,
    rating: 4.5,
    ratingCount: 194,
  },
  {
    id: "podcast-show-notes-generator",
    title: "Podcast Show-Notes Generator",
    description:
      "Episode transcript in: chapters, pull quotes, guest bio, links list and clip timestamps out.",
    category: "content-creation",
    subcategory: "Podcasts",
    tasks: ["extract", "summarize"],
    tags: ["Podcast", "Show Notes", "Chapters", "Repurposing"],
    difficulty: "beginner",
    inputType: "document",
    outputType: "summary",
    purpose: "Publish-ready episode pages",
    transformation: "Transcript → Chapters + quotes + assets",
    tone: "Editorial, faithful",
    bestFor: ["Podcast Producers", "Editors"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "TRANSCRIPT", label: "Episode transcript", required: true },
      { key: "EPISODE_META", label: "Guest name(s) + episode theme" },
    ],
    body: `Act as a podcast producer. Episode: {EPISODE_META}.

<transcript>
{TRANSCRIPT}
</transcript>

Produce show notes:
1. EPISODE DESCRIPTION — 100 words, sells the conversation without spoiling conclusions.
2. CHAPTERS — timestamped [HH:MM] chapter list with evocative-but-honest titles (use transcript markers; estimate where absent and mark ≈).
3. PULL QUOTES — 3 verbatim quotes (≤25 words) chosen for standalone punch, each with its timestamp.
4. GUEST BIO — 50 words assembled only from transcript facts; gaps marked [NEED FROM GUEST].
5. MENTIONS LEDGER — every book/tool/article named: name | who mentioned | context in 5 words.
6. CLIP SHORTLIST — 3 moments for vertical clips with start/end estimates and why each stands alone.
Never paraphrase inside quotation marks.`,
    ageDays: 45,
    usageCount: 1830,
    rating: 4.4,
    ratingCount: 112,
  },
];
