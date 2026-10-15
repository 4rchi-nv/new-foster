/** Prefer CMS string; fall back to code default when empty. */
export function pick(value: string | undefined | null, fallback: string) {
  const next = typeof value === "string" ? value.trim() : "";
  return next || fallback;
}
