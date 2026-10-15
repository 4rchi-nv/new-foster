import type { Metadata } from "next";
import Link from "next/link";

import { ConceptPlate, IndexTitle, InfoNote, NextStep } from "@/components/ui/frames";
import { PageHero, Section } from "@/components/ui/primitives";
import { getExpertise, getMetrics, getSite } from "@/lib/content/api";
import { pick } from "@/lib/content/pick";
import { frames } from "@/lib/i18n/frames";
import { localePath } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = copy(locale);
  const f = frames(locale);
  const site = await getSite(locale);
  return pageMetadata({
    locale,
    path: "/company",
    title: t.nav.company,
    description: pick(site.pages.company.lede, f.company.lede),
  });
}

export default async function CompanyPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params);
  const t = copy(locale);
  const f = frames(locale);
  const c = f.company;
  const [site, metrics, expertise] = await Promise.all([getSite(locale), getMetrics(locale), getExpertise(locale)]);
  const page = site.pages.company;
  const skills = expertise.length
    ? expertise.map((item) => ({ slug: item.slug, title: item.title, text: item.text }))
    : f.skills;
  const facts = metrics.length
    ? metrics.map((metric) => [metric.label, `${metric.value}${metric.suffix}`] as const)
    : f.stats.map(([label]) => [label, f.figurePending] as const);
  return (
    <>
      <PageHero
        locale={locale}
        crumbs={[{ label: t.nav.company }]}
        code={c.code}
        title={t.nav.company}
        lede={pick(page.lede, c.lede)}
      />
      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.8fr)]">
          <div>
            <IndexTitle index={c.profile} title={pick(page.profileTitle, c.profileTitle)} />
            <p className="mt-5 max-w-2xl text-lg leading-8">{pick(page.profileLead, c.profileLead)}</p>
            <p className="mt-4 max-w-2xl leading-7 text-muted">{pick(page.profileText, c.profileText)}</p>
          </div>
          <ConceptPlate title="NF / P&ID — CONCEPT" caption={f.schematic} />
        </div>
      </Section>
      <Section surface>
        <IndexTitle index={c.directions} title={pick(page.directionsTitle, c.directionsTitle)} />
        <ol className="mt-10 divide-y divide-border border-y border-border">
          {skills.map((skill, index) => (
            <li key={skill.slug}>
              <Link href={`${localePath(locale, "/expertise")}#${skill.slug}`} className="grid gap-3 py-5 md:grid-cols-[4rem_16rem_1fr_auto] md:items-baseline">
                <span className="font-mono text-sm text-muted">{String(index + 1).padStart(2, "0")}</span>
                <span className="font-medium">{skill.title}</span>
                <span className="text-muted">{skill.text}</span>
                <span aria-hidden>↗</span>
              </Link>
            </li>
          ))}
        </ol>
      </Section>
      <Section>
        <IndexTitle index={c.facts} title={pick(page.factsTitle, c.factsTitle)} />
        <dl className="mt-8 grid gap-px bg-border sm:grid-cols-3">
          {facts.map(([label, value]) => (
            <div key={label} className="bg-surface p-5">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="mt-3 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 font-medium">{site.legalName || site.companyName || t.companyName}</p>
        <p className="mt-2 max-w-2xl text-muted">{pick(page.legal, c.legal)}</p>
        <Link href={localePath(locale, "/documents")} className="mt-4 inline-flex items-center gap-2 text-sm">{pick(page.docsLink, c.docsLink)} <span aria-hidden>↗</span></Link>
        <div className="mt-8"><InfoNote>{pick(page.note, c.note)}</InfoNote></div>
      </Section>
      <NextStep locale={locale} />
    </>
  );
}
