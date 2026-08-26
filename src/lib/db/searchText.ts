/**
 * Builds the compact retrieval text indexed by `prompts_fts`.
 *
 * Deliberately excludes the full body (only its first 240 chars) so the
 * full-text index stays lean at hundreds of thousands of rows, while
 * title/tags/tasks carry essentially all retrieval vocabulary.
 */
export function buildSearchText(input: {
  title: string;
  description: string;
  subcategory?: string | null;
  tags: string[];
  tasks: string[];
  purpose?: string | null;
  bestFor: string[];
  promptText: string;
}): string {
  return [
    input.title,
    input.title,
    input.description,
    input.subcategory ?? "",
    input.tags.join(" "),
    input.tasks.join(" "),
    input.purpose ?? "",
    input.bestFor.join(" "),
    input.promptText.slice(0, 240),
  ]
    .join(" ")
    .toLowerCase();
}
