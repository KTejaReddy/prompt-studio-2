import { DEFAULT_PLATFORMS, type SeedPrompt } from "../promptTypes";

export const CODING_PROMPTS: SeedPrompt[] = [
  {
    id: "python-security-auditor",
    title: "Python Security Auditor",
    description:
      "Analyze Python code for vulnerabilities, security weaknesses, insecure patterns, and remediation opportunities.",
    category: "coding",
    subcategory: "Code Review",
    tasks: ["review", "analyze", "detect", "recommend"],
    tags: ["Python", "Security", "Code Review", "Audit", "Vulnerabilities"],
    difficulty: "advanced",
    inputType: "code",
    outputType: "report",
    purpose: "Security analysis of source code",
    transformation: "Analyze → Detect → Explain → Recommend",
    tone: "Professional",
    bestFor: ["Developers", "Security Engineers"],
    platforms: ["chatgpt", "claude", "gemini", "deepseek", "grok"],
    variables: [
      { key: "LANGUAGE", label: "Programming Language", placeholder: "Python", suggestions: ["Python", "JavaScript", "TypeScript", "Go"], required: true },
      { key: "STANDARD", label: "Security Standard", placeholder: "OWASP Top 10", suggestions: ["OWASP Top 10", "CWE Top 25", "SANS Top 25"] },
      { key: "EXPERIENCE", label: "Experience Level", placeholder: "intermediate developer", suggestions: ["junior developer", "intermediate developer", "senior engineer"] },
      { key: "CODE", label: "Code to audit", placeholder: "Paste your code here…", required: true },
    ],
    body: `Act as a senior application security engineer reviewing the following {LANGUAGE} code according to {STANDARD}. Assume the reader is an {EXPERIENCE}.

<code>
{CODE}
</code>

Perform a systematic security audit:

1. INVENTORY — List every security-relevant surface you find (input handling, auth, secrets, file I/O, queries, deserialization, network calls).
2. DETECT — Identify concrete vulnerabilities. For each one state: severity (critical / high / medium / low), the exact location, and the attack scenario that exploits it.
3. EXPLAIN — For each finding, explain in plain language why it is dangerous and what data or privilege is at risk.
4. RECOMMEND — Provide a specific fix for every finding. Where practical, show corrected code snippets rather than abstract advice.
5. HARDENING — Suggest up to three proactive improvements beyond immediate bugs.

Constraints:
- Do not invent issues that are not present in the code; if a category is clean, say so explicitly.
- Prefer fewer, well-evidenced findings over speculative ones.
- Keep explanations accessible to a competent but non-security developer.`,
    featured: true,
    ageDays: 210,
    usageCount: 4820,
    rating: 4.9,
    ratingCount: 312,
  },
  {
    id: "universal-code-reviewer",
    title: "Universal Code Reviewer",
    description:
      "A rigorous review of any code for correctness, readability, performance and idiomatic style.",
    category: "coding",
    subcategory: "Code Review",
    tasks: ["review", "improve"],
    tags: ["Code Review", "Quality", "Best Practices"],
    difficulty: "intermediate",
    inputType: "code",
    outputType: "report",
    purpose: "General code quality review",
    transformation: "Read → Assess → Prioritize → Suggest",
    tone: "Constructive",
    bestFor: ["Developers", "Tech Leads"],
    platforms: ["chatgpt", "claude", "gemini", "deepseek", "grok", "copilot", "mistral"],
    variables: [
      { key: "LANGUAGE", label: "Language", placeholder: "e.g. TypeScript" },
      { key: "GOAL", label: "Review focus", placeholder: "e.g. readability before merging" },
      { key: "CODE", label: "Code", placeholder: "Paste code…" },
    ],
    body: `Review the following {LANGUAGE} code as an experienced staff engineer participating in a pull-request review. The author's priority right now is {GOAL}.

<code>
{CODE}
</code>

Structure your review:

1. VERDICT — One paragraph: is this ready, nearly ready, or does it need rework? Why?
2. CORRECTNESS — Bugs, edge cases and unhandled failures, ordered by severity.
3. DESIGN — Naming, structure, duplication, coupling. Only mention changes worth making.
4. PERFORMANCE — Flag only measurable concerns; note the scale at which they matter.
5. STYLE — Idiomatic usage for the language; keep this section brief.

For each point include a short suggested diff or rewrite of the offending lines. Close with the two changes that would most improve the code.`,
    ageDays: 240,
    usageCount: 3911,
    rating: 4.8,
    ratingCount: 268,
  },
  {
    id: "debugging-detective",
    title: "Debugging Detective",
    description:
      "Systematically diagnose a bug from symptoms and code, forming hypotheses and identifying root cause.",
    category: "coding",
    subcategory: "Debugging",
    tasks: ["debug", "diagnose", "fix"],
    tags: ["Debugging", "Root Cause", "Troubleshooting"],
    difficulty: "intermediate",
    inputType: "code",
    outputType: "analysis",
    purpose: "Root-cause analysis of defects",
    transformation: "Observe → Hypothesize → Narrow → Fix",
    tone: "Methodical",
    bestFor: ["Developers", "Support Engineers"],
    platforms: ["chatgpt", "claude", "gemini", "deepseek"],
    variables: [
      { key: "SYMPTOMS", label: "What goes wrong", placeholder: "Error messages, unexpected behavior…" },
      { key: "CODE", label: "Relevant code", placeholder: "Paste code…" },
      { key: "ENVIRONMENT", label: "Environment", placeholder: "Node 20, Postgres 15, Docker…" },
    ],
    body: `Act as a methodical debugging partner. I have a defect I cannot pin down.

Symptoms: {SYMPTOMS}
Environment: {ENVIRONMENT}

<code>
{CODE}
</code>

Work like a detective:

1. RESTATE the failure precisely — what should happen vs. what happens.
2. LIST at least four plausible hypotheses ranked by likelihood, given the evidence.
3. For the top hypothesis, walk through the exact execution path that produces the bug.
4. Propose the cheapest experiment or log line that would confirm or kill each hypothesis.
5. Once confident, give the minimal fix and explain why it addresses the root cause, not just the symptom.

If the provided evidence is genuinely insufficient, say exactly what additional information you need instead of guessing.`,
    ageDays: 190,
    usageCount: 2745,
    rating: 4.7,
    ratingCount: 189,
  },
  {
    id: "sql-query-optimizer",
    title: "SQL Query Optimizer",
    description:
      "Rewrite slow SQL queries with index recommendations and execution-plan reasoning.",
    category: "coding",
    subcategory: "Databases",
    tasks: ["optimize", "rewrite"],
    tags: ["SQL", "Performance", "Databases"],
    difficulty: "advanced",
    inputType: "code",
    outputType: "code",
    purpose: "Database query performance tuning",
    transformation: "Inspect → Diagnose → Rewrite → Index",
    tone: "Technical",
    bestFor: ["Backend Developers", "Data Engineers"],
    platforms: ["chatgpt", "claude", "deepseek", "copilot"],
    variables: [
      { key: "ENGINE", label: "Database engine", suggestions: ["PostgreSQL", "MySQL", "SQLite", "SQL Server"] },
      { key: "QUERY", label: "Slow query" },
      { key: "SCHEMA", label: "Schema / row counts", placeholder: "Tables, columns, approximate sizes" },
    ],
    body: `You are a database performance specialist for {ENGINE}.

Schema context: {SCHEMA}

Problem query:
\`\`\`sql
{QUERY}
\`\`\`

Deliver:
1. DIAGNOSIS — What is likely slow and why (scans, joins, functions on indexed columns, sort spills). Reference how {ENGINE}'s planner treats it.
2. REWRITE — An optimized version with comments explaining each change.
3. INDEXES — Exact CREATE INDEX statements you would add, and the trade-off of each.
4. VALIDATION — How to verify the win (what to look for in EXPLAIN ANALYZE before/after).

Do not change result semantics. If an optimization could alter results subtly (NULL handling, duplicates), call it out explicitly.`,
    ageDays: 160,
    usageCount: 1877,
    rating: 4.6,
    ratingCount: 121,
  },
  {
    id: "api-documentation-generator",
    title: "API Documentation Generator",
    description:
      "Turns endpoints and handlers into clear API docs with parameters, examples and error cases.",
    category: "coding",
    subcategory: "Documentation",
    tasks: ["document", "write"],
    tags: ["API", "Documentation", "OpenAPI"],
    difficulty: "beginner",
    inputType: "code",
    outputType: "documentation",
    purpose: "Generate developer-facing API reference",
    transformation: "Parse → Organize → Illustrate → Format",
    tone: "Clear",
    bestFor: ["Backend Developers", "Technical Writers"],
    platforms: ["chatgpt", "claude", "gemini", "copilot"],
    variables: [
      { key: "FRAMEWORK", label: "Framework", placeholder: "Express, FastAPI, Rails…" },
      { key: "CODE", label: "Route/handler code" },
    ],
    body: `Document the following {FRAMEWORK} routes as professional API reference material.

<code>
{CODE}
</code>

For each endpoint produce:
- Method + path + one-line purpose
- Path/query/body parameters as a table: name, type, required, constraints, default
- A realistic request example
- A success response example with plausible values
- Error responses with status codes and when they occur
- Any rate limits, idempotency or pagination notes implied by the code

Write for an external developer integrating for the first time. Never document behavior the code does not actually implement; flag anything ambiguous as "verify".`,
    ageDays: 120,
    usageCount: 1204,
    rating: 4.5,
    ratingCount: 88,
  },
  {
    id: "regex-explainer-builder",
    title: "Regex Explainer & Builder",
    description:
      "Explains any regular expression piece by piece, or builds one from a plain-English requirement.",
    category: "coding",
    subcategory: "Refactoring",
    tasks: ["explain", "write"],
    tags: ["Regex", "Explanation", "Patterns"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "explanation",
    purpose: "Demystify regular expressions",
    transformation: "Decompose → Annotate → Test → Warn",
    tone: "Friendly",
    bestFor: ["Developers", "Analysts"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "REGEX_OR_NEED", label: "Regex or plain-English need" },
      { key: "FLAVOR", label: "Regex flavor", suggestions: ["JavaScript", "Python", "PCRE", "POSIX"] },
    ],
    body: `I will give you either a regex or a plain-English matching need, working in the {FLAVOR} flavor.

Input: {REGEX_OR_NEED}

If it is a regex:
1. Translate it into English phrase-by-phrase, annotating each token.
2. Give five example strings that match and three near-misses that do not, with reasons.
3. Warn about catastrophic backtracking or subtle pitfalls.

If it is a plain-English need:
1. State any assumptions about the format.
2. Provide the regex with inline comments per component.
3. Show the same match/near-miss table plus one test snippet.`,
    ageDays: 95,
    usageCount: 986,
    rating: 4.6,
    ratingCount: 64,
  },
  {
    id: "refactoring-advisor",
    title: "Refactoring Advisor",
    description:
      "Proposes safe, incremental refactors for messy code with step-by-step migration order.",
    category: "coding",
    subcategory: "Refactoring",
    tasks: ["refactor", "improve"],
    tags: ["Refactoring", "Clean Code", "Architecture"],
    difficulty: "advanced",
    inputType: "code",
    outputType: "plan",
    purpose: "Improve structure without breaking behavior",
    transformation: "Assess → Sequence → Refactor → Verify",
    tone: "Pragmatic",
    bestFor: ["Senior Developers", "Architects"],
    platforms: ["chatgpt", "claude", "deepseek", "copilot"],
    variables: [
      { key: "PAIN_POINT", label: "Biggest pain today", placeholder: "e.g. adding features touches five files" },
      { key: "CODE", label: "Code" },
    ],
    body: `Act as a pragmatic refactoring coach. The team's main pain with this code: {PAIN_POINT}

<code>
{CODE}
</code>

Produce a refactoring plan:
1. SMELLS — Name concrete design problems (not stylistic nits) with line references.
2. TARGET — Sketch the improved shape after refactoring; justify why it relieves the stated pain.
3. SEQUENCE — Order refactorings as small, individually-safe steps (extract function/module, introduce parameter object, etc.). Each step must keep tests green.
4. SAFETY NET — Which characterization tests to write first, and what each protects.
5. EFFORT — Rough size of each step (minutes / hours / days).

Refuse big-bang rewrites. Every suggestion must be executable incrementally by a small team.`,
    ageDays: 75,
    usageCount: 812,
    rating: 4.7,
    ratingCount: 57,
  },
];
