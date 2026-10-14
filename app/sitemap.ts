import type { MetadataRoute } from "next";

import { publishedSlugs } from "@/lib/content/api";
import { locales, localePath } from "@/lib/i18n/locales";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const paths = ["/", "/company", "/expertise", "/documents", "/equipment", "/projects", "/standards", "/news", "/contacts"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteUrl();
  const [equipment, projects, articles] = await Promise.all([
    publishedSlugs("equipment"),
    publishedSlugs("projects"),
    publishedSlugs("articles"),
  ]);
  const dynamicPaths = [
    ...equipment.map((slug) => `/equipment/${slug}`),
    ...projects.map((slug) => `/projects/${slug}`),
    ...articles.map((slug) => `/news/${slug}`),
  ];
  return [...paths, ...dynamicPaths].flatMap((path) =>
    locales.map((locale) => ({
      url: `${site}${localePath(locale, path)}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          ru: `${site}${localePath("ru", path)}`,
          en: `${site}${localePath("en", path)}`,
        },
      },
    })),
  );
}
