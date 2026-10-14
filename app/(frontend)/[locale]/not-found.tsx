import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import { Container } from "@/components/ui/primitives";
import { localePath } from "@/lib/i18n/locales";
import { copy } from "@/lib/i18n/ui";

export async function generateMetadata(): Promise<Metadata> {
  const path = (await headers()).get("x-nf-path") || "/ru";
  const locale = path.startsWith("/en") ? "en" : "ru";
  return { title: copy(locale).notFound };
}

export default async function NotFound() {
  const path = (await headers()).get("x-nf-path") || "/ru";
  const locale = path.startsWith("/en") ? "en" : "ru";
  const t = copy(locale);
  return (
    <Container className="grid gap-8 py-24 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
      <div>
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">NF / ERROR — 404</p>
        <p className="mt-6 font-mono text-6xl text-foreground">404</p>
        <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">{locale === "ru" ? "Маршрут не определён" : "Route not defined"}</p>
        <h1 className="type-h1 mt-4">{locale === "ru" ? "Такой страницы нет в схеме" : "This page is not in the scheme"}</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted">
          {locale === "ru"
            ? "Возможно, ссылка изменилась или адрес указан с ошибкой. Вернитесь на главную или выберите нужный раздел."
            : "The link may have changed, or the address is wrong. Return home or choose a section."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={localePath(locale)} className="inline-flex min-h-11 items-center gap-2 bg-brand px-5 py-2.5 text-surface">{t.backHome} <span aria-hidden>↗</span></Link>
          <Link href={localePath(locale, "/contacts")} className="inline-flex min-h-11 items-center gap-2 border border-border bg-surface px-5 py-2.5">{t.nav.contacts} <span aria-hidden>↗</span></Link>
        </div>
      </div>
    </Container>
  );
}
