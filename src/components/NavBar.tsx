"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Section identities: Find cyan (brand) · Generate orange · Explore turquoise.
const LINKS = [
  {
    href: "/",
    label: "Find",
    dot: "bg-cyan",
    active: "bg-cyan-soft text-cyan-deep ring-1 ring-cyan/25",
    idle: "text-ink-soft hover:bg-cyan-soft/50 hover:text-cyan-deep",
  },
  {
    href: "/generate",
    label: "Generate",
    dot: "bg-cyan",
    active: "bg-cyan-soft text-cyan-deep ring-1 ring-cyan/25",
    idle: "text-ink-soft hover:bg-cyan-soft/50 hover:text-cyan-deep",
  },
  {
    href: "/explore",
    label: "Explore",
    dot: "bg-cyan",
    active: "bg-cyan-soft text-cyan-deep ring-1 ring-cyan/25",
    idle: "text-ink-soft hover:bg-cyan-soft/50 hover:text-cyan-deep",
  },
] as const;

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-cyan/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        {/* Multicolor logo: three overlapping color segments, cyan face */}
        <Link href="/" className="flex items-center gap-2.5">
          <span aria-hidden className="relative grid h-8 w-8 place-items-center">
            <span className="absolute inset-0 -rotate-3 rounded-xl bg-cyan-light/60" />
            <span className="absolute inset-0 rotate-3 rounded-xl bg-turquoise/50" />
            <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-cyan font-display text-lg leading-none text-white shadow-glow">
              P
            </span>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink">
            Promptly
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, label, dot, active, idle }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[13px] font-medium transition-colors ${
                  isActive ? active : idle
                }`}
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
