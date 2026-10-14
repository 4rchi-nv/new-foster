const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_HITS = 5;

// ponytail: in-memory per process; resets on restart. Move to a shared store if the site runs on more than one server.
export function allowInquiry(key: string, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export function resetInquiryLimits() {
  hits.clear();
}
