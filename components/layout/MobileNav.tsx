"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { track } from "@/components/analytics/track";
import { BrandLogo } from "@/components/layout/BrandLogo";
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

export function MobileNav({ locale, pathname }: { locale: Locale; pathname: string }) {
  const t = copy(locale);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="min-[1400px]:hidden">
      <button
        type="button"
        className="min-h-11 px-3 font-mono text-xs uppercase tracking-[0.14em]"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? t.close : t.menu}
      </button>
      {open ? (
        <div id="mobile-nav" role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-50 bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <BrandLogo id={titleId} className="h-8 w-auto" />
            <button ref={closeRef} type="button" className="min-h-11 px-3 font-mono text-xs uppercase tracking-[0.14em]" onClick={() => setOpen(false)}>
              {t.close}
            </button>
          </div>
          <nav className="flex flex-col px-4 py-6">
            {links.map(([key, href]) => (
              <Link
                key={key}
                href={localePath(locale, href)}
                className="border-b border-border py-4 text-2xl"
                onClick={() => setOpen(false)}
              >
                {t.nav[key]}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between px-4">
            <Link
              href={localePath(locale, "/contacts")}
              className="inline-flex items-center gap-2 bg-brand px-5 py-3 text-surface"
              onClick={() => {
                track("contact_cta_click", { place: "menu" });
                setOpen(false);
              }}
            >
              {t.cta} <span aria-hidden>↗</span>
            </Link>
            <div className="font-mono text-sm">
              <Link href={swapLocale(pathname, "ru")} hrefLang="ru" className={locale === "ru" ? "text-foreground" : "text-muted"}>RU</Link>
              <span className="px-2 text-muted">/</span>
              <Link href={swapLocale(pathname, "en")} hrefLang="en" className={locale === "en" ? "text-foreground" : "text-muted"}>EN</Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
