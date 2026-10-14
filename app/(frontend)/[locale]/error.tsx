"use client";

import { usePathname } from "next/navigation";

import { Container } from "@/components/ui/primitives";
import { localePath } from "@/lib/i18n/locales";
import { copy } from "@/lib/i18n/ui";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const pathname = usePathname() || "/ru";
  const locale = pathname.startsWith("/en") ? "en" : "ru";
  const t = copy(locale);
  return (
    <Container className="py-24">
      <h1 className="type-h1">{t.errorTitle}</h1>
      <p className="mt-4 max-w-lg text-muted">{t.errorText}</p>
      <div className="mt-8 flex gap-4">
        <button type="button" className="chamfer bg-foreground px-5 py-3 text-surface [--cut:10px]" onClick={reset}>
          {t.retry}
        </button>
        <a href={localePath(locale)} className="inline-flex items-center underline decoration-brand underline-offset-4">
          {t.backHome}
        </a>
      </div>
    </Container>
  );
}
