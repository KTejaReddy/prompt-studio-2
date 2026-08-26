#!/usr/bin/env node
/**
 * Push schema + curated seed data to a Turso database via SQL-over-HTTP.
 *
 * Usage: node scripts/seed-turso.mjs
 *
 * Reads TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from .env.local or process.env.
 */
import fs from "node:fs";
import path from "node:path";

// ── Load env vars from .env.local ───────────────────────────────────────────
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const DB_URL = process.env.TURSO_DATABASE_URL;
const DB_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!DB_URL || !DB_TOKEN) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const HTTP_URL = DB_URL.replace("libsql://", "https://");
const AUTH_HEADER = { Authorization: `Bearer ${DB_TOKEN}` };

// ── Execute a batch of SQL statements via the Turso pipeline API ────────────
async function execBatch(sqls, label) {
  const requests = [
    ...sqls.map((sql) => ({ type: "execute", stmt: { sql } })),
    { type: "close" },
  ];
  const t0 = Date.now();
  const res = await fetch(`${HTTP_URL}/v2/pipeline`, {
    method: "POST",
    headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });
  const data = await res.json();
  const ms = Date.now() - t0;
  const errors = data.results?.filter((r) => r.type === "error") ?? [];
  if (errors.length > 0) {
    console.error(`[${label}] ${errors.length} errors:`, errors.slice(0, 3));
    return false;
  }
  console.log(`[${label}] OK (${ms}ms, ${sqls.length} stmts)`);
  return true;
}

