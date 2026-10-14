import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ViewBeacon } from "@/components/analytics/Analytics";
import { ConceptPlate, ImageSlot, IndexTitle, InfoNote, NextStep } from "@/components/ui/frames";
import { ChamferedButton, DocumentList, PageHero, Section, SpecTable, TechnicalMedia } from "@/components/ui/primitives";
import { getEquipment, getEquipmentTree } from "@/lib/content/api";
import { frames } from "@/lib/i18n/frames";
import { localePath } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { pageMetadata } from "@/lib/seo";

async function direction(locale: "ru" | "en", slug: string) {
  const known = frames(locale).equipment.directions.find((item) => item.slug === slug);
  if (known) return known;
  const tree = await getEquipmentTree(locale);
  const category = tree.flatMap((group) => group.categories).find((item) => item.slug === slug);
  if (!category) return null;
  return { slug, group: category.groupSlug, code: "NF / EQUIPMENT", title: category.title, summary: category.summary };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await readLocale(params);
  const item = await getEquipment(locale, slug);
  const card = frames(locale).card;
  if (item) {
    return pageMetadata({
      locale,
      path: `/equipment/${slug}`,
      title: item.seoTitle || item.title,
      description: item.seoDescription || item.summary || card.lede,
    });
  }
  const category = await direction(locale, slug);
  if (!category) return {};
  return pageMetadata({ locale, path: `/equipment/${slug}`, title: category.detail || category.title, description: category.detail ? card.lede : category.summary || card.lede });
}

export default async function EquipmentDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const locale = await readLocale(params);
  const item = await getEquipment(locale, slug);
  const category = item ? null : await direction(locale, slug);
  if (!item && !category) notFound();
  const t = copy(locale);
  const f = frames(locale);
  const card = f.card;
  const title = item?.title || category?.detail || category?.title || "";
  const summary = item?.summary || (category?.detail ? card.lede : category?.summary) || card.lede;
  const specs = item?.specs.length
    ? item.specs
    : card.specRows.map((label) => ({ label, value: f.pending, unit: "", notes: "" }));
  return (
    <>
      {item ? <ViewBeacon event="equipment_opened" id={slug} /> : null}
      <PageHero
        locale={locale}
        crumbs={[{ label: t.nav.equipment, href: localePath(locale, "/equipment") }, { label: title }]}
        code={category?.code ? `${category.code} / DETAIL` : card.code}
        title={title}
        lede={summary}
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <ConceptPlate title={`${category?.code || "NF / THERMAL"} — CONCEPT`} caption={f.schematic} />
          {item?.images[0] ? <TechnicalMedia media={item.images[0]} label={title} /> : <ImageSlot label={t.noImage} />}
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{t.furnacesEyebrow}</p>
            <h2 className="type-h2 mt-3">{card.fromProcess}</h2>
            <p className="mt-4 max-w-2xl leading-7 text-muted">{item?.body || card.fromProcessText}</p>
          </div>
          <dl className="grid content-start gap-4 text-sm">
            <div>
              <dt className="text-muted">{card.model}</dt>
              <dd className="mt-1 font-medium">{card.modelValue}</dd>
            </div>
            <div>
              <dt className="text-muted">{card.execution}</dt>
              <dd className="mt-1 font-medium">{card.executionValue}</dd>
            </div>
            <ChamferedButton href={`${localePath(locale, "/contacts")}?source=${encodeURIComponent(localePath(locale, `/equipment/${slug}`))}`}>{f.requestSelection} <span aria-hidden>↗</span></ChamferedButton>
            <p className="text-muted">{card.serialNote}</p>
          </dl>
        </div>
        <nav aria-label={card.specsTitle} className="mt-12 flex flex-wrap gap-6 border-y border-border py-4 font-mono text-[0.72rem] uppercase tracking-[0.14em]">
          {card.tabs.map(([href, label]) => (
            <a key={href} href={href} className="hover:text-muted">{label}</a>
          ))}
        </nav>
      </Section>
      <Section id="specs" surface>
        <IndexTitle index={card.specs} title={card.specsTitle} />
        <div className="mt-8"><SpecTable rows={specs} /></div>
        <div className="mt-8"><InfoNote>{card.specNote}</InfoNote></div>
      </Section>
      <Section>
        <IndexTitle index={card.together} title={card.togetherTitle} />
        <p className="mt-4 max-w-2xl text-muted">{card.togetherText}</p>
        <p className="mt-6 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{card.flow}</p>
      </Section>
      <Section id="scope" surface>
        <IndexTitle index={card.scope} title={card.scopeTitle} />
        <ol className="mt-8 grid gap-px bg-border md:grid-cols-3">
          {card.scopeCards.map(([heading, text], index) => (
            <li key={heading} className="bg-surface p-5">
              <p className="font-mono text-sm text-muted">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 font-medium">{heading}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section id="docs">
        <IndexTitle index={card.docs} title={card.docsTitle} />
        <div className="mt-8">
          {item?.documents.length ? <DocumentList items={item.documents} locale={locale} /> : <InfoNote>{card.docsNote}</InfoNote>}
        </div>
        {item && item.projects.length ? (
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {item.projects.map((project) => (
              <li key={project.href}><Link href={project.href} className="block py-3 hover:text-muted">{project.title}</Link></li>
            ))}
          </ul>
        ) : null}
      </Section>
      <NextStep locale={locale} />
    </>
  );
}
