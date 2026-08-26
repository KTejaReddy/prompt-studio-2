/**
 * Lightweight, dependency-free text utilities used by the retrieval stack.
 * Deliberately simple: deterministic, fast, and good enough for a curated
 * corpus. Swap for a real tokenizer/embedding provider behind the same
 * interfaces when needed.
 */

const STOPWORDS = new Set(
  ("a an the and or but if then else when while of to in on for with without at by from as is are was were be been being " +
    "i you we they it he she my your our their this that these those there here what which who whom how why " +
    "do does did done have has had having will would can could should shall may might must " +
    "want wanted need needs needed like just really very much many some any all no not so too than also " +
    "get got make made create creating give gave take took go went come came say said tell told " +
    "me him her them us it's i'm don't didn't won't can't shouldn't you're we're they're that's " +
    "about into over under again further once only own same s t don now d ll m o re ve y ain aren " +
    "please help something anything everything nothing one two first second next last new")
    .split(" "),
);

/** Very light suffix stripping — stable enough for matching, avoids a stemmer dep. */
export function normalizeToken(tok: string): string {
  let t = tok;
  if (t.length > 4 && t.endsWith("ies")) t = t.slice(0, -3) + "y";
  else if (t.length > 4 && t.endsWith("es")) t = t.slice(0, -2);
  else if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) t = t.slice(0, -1);
  if (t.length > 5 && t.endsWith("ing")) t = t.slice(0, -3);
  else if (t.length > 5 && t.endsWith("ed")) t = t.slice(0, -2);
  return t;
}

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z0-9+#.-]{1,}/g) ?? [])
    .map((w) => w.replace(/[.+]-$/, ""))
    .filter((w) => w.length > 1);
}

export function contentTokens(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tok of tokenize(text)) {
    if (STOPWORDS.has(tok)) continue;
    const norm = normalizeToken(tok);
    if (!norm || seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
  }
  return out;
}

export function bigrams(tokens: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) out.push(`${tokens[i]}_${tokens[i + 1]}`);
  return out;
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
