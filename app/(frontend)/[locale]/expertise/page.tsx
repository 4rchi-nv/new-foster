import type { Metadata } from "next";

import { FilterLinks, IndexTitle, InfoNote, NextStep } from "@/components/ui/frames";
import { Container, PageHero, Section } from "@/components/ui/primitives";
import { frames } from "@/lib/i18n/frames";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = copy(locale);
  const f = frames(locale);
  return pageMetadata({ locale, path: "/expertise", title: t.nav.expertise, description: f.expertise.lede });
}

export default async function ExpertisePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params);
  const t = copy(locale);
  const f = frames(locale);
  const page = f.expertise;
  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.nav.expertise }]} code={page.code} title={t.nav.expertise} lede={page.lede} />
      <Section>
        <FilterLinks
          label={t.filterLabel}
          items={[
            { href: "#directions", label: page.filters[0], current: false },
            ...f.skills.map((skill, index) => ({
              href: `#${skill.slug}`,
              label: page.filters[index + 1] ?? skill.title,
              current: false,
            })),
          ]}
        />
        <div className="mt-8"><InfoNote>{page.note}</InfoNote></div>
        <div id="directions" className="mt-12 grid gap-16">
          {f.skills.map((skill, index) => (
            <article key={skill.slug} id={skill.slug}>
              <IndexTitle index={`${String(index + 1).padStart(2, "0")} / ${page.kicker}`} title={skill.title} />
              <p className="mt-4 max-w-2xl text-muted">{skill.text}</p>
              <ol className="mt-6 divide-y divide-border border-y border-border">
                {skill.steps.map((step, stepIndex) => (
                  <li key={step} className="flex gap-4 py-4">
                    <span className="font-mono text-sm text-muted">{String(stepIndex + 1).padStart(2, "0")}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-muted">{f.stageResult}</p>
            </article>
          ))}
        </div>
      </Section>
      <NextStep locale={locale} />
    </>
  );
}
