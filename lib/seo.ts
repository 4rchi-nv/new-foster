import type { Metadata } from "next";

import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { siteUrl } from "@/lib/utils";

export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const site = siteUrl();
  const canonical = `${site}${localePath(locale, path)}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ru: `${site}${localePath("ru", path)}`,
        en: `${site}${localePath("en", path)}`,
        "x-default": `${site}${localePath("ru", path)}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: locale === "ru" ? "ru_RU" : "en_US",
      alternateLocale: locale === "ru" ? ["en_US"] : ["ru_RU"],
      siteName: "New Foster",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
