import type { PlatformRecord } from "@/lib/types";

/** Platforms supported by the optimizer. Adding a platform is data, not code. */
export const SEED_PLATFORMS: PlatformRecord[] = [
  { id: "chatgpt", name: "ChatGPT", color: "#1E8E5A", note: "Markdown headings + numbered steps work best." },
  { id: "claude", name: "Claude", color: "#D63F18", note: "XML-style section tags improve instruction adherence." },
  { id: "gemini", name: "Gemini", color: "#F97B16", note: "Task-first framing with explicit constraints." },
  { id: "grok", name: "Grok", color: "#2E2436", note: "Direct, punchy phrasing; minimal preamble." },
  { id: "deepseek", name: "DeepSeek", color: "#C43CB8", note: "Explicit step-by-step reasoning requests." },
  { id: "perplexity", name: "Perplexity", color: "#1E8E5A", note: "Add sourcing and citation requirements." },
  { id: "copilot", name: "Microsoft Copilot", color: "#EBA10B", note: "Concise business tone; structured output." },
  { id: "mistral", name: "Mistral", color: "#F4572E", note: "Compact, unambiguous instructions." },
  { id: "meta", name: "Meta AI", color: "#BE2267", note: "Friendly framing; short paragraphs." },
  { id: "custom", name: "Other / Custom", color: "#6E5578", note: "Generic structure that works anywhere." },
];

export const PLATFORM_NAMES: Record<string, string> = Object.fromEntries(
  SEED_PLATFORMS.map((p) => [p.id, p.name]),
);
