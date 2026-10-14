import type { Metadata } from "next";

import { FilterLinks, IndexTitle, InfoNote, NextStep, SearchField, queryHref } from "@/components/ui/frames";
import { DocumentList, PageHero, Section } from "@/components/ui/primitives";
import { getDocuments } from "@/lib/content/api";
import { frames } from "@/lib/i18n/frames";
import { localePath } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = copy(locale);
  const f = frames(locale);
  return pageMetadata({ locale, path: "/standards", title: t.nav.standards, description: f.standards.lede });
}

export default async function StandardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ focus?: string; q?: string }>;
}) {
  const locale = await readLocale(params);
  const query = await searchParams;
  const t = copy(locale);
  const f = frames(locale);
  const page = f.standards;
  const path = localePath(locale, "/standards");
  const documents = await getDocuments(locale, "standards");
  const q = query.q?.trim().toLowerCase() ?? "";
  const rows = page.rows.filter((row) => (!query.focus || row.focus === query.focus) && (!q || `${row.title} ${row.text} ${row.kicker}`.toLowerCase().includes(q)));
  const published = documents.filter((item) => !q || `${item.title} ${item.description} ${item.code}`.toLowerCase().includes(q));
  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.nav.standards }]} code={page.code} title={t.nav.standards} lede={page.lede} />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <div>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{page.categories}</p>
            <div className="mt-4">
              <FilterLinks
                label={page.categories}
                items={page.filters.map(([focus, label]) => ({
                  href: queryHref(path, { focus, q: query.q }),
                  label,
                  current: (query.focus || "") === focus,
                }))}
              />
            </div>
          </div>
          <div>
            <SearchField action={path} label={page.search} value={query.q} hidden={query.focus ? { focus: query.focus } : undefined} />
            {!documents.length ? <div className="mt-8"><InfoNote>{page.note}</InfoNote></div> : null}
            {documents.length ? (
              <div className="mt-8"><DocumentList items={published} locale={locale} /></div>
            ) : (
              <ul className="mt-8 divide-y divide-border border-y border-border">
                {rows.map((row) => (
                  <li key={row.title} className="grid gap-2 py-5">
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{row.kicker}</p>
                    <h2 className="type-h3">{row.title}</h2>
                    <p className="max-w-2xl text-muted">{row.text}</p>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted">{f.editionPending}</p>
                    <p className="text-sm">{f.publicationPending}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>
      <Section surface>
        <IndexTitle index={page.use} title={page.useTitle} />
        <p className="mt-4 max-w-2xl text-muted">{page.useText}</p>
      </Section>
      <NextStep locale={locale} />
    </>
  );
}
