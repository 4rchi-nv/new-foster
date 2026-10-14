import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConceptPlate, IndexTitle, InfoNote, NextStep } from "@/components/ui/frames";
import { DocumentList, PageHero, Prose, Section, TechnicalMedia } from "@/components/ui/primitives";
import { getArticle } from "@/lib/content/api";
import { exampleArticleSlug, frames } from "@/lib/i18n/frames";
import { localePath } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await readLocale(params);
  const article = await getArticle(locale, slug);
  const example = frames(locale);
  if (!article && slug === exampleArticleSlug) {
    return pageMetadata({ locale, path: `/news/${slug}`, title: example.news.featuredTitle, description: example.article.lede });
  }
  if (!article) return {};
  return pageMetadata({
    locale,
    path: `/news/${slug}`,
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const locale = await readLocale(params);
  const article = await getArticle(locale, slug);
  const example = slug === exampleArticleSlug;
  if (!article && !example) notFound();
  const t = copy(locale);
  const f = frames(locale);
  const page = f.article;
  const title = article?.title || f.news.featuredTitle;
  const data = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || undefined,
    datePublished: article.date || undefined,
    author: article.author ? { "@type": "Person", name: article.author } : undefined,
    mainEntityOfPage: `${siteUrl()}${article.href}`,
  } : null;
  return (
    <>
      <PageHero
        locale={locale}
        crumbs={[{ label: f.news.title, href: localePath(locale, "/news") }, { label: title }]}
        code={page.code}
        title={title}
        lede={article ? [article.category, article.date, article.author].filter(Boolean).join(" · ") || article.excerpt : page.lede}
      />
      <Section>
        {!article ? <InfoNote>{page.note}</InfoNote> : null}
        {!article ? (
          <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
            <nav aria-label={page.contents}>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{page.contents}</p>
              <ol className="mt-4 grid gap-3 text-sm">
                {page.sections.map(([heading], index) => (
                  <li key={heading}><a href={`#s${index + 1}`} className="hover:text-muted">{String(index + 1).padStart(2, "0")} / {heading}</a></li>
                ))}
              </ol>
              <p className="mt-6 text-sm text-muted">{page.status}</p>
            </nav>
            <div>
              <p className="max-w-2xl text-lg leading-8">{page.intro}</p>
              <div className="mt-8"><ConceptPlate title="NF / P&ID — CONCEPT" caption={f.schematic} /></div>
              <div className="mt-12 grid gap-12">
                {page.sections.map(([heading, first, second], index) => (
                  <article key={heading} id={`s${index + 1}`}>
                    <IndexTitle index={String(index + 1).padStart(2, "0")} title={heading} />
                    <p className="mt-4 max-w-2xl leading-7">{first}</p>
                    <p className="mt-4 max-w-2xl leading-7 text-muted">{second}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-10">
            {article.hero ? <TechnicalMedia media={article.hero} label={article.title} /> : null}
            <Prose text={article.body} />
            {article.gallery.map((item) => (
              <figure key={item.media.src}>
                <TechnicalMedia media={item.media} label={item.caption || article.title} />
                {item.caption ? <figcaption className="mt-2 text-sm text-muted">{item.caption}</figcaption> : null}
              </figure>
            ))}
            {article.documents.length ? <DocumentList items={article.documents} locale={locale} /> : null}
          </div>
        )}
        <div className="mt-12 border border-border bg-surface p-6">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{page.principle}</p>
          <p className="type-h3 mt-3">{page.principleText}</p>
          <Link href={localePath(locale, "/news")} className="mt-4 inline-flex items-center gap-2 text-sm">{f.allMaterials} <span aria-hidden>↗</span></Link>
        </div>
      </Section>
      <NextStep locale={locale} />
      {data ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} /> : null}
    </>
  );
}
