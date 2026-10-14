import Link from "next/link";
import type { ReactNode } from "react";

import { FurnaceDiagram } from "@/components/graphics/FurnaceDiagram";
import { ChamferedButton, Section, TechnicalLabel } from "@/components/ui/primitives";
import { frames } from "@/lib/i18n/frames";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { copy } from "@/lib/i18n/ui";
import { cn } from "@/lib/utils";

export function NextStep({ locale }: { locale: Locale }) {
  const f = frames(locale);
  const t = copy(locale);
  return (
    <Section className="border-t border-border">
      <TechnicalLabel>{f.nextEyebrow}</TechnicalLabel>
      <h2 className="type-h2 mt-4 max-w-xl">{f.nextTitle}</h2>
      <p className="mt-4 max-w-xl text-muted">{f.nextText}</p>
      <div className="mt-8">
        <ChamferedButton href={localePath(locale, "/contacts")}>{t.cta} <span aria-hidden>↗</span></ChamferedButton>
      </div>
    </Section>
  );
}

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <aside className="flex gap-4 border border-border bg-brand-subtle px-5 py-4 text-sm leading-6">
      <span className="font-mono text-muted">[ i ]</span>
      <p>{children}</p>
    </aside>
  );
}

export function ImageSlot({ label }: { label: string }) {
  return (
    <div className="grid min-h-48 place-items-center border border-border bg-surface-muted px-6 py-10">
      <p className="text-center font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">{label}</p>
    </div>
  );
}

export function ConceptPlate({ title, caption }: { title: string; caption: string }) {
  return <FurnaceDiagram title={title} caption={caption} />;
}

export function FilterLinks({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string; current: boolean }[];
}) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={`${item.href}-${item.label}`}
          href={item.href}
          aria-current={item.current ? "page" : undefined}
          className={cn(
            "border px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.12em]",
            item.current ? "border-foreground bg-surface text-foreground" : "border-border bg-surface text-muted hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function SearchField({
  action,
  label,
  value,
  hidden,
}: {
  action: string;
  label: string;
  value?: string;
  hidden?: Record<string, string>;
}) {
  return (
    <form action={action} className="max-w-xl">
      {hidden ? Object.entries(hidden).map(([name, item]) => <input key={name} type="hidden" name={name} value={item} />) : null}
      <label className="block">
        <span className="sr-only">{label}</span>
        <input
          name="q"
          defaultValue={value}
          placeholder={label}
          className="w-full border border-border bg-surface px-4 py-3 text-base"
        />
      </label>
    </form>
  );
}

export function queryHref(path: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

export function IndexTitle({ index, title }: { index: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">{index}</p>
      <h2 className="type-h2 mt-3">{title}</h2>
    </div>
  );
}
