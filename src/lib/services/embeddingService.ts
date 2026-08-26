import type { PromptRecord } from "@/lib/types";
import { bigrams, contentTokens } from "./textUtils";

/**
 * Embedding layer with a swappable provider interface.
 *
 * The default implementation is a local TF-IDF vector space over enriched
 * prompt documents — fully offline, deterministic and instant for a curated
 * corpus. `EmbeddingProvider` lets a real model (OpenAI, local sentence
 * transformers, etc.) replace it later without touching search or matching.
 */

export interface EmbeddingVector {
  /** term → weight */
  terms: Map<string, number>;
  norm: number;
}

export interface EmbeddingProvider {
  readonly name: string;
  embedDocument(doc: string): EmbeddingVector;
  embedQuery(query: string): EmbeddingVector;
}

export function cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number {
  let dot = 0;
  const [small, large] = a.terms.size <= b.terms.size ? [a, b] : [b, a];
  for (const [term, w] of small.terms) {
    const other = large.terms.get(term);
    if (other) dot += w * other;
  }
  if (dot === 0) return 0;
  return dot / (a.norm * b.norm);
}

/** Local TF-IDF provider. */
class TfidfProvider implements EmbeddingProvider {
  readonly name = "local-tfidf";
  private idf = new Map<string, number>();
  private totalDocs = 1;

  train(documents: string[]): void {
    this.totalDocs = Math.max(1, documents.length);
    const df = new Map<string, number>();
    for (const doc of documents) {
      const seen = new Set(this.extractTerms(doc));
      for (const term of seen) df.set(term, (df.get(term) ?? 0) + 1);
    }
    this.idf.clear();
    for (const [term, count] of df) {
      this.idf.set(term, Math.log((this.totalDocs + 1) / (count + 0.5)));
    }
  }

  private extractTerms(text: string): string[] {
    const tokens = contentTokens(text);
    return [...tokens, ...bigrams(tokens)];
  }

  embedDocument(doc: string): EmbeddingVector {
    return this.vectorize(doc, /* repeatBoost */ false);
  }

  embedQuery(query: string): EmbeddingVector {
    // Queries get a small repetition boost so important terms weigh more.
    return this.vectorize(query, true);
  }

  private vectorize(text: string, boost: boolean): EmbeddingVector {
    const rawTokens = contentTokens(text);
    const terms = boost ? [...rawTokens, ...rawTokens.slice(0, 6), ...bigrams(rawTokens)] : this.extractTerms(text);
    const tf = new Map<string, number>();
    for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + 1);

    const vec = new Map<string, number>();
    let sq = 0;
    for (const [term, freq] of tf) {
      const idf = this.idf.get(term) ?? Math.log((this.totalDocs + 1) / 1.5);
      const weight = (1 + Math.log(freq)) * idf;
      if (weight <= 0) continue;
      vec.set(term, weight);
      sq += weight * weight;
    }
    return { terms: vec, norm: Math.sqrt(sq) || 1 };
  }
}

// ---------- Corpus document enrichment ----------

/** The indexed "document" for a prompt mixes body text with weighted metadata. */
export function promptToDocument(p: PromptRecord): string {
  return [
    p.title,
    p.title,
    p.description,
    ...p.tags,
    ...p.tags,
    ...p.tasks,
    ...p.tasks,
    p.category.replace(/-/g, " "),
    p.subcategory ?? "",
    p.purpose ?? "",
    p.bestFor.join(" "),
    p.outputType.replace(/-/g, " "),
    p.inputType.replace(/-/g, " "),
    p.promptText.slice(0, 900), // first chunk of body carries most signal
  ].join(" ");
}

export function queryToDocument(q: string): string {
  return q;
}

// ---------- Singleton index ----------

interface PromptIndexEntry {
  promptId: string;
  vector: EmbeddingVector;
}

class EmbeddingIndex {
  private provider: EmbeddingProvider = new TfidfProvider();
  private entries: PromptIndexEntry[] = [];
  private builtAtKey = "";

  /**
   * Train IDF statistics from a bounded corpus sample without materializing
   * full-corpus vectors (the scale-safe path used by search/submissions:
   * candidate documents are embedded on demand instead).
   */
  ensureTrainedDocs(docs: string[], signature?: string): void {
    const key = signature ?? `docs:${docs.length}`;
    if (key === this.builtAtKey) return;
    if ("train" in this.provider && typeof this.provider.train === "function") {
      (this.provider as unknown as { train(docs: string[]): void }).train(docs);
    }
    this.builtAtKey = key;
  }

  embedQueryText(queryText: string): EmbeddingVector {
    return this.provider.embedQuery(queryToDocument(queryText));
  }

  embedDocText(doc: string): EmbeddingVector {
    return this.provider.embedDocument(doc);
  }

  rebuild(prompts: PromptRecord[]): void {
    const docs = prompts.map(promptToDocument);
    if ("train" in this.provider && typeof this.provider.train === "function") {
      (this.provider as unknown as { train(docs: string[]): void }).train(docs);
    }
    this.entries = prompts.map((p, i) => ({
      promptId: p.id,
      vector: this.provider.embedDocument(docs[i]),
    }));
    this.builtAtKey = `${prompts.length}:${prompts[prompts.length - 1]?.updatedAt ?? ""}`;
  }

  ensureFresh(prompts: PromptRecord[]): void {
    const key = `${prompts.length}:${prompts[prompts.length - 1]?.updatedAt ?? ""}`;
    if (key !== this.builtAtKey) this.rebuild(prompts);
  }

  search(queryText: string): { promptId: string; score: number }[] {
    const qv = this.provider.embedQuery(queryToDocument(queryText));
    return this.entries
      .map((e) => ({ promptId: e.promptId, score: cosineSimilarity(qv, e.vector) }))
      .sort((a, b) => b.score - a.score);
  }

  similarityBetween(promptIds: string[], aId: string, bId: string): number {
    const a = this.entries.find((e) => e.promptId === aId);
    const b = this.entries.find((e) => e.promptId === bId);
    if (!a || !b) return 0;
    return cosineSimilarity(a.vector, b.vector);
  }

  similarityOf(queryText: string, promptId: string): number {
    const entry = this.entries.find((e) => e.promptId === promptId);
    if (!entry) return 0;
    const qv = this.provider.embedQuery(queryToDocument(queryText));
    return cosineSimilarity(qv, entry.vector);
  }

  get providerName(): string {
    return this.provider.name;
  }
}

export const embeddingIndex = new EmbeddingIndex();
