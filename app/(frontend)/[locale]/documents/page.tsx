import type { Metadata } from "next";

import { FilterLinks, IndexTitle, InfoNote, NextStep, queryHref } from "@/components/ui/frames";
import { ChamferedButton, DocumentList, PageHero, Section } from "@/components/ui/primitives";
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
  return pageMetadata({ locale, path: "/documents", title: t.documents, description: f.documents.lede });
}

export default async function DocumentsPage({
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
  const page = f.documents;
  const path = localePath(locale, "/documents");
  const documents = await getDocuments(locale, "company");
  const rows = page.rows.filter((row) => !query.focus || row.focus === query.focus);
  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.documents }]} code={page.code} title={t.documents} lede={page.lede} />
      <Section>
        <FilterLinks
          label={t.filterLabel}
          items={page.filters.map(([focus, label]) => ({
            href: queryHref(path, { focus }),
            label,
            current: (query.focus || "") === focus,
          }))}
        />
        {!documents.length ? <div className="mt-8"><InfoNote>{page.note}</InfoNote></div> : null}
        {documents.length ? (
          <div className="mt-8"><DocumentList items={documents} locale={locale} /></div>
        ) : (
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {rows.map((row) => (
              <li key={row.title} className="grid gap-3 py-5 md:grid-cols-[5rem_12rem_1fr_auto] md:items-baseline">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">DOC</span>
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{row.kind}</span>
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="mt-1 text-sm text-muted">{row.text}</p>
                </div>
                <div className="text-sm text-muted">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em]">{f.formatPending}</p>
                  <p className="mt-1">{f.filePending}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section surface>
        <IndexTitle index={page.request} title={page.requestTitle} />
        <p className="mt-4 max-w-2xl text-muted">{page.requestText}</p>
        <div className="mt-8">
          <ChamferedButton href={`${localePath(locale, "/contacts")}?source=documents`}>{f.requestDocument} <span aria-hidden>↗</span></ChamferedButton>
        </div>
      </Section>
      <NextStep locale={locale} />
    </>
  );
}
