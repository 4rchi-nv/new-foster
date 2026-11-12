import type { Metadata } from "next";

import { PageHero, Section, TechnicalLabel } from "@/components/ui/primitives";
import { getSite } from "@/lib/content/api";
import { company } from "@/lib/company";
import { pick } from "@/lib/content/pick";
import { frames } from "@/lib/i18n/frames";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = copy(locale);
  const page = frames(locale).contacts;
  return pageMetadata({
    locale,
    path: "/contacts",
    title: t.nav.contacts,
    description: page.lede,
  });
}

export default async function ContactsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params);
  const t = copy(locale);
  const page = frames(locale).contacts;
  const site = await getSite(locale);
  const phone = pick(site.phone, company.phone);
  const email = pick(site.email, company.email);
  const address = pick(site.address, company.address);
  const facts = [
    [page.email, email, `mailto:${email}`],
    [page.phone, phone, `tel:${phone.replace(/[^\d+]/g, "")}`],
    [page.address, address, ""],
    [page.inn, company.inn, ""],
    [page.ogrn, company.ogrn, ""],
  ] as const;
  return (
    <>
      <PageHero
        locale={locale}
        crumbs={[{ label: t.nav.contacts }]}
        code={page.code}
        title={t.nav.contacts}
        lede={page.lede}
      />
      <Section>
        <TechnicalLabel>{site.companyName || t.companyName}</TechnicalLabel>
        <h2 className="type-h2 mt-4">{page.title}</h2>
        <p className="mt-4 max-w-xl leading-7 text-muted">{page.text}</p>
        <dl className="mt-8 max-w-3xl divide-y divide-border border-y border-border">
          {facts.map(([label, value, href]) => (
            <div key={label} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr]">
              <dt className="text-muted">{label}</dt>
              <dd>{href ? <a href={href}>{value}</a> : value}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
