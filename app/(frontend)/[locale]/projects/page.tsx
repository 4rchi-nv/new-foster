import type { Metadata } from "next";
import Link from "next/link";

import { Pager } from "@/components/content/Pager";
import { FilterLinks, ImageSlot, IndexTitle, InfoNote, NextStep, queryHref } from "@/components/ui/frames";
import { PageHero, Section, TechnicalMedia } from "@/components/ui/primitives";
import { getProjects, getSite } from "@/lib/content/api";
import { pick } from "@/lib/content/pick";
import { exampleProjectSlug, frames } from "@/lib/i18n/frames";
import { localePath } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = copy(locale);
  const f = frames(locale);
  const site = await getSite(locale);
  return pageMetadata({ locale, path: "/projects", title: t.nav.projects, description: pick(site.pages.projects.lede, f.projects.lede) });
}

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; category?: string; focus?: string }>;
}) {
  const locale = await readLocale(params);
  const query = await searchParams;
  const t = copy(locale);
  const f = frames(locale);
  const pageCopy = f.projects;
  const site = await getSite(locale);
  const cms = site.pages.projects;
  const path = localePath(locale, "/projects");
  const page = Number(query.page || 1);
  const data = await getProjects(locale, { page, category: query.category });
  const showExample = !data.items.length && (!query.focus || query.focus === "furnaces");
  const filters = data.filters.length
    ? [{ href: path, label: t.filterAll, current: !query.category }, ...data.filters.map((filter) => ({
      href: queryHref(path, { category: filter.slug }),
      label: filter.title,
      current: query.category === filter.slug,
    }))]
    : pageCopy.filters.map(([focus, label]) => ({
      href: queryHref(path, { focus }),
      label,
      current: (query.focus || "") === focus,
    }));
  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.nav.projects }]} code={pageCopy.code} title={t.nav.projects} lede={pick(cms.lede, pageCopy.lede)} />
      <Section>
        <FilterLinks label={t.filterLabel} items={filters} />
        {data.items.length ? (
          <ul className="mt-10 grid gap-8">
            {data.items.map((project) => (
              <li key={project.slug}>
                <Link href={project.href} className="grid gap-5 border border-border bg-surface p-5 sm:grid-cols-[240px_1fr]">
                  <TechnicalMedia media={project.cover} label={t.noImage} />
                  <div>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{[project.category, project.equipmentName].filter(Boolean).join(" / ")}</p>
                    <h2 className="type-h3 mt-2">{project.title}</h2>
                    {project.scope ? <p className="mt-3 text-muted">{project.scope}</p> : null}
                    <p className="mt-4 text-sm">{t.readCase} ↗</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : showExample ? (
          <article className="mt-10 grid gap-5 border border-border bg-surface p-5 sm:grid-cols-[240px_1fr]">
            <ImageSlot label={t.noImage} />
            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{pageCopy.exampleMeta}</p>
              <h2 className="type-h3 mt-2">{pageCopy.exampleTitle}</h2>
              <p className="mt-3 text-muted">{pageCopy.exampleText}</p>
              <Link href={localePath(locale, `/projects/${exampleProjectSlug}`)} className="mt-4 inline-flex items-center gap-2 text-sm">{t.readCase} <span aria-hidden>↗</span></Link>
            </div>
          </article>
        ) : null}
        {!data.items.length ? <div className="mt-8"><InfoNote>{pick(cms.note, pageCopy.note)}</InfoNote></div> : null}
        <Pager locale={locale} path="/projects" page={data.page} totalPages={data.totalPages} category={query.category} />
      </Section>
      <Section surface>
        <IndexTitle index={pageCopy.archive} title={pick(cms.archiveTitle, pageCopy.archiveTitle)} />
        <p className="mt-4 max-w-2xl text-muted">{pick(cms.archiveText, pageCopy.archiveText)}</p>
        <p className="mt-6 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{pageCopy.archiveFlow}</p>
      </Section>
      <NextStep locale={locale} />
    </>
  );
}
