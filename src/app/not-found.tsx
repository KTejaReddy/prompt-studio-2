import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="relative mb-6" aria-hidden>
        <span className="blob -left-8 -top-4 h-20 w-20 bg-cyan/15" />
        <span className="blob -right-8 top-2 h-20 w-20 bg-turquoise/15" />
        <span className="relative font-display text-7xl font-extrabold bg-gradient-text bg-clip-text text-transparent">
          404
        </span>
      </div>
      <h1 className="font-headline text-2xl">That page isn&apos;t in the library.</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-soft">
        The link may be old or mistyped — but the right prompt is probably one
        search away.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/" className="btn-find">
          Find a prompt
        </Link>
        <Link href="/explore" className="btn-explore">
          Explore the library
        </Link>
      </div>
    </div>
  );
}
