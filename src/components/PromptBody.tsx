"use client";

import { Fragment, useState } from "react";

// Variable tokens rotate through the accent palette for visual hierarchy
// without turning the body into a rainbow.
const VAR_CLASSES = [
  "var-coral",
  "var-teal",
  "var-pink",
  "var-orange",
  "var-lavender",
];

export function varClassFor(token: string): string {
  let h = 0;
  for (let i = 0; i < token.length; i++) h = (h * 31 + token.charCodeAt(i)) >>> 0;
  return VAR_CLASSES[h % VAR_CLASSES.length];
}

/** Split prompt text into plain segments and {VARIABLE} tokens. */
export function tokenize(text: string): { plain: string; variable?: string }[] {
  const parts: { plain: string; variable?: string }[] = [];
  const re = /\{([A-Z0-9_]+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ plain: text.slice(last, m.index) });
    parts.push({ plain: `{${m[1]}}`, variable: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ plain: text.slice(last) });
  return parts;
}

/** Full-width prompt body with true one-click copy. */
export function PromptBody({
  promptText,
  originPromptId,
}: {
  promptText: string;
  originPromptId: string;
}) {
  const [copied, setCopied] = useState(false);
  const words = promptText.trim().split(/\s+/).length;

  function flashCopied() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  /** One click → whole prompt on the clipboard. Falls back for odd contexts. */
  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(promptText);
      } else {
        const ta = document.createElement("textarea");
        ta.value = promptText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      flashCopied();
    } catch {
      // Last-resort fallback never blocks the button.
      const ta = document.createElement("textarea");
      ta.value = promptText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      flashCopied();
    }
    // Usage analytics — best effort, never blocks the copy.
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "copy", promptId: originPromptId }),
    }).catch(() => {});
  }

  return (
    <div className="card p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-headline text-xl">
          Prompt <span className="ml-1 text-xs font-normal text-ink-mute">{words} words</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            title="Copy the whole prompt to your clipboard"
            className="btn-save !px-5 !py-2 text-sm"
          >
            {copied ? "Copied ✓" : "Copy prompt"}
          </button>
        </div>
      </div>
      {/* Light editor surface — colored variables, never dark code styling */}
      <pre className="max-h-[38rem] overflow-y-auto whitespace-pre-wrap rounded-xl bg-paper-soft p-5 font-body text-sm leading-relaxed ring-1 ring-cyan/20">
        {tokenize(promptText).map((seg, i) =>
          seg.variable ? (
            <span key={i} className={varClassFor(seg.variable)}>
              {seg.plain}
            </span>
          ) : (
            <Fragment key={i}>{seg.plain}</Fragment>
          ),
        )}
      </pre>
    </div>
  );
}
