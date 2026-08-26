/**
 * Client-safe formatting helpers (no DB / Node imports).
 */

/** Replace {KEY} placeholders in a prompt body with user-supplied values. */
export function interpolate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{([A-Z0-9_]+)\}/g, (match, key: string) => {
    const v = values[key];
    return v && v.trim().length > 0 ? v : match;
  });
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function scorePercent(score: number): number {
  return Math.round(score * 100);
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Fire-and-forget analytics beacon; never blocks or throws on the UI. */
export function trackEvent(
  type: string,
  payload: { promptId?: string | null; outcome?: string | null; meta?: Record<string, unknown> } = {},
): void {
  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ...payload }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* analytics must never break the UI */
  }
}