// ── Schema ──────────────────────────────────────────────────────────────────
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#F4572E',
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  PRIMARY KEY (id, category_id)
);
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#472B52',
  note TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  tasks TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  difficulty TEXT NOT NULL DEFAULT 'intermediate',
  prompt_text TEXT NOT NULL,
  variables TEXT NOT NULL DEFAULT '[]',
  input_type TEXT NOT NULL DEFAULT 'text',
  output_type TEXT NOT NULL DEFAULT 'text',
  purpose TEXT,
  transformation TEXT,
  tone TEXT,
  best_for TEXT NOT NULL DEFAULT '[]',
  platforms TEXT NOT NULL DEFAULT '[]',
  platform_adaptations TEXT NOT NULL DEFAULT '{}',
  quality_score REAL NOT NULL DEFAULT 0.8,
  usage_count INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  author TEXT NOT NULL DEFAULT 'Promptly Editorial',
  status TEXT NOT NULL DEFAULT 'published',
  source TEXT NOT NULL DEFAULT 'seed',
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  search_text TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_featured ON prompts(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompts_usage ON prompts(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_rating ON prompts(rating DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_created ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_quality ON prompts(quality_score DESC) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_prompts_pub_usage ON prompts(usage_count DESC) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_prompts_pub_rating ON prompts(rating DESC) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_prompts_pub_created ON prompts(created_at DESC) WHERE status='published';
CREATE VIRTUAL TABLE IF NOT EXISTS prompts_fts USING fts5(id UNINDEXED, text);
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  steps TEXT NOT NULL DEFAULT '[]',
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  author TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS commands (
  cmd TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  intent_patch TEXT NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  prompt_id TEXT,
  outcome TEXT,
  meta TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type, created_at DESC);
`;

// ── Curated seed data (inline to avoid TS imports) ─────────────────────────
const CATEGORIES = [
  { id: "coding", name: "Coding & Development", icon: "💻", color: "#61DAFB", subcategories: ["Code Generation", "Code Review", "Debugging", "Refactoring", "Architecture", "Documentation", "Testing", "DevOps"] },
  { id: "writing", name: "Writing & Content", icon: "✍️", color: "#FF6B6B", subcategories: ["Blog Posts", "Copywriting", "Creative Writing", "Technical Writing", "Social Media", "Email", "Speeches", "Storytelling"] },
  { id: "research", name: "Research & Analysis", icon: "🔍", color: "#4ECDC4", subcategories: ["Literature Review", "Market Research", "Data Analysis", "Competitive Analysis", "Academic Research", "Trend Analysis", "Surveys", "Synthesis"] },
  { id: "education", name: "Education & Learning", icon: "📚", color: "#FFE66D", subcategories: ["Lesson Plans", "Course Design", "Quiz Generation", "Study Guides", "Tutoring", "Assessment", "Curriculum", "Flashcards"] },
  { id: "business", name: "Business & Strategy", icon: "💼", color: "#A8E6CF", subcategories: ["Strategy", "Planning", "Pitch Decks", "Business Plans", "Pricing", "Partnerships", "Fundraising", "OKRs"] },
  { id: "marketing", name: "Marketing & SEO", icon: "📣", color: "#FF8A5B", subcategories: ["SEO", "Content Marketing", "Ads", "Email Marketing", "Branding", "Social Media", "Analytics", "Conversion"] },
  { id: "finance", name: "Finance & Legal", icon: "💰", color: "#FFD93D", subcategories: ["Financial Modeling", "Budgeting", "Tax Planning", "Contracts", "Compliance", "Investment", "Accounting", "Legal Research"] },
  { id: "productivity", name: "Productivity & Organization", icon: "⚡", color: "#C3B1E1", subcategories: ["Task Management", "Habit Tracking", "Goal Setting", "Time Management", "Note Taking", "Project Planning", "Decision Making", "Prioritization"] },
  { id: "data", name: "Data & Analytics", icon: "📊", color: "#00D2FF", subcategories: ["SQL Queries", "Data Visualization", "Statistical Analysis", "Machine Learning", "ETL", "Dashboarding", "Forecasting", "Reporting"] },
  { id: "creative", name: "Creative & Media", icon: "🎨", color: "#FF69B4", subcategories: ["Image Generation", "Video Scripts", "Podcast", "Music", "Design", "Photography", "UI/UX", "Presentation"] },
  { id: "career", name: "Career & Personal", icon: "🎯", color: "#7B68EE", subcategories: ["Resume", "Interview Prep", "Networking", "Personal Brand", "Mentorship", "Work-Life Balance", "Leadership", "Public Speaking"] },
  { id: "health", name: "Health & Wellness", icon: "🏥", color: "#20B2AA", subcategories: ["Fitness", "Nutrition", "Mental Health", "Sleep", "Meditation", "Medical Research", "Wellness Plans", "Habit Formation"] },
];

const PLATFORMS = [
  { id: "chatgpt", name: "ChatGPT", color: "#10A37F", note: "OpenAI's conversational AI" },
  { id: "claude", name: "Claude", color: "#D97706", note: "Anthropic's AI assistant" },
  { id: "gemini", name: "Gemini", color: "#4285F4", note: "Google's AI model" },
  { id: "copilot", name: "GitHub Copilot", color: "#6E40C9", note: "AI pair programmer" },
  { id: "midjourney", name: "Midjourney", color: "#5865F2", note: "AI image generation" },
  { id: "dalle", name: "DALL·E", color: "#10A37F", note: "OpenAI image generation" },
  { id: "stable-diffusion", name: "Stable Diffusion", color: "#A855F7", note: "Open-source image generation" },
  { id: "perplexity", name: "Perplexity", color: "#20B2AA", note: "AI-powered search" },
];

const COMMANDS = [
  { cmd: "/find", label: "Find Prompts", description: "Search the prompt library", intentPatch: { mode: "find" } },
  { cmd: "/generate", label: "Generate Prompt", description: "Generate a new prompt from description", intentPatch: { mode: "generate" } },
  { cmd: "/explore", label: "Explore Categories", description: "Browse prompts by category", intentPatch: { mode: "explore" } },
  { cmd: "/recent", label: "Recent Prompts", description: "Show recently added prompts", intentPatch: { mode: "recent" } },
  { cmd: "/top", label: "Top Prompts", description: "Show highest-rated prompts", intentPatch: { mode: "top" } },
];

const WORKFLOWS = [
  { id: "wf-code-review", name: "Code Review Workflow", description: "Comprehensive code review process", category: "coding", steps: ["Analyze code structure", "Check for bugs", "Review style", "Suggest improvements"], usageCount: 150, isFeatured: true },
  { id: "wf-blog-post", name: "Blog Post Creation", description: "End-to-end blog post workflow", category: "writing", steps: ["Research topic", "Create outline", "Write draft", "Edit and polish", "SEO optimize"], usageCount: 200, isFeatured: true },
  { id: "wf-data-analysis", name: "Data Analysis Pipeline", description: "From raw data to insights", category: "data", steps: ["Clean data", "Explore patterns", "Visualize", "Interpret", "Report"], usageCount: 120, isFeatured: false },
];

// ── Build seed prompt data (curated, inline) ───────────────────────────────
function daysAgoIso(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function buildSearchText(p) {
  return [p.title, p.title, p.description, p.subcategory || "", p.tags.join(" "), p.tasks.join(" "), p.purpose || "", p.bestFor.join(" "), (p.promptText || "").slice(0, 240)].join(" ").toLowerCase();
}

// A representative set of curated prompts covering all categories
const CURATED_PROMPTS = [
  { id: "code-review-1", title: "Expert Code Reviewer", description: "Thorough code review with actionable feedback", category: "coding", subcategory: "Code Review", tasks: ["review", "feedback"], tags: ["code-review", "quality"], difficulty: "advanced", promptText: "You are an expert code reviewer. Review the following code and provide:\n1. Bugs or potential issues\n2. Performance concerns\n3. Security vulnerabilities\n4. Code style improvements\n5. Architecture suggestions\n\nCode:\n{{code}}", variables: ["code"], inputType: "code", outputType: "text", purpose: "Review code for quality and issues", bestFor: ["Developers", "Tech leads"], platforms: ["chatgpt", "claude"], usageCount: 3200, rating: 4.8, ratingCount: 450, featured: true, ageDays: 90 },
  { id: "code-gen-1", title: "Function Generator", description: "Generate clean, well-documented functions", category: "coding", subcategory: "Code Generation", tasks: ["generate", "document"], tags: ["code-generation", "functions"], difficulty: "intermediate", promptText: "Write a {{language}} function that {{description}}. Include:\n- Clear function signature with types\n- Documentation comments\n- Error handling\n- Example usage", variables: ["language", "description"], inputType: "text", outputType: "code", purpose: "Generate production-ready functions", bestFor: ["Developers"], platforms: ["chatgpt", "claude", "copilot"], usageCount: 4100, rating: 4.7, ratingCount: 520, featured: true, ageDays: 85 },
  { id: "debug-1", title: "Bug Detective", description: "Systematic debugging assistant", category: "coding", subcategory: "Debugging", tasks: ["debug", "diagnose"], tags: ["debugging", "troubleshooting"], difficulty: "intermediate", promptText: "Help me debug this issue. I'll provide the error message and relevant code. Walk me through systematic debugging steps:\n\nError: {{error}}\nCode:\n{{code}}\n\nExpected behavior: {{expected}}\nActual behavior: {{actual}}", variables: ["error", "code", "expected", "actual"], inputType: "code", outputType: "text", purpose: "Debug issues systematically", bestFor: ["Developers"], platforms: ["chatgpt", "claude"], usageCount: 2800, rating: 4.6, ratingCount: 380, featured: false, ageDays: 80 },
  { id: "blog-post-1", title: "Engaging Blog Writer", description: "Write compelling blog posts with SEO optimization", category: "writing", subcategory: "Blog Posts", tasks: ["write", "seo"], tags: ["blog", "seo", "content"], difficulty: "intermediate", promptText: "Write a 1500-word blog post about {{topic}} for {{audience}}. Include:\n- Catchy headline with target keyword: {{keyword}}\n- Hook introduction\n- Subheadings with H2/H3 tags\n- Actionable takeaways\n- SEO meta description\n- Internal linking suggestions", variables: ["topic", "audience", "keyword"], inputType: "text", outputType: "text", purpose: "Create engaging, SEO-friendly blog content", bestFor: ["Content marketers", "Bloggers"], platforms: ["chatgpt", "claude"], usageCount: 5200, rating: 4.9, ratingCount: 680, featured: true, ageDays: 95 },
  { id: "email-1", title: "Professional Email Composer", description: "Craft clear, professional emails", category: "writing", subcategory: "Email", tasks: ["compose", "professional"], tags: ["email", "professional", "communication"], difficulty: "beginner", promptText: "Write a professional email to {{recipient}} about {{purpose}}. Tone: {{tone}}. Include a clear subject line, concise body, and appropriate call to action.", variables: ["recipient", "purpose", "tone"], inputType: "text", outputType: "text", purpose: "Compose professional emails", bestFor: ["Professionals", "Managers"], platforms: ["chatgpt", "claude"], usageCount: 3800, rating: 4.5, ratingCount: 420, featured: false, ageDays: 70 },
  { id: "market-research-1", title: "Market Research Analyst", description: "Comprehensive market analysis framework", category: "research", subcategory: "Market Research", tasks: ["analyze", "market"], tags: ["market-research", "analysis"], difficulty: "advanced", promptText: "Conduct a market research analysis for {{industry}} targeting {{audience}}. Cover:\n1. Market size and growth trends\n2. Key competitors and positioning\n3. Customer pain points\n4. Opportunities and threats\n5. Recommended strategies", variables: ["industry", "audience"], inputType: "text", outputType: "text", purpose: "Conduct thorough market research", bestFor: ["Entrepreneurs", "Product managers"], platforms: ["chatgpt", "claude", "perplexity"], usageCount: 2100, rating: 4.7, ratingCount: 290, featured: false, ageDays: 75 },
  { id: "lesson-plan-1", title: "Lesson Plan Creator", description: "Design engaging lesson plans for any subject", category: "education", subcategory: "Lesson Plans", tasks: ["design", "teach"], tags: ["education", "teaching", "planning"], difficulty: "intermediate", promptText: "Create a {{duration}} lesson plan for {{subject}} targeting {{grade}} students. Include:\n- Learning objectives\n- Materials needed\n- Warm-up activity\n- Main instruction\n- Hands-on activity\n- Assessment method\n- Homework extension", variables: ["duration", "subject", "grade"], inputType: "text", outputType: "text", purpose: "Design effective lesson plans", bestFor: ["Teachers", "Tutors"], platforms: ["chatgpt", "claude"], usageCount: 1800, rating: 4.6, ratingCount: 250, featured: false, ageDays: 65 },
  { id: "business-plan-1", title: "Business Plan Architect", description: "Create comprehensive business plans", category: "business", subcategory: "Business Plans", tasks: ["plan", "strategy"], tags: ["business", "planning", "startup"], difficulty: "advanced", promptText: "Create a business plan for {{business_idea}}. Target market: {{target_market}}. Include:\n1. Executive summary\n2. Value proposition\n3. Revenue model\n4. Go-to-market strategy\n5. Financial projections (3 years)\n6. Risk assessment\n7. Key milestones", variables: ["business_idea", "target_market"], inputType: "text", outputType: "text", purpose: "Build comprehensive business plans", bestFor: ["Entrepreneurs", "Founders"], platforms: ["chatgpt", "claude"], usageCount: 2400, rating: 4.8, ratingCount: 340, featured: true, ageDays: 88 },
  { id: "seo-1", title: "SEO Content Optimizer", description: "Optimize content for search engines", category: "marketing", subcategory: "SEO", tasks: ["optimize", "seo"], tags: ["seo", "content", "optimization"], difficulty: "intermediate", promptText: "Optimize the following content for SEO targeting keyword: {{keyword}}. Provide:\n1. Title tag and meta description\n2. Header structure (H1-H3)\n3. Keyword density recommendations\n4. Internal/external linking suggestions\n5. Schema markup ideas\n6. Content improvements\n\nContent:\n{{content}}", variables: ["keyword", "content"], inputType: "text", outputType: "text", purpose: "Optimize content for search rankings", bestFor: ["Marketers", "Content creators"], platforms: ["chatgpt", "claude", "perplexity"], usageCount: 3100, rating: 4.7, ratingCount: 410, featured: false, ageDays: 72 },
  { id: "data-analysis-1", title: "SQL Query Builder", description: "Generate optimized SQL queries from natural language", category: "data", subcategory: "SQL Queries", tasks: ["query", "sql"], tags: ["sql", "database", "data"], difficulty: "intermediate", promptText: "Write an optimized SQL query for: {{description}}\n\nSchema:\n{{schema}}\n\nRequirements:\n- Use proper indexing hints\n- Include explanation of the query logic\n- Suggest performance optimizations\n- Handle edge cases", variables: ["description", "schema"], inputType: "text", outputType: "code", purpose: "Generate efficient SQL queries", bestFor: ["Data analysts", "Backend developers"], platforms: ["chatgpt", "claude", "copilot"], usageCount: 2900, rating: 4.8, ratingCount: 370, featured: true, ageDays: 60 },
  { id: "resume-1", title: "Resume Optimizer", description: "Optimize resume for ATS and impact", category: "career", subcategory: "Resume", tasks: ["optimize", "resume"], tags: ["resume", "career", "ats"], difficulty: "intermediate", promptText: "Review and optimize my resume for a {{job_title}} position at {{company}}. Focus on:\n1. ATS-friendly formatting\n2. Quantified achievements\n3. Relevant keyword optimization\n4. Strong action verbs\n5. Skills alignment\n\nCurrent resume:\n{{resume}}", variables: ["job_title", "company", "resume"], inputType: "text", outputType: "text", purpose: "Optimize resumes for job applications", bestFor: ["Job seekers", "Career changers"], platforms: ["chatgpt", "claude"], usageCount: 4500, rating: 4.9, ratingCount: 610, featured: true, ageDays: 50 },
  { id: "creative-1", title: "Image Prompt Master", description: "Create detailed AI image generation prompts", category: "creative", subcategory: "Image Generation", tasks: ["generate", "image"], tags: ["image-generation", "midjourney", "dalle"], difficulty: "intermediate", promptText: "Create a detailed image generation prompt for: {{description}}. Include:\n- Subject and composition\n- Lighting and mood\n- Art style and medium\n- Camera angle and lens\n- Color palette\n- Quality modifiers\n\nPlatform: {{platform}}", variables: ["description", "platform"], inputType: "text", outputType: "text", purpose: "Generate effective AI image prompts", bestFor: ["Designers", "Artists"], platforms: ["midjourney", "dalle", "stable-diffusion"], usageCount: 3600, rating: 4.7, ratingCount: 490, featured: true, ageDays: 55 },
  { id: "fitness-1", title: "Workout Plan Generator", description: "Create personalized workout routines", category: "health", subcategory: "Fitness", tasks: ["plan", "fitness"], tags: ["fitness", "workout", "health"], difficulty: "beginner", promptText: "Create a {{duration}} workout plan for {{goal}}. Experience level: {{level}}. Equipment: {{equipment}}. Include:\n- Warm-up\n- Main exercises with sets/reps\n- Cool-down\n- Rest periods\n- Progression plan", variables: ["duration", "goal", "level", "equipment"], inputType: "text", outputType: "text", purpose: "Generate personalized fitness plans", bestFor: ["Fitness enthusiasts", "Personal trainers"], platforms: ["chatgpt", "claude"], usageCount: 1900, rating: 4.5, ratingCount: 260, featured: false, ageDays: 45 },
];

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Connecting to: ${HTTP_URL}`);
  console.log("");

  // 1. Push schema
  const schemaStmts = SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s + ";");
  const ok = await execBatch(schemaStmts, "schema");
  if (!ok) {
    console.error("Schema creation failed!");
    process.exit(1);
  }

  // 1b. Drop FTS triggers so prompt inserts don't fire stale triggers
  await execBatch([
    "DROP TRIGGER IF EXISTS prompts_fts_insert",
    "DROP TRIGGER IF EXISTS prompts_fts_delete",
    "DROP TRIGGER IF EXISTS prompts_fts_update",
    "DELETE FROM prompts",
    "DELETE FROM prompts_fts",
  ], "cleanup");

  // 2. Seed categories + subcategories
  const catStmts = [];
  CATEGORIES.forEach((c, i) => {
    catStmts.push({
      sql: `INSERT OR IGNORE INTO categories (id, name, icon, color, sort) VALUES (?, ?, ?, ?, ?)`,
      args: [c.id, c.name, c.icon, c.color, i],
    });
    c.subcategories.forEach((name) => {
      catStmts.push({
        sql: `INSERT OR IGNORE INTO subcategories (id, category_id, name) VALUES (?, ?, ?)`,
        args: [name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), c.id, name],
      });
    });
  });

  const catRequests = [
    ...catStmts.map(({ sql, args }) => ({
      type: "execute",
      stmt: { sql, args: args.map((a) => ({ type: typeof a === "number" ? "integer" : "text", value: typeof a === "number" ? String(a) : a })) },
    })),
    { type: "close" },
  ];
  {
    const res = await fetch(`${HTTP_URL}/v2/pipeline`, {
      method: "POST",
      headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: catRequests }),
    });
    const data = await res.json();
    const errs = data.results?.filter((r) => r.type === "error") ?? [];
    if (errs.length > 0) console.error("[categories] errors:", errs.length);
    else console.log(`[categories] OK (${CATEGORIES.length} categories seeded)`);
  }

  // 3. Seed platforms
  const platRequests = [
    ...PLATFORMS.map((p, i) => ({
      type: "execute",
      stmt: {
        sql: `INSERT OR IGNORE INTO platforms (id, name, color, note, sort) VALUES (?, ?, ?, ?, ?)`,
        args: [
          { type: "text", value: p.id },
          { type: "text", value: p.name },
          { type: "text", value: p.color },
          { type: "text", value: p.note },
          { type: "integer", value: String(i) },
        ],
      },
    })),
    { type: "close" },
  ];
  {
    const res = await fetch(`${HTTP_URL}/v2/pipeline`, {
      method: "POST",
      headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: platRequests }),
    });
    const data = await res.json();
    const errs = data.results?.filter((r) => r.type === "error") ?? [];
    if (errs.length > 0) console.error("[platforms] errors:", errs.length);
    else console.log(`[platforms] OK (${PLATFORMS.length} platforms seeded)`);
  }

  // 4. Seed commands
  const cmdRequests = [
    ...COMMANDS.map((c) => ({
      type: "execute",
      stmt: {
        sql: `INSERT OR IGNORE INTO commands (cmd, label, description, intent_patch) VALUES (?, ?, ?, ?)`,
        args: [
          { type: "text", value: c.cmd },
          { type: "text", value: c.label },
          { type: "text", value: c.description },
          { type: "text", value: JSON.stringify(c.intentPatch) },
        ],
      },
    })),
    { type: "close" },
  ];
  {
    const res = await fetch(`${HTTP_URL}/v2/pipeline`, {
      method: "POST",
      headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: cmdRequests }),
    });
    const data = await res.json();
    const errs = data.results?.filter((r) => r.type === "error") ?? [];
    if (errs.length > 0) console.error("[commands] errors:", errs.length);
    else console.log(`[commands] OK (${COMMANDS.length} commands seeded)`);
  }

  // 5. Seed curated prompts (batched)
  const BATCH = 10;
  let promptCount = 0;
  for (let i = 0; i < CURATED_PROMPTS.length; i += BATCH) {
    const batch = CURATED_PROMPTS.slice(i, i + BATCH);
    const promptRequests = [];
    for (const seed of batch) {
      const created = daysAgoIso(seed.ageDays);
      const searchText = buildSearchText(seed);
      promptRequests.push({
        type: "execute",
        stmt: {
          sql: `INSERT OR IGNORE INTO prompts (id, title, description, category, subcategory, tasks, tags, difficulty, prompt_text, variables, input_type, output_type, purpose, transformation, tone, best_for, platforms, platform_adaptations, quality_score, usage_count, rating, rating_count, author, status, source, is_featured, created_at, updated_at, search_text) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          args: [
            { type: "text", value: seed.id },
            { type: "text", value: seed.title },
            { type: "text", value: seed.description },
            { type: "text", value: seed.category },
            { type: "text", value: seed.subcategory || "" },
            { type: "text", value: JSON.stringify(seed.tasks) },
            { type: "text", value: JSON.stringify(seed.tags) },
            { type: "text", value: seed.difficulty },
            { type: "text", value: seed.promptText },
            { type: "text", value: JSON.stringify(seed.variables) },
            { type: "text", value: seed.inputType },
            { type: "text", value: seed.outputType },
            { type: "text", value: seed.purpose || "" },
            { type: "text", value: "" },
            { type: "text", value: "" },
            { type: "text", value: JSON.stringify(seed.bestFor) },
            { type: "text", value: JSON.stringify(seed.platforms) },
            { type: "text", value: "{}" },
            { type: "float", value: Math.min(0.99, 0.55 + (seed.rating / 5) * 0.35) },
            { type: "integer", value: String(seed.usageCount) },
            { type: "float", value: seed.rating },
            { type: "integer", value: String(seed.ratingCount) },
            { type: "text", value: "Promptly Editorial" },
            { type: "text", value: "published" },
            { type: "text", value: "seed" },
            { type: "integer", value: seed.featured ? "1" : "0" },
            { type: "text", value: created },
            { type: "text", value: created },
            { type: "text", value: searchText },
          ],
        },
      });
      // Also insert into FTS
      promptRequests.push({
        type: "execute",
        stmt: {
          sql: `INSERT OR IGNORE INTO prompts_fts (id, text) VALUES (?, ?)`,
          args: [
            { type: "text", value: seed.id },
            { type: "text", value: searchText },
          ],
        },
      });
    }
    promptRequests.push({ type: "close" });

    const res = await fetch(`${HTTP_URL}/v2/pipeline`, {
      method: "POST",
      headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: promptRequests }),
    });
    const data = await res.json();
    const errs = data.results?.filter((r) => r.type === "error") ?? [];
    if (errs.length > 0) {
      console.error(`[prompts batch ${i}-${i + batch.length}] ${errs.length} errors:`, errs[0]);
    }
    promptCount += batch.length;
  }
  console.log(`[prompts] OK (${promptCount} curated prompts seeded)`);

  // 6. Seed workflows
  const wfRequests = [
    ...WORKFLOWS.map((w) => ({
      type: "execute",
      stmt: {
        sql: `INSERT OR IGNORE INTO workflows (id, name, description, category, steps, usage_count, is_featured, author, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          { type: "text", value: w.id },
          { type: "text", value: w.name },
          { type: "text", value: w.description },
          { type: "text", value: w.category || "" },
          { type: "text", value: JSON.stringify(w.steps) },
          { type: "integer", value: String(w.usageCount) },
          { type: "integer", value: w.isFeatured ? "1" : "0" },
          { type: "text", value: "Promptly Editorial" },
          { type: "text", value: daysAgoIso(120) },
        ],
      },
    })),
    { type: "close" },
  ];
  {
    const res = await fetch(`${HTTP_URL}/v2/pipeline`, {
      method: "POST",
      headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: wfRequests }),
    });
    const data = await res.json();
    const errs = data.results?.filter((r) => r.type === "error") ?? [];
    if (errs.length > 0) console.error("[workflows] errors:", errs.length);
    else console.log(`[workflows] OK (${WORKFLOWS.length} workflows seeded)`);
  }

  // 7. Create FTS triggers
  const triggerSqls = [
    `CREATE TRIGGER IF NOT EXISTS prompts_fts_insert AFTER INSERT ON prompts BEGIN INSERT INTO prompts_fts (id, text) VALUES (new.id, new.search_text); END`,
    `CREATE TRIGGER IF NOT EXISTS prompts_fts_delete AFTER DELETE ON prompts BEGIN DELETE FROM prompts_fts WHERE id = old.id; END`,
    `CREATE TRIGGER IF NOT EXISTS prompts_fts_update AFTER UPDATE OF search_text ON prompts BEGIN UPDATE prompts_fts SET text = new.search_text WHERE id = new.id; END`,
  ];
  await execBatch(triggerSqls, "triggers");

  console.log("");
  console.log("✅ Turso database seeded successfully!");
  console.log(`   Database URL: ${DB_URL}`);
  console.log(`   Prompts: ${promptCount} curated`);
  console.log(`   Categories: ${CATEGORIES.length}`);
  console.log(`   Platforms: ${PLATFORMS.length}`);
  console.log(`   Workflows: ${WORKFLOWS.length}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
