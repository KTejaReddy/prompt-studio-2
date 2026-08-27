export default function ExploreLoading() {
  return (
    <div className="space-y-6">
      <header>
        <span className="chip bg-cyan-soft text-cyan-deep">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden />
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

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar skeleton */}
        <aside className="space-y-5 self-start rounded-xl2 bg-cyan-surface p-4 ring-1 ring-cyan/25 shadow-soft lg:sticky lg:top-20">
          <div className="h-10 rounded-xl bg-white/60 ring-1 ring-ink/5" />
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-paper-deep" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 w-16 rounded-full bg-white/60 ring-1 ring-ink/5" />
              ))}
            </div>
          </div>
        </aside>

        {/* Card grid skeleton */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-paper-deep" />
            <div className="h-4 w-20 rounded bg-paper-deep" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl2 bg-white p-4 ring-1 ring-ink/5 shadow-soft">
                <div className="mb-3 h-5 w-24 rounded-full bg-cyan-soft/60" />
                <div className="mb-2 h-5 w-3/4 rounded bg-paper-deep" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded bg-blush" />
                  <div className="h-3 w-5/6 rounded bg-blush" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-5 w-16 rounded-full bg-mint-soft/50" />
                  <div className="h-3 w-10 rounded bg-blush" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
