import { DEFAULT_PLATFORMS, type SeedPrompt } from "../promptTypes";

export const BUSINESS_MARKETING_FINANCE_LEGAL_PROMPTS: SeedPrompt[] = [
  // ---------------- Business ----------------
  {
    id: "swot-analyst",
    title: "SWOT Analyst",
    description:
      "Produces an honest SWOT analysis with evidence, prioritization and strategic implications.",
    category: "business",
    subcategory: "Strategy",
    tasks: ["analyze", "evaluate"],
    tags: ["SWOT", "Strategy", "Business Analysis"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "report",
    purpose: "Strategic self-assessment",
    transformation: "Gather → Sort → Prioritize → Imply",
    tone: "Candid advisor",
    bestFor: ["Founders", "Managers", "Consultants"],
    platforms: ["chatgpt", "claude", "gemini", "copilot"],
    variables: [
      { key: "SUBJECT", label: "Company / product / situation", required: true },
      { key: "CONTEXT", label: "Context & known facts" },
      { key: "GOAL", label: "Strategic goal" },
    ],
    body: `Perform a SWOT analysis of {SUBJECT} toward this goal: {GOAL}. Known context: {CONTEXT}

Rules of engagement:
1. FACTS FIRST — Base every entry on the provided context or clearly label it an assumption worth verifying.
2. STRENGTHS & WEAKNESSES — Internal factors only; OPPORTUNITIES & THREATS — external only. No misfiled items.
3. PRIORITIZE — Mark the single most decisive item in each quadrant with ★ and justify the pick in one line.
4. CROSS-INSIGHTS — Derive three SO/WO strategies (use strength to seize opportunity; fix weakness blocking opportunity).
5. RED TEAM — Name the one belief in this analysis most likely to be wrong.

Keep it under 600 words. Executives read the starred items first.`,
    ageDays: 185,
    usageCount: 2980,
    rating: 4.6,
    ratingCount: 187,
  },
  {
    id: "executive-summary-writer",
    title: "Executive Summary Writer",
    description:
      "Compresses long reports into a one-page executive summary built around decisions, not details.",
    category: "business",
    subcategory: "Reporting",
    tasks: ["summarize", "rewrite"],
    tags: ["Executive Summary", "Reporting", "Communication"],
    difficulty: "intermediate",
    inputType: "document",
    outputType: "summary",
    purpose: "Decision-maker briefing",
    transformation: "Distill → Frame → Quantify → Recommend",
    tone: "Boardroom-crisp",
    bestFor: ["Analysts", "Managers", "Consultants"],
    platforms: ["chatgpt", "copilot", "claude", "gemini"],
    variables: [
      { key: "REPORT", label: "Full report / document", required: true },
      { key: "DECISION_NEEDED", label: "Decision the reader must make" },
    ],
    body: `Write a one-page executive summary of the document below. The reader's decision: {DECISION_NEEDED}

<document>
{REPORT}
</document>

Structure:
1. BOTTOM LINE — Two sentences: situation + recommendation. Written first, read first.
2. KEY NUMBERS — Up to five figures that drive the decision, each with its source section.
3. WHAT CHANGED — Why now; what moved since the last review if inferable.
4. OPTIONS CONSIDERED — One line per option with its fatal flaw or cost.
5. RISKS & MITIGATIONS — Top two risks with concrete mitigations.
6. ASK — Exactly what you need from the reader (approval, budget, introduction).

Never exceed one page. Cut every sentence a busy executive would skip.`,
    ageDays: 155,
    usageCount: 2470,
    rating: 4.7,
    ratingCount: 158,
  },
  {
    id: "decision-matrix-evaluator",
    title: "Decision Matrix Evaluator",
    description:
      "Turns a hard choice into a weighted decision matrix with sensitivity analysis.",
    category: "business",
    subcategory: "Decision Making",
    tasks: ["compare", "evaluate", "recommend"],
    tags: ["Decisions", "Matrix", "Prioritization"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "table",
    purpose: "Structured option comparison",
    transformation: "Criteria → Weight → Score → Stress-test",
    tone: "Analytical",
    bestFor: ["Anyone stuck between options"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "DECISION", label: "The decision" },
      { key: "OPTIONS", label: "Options being weighed" },
      { key: "CRITERIA_HINTS", label: "What matters most to you" },
    ],
    body: `Help me decide: {DECISION}. Options: {OPTIONS}. What matters to me: {CRITERIA_HINTS}

Build a weighted decision matrix:
1. CRITERIA — 4–6 criteria derived from my stated priorities plus any you'd add; justify additions briefly.
2. WEIGHTS — Assign weights summing to 100; show your reasoning in one line each so I can adjust.
3. MATRIX — Score each option 1–10 per criterion with a short justification per cell (no unexplained numbers).
4. RESULT — Weighted totals, stated plainly.
5. SENSITIVITY — Which criterion change would flip the winner? State the flip point.
6. GUT CHECK — What the matrix cannot see (reversibility, regret, learning value) in three bullets.`,
    ageDays: 115,
    usageCount: 1980,
    rating: 4.6,
    ratingCount: 112,
  },
  {
    id: "business-model-reviewer",
    title: "Business Model Reviewer",
    description:
      "Stress-tests a business model across value proposition, channels, margins and failure modes.",
    category: "business",
    subcategory: "Strategy",
    tasks: ["analyze", "critique"],
    tags: ["Business Model", "Strategy", "Startups"],
    difficulty: "advanced",
    inputType: "text",
    outputType: "report",
    purpose: "Find the weakest load-bearing wall",
    transformation: "Map → Question → Quantify → Rank",
    tone: "Direct investor",
    bestFor: ["Founders", "Angel Investors", "Strategy Teams"],
    platforms: ["chatgpt", "claude", "gemini", "deepseek"],
    variables: [{ key: "MODEL_DESCRIPTION", label: "Business model description", required: true }],
    body: `Act as a skeptical early-stage investor reviewing this business model: {MODEL_DESCRIPTION}

Deliver:
1. MODEL ON ONE LINE — Customer, problem, solution, why they pay, how money scales.
2. UNIT ECONOMICS SENSE-CHECK — List every assumption behind revenue per user and cost per user; mark which are stated vs inferred, and which are heroic.
3. THE KILLER QUESTION — The single question whose answer most changes the outcome.
4. FAILURE MODES — Three most likely ways this dies (no demand / wrong channel / margin collapse / dependency risk…), ranked, with the earliest warning signal of each.
5. STRONGEST ASSET — What genuinely compounds here if it works.
Be candid; flattery wastes founder time. If information is missing, name it as a bet rather than assuming the best case.`,
    ageDays: 125,
    usageCount: 1520,
    rating: 4.5,
    ratingCount: 89,
  },
  {
    id: "pricing-strategy-advisor",
    title: "Pricing Strategy Advisor",
    description:
      "Designs pricing tiers using value metrics, willingness-to-pay logic and packaging psychology.",
    category: "business",
    subcategory: "Strategy",
    tasks: ["design", "recommend"],
    tags: ["Pricing", "Monetization", "SaaS"],
    difficulty: "advanced",
    inputType: "text",
    outputType: "plan",
    purpose: "Monetization design",
    transformation: "Segment → Metric → Package → Test",
    tone: "Commercial",
    bestFor: ["Founders", "Product Managers"],
    platforms: ["chatgpt", "claude", "copilot"],
    variables: [
      { key: "PRODUCT", label: "Product & current pricing" },
      { key: "CUSTOMERS", label: "Customer segments" },
      { key: "CONSTRAINTS", label: "Constraints", placeholder: "e.g. can't lose existing customers" },
    ],
    body: `Advise on pricing. Product/status quo: {PRODUCT}. Segments: {CUSTOMERS}. Constraints: {CONSTRAINTS}

Produce:
1. VALUE METRIC — The unit customers intuitively feel scaling with value (seats, contacts, runs, docs). Argue the top choice and runner-up.
2. THREE TIERS — For each: target segment, price anchor rationale, included/excluded capabilities that make upgrades feel natural (not crippled).
3. PSYCHOLOGY NOTES — Anchoring, decoy placement, annual-discount framing — applied concretely, not textbook-generic.
4. MIGRATION RISK — How existing users experience the change and the goodwill-preserving move.
5. TEST PLAN — The cheapest experiment to validate willingness-to-pay within four weeks.`,
    ageDays: 70,
    usageCount: 940,
    rating: 4.6,
    ratingCount: 51,
  },

  // ---------------- Marketing ----------------
  {
    id: "marketing-campaign-planner",
    title: "Marketing Campaign Planner",
    description:
      "Builds a full campaign plan: audience insight, messaging pillars, channel mix, calendar and KPIs.",
    category: "marketing",
    subcategory: "Campaigns",
    tasks: ["plan", "design"],
    tags: ["Campaign", "Go-to-Market", "Planning"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "plan",
    purpose: "Coordinated campaign execution",
    transformation: "Audience → Message → Channels → Measure",
    tone: "Practical strategist",
    bestFor: ["Marketers", "Founders", "Growth Teams"],
    platforms: ["chatgpt", "claude", "gemini", "copilot"],
    variables: [
      { key: "PRODUCT", label: "Product / offer", required: true },
      { key: "AUDIENCE", label: "Target audience" },
      { key: "BUDGET_ENERGY", label: "Budget / effort level", suggestions: ["Bootstrap", "Moderate", "Funded"] },
    ],
    body: `Plan a marketing campaign. Offer: {PRODUCT}. Audience: {AUDIENCE}. Resources: {BUDGET_ENERGY}

Deliver:
1. AUDIENCE TRUTH — The anxiety or desire this offer resolves, phrased in the audience's own words.
2. POSITIONING LINE — One sentence: for whom, against what alternative, with what proof.
3. MESSAGE PILLARS — Three pillars max; each with a headline example and why it lands.
4. CHANNEL PLAN — 2–4 channels ranked for this resource level, with the first action per channel and expected cost shape.
5. TWO-WEEK CALENDAR — Day-by-day launch sequence (tease → launch → proof → amplify).
6. MEASUREMENT — One primary KPI, two guardrail metrics, and the weekly checkpoint question.`,
    featured: true,
    ageDays: 165,
    usageCount: 2740,
    rating: 4.6,
    ratingCount: 173,
  },
  {
    id: "ad-copy-lab",
    title: "Ad Copy Lab",
    description:
      "Generates testable ad variants across angles and formats, each grounded in a distinct persuasion angle.",
    category: "marketing",
    subcategory: "Ad Copy",
    tasks: ["write", "brainstorm"],
    tags: ["Ads", "Copywriting", "A/B Testing"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "copy",
    purpose: "High-variance ad creative",
    transformation: "Angle → Hook → Variant → Testable",
    tone: "Punchy",
    bestFor: ["Performance Marketers", "Founders"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "PRODUCT", label: "Product & audience" },
      { key: "PLATFORM_STYLE", label: "Ad platform", suggestions: ["Google Search", "Meta", "LinkedIn", "TikTok"] },
      { key: "VARIANT_COUNT", label: "Variants", placeholder: "6" },
    ],
    body: `Create {VARIANT_COUNT} distinct ad variants for {PLATFORM_STYLE}. Product/audience: {PRODUCT}

Rules:
- Each variant uses a DIFFERENT persuasion angle (pain relief, aspiration, social proof, contrarian claim, comparison, urgency) — no reworded duplicates.
- Follow {PLATFORM_STYLE} format conventions exactly (headline lengths, CTA norms).
- Every variant includes: hook line, primary text ≤ 90 words, CTA button suggestion.
- Add a one-line note per variant: the hypothesis it tests ("this audience responds to X more than Y").
Finish with the pairing you would A/B test first and why.`,
    ageDays: 135,
    usageCount: 2310,
    rating: 4.5,
    ratingCount: 141,
  },
  {
    id: "seo-content-brief",
    title: "SEO Content Brief",
    description:
      "Creates a complete content brief writers can execute: search intent, outline, entities, internal links.",
    category: "marketing",
    subcategory: "SEO",
    tasks: ["outline", "research"],
    tags: ["SEO", "Content Brief", "Search Intent"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "brief",
    purpose: "Rank-worthy content planning",
    transformation: "Intent → Outline → Entities → Differentiate",
    tone: "Editorial",
    bestFor: ["SEO Specialists", "Writers"],
    platforms: ["chatgpt", "perplexity", "claude", "gemini"],
    variables: [
      { key: "KEYWORD_TOPIC", label: "Keyword / topic" },
      { key: "AUDIENCE_SITE", label: "Site & audience context" },
    ],
    body: `Write an SEO content brief for "{KEYWORD_TOPIC}". Site context: {AUDIENCE_SITE}

Sections:
1. SEARCH INTENT — Classify (informational / commercial / transactional) and describe the job behind the query; note intent mismatches to avoid.
2. READER PROMISE — What someone should accomplish by the end; the "search satisfaction" moment.
3. OUTLINE — H2/H3 skeleton covering subtopics searchers expect plus two they don't know to ask.
4. ENTITIES & TERMS — Concepts and vocabulary the piece must include naturally (not keyword stuffing).
5. FORMATS TO INCLUDE — Table/comparison/steps/FAQ based on what the SERP rewards for this intent.
6. DIFFERENTIATOR — The angle our page owns that generic competitors lack.
7. INTERNAL LINKS — Anchor text ideas tied to our site context.
Flag anything requiring fresh data verification rather than model memory.`,
    ageDays: 105,
    usageCount: 1680,
    rating: 4.4,
    ratingCount: 92,
  },
  {
    id: "landing-page-copywriter",
    title: "Landing Page Copywriter",
    description:
      "Writes converting landing page copy section by section, from hero to objection handling to close.",
    category: "marketing",
    subcategory: "Campaigns",
    tasks: ["write"],
    tags: ["Landing Page", "Conversion", "Copywriting"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "copy",
    purpose: "Page copy that converts",
    transformation: "Promise → Proof → Objections → Action",
    tone: "Clear, confident",
    bestFor: ["Marketers", "Indie Founders"],
    platforms: ["chatgpt", "claude", "gemini"],
    variables: [
      { key: "OFFER", label: "Offer & differentiator" },
      { key: "AUDIENCE", label: "Audience & traffic source" },
    ],
    body: `Write landing page copy. Offer: {OFFER}. Audience arriving from: {AUDIENCE}

Section-by-section:
1. HERO — Headline (outcome, ≤10 words), subhead (mechanism + for whom), primary CTA text.
2. SOCIAL PROOF BAR — Placeholder slots describing exactly which proof to place (logos, metric, quote type).
3. PROBLEM→SOLUTION — Two short blocks naming the pain in audience language, then how the offer removes it.
4. FEATURE BENEFITS — Three features translated into felt benefits, each ≤ 20 words.
5. OBJECTION HANDLING — Top three objections with honest answers (price, trust, switching cost).
6. FINAL CLOSE — Risk-reversal line + repeat CTA with urgency only if truthful.

Ban: "revolutionary", "seamless", "unlock the power". Write like a confident human explaining something useful.`,
    ageDays: 88,
    usageCount: 1420,
    rating: 4.5,
    ratingCount: 84,
  },

  // ---------------- Finance ----------------
  {
    id: "personal-budget-auditor",
    title: "Personal Budget Auditor",
    description:
      "Reviews spending data, finds leaks, and proposes a realistic budget aligned to your priorities.",
    category: "finance",
    subcategory: "Personal Finance",
    tasks: ["analyze", "recommend", "plan"],
    tags: ["Budgeting", "Personal Finance", "Money"],
    difficulty: "beginner",
    inputType: "data",
    outputType: "report",
    purpose: "Take control of spending",
    transformation: "Categorize → Diagnose → Right-size → Automate",
    tone: "Non-judgmental coach",
    bestFor: ["Anyone with a spreadsheet of expenses"],
    platforms: ["chatgpt", "claude", "gemini", "copilot"],
    variables: [
      { key: "INCOME", label: "Monthly income" },
      { key: "EXPENSES", label: "Expenses / transactions" },
      { key: "PRIORITIES", label: "Money goals", placeholder: "e.g. emergency fund, travel" },
    ],
    body: `Audit my budget without judgment. Income: {INCOME}. Goals: {PRIORITIES}. Expenses:

{EXPENSES}

Deliver:
1. SNAPSHOT — Fixed vs variable vs irregular spending shares; savings rate.
2. LEAK FINDER — Three spending patterns that quietly cost the most annually (show the math ×12).
3. ALIGNED BUDGET — Category targets summing to income using a priority-based split (goals funded before lifestyle creep), noting what each trade-off protects.
4. AUTOMATION MOVES — Transfers/rules that make the plan survive bad weeks.
5. FIRST 30 DAYS — The three changes with highest impact-per-willpower spent.
Use ranges where numbers are estimates. Never shame past choices; optimize forward.`,
    ageDays: 95,
    usageCount: 1180,
    rating: 4.4,
    ratingCount: 66,
  },

  // ---------------- Legal ----------------
  {
    id: "legal-clause-extractor",
    title: "Legal Clause Extractor & Risk Flagging",
    description:
      "Extracts key clauses from contracts and legal documents, flags risky terms, and summarizes exposure in plain language.",
    category: "legal",
    subcategory: "Contract Analysis",
    tasks: ["extract", "analyze", "flag"],
    tags: ["Legal", "Contracts", "Risk", "PDF", "Clauses"],
    difficulty: "advanced",
    inputType: "pdf",
    outputType: "structured-report",
    purpose: "Rapid contract triage",
    transformation: "Extract → Classify → Flag → Summarize",
    tone: "Precise, plain-language",
    bestFor: ["Founders", "Freelancers", "Ops Managers"],
    platforms: ["claude", "chatgpt", "gemini", "copilot"],
    variables: [
      { key: "DOCUMENT", label: "Contract / legal document text", required: true },
      { key: "OUR_POSITION", label: "Our position", placeholder: "e.g. we are the contractor providing services" },
    ],
    body: `Analyze the following legal document from our position: {OUR_POSITION}

<document>
{DOCUMENT}
</document>

Part 1 — CLAUSE INVENTORY
Extract every material clause into a table: Clause type (payment, termination, liability, IP, confidentiality, indemnity, non-compete, governing law, auto-renewal, data protection…) | Section reference | Summary in plain English | Obligation holder (us / them / both).

Part 2 — RISK FLAGS
For each clause that creates meaningful exposure: severity (high / medium / low), the specific scenario where it hurts us, and the market-standard alternative we could request instead.

Part 3 — MISSING BUT EXPECTED
List standard protections absent from the document (e.g., limitation of liability cap, notice period for termination).

Part 4 — NEGOTIATION SHORTLIST
The three amendments with the best risk-reduction-per-friction, each phrased as a proposed redline sentence.

Rules: quote exact language when flagging; never invent clauses; add a note that this is informational analysis, not legal advice.`,
    featured: true,
    ageDays: 130,
    usageCount: 2050,
    rating: 4.8,
    ratingCount: 127,
  },
];
