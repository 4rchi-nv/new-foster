import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { copy } from "@/lib/i18n/ui";
import type { DocumentView, MediaView, SpecRow } from "@/lib/content/types";
import { cn, formatBytes, siteUrl } from "@/lib/utils";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-10", className)}>{children}</div>;
}

export function Section({
  children,
  className,
  surface = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  surface?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-16 md:py-24", surface && "bg-surface", className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function TechnicalLabel({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">{children}</p>;
}

export function ChamferedButton({
  href,
  children,
  variant = "solid",
  type = "button",
  className,
}: {
  href?: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
  type?: "button" | "submit";
  className?: string;
}) {
  const face = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-[0.95rem] font-medium",
    variant === "solid" ? "bg-brand text-surface" : "border border-border bg-surface text-foreground",
    className,
  );
  if (!href) return <button type={type} className={face}>{children}</button>;
  return <Link href={href} className={face}>{children}</Link>;
}

export function Prose({ text }: { text?: string | null }) {
  if (!text?.trim()) return null;
  return (
    <div className="max-w-[68ch] space-y-4">
      {text.trim().split(/\n{2,}/).map((block, index) => (
        <p key={index} className="whitespace-pre-wrap text-[1.05rem] leading-7 text-foreground">
          {block}
        </p>
      ))}
    </div>
  );
}

export function SpecTable({ rows }: { rows: SpecRow[] }) {
  if (!rows.length) return null;
  return (
    <>
      <table className="hidden w-full border-collapse text-left md:table">
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.label}-${row.value}`} className="border-t border-border">
              <th scope="row" className="w-[34%] py-3 pr-6 font-normal text-muted">{row.label}</th>
              <td className="py-3 pr-6 font-medium">
                {row.value}
                {row.unit ? <span className="ml-1 font-normal text-muted">{row.unit}</span> : null}
              </td>
              <td className="py-3 text-sm text-muted">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="divide-y divide-border border-y border-border md:hidden">
        {rows.map((row) => (
          <div key={`${row.label}-${row.value}`} className="grid gap-1 py-3">
            <dt className="text-sm text-muted">{row.label}</dt>
            <dd className="font-medium">
              {row.value}
              {row.unit ? <span className="ml-1 font-normal text-muted">{row.unit}</span> : null}
            </dd>
            {row.notes ? <dd className="text-sm text-muted">{row.notes}</dd> : null}
          </div>
        ))}
      </dl>
    </>
  );
}

export function DocumentList({ items, locale }: { items: DocumentView[]; locale: Locale }) {
  const t = copy(locale);
  if (!items.length) return null;
  return (
    <ul className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">
              {item.kind && item.kind in t.documentKinds
                ? t.documentKinds[item.kind as keyof typeof t.documentKinds]
                : item.code || item.filename}
            </p>
            <p className="mt-1 font-medium">{item.title}</p>
            {item.description ? <p className="mt-1 max-w-2xl text-sm text-muted">{item.description}</p> : null}
          </div>
          <a href={item.href} className="shrink-0 text-sm underline decoration-brand underline-offset-4">
            {t.download}
            {item.size ? <span className="ml-2 font-mono text-xs text-muted">{formatBytes(item.size)}</span> : null}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="chamfer border border-border bg-surface px-6 py-8 [--cut:16px]">
      <p className="max-w-2xl text-muted">{children}</p>
    </div>
  );
}

export function TechnicalMedia({ media, label }: { media: MediaView | null; label: string }) {
  if (!media) {
    return (
      <div className="chamfer grid min-h-48 place-items-center bg-surface-muted px-6 [--cut:16px]">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      </div>
    );
  }
  return (
    <div className="chamfer relative bg-surface-muted [--cut:16px]">
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width || 1600}
        height={media.height || 1100}
        className="h-auto w-full"
        sizes="(min-width: 1024px) 960px, 100vw"
        unoptimized
      />
    </div>
  );
}

export function Breadcrumbs({
  locale,
  items,
  className,
}: {
  locale: Locale;
  items: { label: string; href?: string }[];
  className?: string;
}) {
  const t = copy(locale);
  const all = [{ label: t.home, href: localePath(locale) }, ...items];
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteUrl()}${item.href}` : undefined,
    })),
  };
  return (
    <nav aria-label="Breadcrumb" className={className ?? "mb-8"}>
      <ol className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-muted">
        {all.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex gap-2">
            {index > 0 ? <span aria-hidden>/</span> : null}
            {item.href && index < all.length - 1 ? (
              <Link href={item.href} className="hover:text-foreground">{item.label}</Link>
            ) : (
              <span aria-current="page" className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
    </nav>
  );
}

export function RelatedLinks({ title, items }: { title: string; items: { title: string; href: string }[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="type-h3">{title}</h2>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="flex items-center justify-between gap-4 py-3 hover:text-muted">
              <span>{item.title}</span>
              <span aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  code,
  locale,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  code?: string;
  locale?: Locale;
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <header className="border-b border-border bg-background">
      <Container className="py-14 md:py-20">
        <div className="flex items-start justify-between gap-6">
          {crumbs && locale ? (
            <Breadcrumbs locale={locale} items={crumbs} className="mb-0" />
          ) : eyebrow ? (
            <TechnicalLabel>{eyebrow}</TechnicalLabel>
          ) : <span />}
          {code ? <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">{code}</p> : null}
        </div>
        <h1 className="type-h1 mt-5 max-w-4xl text-balance">{title}</h1>
        {lede ? <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{lede}</p> : null}
      </Container>
    </header>
  );
}
