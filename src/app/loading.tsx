export default function HomeLoading() {
  return (
    <div className="space-y-12">
      {/* Hero skeleton */}
      <section className="relative overflow-hidden rounded-[2.5rem] px-6 py-14">
        <div className="mx-auto max-w-xl space-y-4 text-center">
          <div className="mx-auto h-6 w-48 animate-pulse rounded-full bg-cyan-soft/60" />
          <div className="mx-auto h-10 w-80 animate-pulse rounded-xl bg-paper-deep" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded bg-blush" />
          <div className="mx-auto mt-8 h-20 w-full max-w-md rounded-2xl bg-white/60 ring-1 ring-ink/5" />
        </div>
      </section>

      {/* Category grid skeleton */}
      <section>
        <div className="mb-4 h-4 w-32 rounded bg-paper-deep" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl2 bg-white p-3.5 ring-1 ring-ink/5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-cyan-soft/60" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded bg-paper-deep" />
                  <div className="h-2.5 w-16 rounded bg-blush" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
