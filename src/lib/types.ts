/**
 * Shared domain types for Promptly.
 * These types are the contract between DB, services and UI layers.
 */

// ---------- Enumerations ----------

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type PromptStatus = "published" | "pending" | "rejected" | "draft";
export type PromptSource = "seed" | "community" | "generated";

// ---------- Core records ----------

export interface PromptVariable {
  /** Placeholder key used inside prompt_text, e.g. LANGUAGE for {LANGUAGE} */
  key: string;
  label: string;
  placeholder?: string;
  /** Suggested options the UI can render as quick-picks */
  suggestions?: string[];
  required?: boolean;
}

export interface PromptRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  tasks: string[];
  tags: string[];
  difficulty: Difficulty;
  promptText: string;
  variables: PromptVariable[];
  inputType: string;
  outputType: string;
  purpose: string | null;
  transformation: string | null;
  tone: string | null;
  bestFor: string[];
  platforms: string[];
  platformAdaptations: Record<string, string>;
  qualityScore: number;
  usageCount: number;
  rating: number;
  ratingCount: number;
  author: string;
  status: PromptStatus;
  source: PromptSource;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  order: number;
  title: string;
  promptId?: string;
  instruction: string;
}

export interface WorkflowRecord {
  id: string;
  name: string;
  description: string;
  category: string | null;
  steps: WorkflowStep[];
  usageCount: number;
  isFeatured: boolean;
  author: string | null;
  createdAt: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
  sort: number;
}

export interface PlatformRecord {
  id: string;
  name: string;
  color: string;
  note: string;
}

export interface CommandRecord {
  cmd: string;
  label: string;
  description: string;
  intentPatch: Partial<IntentAnalysis>;
}

// ---------- Saved / user workspace ----------

export type SavedKind = "saved" | "customized" | "generated" | "variation";

export interface SavedPrompt {
  id: string;
  kind: SavedKind;
  originPromptId: string | null;
  title: string;
  description: string | null;
  promptText: string;
  variables: PromptVariable[];
  values: Record<string, string>;
  platform: string | null;
  category: string | null;
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------- Intent & matching ----------

/** Structured understanding of a natural-language request. */
export interface IntentAnalysis {
  rawQuery: string;
  intent: string; // short human phrase, e.g. "Security-focused code review"
  category: string | null; // category id
  tasks: TaskSignal[]; // ordered task signals found in the request
  domain: string | null;
  inputType: string | null; // code | pdf | document | text | data | url | image ...
  outputType: string | null; // report | questions | summary | notes | slides | email ...
  platform: string | null; // mentioned platform id
  complexity: number; // 1..5 heuristic
  keywords: string[];
  constraints: string[]; // explicit constraints detected ("in plain language", ...)
}

export interface TaskSignal {
  task: string; // canonical task id, e.g. summarize | review | quiz | extract
  phrase: string; // matched phrase from the query
}

export type MatchVerdict = "strong" | "related" | "compose" | "generate";

export interface ScoredPrompt {
  prompt: PromptRecord;
  score: number; // final calibrated match score 0..1
  semantic: number;
  keyword: number;
  structured: number;
  reasons: MatchReason[];
}

export interface MatchReason {
  label: string;
  detail: string;
}

export interface FindDecision {
  verdict: MatchVerdict;
  intent: IntentAnalysis;
  matches: ScoredPrompt[]; // ranked, may be empty
  message: string;
  suggestionWorkflow?: {
    name: string;
    steps: { title: string; promptId: string; instruction: string }[];
  } | null;
}

// ---------- Generation ----------

export interface GeneratedSpec {
  role: string;
  objective: string;
  context: string;
  instructions: string[];
  constraints: string[];
  inputRequirements: string;
  reasoningApproach: string[];
  outputFormat: string;
  qualityCriteria: string[];
  examplePlaceholder?: string;
}

export interface GeneratedPromptResult {
  spec: GeneratedSpec;
  promptText: string;
  title: string;
  description: string;
  category: string | null;
  tags: string[];
  variables: PromptVariable[];
  basedOnIds: string[]; // library prompts that informed the generation
  notes: string;
}

// ---------- Search ----------

export interface SearchFilters {
  categories?: string[];
  subcategories?: string[];
  platforms?: string[];
  difficulty?: Difficulty[];
  task?: string[];
  inputType?: string[];
  outputType?: string[];
  minRating?: number;
  minQuality?: number;
  featuredOnly?: boolean;
}

export type SortOption =
  | "relevance"
  | "popular"
  | "rating"
  | "recent"
  | "quality";

export interface SearchResponse {
  results: (ScoredPrompt | { prompt: PromptRecord })[];
  total: number;
  query: string;
}

// ---------- Analytics ----------

export type EventType =
  | "search"
  | "view"
  | "copy"
  | "use"
  | "save"
  | "customize"
  | "generate"
  | "workflow_run"
  | "platform_select";

export interface AnalyticsSummary {
  totals: Record<EventType | "submissions", number>;
  searchesWithOutcome: { strong: number; related: number; generate: number };
  reuseRate: number; // % of find/create requests fulfilled by existing prompts
  topPrompts: { id: string; title: string; uses: number }[];
  topCategories: { category: string; count: number }[];
}

// ---------- Submission pipeline ----------

export interface SubmissionAnalysis {
  quality: { score: number; issues: string[] };
  duplicate: { similarTo: { id: string; title: string; similarity: number } | null };
  categorization: { category: string | null; suggestedTags: string[] };
  safety: { flagged: boolean; reasons: string[] };
  compatibility: { platforms: string[] };
}
