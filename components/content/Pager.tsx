import Link from "next/link";

import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { copy } from "@/lib/i18n/ui";

export function Pager({
  locale,
  path,
  page,
  totalPages,
  category,
}: {
  locale: Locale;
  path: string;
  page: number;
  totalPages: number;
  category?: string;
}) {
  if (totalPages <= 1) return null;
  const t = copy(locale);
  const href = (next: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (next > 1) params.set("page", String(next));
    const query = params.toString();
    return `${localePath(locale, path)}${query ? `?${query}` : ""}`;
  };
  return (
    <nav className="mt-10 flex items-center gap-4 font-mono text-sm" aria-label={t.page}>
      {page > 1 ? <Link href={href(page - 1)}>{t.prev}</Link> : <span />}
      <span>{page} / {totalPages}</span>
      {page < totalPages ? <Link href={href(page + 1)}>{t.next}</Link> : null}
    </nav>
  );
}
