import type { Difficulty, PromptSource, PromptVariable } from "@/lib/types";

/** Compact authoring shape for seed prompts; expanded into full rows by the seeder. */
export interface SeedPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  tasks: string[];
  tags: string[];
  difficulty: Difficulty;
  inputType: string;
  outputType: string;
  purpose: string;
  transformation: string;
  tone: string;
  bestFor: string[];
  platforms: string[];
  variables?: PromptVariable[];
  body: string;
  featured?: boolean;
  /** Override authorship (defaults to Promptly Editorial). */
  author?: string;
  /** Record provenance (defaults to "seed"). */
  source?: PromptSource;
  /** Days ago it was added — creates realistic recency spread. */
  ageDays: number;
  usageCount: number;
  rating: number;
  ratingCount: number;
}

export const DEFAULT_PLATFORMS = ["chatgpt", "claude", "gemini", "deepseek", "grok"];
