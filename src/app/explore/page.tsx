import { ExploreClient } from "@/components/ExploreClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore" };

export default function ExplorePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <span className="chip bg-cyan-soft text-cyan-deep">            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden />
          Discovery
        </span>
        <h1 className="mt-3 font-display">
          Explore the <span className="text-cyan">library</span>
        </h1>
        <p className="mt-1 text-ink-soft">
          Filter by domain, difficulty and platform — or search to rank every
          prompt by relevance to your need.
        </p>
      </header>
      <ExploreClient initialQuery={searchParams.q ?? ""} initialCategory={searchParams.category ?? ""} />
    </div>
  );
}
