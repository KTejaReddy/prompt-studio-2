"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { tokenize, varClassFor } from "@/components/PromptBody";
import { Fragment } from "react";

interface ModelInfo {
  id: string;
  label: string;
  blurb: string;
  tier: string;
}

type Level = 1 | 2 | 3;

const LEVELS: { level: Level; name: string; hint: string }[] = [
  { level: 1, name: "Standard", hint: "Full structure with method and constraints" },
  { level: 2, name: "Detailed", hint: "Methodology, edge cases, worked example" },
  {
    level: 3,
    name: "Expert",
    hint: "Rubric, failure modes, self-check, adaptations",
  },
];

// Each depth level owns an accent — cyan-led, with cool variety.
const LEVEL_ACCENT: Record<Level, { ring: string; badge: string }> = {
  1: { ring: "ring-2 ring-cyan-light shadow-glow", badge: "bg-gradient-explore" },
  2: { ring: "ring-2 ring-cyan shadow-glow", badge: "bg-gradient-find" },
  3: { ring: "ring-2 ring-cyan-deep shadow-glow", badge: "bg-gradient-generate" },
};

interface Generated {
  title: string;
  description: string;
  category: string | null;
  subcategory: string | null;
  tasks: string[];
  tags: string[];
  difficulty: string;
  tone: string;
  platforms: string[];
  variables: { key: string; label: string; placeholder?: string; suggestions?: string[] }[];
  body: string;
  model: string;
}

export function GeneratorStudio() {
  const params = useSearchParams();
  const [ask, setAsk] = useState("");
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [model, setModel] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [level, setLevel] = useState<Level>(2);
  const [platforms, setPlatforms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Generated | null>(null);
  const [copied, setCopied] = useState(false);

  // Live catalog + taxonomy + ?ask= prefill
  useEffect(() => {
    const prefill = params.get("ask");
    if (prefill) setAsk(prefill);
    fetch("/api/generate")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.models) && d.models.length) {
          setModels(d.models);
          setModel(d.models[0].id);
        }
      })
      .catch(() => {});
    fetch("/api/taxonomy")
      .then((r) => r.json())
      .then((d) => setPlatforms(d.platforms ?? []))
      .catch(() => {});
  }, [params]);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ask, model, platform: platform || null, level }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed.");
      setResult(data as Generated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  function copyBody() {
    if (!result) return;
    navigator.clipboard.writeText(result.body).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  }

  return (
    <div className="space-y-6">
      {/* ---------- Composer ---------- */}
      <div className="card p-6">
        <label htmlFor="ask" className="mb-2 block font-headline text-lg">
          What should the prompt do?
        </label>
        <textarea
          id="ask"
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          rows={4}
          placeholder="e.g. Turn messy customer interview notes into themes, quotes and a prioritized feature list"
          className="hero-input w-full resize-y rounded-xl border border-cyan/30 bg-white p-4 text-sm text-ink outline-none focus:border-cyan focus:bg-white focus:ring-2 focus:ring-cyan/20"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_200px_auto]">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-ink ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-cyan"
            aria-label="AI model"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.blurb}
              </option>
            ))}
            {!models.length && <option value="">Loading models…</option>}
          </select>

          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-ink ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-cyan"
            aria-label="Target platform"
          >
            <option value="">Any platform</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>
                For {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={generate}
            disabled={loading || ask.trim().length < 8 || !model}
            className="btn-generate disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate prompt"}
          </button>
        </div>

        {/* Detail level — three colorful controls */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-mute">
            Prompt depth
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {LEVELS.map(({ level: l, name, hint }) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`rounded-xl bg-white px-4 py-3 text-left transition-all ${
                  level === l                    ? LEVEL_ACCENT[l].ring : "ring-1 ring-ink/10 hover:bg-cyan-soft/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-md text-[11px] font-bold text-white ${
                      level === l ? LEVEL_ACCENT[l].badge : "bg-ink/15 text-ink-mute"
                    }`}
                    aria-hidden
                  >
                    {l}
                  </span>
                  <span className="text-sm font-bold text-ink">{name}</span>
                </span>
                <span
                  className={`mt-1 block text-xs ${
                    level === l ? "text-ink-soft" : "text-ink-mute"
                  }`}
                >
                  {hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-coral-soft px-4 py-3 text-sm font-semibold text-coral-deep">
            {error}
          </p>
        )}
      </div>

      {/* ---------- Loading skeleton ---------- */}
      {loading && (
        <div className="card animate-pulse p-8">
          <div className="mb-4 h-5 w-1/2 rounded bg-paper-deep" />
          <div className="space-y-2">
            {[90, 75, 85, 60].map((w, i) => (
              <div key={i} className={`h-3 rounded bg-blush`} style={{ width: `${w}%` }} />
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-mute">
            Reasoning models think before writing — this can take a few seconds.
          </p>
        </div>
      )}

      {/* ---------- Result ---------- */}
      {result && !loading && (
        <div className="card animate-fade-up space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-headline text-2xl">{result.title}</h2>
              <p className="mt-1 max-w-prose text-sm text-ink-soft">{result.description}</p>
            </div>
            <span className="chip bg-cyan-soft text-cyan-deep ring-1 ring-cyan/30">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden />
              New prompt created · via {result.model}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {result.category && (
              <span className="chip bg-white text-ink-soft ring-1 ring-cyan/25">{result.category}</span>
            )}
            {result.subcategory && (
              <span className="chip bg-white text-ink-soft ring-1 ring-cyan/25">
                {result.subcategory}
              </span>
            )}
            <span className="chip bg-white text-ink-soft ring-1 ring-cyan/20">{result.difficulty}</span>
            {result.tags.map((t) => (
              <span key={t} className="chip bg-white text-ink-soft ring-1 ring-cyan/25">
                #{t}
              </span>
            ))}
          </div>

          {result.variables.length > 0 && (
            <div className="rounded-xl bg-paper-soft p-4 ring-1 ring-cyan/20">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-mute">
                Variables
              </p>
              <ul className="space-y-1.5">
                {result.variables.map((v) => (
                  <li key={v.key} className="text-sm">
                    <code className={`mr-2 ${varClassFor(v.key)}`}>
                      {`{${v.key}}`}
                    </code>
                    <span className="text-ink">{v.label}</span>
                    {v.placeholder && <span className="text-ink-mute"> — e.g. {v.placeholder}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Light editor surface with colored variable highlights (§12) */}
          <pre className="max-h-[28rem] overflow-y-auto whitespace-pre-wrap rounded-xl bg-paper-soft p-5 font-body text-sm leading-relaxed ring-1 ring-cyan/20">
            {tokenize(result.body).map((seg, i) =>
              seg.variable ? (
                <span key={i} className={varClassFor(seg.variable)}>
                  {seg.plain}
                </span>
              ) : (
                <Fragment key={i}>{seg.plain}</Fragment>
              ),
            )}
          </pre>

          <div className="flex flex-wrap gap-2">
            <button onClick={copyBody} className="btn-save">
              {copied ? "Copied ✓" : "Copy prompt"}
            </button>
            <button onClick={generate} className="btn-secondary">
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
