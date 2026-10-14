import Link from "next/link";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { Container } from "@/components/ui/primitives";
import type { SiteContent } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n/locales";
import { localePath, swapLocale } from "@/lib/i18n/locales";
import { copy } from "@/lib/i18n/ui";

const links = [
  ["company", "/company"],
  ["expertise", "/expertise"],
  ["equipment", "/equipment"],
  ["projects", "/projects"],
  ["standards", "/standards"],
  ["news", "/news"],
  ["contacts", "/contacts"],
] as const;

export function SiteFooter({
  locale,
  pathname,
  site,
}: {
  locale: Locale;
  pathname: string;
  site: SiteContent;
}) {
  const t = copy(locale);
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid gap-10 py-12 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <BrandLogo className="h-8 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
            {locale === "ru"
              ? "Инженерные решения для нефтепереработки и нефтехимии."
              : "Engineering solutions for oil refining and petrochemicals."}
          </p>
          <p className="mt-3 text-sm">{site.legalName || t.companyName}</p>
        </div>
        <nav aria-label={t.footerNav}>
          <ul className="space-y-2">
            {links.filter(([key]) => key !== "contacts").map(([key, href]) => (
              <li key={key}><Link href={localePath(locale, href)} className="text-sm hover:text-muted">{t.nav[key]}</Link></li>
            ))}
            <li><Link href={localePath(locale, "/documents")} className="text-sm hover:text-muted">{t.documents}</Link></li>
            <li><Link href={localePath(locale, "/contacts")} className="text-sm hover:text-muted">{t.nav.contacts}</Link></li>
          </ul>
        </nav>
        <div>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">{locale === "ru" ? "Связаться с компанией" : "Contact the company"}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {site.phone ? <li><a href={`tel:${site.phone}`}>{site.phone}</a></li> : null}
            {site.email ? <li><a href={`mailto:${site.email}`}>{site.email}</a></li> : null}
            {site.address ? <li className="whitespace-pre-wrap text-muted">{site.address}</li> : null}
            {!site.phone && !site.email ? <li className="text-muted">{locale === "ru" ? "Телефон и email уточняются" : "Phone and email to be confirmed"}</li> : null}
            <li><Link href={localePath(locale, "/contacts")} className="inline-flex items-center gap-2">{t.inquiryTitle} <span aria-hidden>↗</span></Link></li>
          </ul>
        </div>
      </Container>
      <Container className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-4 text-xs text-muted">
        <p>© {new Date().getFullYear()} {t.rights}</p>
        <p className="font-mono">
          <Link href={swapLocale(pathname, "ru")} hrefLang="ru">RU</Link>
          <span className="px-2" aria-hidden>/</span>
          <Link href={swapLocale(pathname, "en")} hrefLang="en">EN</Link>
        </p>
      </Container>
    </footer>
  );
}
