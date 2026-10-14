import type { Metadata } from "next";

import { HomeView } from "@/components/home/HomeView";
import { getArticles, getEquipmentTree, getExpertise, getMetrics, getProjects, getSite } from "@/lib/content/api";
import { readLocale } from "@/lib/i18n/page";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await readLocale(params);
  const site = await getSite(locale);
  return pageMetadata({
    locale,
    path: "/",
    title: site.seoTitle || site.companyName || "New Foster",
    description: site.seoDescription || site.heroLead,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params);
  const [site, expertise, metrics, groups, projects, articles] = await Promise.all([
    getSite(locale),
    getExpertise(locale),
    getMetrics(locale),
    getEquipmentTree(locale),
    getProjects(locale),
    getArticles(locale),
  ]);
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.companyName || "New Foster",
    url: siteUrl(),
    inLanguage: ["ru", "en"],
  };
  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    <HomeView
      locale={locale}
      site={site}
      expertise={expertise}
      metrics={metrics}
      groups={groups}
      projects={projects.items.slice(0, 4)}
      articles={articles.items.slice(0, 3)}
    />
    </>
  );
}
