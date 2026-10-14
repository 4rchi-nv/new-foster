import type { Metadata } from "next";
import Link from "next/link";

import { Pager } from "@/components/content/Pager";
import { ConceptPlate, FilterLinks, ImageSlot, InfoNote, queryHref } from "@/components/ui/frames";
import { PageHero, Section, TechnicalMedia } from "@/components/ui/primitives";
import { getArticles } from "@/lib/content/api";
import { exampleArticleSlug, frames } from "@/lib/i18n/frames";
import { localePath } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await readLocale(params);
  const f = frames(locale);
  return pageMetadata({ locale, path: "/news", title: f.news.title, description: f.news.lede });
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; focus?: string }>;
}) {
  const locale = await readLocale(params);
  const query = await searchParams;
  const t = copy(locale);
  const f = frames(locale);
  const pageCopy = f.news;
  const path = localePath(locale, "/news");
  const data = await getArticles(locale, Number(query.page || 1));
  const cards = pageCopy.cards.filter((card) => !query.focus || card.focus === query.focus);
  const showFeatured = !query.focus || query.focus === "engineering";
  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: pageCopy.title }]} code={pageCopy.code} title={pageCopy.title} lede={pageCopy.lede} />
      <Section>
        <FilterLinks
          label={t.filterLabel}
          items={pageCopy.filters.map(([focus, label]) => ({
            href: queryHref(path, { focus }),
            label,
            current: (query.focus || "") === focus,
          }))}
        />
        {!data.items.length ? <div className="mt-8"><InfoNote>{pageCopy.note}</InfoNote></div> : null}
        {data.items.length ? (
          <ul className="mt-10 grid gap-8">
            {data.items.map((article, index) => (
              <li key={article.slug}>
                <Link href={article.href} className="grid gap-5 border border-border bg-surface p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.7fr)]">
                  <div>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{[article.category, article.date].filter(Boolean).join(" / ")}</p>
                    <h2 className={index === 0 ? "type-h2 mt-3" : "type-h3 mt-3"}>{article.title}</h2>
                    {article.excerpt ? <p className="mt-3 max-w-2xl text-muted">{article.excerpt}</p> : null}
                    <p className="mt-4 text-sm">{t.readMaterial} ↗</p>
                  </div>
                  {article.hero ? <TechnicalMedia media={article.hero} label={article.title} /> : <ImageSlot label={t.noImage} />}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 grid gap-8">
            {showFeatured ? (
              <article className="border border-border bg-surface p-5">
                <div>
                  <ConceptPlate title="NF / P&ID — CONCEPT" caption={f.schematic} />
                  <p className="mt-5 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{pageCopy.featuredKicker}</p>
                  <h2 className="type-h2 mt-3">{pageCopy.featuredTitle}</h2>
                  <p className="mt-3 max-w-2xl text-muted">{pageCopy.featuredText}</p>
                  <Link href={localePath(locale, `/news/${exampleArticleSlug}`)} className="mt-4 inline-flex items-center gap-2 text-sm">{pageCopy.read} <span aria-hidden>↗</span></Link>
                </div>
              </article>
            ) : null}
            <ul className="grid gap-6 md:grid-cols-2">
              {cards.map((card) => (
                <li key={card.title} className="border border-border bg-surface p-5">
                  <ImageSlot label={t.noImage} />
                  <p className="mt-5 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{card.kicker}</p>
                  <h2 className="type-h3 mt-2">{card.title}</h2>
                  <p className="mt-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted">{pageCopy.pendingMeta}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Pager locale={locale} path="/news" page={data.page} totalPages={data.totalPages} />
      </Section>
    </>
  );
}
