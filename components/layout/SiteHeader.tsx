import Link from "next/link";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { CtaLink } from "@/components/layout/CtaLink";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/ui/primitives";
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
  ["documents", "/documents"],
  ["contacts", "/contacts"],
] as const;

export function SiteHeader({ locale, pathname }: { locale: Locale; pathname: string }) {
  const t = copy(locale);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <Container className="flex h-16 items-center gap-6">
        <Link href={localePath(locale)} className="shrink-0">
          <BrandLogo variant="auto" priority />
        </Link>
        <nav className="ml-auto hidden items-center gap-5 min-[1400px]:flex" aria-label={locale === "ru" ? "Основное меню" : "Main"}>
          {links.map(([key, href]) => {
            const path = localePath(locale, href);
            const active = pathname === path || pathname.startsWith(`${path}/`);
            return (
              <Link
                key={key}
                href={path}
                aria-current={active ? "page" : undefined}
                className={active ? "text-sm text-foreground" : "text-sm text-muted hover:text-foreground"}
              >
                {t.nav[key]}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-4 min-[1400px]:flex">
          <p className="font-mono text-xs">
            <Link href={swapLocale(pathname, "ru")} hrefLang="ru" className={locale === "ru" ? "text-foreground" : "text-muted"}>RU</Link>
            <span className="px-1.5 text-muted" aria-hidden>/</span>
            <Link href={swapLocale(pathname, "en")} hrefLang="en" className={locale === "en" ? "text-foreground" : "text-muted"}>EN</Link>
          </p>
          <CtaLink href={localePath(locale, "/contacts")} place="header" className="inline-flex items-center gap-2 bg-brand px-4 py-2 text-sm text-surface">
            {t.cta} <span aria-hidden>↗</span>
          </CtaLink>
        </div>
        <div className="ml-auto min-[1400px]:hidden">
          <MobileNav locale={locale} pathname={pathname} />
        </div>
      </Container>
    </header>
  );
}
