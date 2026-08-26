import type { Metadata } from "next";
import { Suspense } from "react";
import { GeneratorStudio } from "@/components/GeneratorStudio";

export const metadata: Metadata = {
  title: "Generate with AI",
  description:
    "Describe what you need in plain language and Promptly's AI writes a library-ready prompt, complete with variables and structure.",
};

export default function GeneratePage() {
  return (
    <main className="relative mx-auto max-w-3xl px-4 py-10">
      {/* Cyan/sky atmosphere — the studio stays on-theme */}
      <div aria-hidden className="blob -right-10 -top-6 h-52 w-52 bg-cyan/20 animate-floaty" />
      <div
        aria-hidden
        className="blob h-48 w-48 bg-turquoise/20 -left-14 top-40 animate-floaty [animation-delay:1.6s]"
      />

      <div className="relative">
        <header className="mb-8">
          <span className="chip bg-cyan-soft text-cyan-deep">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden />
            AI Studio
          </span>
          <h1 className="mt-3 font-headline text-4xl">
            Nothing fits? <span className="text-cyan">Generate it.</span>
          </h1>
          <p className="mt-2 max-w-prose text-ink-soft">
            Describe your task in plain language. A Groq model drafts a
            library-quality prompt — structured, variable-driven, ready to copy.
          </p>
        </header>
        <Suspense fallback={<div className="card p-8 text-sm text-ink-mute">Loading studio…</div>}>
          <GeneratorStudio />
        </Suspense>
      </div>
    </main>
  );
}
