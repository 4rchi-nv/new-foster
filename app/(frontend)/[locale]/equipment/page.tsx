import type { Metadata } from "next";
import Link from "next/link";

import { ConceptPlate, FilterLinks, IndexTitle, InfoNote, NextStep, SearchField, queryHref } from "@/components/ui/frames";
import { PageHero, Section } from "@/components/ui/primitives";
import { frames } from "@/lib/i18n/frames";
import { localePath } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = copy(locale);
  const f = frames(locale);
  return pageMetadata({ locale, path: "/equipment", title: t.nav.equipment, description: f.equipment.lede });
}

export default async function EquipmentPage({
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
  const page = f.equipment;
  const path = localePath(locale, "/equipment");
  const q = query.q?.trim().toLowerCase() ?? "";
  const cards = page.directions.filter((item) => {
    const groupOk = !query.focus || item.group === query.focus;
    const text = `${item.title} ${item.summary}`.toLowerCase();
    return groupOk && (!q || text.includes(q));
  });
  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.nav.equipment }]} code={page.code} title={t.nav.equipment} lede={page.lede} />
      <Section>
        <FilterLinks
          label={t.filterLabel}
          items={page.filters.map(([focus, label]) => ({
            href: queryHref(path, { focus, q: query.q }),
            label,
            current: (query.focus || "") === focus,
          }))}
        />
        <div className="mt-6">
          <SearchField action={path} label={page.search} value={query.q} hidden={query.focus ? { focus: query.focus } : undefined} />
        </div>
        <div className="mt-8"><InfoNote>{page.note}</InfoNote></div>
        <ul className="mt-10 grid gap-8 md:grid-cols-2">
          {cards.map((item) => (
            <li key={item.slug} className="border border-border bg-surface">
              <ConceptPlate title={`${item.code} — CONCEPT`} caption={f.schematic} />
              <div className="p-5">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{item.code}</p>
                <h2 className="type-h3 mt-2">{item.title}</h2>
                <p className="mt-2 text-muted">{item.summary}</p>
                <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted">{f.specsPending}</p>
                <Link href={localePath(locale, `/equipment/${item.slug}`)} className="mt-4 inline-flex items-center gap-2 text-sm">{f.more} <span aria-hidden>↗</span></Link>
              </div>
            </li>
          ))}
        </ul>
      </Section>
      <Section surface>
        <IndexTitle index={page.fitEyebrow} title={page.fitTitle} />
        <p className="mt-4 max-w-2xl text-muted">{page.fitText}</p>
      </Section>
      <NextStep locale={locale} />
    </>
  );
}
