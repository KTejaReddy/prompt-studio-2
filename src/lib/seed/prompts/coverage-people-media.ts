import { DEFAULT_PLATFORMS, type SeedPrompt } from "../promptTypes";

/**
 * Coverage expansion — domains that previously had 0–1 prompts.
 * Same compact authoring shape as the other seed files.
 */
export const COVERAGE_PEOPLE_MEDIA_PROMPTS: SeedPrompt[] = [
  // ================= DESIGN =================
  {
    id: "ux-interview-script-builder",
    title: "UX Interview Script Builder",
    description:
      "Turn research goals into a unbiased user-interview script with warm-up, deep-dive and wrap-up sections.",
    category: "design",
    subcategory: "UX Research",
    tasks: ["plan", "write"],
    tags: ["UX Research", "Interviews", "User Testing", "Discovery"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "questions",
    purpose: "Prepare neutral, insight-rich user interviews",
    transformation: "Goals → Question funnel → Script",
    tone: "Curious, neutral",
    bestFor: ["Product Designers", "Researchers", "PMs"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "PRODUCT", label: "Product or feature", placeholder: "a habit-tracking app", required: true },
      { key: "GOAL", label: "Research goal", placeholder: "understand why users abandon onboarding" },
      { key: "AUDIENCE", label: "Participant type", placeholder: "users who churned in week 1" },
    ],
    body: `Act as a senior UX researcher designing an interview guide.

Research context: I am studying {PRODUCT}. Goal: {GOAL}. Participants: {AUDIENCE}.

Produce an interview script with:
1. WARM-UP (3 questions) — build rapport, establish context without leading.
2. CONTEXT QUESTIONS (4) — how they currently solve the problem today.
3. DEEP-DIVE (6) — open "tell me about a time…" questions targeting {GOAL}. For each, add one follow-up probe.
4. WRAP-UP (2) — anything we didn't ask; who else should we talk to?

Rules: no yes/no questions, no feature pitches, no hypotheticals ("would you use…"). Flag any accidental bias in brackets.`,
    ageDays: 18,
    usageCount: 2140,
    rating: 4.7,
    ratingCount: 189,
  },
  {
    id: "heuristic-usability-critique",
    title: "Heuristic Usability Critique",
    description:
      "Score any interface description or screenshot walkthrough against Nielsen's 10 usability heuristics.",
    category: "design",
    subcategory: "Critique",
    tasks: ["review", "analyze"],
    tags: ["Usability", "Heuristics", "UX Audit", "Nielsen"],
    difficulty: "advanced",
    inputType: "text",
    outputType: "report",
    purpose: "Structured expert review of a UI",
    transformation: "Flow description → Severity-ranked findings",
    tone: "Professional, direct",
    bestFor: ["Designers", "Frontend Teams"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "FLOW", label: "Screen or flow to critique", placeholder: "Describe the checkout flow…", required: true },
      { key: "USERS", label: "Primary users", placeholder: "first-time mobile shoppers" },
    ],
    body: `Act as a usability expert performing a heuristic evaluation.

Interface flow to evaluate:
<flow>
{FLOW}
</flow>
Primary users: {USERS}.

Evaluate against Nielsen's 10 heuristics (visibility of status, match with the real world, user control, consistency, error prevention, recognition over recall, flexibility, aesthetics/minimalism, error recovery, help & docs).

For EACH heuristic: state PASS / MINOR ISSUE / MAJOR ISSUE with evidence from the flow. Then produce a severity-ranked fix list (critical first): issue → why it hurts {USERS} → specific redesign suggestion. End with the three changes that would most improve task completion.`,
    ageDays: 26,
    usageCount: 1870,
    rating: 4.6,
    ratingCount: 143,
  },
  {
    id: "brand-identity-foundation",
    title: "Brand Identity Foundation",
    description:
      "Distill a rough product idea into mission, voice, visual direction and do/don't messaging guardrails.",
    category: "design",
    subcategory: "Branding",
    tasks: ["brainstorm", "write"],
    tags: ["Branding", "Identity", "Voice", "Positioning"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "document",
    purpose: "A one-page brand foundation",
    transformation: "Raw idea → Voice + visual direction",
    tone: "Inspired, concrete",
    bestFor: ["Founders", "Freelancers", "Marketers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "IDEA", label: "What you're building", required: true },
      { key: "AUDIENCE", label: "Who it's for", required: true },
      { key: "FEELING", label: "Feeling to evoke", placeholder: "calm competence", suggestions: ["calm competence", "playful energy", "quiet luxury", "bold urgency"] },
    ],
    body: `Act as a brand strategist building a foundation sheet.

Concept: {IDEA}
Audience: {AUDIENCE}
Target feeling: {FEELING}

Deliver:
1. POSITIONING LINE — one sentence: for [audience], [brand] is the [category] that [key difference].
2. MISSION & VALUES — 1 mission + 3 values, each with a "in practice" example.
3. VOICE — 3 adjectives, each shown as "we say / we never say" pairs (3 examples each).
4. VISUAL DIRECTION — palette mood (no hex codes needed), typography character, imagery rules.
5. GUARDRAILS — 5 things this brand would never do or say.

Keep every line usable by a designer or copywriter tomorrow morning.`,
    ageDays: 41,
    usageCount: 3120,
    rating: 4.5,
    ratingCount: 276,
  },
  {
    id: "accessibility-tear-down",
    title: "Accessibility Tear-Down (WCAG Quick Pass)",
    description:
      "Walk through a described interface and flag WCAG 2.2 AA violations with exact fixes.",
    category: "design",
    subcategory: "Critique",
    tasks: ["detect", "recommend"],
    tags: ["Accessibility", "WCAG", "Inclusive Design", "Audit"],
    difficulty: "advanced",
    inputType: "text",
    outputType: "report",
    purpose: "Find accessibility violations early",
    transformation: "UI description → WCAG findings + fixes",
    tone: "Precise, constructive",
    bestFor: ["Engineers", "Designers", "QA"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "UI", label: "Interface description / markup", required: true },
      { key: "LEVEL", label: "Conformance level", placeholder: "WCAG 2.2 AA", suggestions: ["WCAG 2.2 AA", "WCAG 2.1 AA", "WCAG 2.2 AAA"] },
    ],
    body: `Act as an accessibility specialist auditing against {LEVEL}.

Interface:
{UI}

Audit these dimensions: perceivability (contrast, alt text, captions), operability (keyboard paths, focus order, target sizes), understandability (labels, errors, reading level), robustness (semantics, ARIA misuse).

Output a table: | # | Violation | WCAG criterion (e.g. 1.4.3) | Severity | Exact fix |. Quote the criterion name precisely. Finish with a prioritized remediation order assuming one developer-week.`,
    ageDays: 12,
    usageCount: 1490,
    rating: 4.8,
    ratingCount: 97,
  },

  // ================= CUSTOMER SUPPORT =================
  {
    id: "empathetic-ticket-responder",
    title: "Empathetic Ticket Responder",
    description:
      "Draft support replies that acknowledge frustration, solve the problem and rebuild trust — in your tone.",
    category: "customer-support",
    subcategory: "Response Writing",
    tasks: ["write", "rewrite"],
    tags: ["Support", "Email", "De-escalation", "CX"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "email",
    purpose: "High-quality support replies at speed",
    transformation: "Ticket → Empathetic resolution email",
    tone: "Warm, competent",
    bestFor: ["Support Agents", "Founders doing support"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "TICKET", label: "Customer message", required: true },
      { key: "RESOLUTION", label: "Solution / what we can offer", required: true },
      { key: "BRAND_TONE", label: "Brand tone", placeholder: "friendly, slightly playful", suggestions: ["friendly, slightly playful", "professional and concise", "extra warm"] },
    ],
    body: `You are a senior support agent writing in a {BRAND_TONE} voice.

Customer ticket:
<ticket>
{TICKET}
</ticket>
What we can do: {RESOLUTION}

Write a reply that:
1. Opens by reflecting the customer's actual frustration in one sentence (no "sorry for any inconvenience").
2. States clearly what happened and what we're doing about it — specifics over apologies.
3. Gives the resolution as numbered steps if there are steps, including exactly what they'll see next.
4. Closes with one forward-looking sentence, not boilerplate.

Then add a P.S. line offering one relevant help-center link only if genuinely useful. Max 180 words.`,
    featured: false,
    ageDays: 9,
    usageCount: 5210,
    rating: 4.8,
    ratingCount: 512,
  },
  {
    id: "support-macro-librarian",
    title: "Support Macro Librarian",
    description:
      "Mine past resolved tickets into a reusable macro/snippet library organized by intent.",
    category: "customer-support",
    tasks: ["extract", "convert"],
    tags: ["Macros", "Templates", "Knowledge Base", "Efficiency"],
    difficulty: "intermediate",
    inputType: "document",
    outputType: "document",
    purpose: "Stop rewriting the same replies",
    transformation: "Ticket history → Macro library",
    tone: "Systematic",
    bestFor: ["Support Leads", "Ops"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "TICKETS", label: "Paste 3–10 resolved tickets (with your replies)", required: true },
      { key: "PRODUCT", label: "Product name" },
    ],
    body: `Act as a knowledge manager building a macro library for {PRODUCT}.

Resolved tickets with agent replies:
<tickets>
{TICKETS}
</tickets>

1. Cluster the tickets by underlying intent (e.g. refund request, bug report, how-do-I).
2. For each cluster, write ONE reusable macro: variable slots in [BRACKETS], a subject-line template, and a fallback sentence when the standard answer doesn't apply.
3. Rate each macro's coverage: how many of the past tickets it would have handled (%).
4. List gaps — intents that appeared once and deserve no macro yet.

Format as a copy-paste-ready reference doc.`,
    ageDays: 33,
    usageCount: 1230,
    rating: 4.4,
    ratingCount: 88,
  },
  {
    id: "csat-theme-miner",
    title: "CSAT Theme Miner",
    description:
      "Turn a pile of satisfaction comments into ranked themes, sentiment splits and three concrete fixes.",
    category: "customer-support",
    subcategory: "Ticket Handling",
    tasks: ["analyze", "summarize"],
    tags: ["Feedback", "CSAT", "Voice of Customer", "Reporting"],
    difficulty: "intermediate",
    inputType: "data",
    outputType: "report",
    purpose: "Understand what drives satisfaction scores",
    transformation: "Raw comments → Themes + fixes",
    tone: "Analytical",
    bestFor: ["Support Leads", "Product Managers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "COMMENTS", label: "Paste CSAT/NPS comments (with scores if available)", required: true },
    ],
    body: `Act as a CX analyst. Here are customer comments (scores included where given):

<comments>
{COMMENTS}
</comments>

Produce:
1. THEME TABLE — theme | share of mentions | avg score of those mentions | representative quote.
2. DELIGHTERS vs DETRACTORS — top 2 of each, with evidence.
3. SENTIMENT SPLIT — % positive / neutral / negative, one caveat about your confidence.
4. THREE FIXES — highest-leverage changes, each tied to the theme it addresses and expected score impact.
Quote verbatim; don't paraphrase evidence.`,
    ageDays: 22,
    usageCount: 980,
    rating: 4.5,
    ratingCount: 61,
  },

  // ================= MANAGEMENT =================
  {
    id: "one-on-one-agenda-coach",
    title: "One-on-One Agenda Coach",
    description:
      "Build a focused 1:1 agenda from recent wins, blockers and growth topics — adaptable to 15 or 45 minutes.",
    category: "management",
    subcategory: "One-on-Ones",
    tasks: ["plan"],
    tags: ["Management", "1:1", "Leadership", "Agenda"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "notes",
    purpose: "Make recurring 1:1s actually useful",
    transformation: "Context → Prioritized agenda",
    tone: "Supportive, structured",
    bestFor: ["Engineering Managers", "Team Leads"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "REPORT", label: "About your report (role, current project, recent wins/blockers)", required: true },
      { key: "LENGTH", label: "Meeting length", placeholder: "30 min", suggestions: ["15 min", "30 min", "45 min"] },
      { key: "SEASON", label: "Current season", placeholder: "pre-launch crunch", suggestions: ["normal cadence", "pre-launch crunch", "post-launch recovery", "annual review season"] },
    ],
    body: `Act as a leadership coach preparing my next 1:1 ({LENGTH}).

Report context: {REPORT}
Season: {SEASON}

Give me:
1. AGENDA — 4 items max, time-boxed, ordered so the hardest topic lands mid-meeting. Mark which item is THEIRS to own.
2. OPENING QUESTION — one question that invites candor better than "how are you?".
3. LISTENING NOTES — 2 signals I should watch for given the season, and what each would mean.
4. FOLLOW-UP HOOK — how to end with clarity (who does what by when).
Avoid status updates — assume async covers those.`,
    ageDays: 15,
    usageCount: 2760,
    rating: 4.6,
    ratingCount: 231,
  },
  {
    id: "performance-review-writer",
    title: "Performance Review Writer",
    description:
      "Convert messy notes into a fair, specific review with evidence-linked ratings and growth framing.",
    category: "management",
    subcategory: "Performance Reviews",
    tasks: ["write", "summarize"],
    tags: ["Reviews", "Feedback", "HR", "Career"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "document",
    purpose: "Fair, specific performance reviews",
    transformation: "Bullet notes → Structured review",
    tone: "Direct, kind, factual",
    bestFor: ["Managers", "Team Leads"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "NOTES", label: "Raw notes: accomplishments, misses, peer feedback", required: true },
      { key: "ROLE", label: "Their role + level" },
      { key: "RATING_SCALE", label: "Company rating scale", placeholder: "1–5 with 3 = meets expectations" },
    ],
    body: `Act as an experienced manager drafting a performance review.

Raw notes:
<notes>
{NOTES}
</notes>
Role & level: {ROLE}. Rating scale: {RATING_SCALE}.

Write:
1. SUMMARY PARAGRAPH — the year in 3 sentences a skip-level could read cold.
2. STRENGTHS (2–3) — each: claim → specific evidence from the notes → impact.
3. GROWTH AREAS (1–2) — same structure, framed as next-level behaviors, not flaws.
4. RATING RATIONALE — justify one rating on {RATING_SCALE}; note where evidence is thin rather than inventing.
5. NEXT-QUARTER FOCUS — 2 measurable goals.

Rules: every claim cites an actual note; no personality judgments; no comparative rankings vs teammates.`,
    ageDays: 47,
    usageCount: 4310,
    rating: 4.7,
    ratingCount: 388,
  },
  {
    id: "hiring-rubric-designer",
    title: "Hiring Rubric Designer",
    description:
      "Turn a job description into scored interview exercises with anchors that reduce bias and vibes.",
    category: "management",
    subcategory: "Hiring",
    tasks: ["plan", "compare"],
    tags: ["Hiring", "Interviewing", "Rubrics", "Recruiting"],
    difficulty: "advanced",
    inputType: "text",
    outputType: "table",
    purpose: "Structured, comparable candidate evaluation",
    transformation: "Job description → Scored exercise set",
    tone: "Methodical",
    bestFor: ["Hiring Managers", "Recruiters"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "JD", label: "Job description (paste)", required: true },
      { key: "STAGE", label: "Stage", placeholder: "final loop", suggestions: ["phone screen", "technical round", "final loop"] },
    ],
    body: `Act as a head of talent designing a structured interview kit for stage: {STAGE}.

Job description:
<jd>
{JD}
</jd>

Deliver:
1. COMPETENCY MAP — the 4–5 competencies this hire must demonstrate, weighted to sum 100%.
2. EXERCISES — one question or work-sample per competency, phrased to elicit evidence, not trivia.
3. SCORING ANCHORS — for each competency: what a 1, 3 and 5 answer looks like (behavioral anchors, not adjectives).
4. RED FLAGS — legitimate disqualifiers distinct from style differences.
5. DEBRIEF TEMPLATE — the exact form interviewers fill in within 30 minutes of finishing.

Everything must be scoreable without knowing the candidate's background or personality.`,
    ageDays: 58,
    usageCount: 1650,
    rating: 4.6,
    ratingCount: 121,
  },

  // ================= ENTREPRENEURSHIP =================
  {
    id: "idea-stress-test",
    title: "Startup Idea Stress Test",
    description:
      "Attack your business idea like a skeptical investor: market, moat, distribution and kill-criteria.",
    category: "entrepreneurship",
    subcategory: "Idea Validation",
    tasks: ["analyze", "detect"],
    tags: ["Startups", "Validation", "Investor Thinking", "Strategy"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "report",
    purpose: "Find fatal flaws before building",
    transformation: "Idea → Risk teardown + kill criteria",
    tone: "Skeptical but fair",
    bestFor: ["Founders", "Indie Hackers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "IDEA", label: "Your idea (what, for whom, how it makes money)", required: true },
      { key: "STAGE", label: "Current proof", placeholder: "waitlist of 300", suggestions: ["just an idea", "landing page up", "waitlist of 300", "paying pilot customers"] },
    ],
    body: `Act as a pre-seed investor who has passed on 500 deals. My idea: {IDEA}. Current proof: {STAGE}.

Stress-test it:
1. STEELMAN — the strongest version of this idea in 2 sentences.
2. MARKET REALITY — TAM sanity check, willingness-to-pay signal, timing argument (why now, or why not).
3. MOAT AUDIT — what stops an incumbent or well-funded clone from winning in 6 months?
4. DISTRIBUTION GAP — the unsexy question: exactly how do the first 100 customers arrive, and what does that channel cost?
5. KILL CRITERIA — 3 measurable signals that should make me stop.
6. VERDICT — proceed / iterate / pass, with the single riskiest assumption named.

Be blunt; politeness wastes founder time.`,
    featured: true,
    ageDays: 7,
    usageCount: 6890,
    rating: 4.9,
    ratingCount: 704,
  },
  {
    id: "pitch-narrative-weaver",
    title: "Pitch Narrative Weaver",
    description:
      "Shape facts you already have into a 12-slide investor story with one tension running through it.",
    category: "entrepreneurship",
    subcategory: "Pitching",
    tasks: ["write", "plan"],
    tags: ["Pitch Deck", "Fundraising", "Storytelling", "Slides"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "slides",
    purpose: "Investor narrative from raw facts",
    transformation: "Facts → 12-slide arc",
    tone: "Confident, concrete",
    bestFor: ["Founders raising pre-seed/seed"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "FACTS", label: "Your raw material (traction, team, market, product)", required: true },
      { key: "ROUND", label: "Round & raise amount", placeholder: "seed, $1.5M" },
    ],
    body: `Act as a pitch coach for founders raising {ROUND}.

Raw facts:
<facts>
{FACTS}
</facts>

Build the deck narrative:
- For each of 12 slides: TITLE (assertion, not label), the ONE message, and what fact from above lands there. Slides: problem tension, why now, solution, product, market, business model, traction, GTM, competition (framed honestly), team, financial ask, vision.
- Name the single TENSION the whole story resolves.
- Mark the two slides investors will attack, and the one-sentence defense for each.
No invented numbers — flag missing facts as [NEEDS DATA].`,
    ageDays: 29,
    usageCount: 2450,
    rating: 4.6,
    ratingCount: 178,
  },
  {
    id: "growth-experiment-prioritizer",
    title: "Growth Experiment Prioritizer",
    description:
      "Score your backlog of growth ideas with ICE, sequence them and define success metrics per test.",
    category: "entrepreneurship",
    subcategory: "Growth",
    tasks: ["recommend", "compare", "plan"],
    tags: ["Growth", "Experiments", "ICE", "Prioritization"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "table",
    purpose: "Stop guessing which experiment to run",
    transformation: "Idea list → Sequenced test plan",
    tone: "Analytical, pragmatic",
    bestFor: ["Growth Marketers", "Founders"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "IDEAS", label: "Growth ideas / current funnel metrics", required: true },
      { key: "CAPACITY", label: "Team capacity", placeholder: "1 marketer + 0.5 engineer for a month" },
    ],
    body: `Act as a growth lead. Ideas and context: {IDEAS}. Capacity: {CAPACITY}.

1. ICE TABLE — idea | Impact 1–10 | Confidence 1–10 (justify!) | Ease 1–10 | total. Justify each score in one clause; penalize ideas needing assets we can't build within capacity.
2. SEQUENCE — order experiments so cheap learning comes before expensive swings; note dependencies.
3. TEST DESIGN — for the top 3: hypothesis (If we… then… because…), primary metric, guardrail metric, minimum runtime, and the result threshold that kills the idea.
4. LEARNING LOG TEMPLATE — one row per experiment for future retros.`,
    ageDays: 19,
    usageCount: 1980,
    rating: 4.5,
    ratingCount: 132,
  },

  // ================= PERSONAL DEVELOPMENT =================
  {
    id: "habit-loop-architect",
    title: "Habit Loop Architect",
    description:
      "Design a sticky habit with cue-craving-response-reward mechanics, failure modes and a restart protocol.",
    category: "personal-development",
    subcategory: "Habits",
    tasks: ["plan"],
    tags: ["Habits", "Behavior Change", "Atomic Habits", "Systems"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "plan",
    purpose: "Make a good habit automatic",
    transformation: "Wish → Engineered habit loop",
    tone: "Encouraging, practical",
    bestFor: ["Anyone", "Coaches"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "HABIT", label: "The habit you want", required: true },
      { key: "OBSTACLE", label: "Why it hasn't stuck before", required: true },
      { key: "ANCHOR", label: "Existing routine to anchor to", placeholder: "morning coffee" },
    ],
    body: `Act as a behavior-design coach trained on habit formation research.

Habit wanted: {HABIT}
Past obstacle: {OBSTACLE}
Anchor routine: {ANCHOR}

Design:
1. TWO-MINUTE VERSION — the smallest entry point that still counts as doing it.
2. LOOP — cue (anchored to {ANCHOR}), craving statement (make it attractive), response, immediate reward (must land within 60 seconds).
3. ENVIRONMENT DESIGN — 3 physical/digital changes that remove friction from the good path and add friction to the competing behavior.
4. FAILURE MODES — top 3 ways this breaks (including {OBSTACLE}) and the if-then plan for each.
5. RESTART PROTOCOL — missing one day is data, not failure; define the rule that gets me back on day two.
6. TRACKER — a 4-week grid with a leading indicator, not just yes/no.`,
    ageDays: 11,
    usageCount: 3940,
    rating: 4.7,
    ratingCount: 342,
  },
  {
    id: "weekly-reflection-engine",
    title: "Weekly Reflection Engine",
    description:
      "A guided retrospective that turns seven messy days into three lessons and one adjustment.",
    category: "personal-development",
    subcategory: "Reflection",
    tasks: ["extract", "analyze"],
    tags: ["Journaling", "Retrospective", "Self Improvement", "Weekly Review"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "summary",
    purpose: "Learn from your own week deliberately",
    transformation: "Week dump → Insights + one change",
    tone: "Calm, probing",
    bestFor: ["Professionals", "Students", "Anyone"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "WEEK", label: "Brain-dump of your week (events, moods, wins, frustrations)", required: true },
      { key: "FOCUS", label: "Area you're working on", placeholder: "deep work", suggestions: ["deep work", "health", "relationships", "side project"] },
    ],
    body: `Act as a reflective journaling partner. Focus area: {FOCUS}.

My week:
<week>
{WEEK}
</week>

Guide the retro:
1. MIRROR — reflect my week back in 5 bullets, keeping my own words where they matter.
2. ENERGY MAP — what gave energy, what drained it (with counts of mentions).
3. PATTERNS — 2 recurring patterns linking events I treated as unrelated.
4. EVIDENCE VS STORY — one place I'm telling myself a harsher story than the evidence supports; restate it neutrally.
5. THREE LESSONS — each in "When X, I'll Y" form.
6. ONE ADJUSTMENT — the smallest change for next week. Resist giving five.`,
    ageDays: 24,
    usageCount: 2210,
    rating: 4.6,
    ratingCount: 167,
  },
  {
    id: "skill-roadmap-90",
    title: "Skill Roadmap in 90 Days",
    description:
      "A project-based learning plan for any skill with weekly milestones, resources criteria and checkpoints.",
    category: "personal-development",
    subcategory: "Learning",
    tasks: ["plan"],
    tags: ["Learning", "Roadmap", "Skills", "Projects"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "plan",
    purpose: "Learn by building, not binge-watching tutorials",
    transformation: "Skill goal → 13-week project ladder",
    tone: "Coach-like, no fluff",
    bestFor: ["Career Switchers", "Autodidacts"],
    platforms: [...DEFAULT_PLATFORMS, "perplexity"],
    variables: [
      { key: "SKILL", label: "Skill to learn", required: true },
      { key: "START", label: "Current level", placeholder: "can read code, can't write it", suggestions: ["complete beginner", "know basics", "can read code, can't write it", "intermediate wanting depth"] },
      { key: "TIME", label: "Hours per week", placeholder: "6", suggestions: ["3", "6", "10+"] },
    ],
    body: `Act as a learning architect. Target skill: {SKILL}. Starting level: {START}. Time budget: {TIME} h/week.

Build a 90-day roadmap:
1. DESTINATION — define "competent" as one demoable project outcome, not a course certificate.
2. PROJECT LADDER — 3 projects of rising difficulty; each ships something visible and forces the skills below.
3. WEEKLY CADENCE — for each week: focus concept, the smallest exercise that proves understanding, and estimated hours fitting {TIME}.
4. RESOURCE CRITERIA — describe what a good resource looks like (project-based, recent, correct depth); don't fabricate specific links.
5. CHECKPOINTS — weeks 4/8/13: a self-test task that distinguishes real progress from familiarity.
6. TRAP WARNING — the most common way learners plateau at {SKILL}, and how this plan avoids it.`,
    ageDays: 36,
    usageCount: 2870,
    rating: 4.8,
    ratingCount: 203,
  },

  // ================= IMAGE GENERATION =================
  {
    id: "cinematic-photo-forge",
    title: "Cinematic Photo Prompt Forge",
    description:
      "Compose richly specified image-generation prompts: lens, lighting, composition, film stock and mood.",
    category: "image-generation",
    subcategory: "Photography",
    tasks: ["write"],
    tags: ["Midjourney", "Image Prompt", "Photography", "Art Direction"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "image-prompt",
    purpose: "Photoreal images on the first roll",
    transformation: "Scene idea → Fully-specified photo prompt",
    tone: "Visual, precise",
    bestFor: ["Creators", "Marketers", "Designers"],
    platforms: ["chatgpt", "claude", "gemini", "mistral"],
    variables: [
      { key: "SCENE", label: "What should the image show?", required: true },
      { key: "MOOD", label: "Mood", placeholder: "hopeful dawn", suggestions: ["hopeful dawn", "moody noir", "warm nostalgia", "clinical minimalism"] },
      { key: "ASPECT", label: "Aspect ratio", placeholder: "16:9", suggestions: ["16:9", "4:5", "1:1", "21:9"] },
    ],
    body: `You are an art director writing image-model prompts.

Scene: {SCENE}. Mood: {MOOD}. Aspect ratio: {ASPECT}.

Write 3 variations, each a single paragraph covering ALL layers:
- Subject & action · environment & era · composition (shot size, angle, rule placement)
- Lighting (source, direction, quality, color temperature) · color palette (3 colors max)
- Camera language (lens mm, aperture, film stock or digital look) · texture/grain · atmosphere details

Variation 1: photoreal editorial. Variation 2: stylized but grounded. Variation 3: unexpected interpretation that still serves the brief.
End with a negative-prompt line listing artifacts to avoid. No camera-brand names.`,
    ageDays: 14,
    usageCount: 5720,
    rating: 4.8,
    ratingCount: 498,
  },
  {
    id: "logo-brief-generator",
    title: "Logo Brief Generator",
    description:
      "Translate fuzzy branding wishes into a designer-ready logo brief with references and constraints.",
    category: "image-generation",
    subcategory: "Logos",
    tasks: ["brainstorm", "write"],
    tags: ["Logo", "Brief", "Branding", "Design Handoff"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "document",
    purpose: "Better logos through better briefs",
    transformation: "Vague wish → Structured creative brief",
    tone: "Clear, professional",
    bestFor: ["Founders", "Freelancers", "Designers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "BUSINESS", label: "Business name + what it does", required: true },
      { key: "PERSONALITY", label: "Personality words", placeholder: "sturdy, friendly, a bit retro" },
      { key: "AVOID", label: "Things to avoid", placeholder: "gradients, swooshes" },
    ],
    body: `Act as a brand designer writing a logo brief for: {BUSINESS}. Personality: {PERSONALITY}. Hard avoids: {AVOID}.

Produce:
1. CONCEPT DIRECTIONS (3) — each: name, metaphor, one-line rationale, and a text sketch of the mark (geometry, weight, negative space tricks).
2. TYPE PAIRINGS — for each direction, a font character pairing (e.g. "geometric sans + humanist serif"), not specific licensed names.
3. COLOR SYSTEM — primary, secondary, accent with emotional justification; specify light/dark background behavior.
4. LOCKUPS — guidance for horizontal, stacked and icon-only versions.
5. IMAGE PROMPT BRIDGE — convert each direction into a ready-to-run image-generation prompt for quick concept exploration.
Flag anything that will not scale to 16px favicon size.`,
    ageDays: 31,
    usageCount: 2410,
    rating: 4.4,
    ratingCount: 156,
  },
  {
    id: "style-transfer-describer",
    title: "Illustration Style Translator",
    description:
      "Describe any art style precisely enough to reproduce it — then apply it to a new subject.",
    category: "image-generation",
    subcategory: "Illustration",
    tasks: ["convert", "write"],
    tags: ["Style Guide", "Illustration", "Image Prompt", "Art Direction"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "image-prompt",
    purpose: "Consistent style across image generations",
    transformation: "Style reference + subject → Reproducible recipe",
    tone: "Descriptive, exact",
    bestFor: ["Illustrators", "Content Teams"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "STYLE_REF", label: "Describe the reference style (or paste an artist-style description)", required: true },
      { key: "SUBJECT", label: "New subject to render", required: true },
    ],
    body: `You are an illustration director. Style reference: {STYLE_REF}. New subject: {SUBJECT}.

1. STYLE DECONSTRUCTION — break {STYLE_REF} into reproducible parameters: line quality (weight, wobble), shading method (flat/cel/painterly), palette logic (limited? complementary?), proportion exaggerations, texture treatment, edge behavior.
2. STYLE DICTIONARY — a reusable paragraph (<80 words) that encodes the style for any future prompt.
3. APPLICATION PROMPT — apply the dictionary to {SUBJECT}: full image-generation paragraph.
4. CONSISTENCY NOTES — 3 things that quietly drift between generations (e.g. line weight, palette warmth) and the exact words that pin them down.`,
    ageDays: 44,
    usageCount: 1760,
    rating: 4.5,
    ratingCount: 118,
  },

  // ================= VIDEO =================
  {
    id: "youtube-hook-lab",
    title: "YouTube Hook Lab",
    description:
      "Generate ten opening hooks engineered around curiosity gaps, then diagnose why each works.",
    category: "video",
    subcategory: "Hooks",
    tasks: ["write", "brainstorm"],
    tags: ["YouTube", "Hooks", "Retention", "Scripting"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "text",
    purpose: "Stop the scroll in the first 15 seconds",
    transformation: "Video topic → Hook menu + diagnosis",
    tone: "Punchy",
    bestFor: ["YouTubers", "Educators", "Editors"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "TOPIC", label: "Video topic & who it's for", required: true },
      { key: "PAYOFF", label: "What viewers get by the end", required: true },
      { key: "FORMAT", label: "Format", placeholder: "8-minute explainer", suggestions: ["short", "8-minute explainer", "20-minute deep dive", "tutorial"] },
    ],
    body: `Act as a retention editor for a {FORMAT} video.

Topic & audience: {TOPIC}. Payoff: {PAYOFF}.

Write 10 hooks (max 2 spoken sentences each):
- 2× curiosity gap · 2× bold claim (defensible!) · 2× relatable pain · 2× contrarian take · 1× mid-action start · 1× stakes escalation.

For EACH hook add: mechanism (one clause on the psychology), and a B-ROLL/VISUAL cue for the first shot.
Then pick the strongest hook for this audience and explain in 2 sentences why it beats the rest — and what to say in seconds 3–15 to keep them.`,
    ageDays: 6,
    usageCount: 6340,
    rating: 4.7,
    ratingCount: 587,
  },
  {
    id: "storyboard-shot-builder",
    title: "Storyboard Shot Builder",
    description:
      "Convert a finished script into a numbered shot list with framing, movement and b-roll notes.",
    category: "video",
    subcategory: "Storyboards",
    tasks: ["convert", "plan"],
    tags: ["Storyboard", "Shot List", "Production", "Filmmaking"],
    difficulty: "intermediate",
    inputType: "document",
    outputType: "table",
    purpose: "From script to shootable plan",
    transformation: "Script → Numbered shot list",
    tone: "Technical, terse",
    bestFor: ["Creators", "Videographers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "SCRIPT", label: "Paste the narration/script", required: true },
      { key: "GEAR", label: "Setup constraints", placeholder: "talking head + screen recording, one location" },
    ],
    body: `Act as a director of photography. Constraints: {GEAR}.

Script:
<script>
{SCRIPT}
</script>

Produce a shot list table: | # | Timecode est. | Script line | Shot size & angle | Camera move | On-screen action / b-roll | Text overlay |.
Rules:
- Vary shot sizes deliberately; never two identical framings back-to-back longer than 20s.
- Insert cutaway/b-roll at least every 30 seconds of talking.
- Mark the 3 shots needing the most prep with ⚠ and say why.
End with a props/assets checklist aggregated from the list.`,
    ageDays: 27,
    usageCount: 1540,
    rating: 4.5,
    ratingCount: 96,
  },
  {
    id: "longform-to-shorts-condenser",
    title: "Long-form → Shorts Condenser",
    description:
      "Mine a long video transcript for self-contained short-form clips with rewritten punchy openings.",
    category: "video",
    subcategory: "Scripting",
    tasks: ["extract", "rewrite"],
    tags: ["Shorts", "Repurposing", "TikTok", "Editing"],
    difficulty: "beginner",
    inputType: "document",
    outputType: "text",
    purpose: "One long video → many shorts",
    transformation: "Transcript → Clip candidates + rewrites",
    tone: "Energetic",
    bestFor: ["Podcasters", "Educators", "Editors"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "TRANSCRIPT", label: "Video transcript", required: true },
      { key: "PLATFORM", label: "Target platform", placeholder: "TikTok", suggestions: ["TikTok", "YouTube Shorts", "Instagram Reels", "LinkedIn"] },
    ],
    body: `Act as a short-form producer for {PLATFORM}.

Transcript:
<transcript>
{TRANSCRIPT}
</transcript>

1. CLUSTER — find 5 moments that are self-contained insights (they make sense with zero context). Note approximate source lines.
2. For each moment deliver: CAPTION (hook, ≤80 chars), REWRITTEN SCRIPT for ≤45s — restructure so the payoff lands in the first 3 seconds, keep the speaker's voice, cut filler.
3. TEXT-OVERLAY PLAN — the 3 key phrases to burn in.
4. ENDING — a final line that invites follows without begging.
Reject any clip that needs setup longer than one sentence.`,
    ageDays: 16,
    usageCount: 3480,
    rating: 4.6,
    ratingCount: 291,
  },

  // ================= SOCIAL MEDIA =================
  {
    id: "x-thread-architect",
    title: "X Thread Architect",
    description:
      "Rebuild any article or idea into a thread with a scroll-stopping opener and one idea per beat.",
    category: "social-media",
    subcategory: "Threads",
    tasks: ["write", "convert"],
    tags: ["Twitter/X", "Threads", "Copywriting", "Repurposing"],
    difficulty: "beginner",
    inputType: "document",
    outputType: "text",
    purpose: "Threads people finish and repost",
    transformation: "Long-form → Thread beats",
    tone: "Sharp, conversational",
    bestFor: ["Founders", "Writers", "Marketers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "SOURCE", label: "Article / notes / idea", required: true },
      { key: "ANGLE", label: "Angle for THIS audience", placeholder: "practical, for busy PMs" },
      { key: "LENGTH", label: "Max tweets", placeholder: "8", suggestions: ["5", "8", "12"] },
    ],
    body: `Act as a thread writer. Angle: {ANGLE}. Max length: {LENGTH} tweets.

Source material:
<source>
{SOURCE}
</source>

Build the thread:
1. OPENER — 2 options under 200 chars: either a strong claim or a "I did X, here's what happened". No hashtags, no "🧵".
2. BEATS — one idea per tweet, each <240 chars, each ending in a reason to read the next. Cut everything that doesn't serve {ANGLE}.
3. VALUE DENSITY PASS — mark any tweet that's filler; replace with a concrete number, example or mini-framework.
4. CLOSER — recap in one line + soft CTA (reply prompt, not "like & retweet").
Number every tweet. Show character counts.`,
    ageDays: 13,
    usageCount: 4890,
    rating: 4.5,
    ratingCount: 402,
  },
  {
    id: "content-calendar-composer",
    title: "Content Calendar Composer",
    description:
      "Plan a month of platform-fit content from your pillars, with formats, hooks and repurposing built in.",
    category: "social-media",
    subcategory: "Calendars",
    tasks: ["plan"],
    tags: ["Content Calendar", "Planning", "Multi-platform", "Pillars"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "table",
    purpose: "A month of content in one sitting",
    transformation: "Pillars → 4-week calendar",
    tone: "Organized, creative",
    bestFor: ["Solo Creators", "Social Media Managers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "PILLARS", label: "Your 3–5 content pillars", required: true },
      { key: "CHANNELS", label: "Channels", placeholder: "LinkedIn + YouTube Shorts", suggestions: ["LinkedIn only", "X/Twitter + LinkedIn", "LinkedIn + YouTube Shorts", "Instagram + TikTok"] },
      { key: "CADENCE", label: "Posts per week", placeholder: "4", suggestions: ["3", "4", "daily"] },
    ],
    body: `Act as a content strategist. Pillars: {PILLARS}. Channels: {CHANNELS}. Cadence: {CADENCE}/week.

Build a 4-week calendar table: | Date slot | Pillar | Channel | Format | Hook (first line) | CTA | Repurposed from |.
Rules:
- Rotate all pillars; never repeat a pillar twice in a row on the same channel.
- Every week includes: 1 story post, 1 practical/tip post, 1 opinion post.
- One pillar piece per week is created natively; others marked "repurpose" must name their parent piece.
After the table: 3 batch-production tips tailored to {CHANNELS}, and the single metric to watch this month.`,
    ageDays: 21,
    usageCount: 2650,
    rating: 4.6,
    ratingCount: 184,
  },
  {
    id: "linkedin-humanizer",
    title: "LinkedIn Post Humanizer",
    description:
      "Rewrite corporate-speak posts into human stories with specifics — without engagement-bait cringe.",
    category: "social-media",
    tasks: ["rewrite"],
    tags: ["LinkedIn", "Rewriting", "Personal Brand", "Storytelling"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "text",
    purpose: "Sound like a person, not a press release",
    transformation: "Corporate post → Human post",
    tone: "Grounded, candid",
    bestFor: ["Professionals", "Job Seekers", "Founders"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "POST", label: "Your current draft", required: true },
      { key: "CONTEXT", label: "What really happened (the honest backstory)" },
    ],
    body: `Act as a ghostwriter who hates LinkedIn clichés. Rewrite my post.

Draft:
<post>
{POST}
</post>
Honest backstory (optional gold): {CONTEXT}

Rules for the rewrite:
- First line ≤12 words, earns the click without bait.
- Kill: "thrilled to announce", "humbled", "journey", em-dash abuse, hashtag walls, "Let's connect 🚀".
- Replace abstractions with ONE specific detail (number, name of a mistake, minute-by-minute moment).
- Short paragraphs, one idea each. End on a real question people could actually answer.
Give me the rewrite, then a 1-line diff explaining the biggest change you made.`,
    ageDays: 8,
    usageCount: 5610,
    rating: 4.7,
    ratingCount: 468,
  },
];
