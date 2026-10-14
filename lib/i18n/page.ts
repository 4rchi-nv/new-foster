import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/lib/i18n/locales";

export async function readLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
