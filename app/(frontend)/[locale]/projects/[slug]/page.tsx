import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ViewBeacon } from "@/components/analytics/Analytics";
import { ConceptPlate, ImageSlot, IndexTitle, InfoNote, NextStep } from "@/components/ui/frames";
import { DocumentList, PageHero, Prose, Section, SpecTable, TechnicalMedia } from "@/components/ui/primitives";
import { getProject } from "@/lib/content/api";
import { exampleProjectSlug, frames } from "@/lib/i18n/frames";
import { localePath } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await readLocale(params);
  const project = await getProject(locale, slug);
  const example = frames(locale);
  if (!project && slug === exampleProjectSlug) {
    return pageMetadata({ locale, path: `/projects/${slug}`, title: example.projects.exampleTitle, description: example.projectCase.lede });
  }
  if (!project) return {};
  return pageMetadata({
    locale,
    path: `/projects/${slug}`,
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.scope || project.task,
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const locale = await readLocale(params);
  const project = await getProject(locale, slug);
  const example = slug === exampleProjectSlug;
  if (!project && !example) notFound();
  const t = copy(locale);
  const f = frames(locale);
  const c = f.projectCase;
  const title = project?.title || f.projects.exampleTitle;
  const status = project?.status ? t.projectStatuses[project.status as keyof typeof t.projectStatuses] : "";
  const passport = project
    ? [
      [c.object, project.customer || f.pending],
      [t.equipmentLabel, project.equipmentName || f.pending],
      [c.period, project.year || f.pending],
      [c.participation, project.scope || f.pending],
      [c.status, status || f.pending],
    ]
    : [
      [c.object, f.projects.exampleObject],
      [t.equipmentLabel, f.projects.exampleEquipment],
      [c.period, f.pending],
      [c.participation, f.pending],
      [c.status, f.pending],
    ];
  const creativeWork = project ? {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.scope || project.task || undefined,
    url: `${siteUrl()}${project.href}`,
  } : null;
  const scopeRows = project
    ? [
      [t.task, project.task],
      [t.execution, project.execution],
      [t.manufacturing, project.manufacturing],
      [t.documents, project.documents.length ? String(project.documents.length) : f.pending],
    ].filter((row) => row[1])
    : c.scopeRows;
  return (
    <>
      {project ? <ViewBeacon event="project_opened" id={slug} /> : null}
      <PageHero
        locale={locale}
        crumbs={[{ label: t.nav.projects, href: localePath(locale, "/projects") }, { label: title }]}
        code={c.code}
        title={title}
        lede={project?.scope || c.lede}
      />
      <Section>
        {project?.cover ? <TechnicalMedia media={project.cover} label={title} /> : <ImageSlot label={t.noImage} />}
        <h2 className="type-h3 mt-10">{c.passport}</h2>
        <dl className="mt-4 divide-y divide-border border-y border-border">
          {passport.map(([label, value]) => (
            <div key={label} className="grid gap-2 py-3 sm:grid-cols-[16rem_1fr]">
              <dt className="text-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {!project ? <div className="mt-8"><InfoNote>{c.note}</InfoNote></div> : null}
      </Section>
      <Section surface>
        <IndexTitle index={c.task} title={c.taskTitle} />
        <div className="mt-4">{project?.task ? <Prose text={project.task} /> : <p className="max-w-2xl text-muted">{c.taskText}</p>}</div>
      </Section>
      <Section>
        <IndexTitle index={c.solution} title={c.solutionTitle} />
        <div className="mt-4">{project?.solution ? <Prose text={project.solution} /> : <p className="max-w-2xl text-muted">{c.solutionText}</p>}</div>
        <div className="mt-8 max-w-3xl">
          <ConceptPlate title="NF / THERMAL — CONCEPT" caption={c.diagramNote} />
        </div>
      </Section>
      <Section surface>
        <IndexTitle index={c.scope} title={c.scopeTitle} />
        <dl className="mt-6 divide-y divide-border border-y border-border">
          {scopeRows.map(([label, value]) => (
            <div key={label} className="grid gap-2 py-4 sm:grid-cols-[16rem_1fr]">
              <dt className="font-medium">{label}</dt>
              <dd className="text-muted">{value}</dd>
            </div>
          ))}
        </dl>
        {project?.specs.length ? <div className="mt-8"><SpecTable rows={project.specs} /></div> : null}
        {project?.documents.length ? <div className="mt-8"><DocumentList items={project.documents} locale={locale} /></div> : null}
      </Section>
      <Section>
        <IndexTitle index={c.result} title={project?.result ? t.result : c.resultTitle} />
        <div className="mt-4">{project?.result ? <Prose text={project.result} /> : <p className="max-w-2xl text-muted">{c.resultText}</p>}</div>
        <Link href={localePath(locale, "/projects")} className="mt-8 inline-flex items-center gap-2 text-sm">{f.backToProjects} <span aria-hidden>↗</span></Link>
      </Section>
      <NextStep locale={locale} />
      {creativeWork ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWork) }} /> : null}
    </>
  );
}
