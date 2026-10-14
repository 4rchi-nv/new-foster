import type { Metadata } from "next";

import { ProjectInquiryForm } from "@/components/inquiry/ProjectInquiryForm";
import { IndexTitle, InfoNote } from "@/components/ui/frames";
import { PageHero, Section, TechnicalLabel } from "@/components/ui/primitives";
import { getSite } from "@/lib/content/api";
import { frames } from "@/lib/i18n/frames";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = copy(locale);
  const f = frames(locale);
  return pageMetadata({ locale, path: "/contacts", title: t.nav.contacts, description: f.contacts.lede });
}

export default async function ContactsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const locale = await readLocale(params);
  const query = await searchParams;
  const t = copy(locale);
  const f = frames(locale);
  const page = f.contacts;
  const site = await getSite(locale);
  const facts = [
    [page.phone, site.phone, page.phoneValue, site.phone ? `tel:${site.phone}` : ""],
    [page.email, site.email, page.emailValue, site.email ? `mailto:${site.email}` : ""],
    [page.address, site.address, page.addressValue, ""],
    [page.hours, "", f.pending, ""],
  ] as const;
  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.nav.contacts }]} code={page.code} title={t.nav.contacts} lede={page.lede} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <TechnicalLabel>{site.companyName || t.companyName}</TechnicalLabel>
            <h2 className="type-h2 mt-4">{page.title}</h2>
            <p className="mt-4 max-w-xl leading-7 text-muted">{page.text}</p>
            <dl className="mt-8 divide-y divide-border border-y border-border">
              {facts.map(([label, value, fallback, href]) => (
                <div key={label} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr]">
                  <dt className="text-muted">{label}</dt>
                  <dd>{value && href ? <a href={href}>{value}</a> : value || fallback}</dd>
                </div>
              ))}
            </dl>
            {!site.phone && !site.email && !site.address ? <div className="mt-8"><InfoNote>{page.note}</InfoNote></div> : null}
          </div>
          <div className="grid min-h-72 place-items-center border border-border bg-surface-muted px-6 text-center">
            <div>
              <p className="font-medium">{page.map}</p>
              <p className="mt-2 text-sm text-muted">{page.mapText}</p>
            </div>
          </div>
        </div>
      </Section>
      <Section id="inquiry" surface>
        <IndexTitle index={t.inquiryTitle} title={page.formTitle} />
        <p className="mt-4 max-w-2xl text-muted">{page.formText}</p>
        <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{page.required}</p>
        <div className="mt-8 max-w-3xl">
          <ProjectInquiryForm locale={locale} source={query.source || "contacts"} />
        </div>
      </Section>
    </>
  );
}
