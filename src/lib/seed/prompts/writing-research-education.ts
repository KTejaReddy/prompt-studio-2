import { DEFAULT_PLATFORMS, type SeedPrompt } from "../promptTypes";

export const WRITING_RESEARCH_EDUCATION_PROMPTS: SeedPrompt[] = [
  // ---------------- Writing ----------------
  {
    id: "blog-post-architect",
    title: "Blog Post Architect",
    description:
      "Plans and writes an SEO-aware blog post with a strong hook, clear structure and a memorable close.",
    category: "writing",
    subcategory: "Blogging",
    tasks: ["write", "outline"],
    tags: ["Blog", "SEO", "Content"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "article",
    purpose: "Publishable long-form articles",
    transformation: "Angle → Outline → Draft → Polish",
    tone: "Engaging",
    bestFor: ["Content Marketers", "Founders"],
    platforms: ["chatgpt", "claude", "gemini", "copilot"],
    variables: [
      { key: "TOPIC", label: "Topic", required: true },
      { key: "AUDIENCE", label: "Audience", placeholder: "e.g. first-time founders" },
      { key: "TONE", label: "Tone", suggestions: ["Conversational", "Authoritative", "Witty"] },
      { key: "LENGTH", label: "Approx. length", suggestions: ["800 words", "1200 words", "2000 words"] },
    ],
    body: `Write a blog post about {TOPIC} for {AUDIENCE}. Tone: {TONE}. Target length ≈ {LENGTH}.

Process:
1. ANGLE — Choose one specific, non-generic angle on the topic; state it in a sentence before drafting.
2. OUTLINE — 4–6 H2 sections, each with a one-line promise to the reader.
3. DRAFT — Open with a hook grounded in a concrete scenario or number. Use short paragraphs, examples over adjectives, and one idea per paragraph.
4. CLOSE — End with a single actionable takeaway.

Constraints:
- No filler openings like "In today's fast-paced world".
- Prefer concrete verbs; cut hedges ("might", "perhaps") unless uncertainty is the point.
- Include one original analogy the reader could repeat to a colleague.`,
    featured: true,
    ageDays: 300,
    usageCount: 3560,
    rating: 4.7,
    ratingCount: 241,
  },
  {
    id: "ai-humanizer",
    title: "AI Humanizer",
    description:
      "Rewrites robotic AI-sounding text so it reads naturally, with human rhythm and voice.",
    category: "writing",
    subcategory: "Editing",
    tasks: ["rewrite", "humanize"],
    tags: ["Humanize", "Rewriting", "Voice"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "text",
    purpose: "Natural-sounding prose",
    transformation: "Detect → Vary → Ground → Trim",
    tone: "Natural",
    bestFor: ["Anyone publishing AI drafts"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "TEXT", label: "Text to humanize", required: true },
      { key: "VOICE", label: "Desired voice", placeholder: "e.g. warm expert friend" },
    ],
    body: `Rewrite the text below so it reads as if a thoughtful human wrote it. Voice: {VOICE}.

<original>
{TEXT}
</original>

Rules:
1. Break monotonous sentence rhythm — vary length deliberately; allow a rare fragment for emphasis.
2. Replace inflated phrasing ("utilize", "leverage", "in order to") with plain verbs.
3. Remove listy parallelism where prose flows better; keep lists only when items are truly enumerable.
4. Cut every sentence that only restates the previous one.
5. Keep all facts, names and numbers exactly as given — never invent content.

Return only the rewritten text.`,
    ageDays: 140,
    usageCount: 5120,
    rating: 4.8,
    ratingCount: 402,
  },
  {
    id: "line-editor-prose-polisher",
    title: "Line Editor & Prose Polisher",
    description:
      "A demanding line edit that tightens prose, fixes logic gaps and preserves the author's voice.",
    category: "writing",
    subcategory: "Editing",
    tasks: ["edit", "improve"],
    tags: ["Editing", "Style", "Clarity"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "text",
    purpose: "Publication-ready prose",
    transformation: "Read → Diagnose → Edit → Justify",
    tone: "Precise",
    bestFor: ["Writers", "Newsletter Authors"],
    platforms: ["chatgpt", "claude", "gemini"],
    variables: [
      { key: "DRAFT", label: "Draft" },
      { key: "PRIORITY", label: "Edit priority", suggestions: ["Clarity", "Brevity", "Persuasion"] },
    ],
    body: `Act as a sharp line editor. Priority for this pass: {PRIORITY}.

<draft>
{DRAFT}
</draft>

Deliver in this order:
1. DIAGNOSIS — Three sentences maximum on the draft's biggest weaknesses.
2. EDITED TEXT — The full edited version. Preserve voice and meaning; change sentences only when it earns its keep.
3. CHANGE LOG — A table of the five most consequential edits: before → after → why.
4. If any claim is unsupported or logic jumps, mark it inline with [?] rather than fixing silently.`,
    ageDays: 110,
    usageCount: 1655,
    rating: 4.6,
    ratingCount: 97,
  },
  {
    id: "story-structure-coach",
    title: "Story Structure Coach",
    description:
      "Develops narratives with solid arcs — for fiction, case studies or brand stories.",
    category: "writing",
    subcategory: "Storytelling",
    tasks: ["outline", "improve"],
    tags: ["Storytelling", "Narrative", "Structure"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "outline",
    purpose: "Compelling narrative arcs",
    transformation: "Premise → Stakes → Arc → Beats",
    tone: "Creative",
    bestFor: ["Writers", "Screenwriters", "Marketers"],
    platforms: ["chatgpt", "claude", "gemini"],
    variables: [
      { key: "PREMISE", label: "Story premise or draft" },
      { key: "MEDIUM", label: "Medium", suggestions: ["Short story", "Novel chapter", "Case study", "Brand film"] },
    ],
    body: `You are a story editor with years in a writers' room. Medium: {MEDIUM}.

Material: {PREMISE}

Help me develop it:
1. SPINE — State the story in one sentence: protagonist, want, obstacle, stakes.
2. ARC MAP — Beat sheet of 7–9 beats (setup, inciting incident, rising complications, midpoint reversal, crisis, climax, resolution) with one line each.
3. PRESSURE TEST — Where does tension sag? Name the beat and propose two ways to raise stakes.
4. VOICE NOTE — One concrete stylistic suggestion to make the telling distinctive.
Ask me nothing; make reasonable assumptions and note them at the end.`,
    ageDays: 85,
    usageCount: 943,
    rating: 4.5,
    ratingCount: 61,
  },
  {
    id: "press-release-writer",
    title: "Press Release Writer",
    description:
      "Writes journalist-ready press releases: inverted pyramid, quotable lines, zero hype.",
    category: "writing",
    subcategory: "Copywriting",
    tasks: ["write"],
    tags: ["PR", "Announcements", "Media"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "document",
    purpose: "Media announcements",
    transformation: "News → Pyramid → Quote → Boilerplate",
    tone: "Professional",
    bestFor: ["Comms Teams", "Founders"],
    platforms: ["chatgpt", "copilot", "gemini", "claude"],
    variables: [
      { key: "NEWS", label: "What is being announced" },
      { key: "COMPANY_FACTS", label: "Company facts / quotes" },
    ],
    body: `Write a press release about {NEWS} using these company facts and quotes: {COMPANY_FACTS}

Format (classic inverted pyramid):
- HEADLINE — Factual, under 90 characters, no clickbait.
- SUBHEAD — One sentence adding the "so what".
- LEDE — First paragraph answers who/what/when/where/why in ≤ 45 words.
- BODY — Two or three short paragraphs in descending importance.
- QUOTE — One quote that sounds spoken, not written; attribute clearly.
- BOILERPLATE — Two-sentence standard description.

Ban list: "revolutionary", "game-changing", "delighted to announce". A busy journalist should grasp the story from headline plus lede alone.`,
    ageDays: 60,
    usageCount: 704,
    rating: 4.4,
    ratingCount: 39,
  },

  // ---------------- Research ----------------
  {
    id: "research-paper-to-notes",
    title: "Research Paper → Simple Notes",
    description:
      "Turns dense research papers into plain-language notes anyone can understand, without losing accuracy.",
    category: "research",
    subcategory: "Summarization",
    tasks: ["summarize", "explain", "convert"],
    tags: ["Papers", "Notes", "Summarization", "Academic"],
    difficulty: "intermediate",
    inputType: "pdf",
    outputType: "notes",
    purpose: "Make academic literature accessible",
    transformation: "Extract → Simplify → Structure → Verify",
    tone: "Plain-language",
    bestFor: ["Students", "Engineers tracking research", "Curious readers"],
    platforms: ["chatgpt", "claude", "gemini", "perplexity", "deepseek"],
    variables: [
      { key: "PAPER", label: "Paper text or file content", required: true },
      { key: "DEPTH", label: "Depth", suggestions: ["TL;DR", "Standard notes", "Deep dive"] },
    ],
    body: `Convert the following research paper into clear study notes at {DEPTH} depth.

<paper>
{PAPER}
</paper>

Produce notes with exactly these sections:

1. IN ONE PARAGRAPH — What problem the paper solves and the core result, in language a smart non-specialist follows.
2. WHY IT MATTERS — The gap before this work and what becomes possible after.
3. HOW IT WORKS — Method walkthrough step by step; define jargon the moment it appears.
4. KEY RESULTS — Main findings with actual numbers from the paper.
5. LIMITATIONS — What the authors concede plus anything they gloss over.
6. QUESTIONS I SHOULD ASK — Three probing questions about validity or applicability.

Rules: never invent numbers or citations; if a section is absent from the paper write "not addressed". Keep every technical term defined on first use.`,
    featured: true,
    ageDays: 175,
    usageCount: 4210,
    rating: 4.9,
    ratingCount: 288,
  },
  {
    id: "literature-review-scaffold",
    title: "Literature Review Scaffold",
    description:
      "Organizes a pile of papers into a thematic literature review structure with synthesis, not summaries.",
    category: "research",
    subcategory: "Literature Review",
    tasks: ["analyze", "synthesize", "outline"],
    tags: ["Literature Review", "Academia", "Synthesis"],
    difficulty: "advanced",
    inputType: "document",
    outputType: "document",
    purpose: "Academic literature synthesis",
    transformation: "Cluster → Contrast → Synthesize → Position",
    tone: "Scholarly",
    bestFor: ["Grad Students", "Researchers"],
    platforms: ["claude", "chatgpt", "gemini"],
    variables: [
      { key: "FIELD", label: "Field / topic" },
      { key: "PAPERS", label: "Paper abstracts or notes" },
    ],
    body: `Act as an academic supervisor helping structure a literature review on {FIELD}.

Source material: {PAPERS}

Build the scaffold:
1. THEMES — Cluster the material into 3–5 themes by argument or finding, not chronology. Name each theme as a claim ("X improves Y", not "papers about X").
2. MAP — Under each theme: which sources agree, which disagree, and the precise point of disagreement.
3. GAPS — What no source addresses; distinguish "unexplored" from "contested".
4. NARRATIVE ORDER — The paragraph sequence for the review that builds toward the gap your research fills.
5. SENTENCE STARTERS — Five synthesis phrases ("While X established…, Y demonstrated…") to avoid list-style writing.`,
    ageDays: 130,
    usageCount: 1380,
    rating: 4.6,
    ratingCount: 84,
  },
  {
    id: "fact-checker",
    title: "Rigorous Fact Checker",
    description:
      "Verifies claims in a text, separating confirmed facts from shaky ones and stating what evidence would settle each.",
    category: "research",
    subcategory: "Fact Checking",
    tasks: ["verify", "analyze"],
    tags: ["Fact Checking", "Verification", "Critical Thinking"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "report",
    purpose: "Claim verification triage",
    transformation: "Extract → Classify → Evidence → Verdict",
    tone: "Skeptical but fair",
    bestFor: ["Editors", "Analysts", "Students"],
    platforms: ["perplexity", "chatgpt", "claude", "gemini"],
    variables: [{ key: "TEXT", label: "Text containing claims", required: true }],
    body: `Extract every checkable factual claim from the text below, then assess each.

<text>
{TEXT}
</text>

Output a numbered claim table:
| # | Claim | Type (statistic / attribution / causal / prediction) | Confidence | What evidence would confirm or refute it |

Then:
1. Flag the three claims most likely to be wrong or misleading, explaining the specific weakness (source missing, correlation vs causation, cherry-picked timeframe).
2. List claims you cannot assess without external data — do not pretend certainty either way.
3. Rewrite the two weakest sentences into defensible versions.`,
    ageDays: 100,
    usageCount: 1120,
    rating: 4.5,
    ratingCount: 72,
  },
  {
    id: "competitor-research-brief",
    title: "Competitor Research Brief",
    description:
      "Structures competitor intelligence into a decision-ready brief: positioning, strengths, exploitable gaps.",
    category: "research",
    subcategory: "Study Design",
    tasks: ["analyze", "compare", "recommend"],
    tags: ["Competitive Analysis", "Strategy", "Market Research"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "report",
    purpose: "Understand competitive landscape",
    transformation: "Profile → Compare → Gap-hunt → Recommend",
    tone: "Analytical",
    bestFor: ["Founders", "Product Managers", "Marketers"],
    platforms: ["perplexity", "chatgpt", "claude", "gemini"],
    variables: [
      { key: "COMPETITORS", label: "Competitors to analyze" },
      { key: "OUR_PRODUCT", label: "Our product / context" },
      { key: "FOCUS", label: "Decision this informs", placeholder: "e.g. pricing page redesign" },
    ],
    body: `Produce a competitive research brief. Competitors: {COMPETITORS}. Our context: {OUR_PRODUCT}. This brief will inform: {FOCUS}.

Sections:
1. LANDSCAPE SNAPSHOT — One paragraph: how these players segment the market.
2. PER-COMPONENT PROFILES — For each competitor: positioning statement (theirs, inferred), target customer, pricing model, signature strength, visible weakness.
3. COMPARISON MATRIX — Rows = dimensions relevant to the decision ({FOCUS}); columns = competitors. Fill with facts; use "unknown" honestly.
4. EXPLOITABLE GAPS — Three gaps we could own, ranked by feasibility, each with the evidence for the gap.
5. IMPLICATIONS — What we should do differently because of this analysis, tied to the decision at hand.

Prefer verifiable specifics over adjectives. If information is missing, say what to look up where.`,
    featured: true,
    ageDays: 150,
    usageCount: 2260,
    rating: 4.7,
    ratingCount: 143,
  },

  // ---------------- Education ----------------
  {
    id: "pdf-exam-question-generator",
    title: "PDF Study Guide & Exam Question Generator",
    description:
      "Reads study material and produces a revision guide plus difficult exam questions with model answers.",
    category: "education",
    subcategory: "Exam Prep",
    tasks: ["summarize", "extract", "quiz"],
    tags: ["PDF", "Exam", "Study", "Questions", "Revision"],
    difficulty: "intermediate",
    inputType: "pdf",
    outputType: "questions",
    purpose: "Turn study material into exam readiness",
    transformation: "Digest → Prioritize → Quiz → Grade-rubric",
    tone: "Academic but clear",
    bestFor: ["Students", "Teachers", "Certification Candidates"],
    platforms: ["chatgpt", "claude", "gemini", "deepseek"],
    variables: [
      { key: "MATERIAL", label: "Study material / PDF content", required: true },
      { key: "EXAM_STYLE", label: "Exam style", suggestions: ["University final", "High school", "Professional certification"] },
      { key: "QUESTION_COUNT", label: "Number of questions", placeholder: "25" },
    ],
    body: `I am preparing for an {EXAM_STYLE}-style exam. Study material:

<material>
{MATERIAL}
</material>

Part 1 — REVISION GUIDE
- The 10 concepts most likely to be examined, ranked, each with a two-sentence refresher.
- A "common traps" list: distinctions students confuse (A vs B), sign errors, off-by-one ideas.

Part 2 — EXAM PAPER ({QUESTION_COUNT} questions)
- 60% applied questions requiring reasoning, 25% tricky multiple-choice with plausible distractors, 15% multi-step problems.
- Tag each question with the concept it tests and difficulty (easy / medium / hard).
- After the paper, provide full model answers AND a marking rubric showing where partial credit is earned.

Do not test trivia that the guide did not cover. Every question must be answerable from the provided material alone.`,
    featured: true,
    ageDays: 195,
    usageCount: 5340,
    rating: 4.9,
    ratingCount: 377,
  },
  {
    id: "concept-explainer",
    title: "Any-Concept Explainer",
    description:
      "Explains any concept with layered analogies, then checks understanding with a quick self-test.",
    category: "education",
    subcategory: "Explainers",
    tasks: ["explain"],
    tags: ["Explanation", "Learning", "Analogies"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "explanation",
    purpose: "Genuine understanding of a concept",
    transformation: "Anchor → Explain → Extend → Check",
    tone: "Warm, patient teacher",
    bestFor: ["Learners", "Parents", "Career Switchers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "CONCEPT", label: "Concept to explain", required: true },
      { key: "LEVEL", label: "Learner level", suggestions: ["curious kid", "high school", "adult beginner", "professional from another field"] },
    ],
    body: `Explain {CONCEPT} to me as if I were a {LEVEL}.

Structure:
1. THE ONE-LINER — The idea in a single memorable sentence.
2. ANALOGY FIRST — Start from something my everyday experience already contains; map each part of the analogy to the real thing explicitly.
3. THE ACTUAL MECHANISM — Now explain how it really works, referring back to the analogy where it helps and noting where the analogy breaks.
4. WORKED MICRO-EXAMPLE — A tiny concrete instance walked through end-to-end.
5. THREE-QUESTION SELF-TEST — Questions that would reveal real understanding (not recall). Put answers upside-down at the very bottom.

Keep total length under 500 words. No jargon without immediate definition.`,
    featured: true,
    ageDays: 220,
    usageCount: 4670,
    rating: 4.8,
    ratingCount: 331,
  },
  {
    id: "quiz-generator",
    title: "Quiz Generator",
    description:
      "Creates adaptive quizzes from any topic or notes, adjusting difficulty based on your answers.",
    category: "education",
    subcategory: "Quizzing",
    tasks: ["quiz", "assess"],
    tags: ["Quiz", "Testing", "Practice"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "questions",
    purpose: "Active-recall practice",
    transformation: "Probe → Adapt → Explain → Track",
    tone: "Encouraging coach",
    bestFor: ["Students", "Self-learners", "Teams training"],
    platforms: ["chatgpt", "claude", "gemini", "deepseek"],
    variables: [
      { key: "TOPIC_OR_NOTES", label: "Topic or notes", required: true },
      { key: "START_LEVEL", label: "Starting level", suggestions: ["easy", "medium", "hard"] },
    ],
    body: `Quiz me interactively on: {TOPIC_OR_NOTES}. Begin at {START_LEVEL} difficulty.

Rules of engagement:
1. Ask ONE question at a time. Wait for my answer before continuing.
2. Mix formats across questions: open reasoning, multiple choice with plausible distractors, true/false with a twist, fill-the-gap.
3. After each answer: grade strictly, show the ideal answer in two sentences, give one memory hook for the underlying fact.
4. Adapt: two correct in a row → harder; two wrong → easier and add a hint next time.
5. Every five questions, print a mini scoreboard: topics mastered, topics wobbling, and which one we drill next.

Never reveal the answer before I attempt. Finish after ten questions with a summary of what to review.`,
    ageDays: 170,
    usageCount: 3890,
    rating: 4.7,
    ratingCount: 245,
  },
  {
    id: "flashcard-maker",
    title: "Flashcard Maker (Spaced Repetition Ready)",
    description:
      "Converts notes into atomic question/answer flashcards optimized for spaced repetition apps.",
    category: "education",
    subcategory: "Flashcards",
    tasks: ["convert", "extract"],
    tags: ["Flashcards", "Memorization", "Anki"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "flashcards",
    purpose: "Durable memorization",
    transformation: "Atomize → Questionize → Tag → Sequence",
    tone: "Neutral",
    bestFor: ["Students", "Language Learners", "Med students"],
    platforms: ["chatgpt", "claude", "deepseek"],
    variables: [
      { key: "NOTES", label: "Source notes", required: true },
      { key: "CARD_LIMIT", label: "Max cards", placeholder: "30" },
    ],
    body: `Convert these notes into flashcards for spaced repetition. Source:

<notes>
{NOTES}
</notes>

Rules:
- One fact per card, maximum {CARD_LIMIT} cards.
- Each card: FRONT = precise question (not "What about X?" — ask something answerable), BACK = minimal answer, plus a mnemonic when the fact is arbitrary.
- Prefer cards that test understanding ("Why does X cause Y?") over pure recall where the material allows.
- Tag each card: [core] essential, [detail] supporting, [trap] commonly-confused distinction.
- Output as a markdown table: Front | Back | Tag.

End with the five cards I should review first, chosen for highest exam-or-real-life payoff.`,
    ageDays: 145,
    usageCount: 2140,
    rating: 4.6,
    ratingCount: 156,
  },
  {
    id: "lesson-plan-designer",
    title: "Lesson Plan Designer",
    description:
      "Designs engaging lesson plans with timing, activities, checks for understanding and differentiation.",
    category: "education",
    subcategory: "Lesson Planning",
    tasks: ["plan", "design"],
    tags: ["Teaching", "Lesson Plan", "Pedagogy"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "plan",
    purpose: "Classroom-ready lessons",
    transformation: "Objectives → Sequence → Activities → Assess",
    tone: "Practical educator",
    bestFor: ["Teachers", "Trainers", "Workshop Facilitators"],
    platforms: ["chatgpt", "claude", "gemini", "copilot"],
    variables: [
      { key: "TOPIC", label: "Lesson topic", required: true },
      { key: "LEARNERS", label: "Learners", placeholder: "e.g. 9th grade, mixed ability, 24 students" },
      { key: "DURATION", label: "Duration", placeholder: "50 minutes" },
    ],
    body: `Design a lesson plan.

Topic: {TOPIC}
Learners: {LEARNERS}
Duration: {DURATION}

Include:
1. OBJECTIVES — 2–3 measurable objectives ("students will be able to…"), achievable within the time.
2. MINUTE-BY-MINUTE FLOW — Timed segments: hook, input, guided practice, independent practice, closure. Name the activity and its purpose per segment.
3. CHECKS FOR UNDERSTANDING — Specific moments and techniques (mini-whiteboards, cold call with think-time, exit ticket) with the exact question you will ask.
4. DIFFERENTIATION — One support scaffold and one stretch extension.
5. MATERIALS LIST and the biggest timing risk with a plan B.

Assume ordinary classroom constraints; nothing that requires special equipment.`,
    ageDays: 90,
    usageCount: 1290,
    rating: 4.5,
    ratingCount: 78,
  },
];
