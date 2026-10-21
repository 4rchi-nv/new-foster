import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { Analytics } from "@/components/analytics/Analytics";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getSite } from "@/lib/content/api";
import { readLocale } from "@/lib/i18n/page";
import { copy } from "@/lib/i18n/ui";
import { siteUrl } from "@/lib/utils";

import "../../globals.css";

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: "#f3f4f5",
};

const sans = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-family",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-mono-family",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await readLocale(params);
  const t = copy(locale);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t.brand, template: `%s — ${t.brand}` },
    description: locale === "ru"
      ? "Инженерные решения, производство и поставка оборудования для нефтепереработки и нефтехимии."
      : "Engineering, manufacturing, and supply of equipment for oil refining and petrochemicals.",
    icons: {
      icon: "/avatar/nf-avatar.png",
      apple: "/avatar/nf-avatar.png",
    },
    openGraph: {
      images: [{ url: "/nf-horizontal-logo/two-colors/nf-horizontal-logo-two-colors.png", alt: "New Foster" }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = await readLocale(params);
  const t = copy(locale);
  const pathname = (await headers()).get("x-nf-path") || `/${locale}`;
  const site = await getSite(locale);
  const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  const analyticsProvider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.companyName || "New Foster",
    legalName: site.legalName || undefined,
    url: siteUrl(),
    logo: `${siteUrl()}/nf-horizontal-logo/two-colors/nf-horizontal-logo-two-colors.png`,
    email: site.email || undefined,
    telephone: site.phone || undefined,
    description: site.positioning || undefined,
  };

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${sans.variable} ${mono.variable} h-full`}>
      <body className={`${sans.className} flex min-h-full flex-col antialiased`}>
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-3 focus:py-2">
          {t.skip}
        </a>
        <SiteHeader locale={locale} pathname={pathname} />
        <main id="content" className="flex-1">{children}</main>
        <SiteFooter locale={locale} pathname={pathname} site={site} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        {analyticsId && analyticsProvider ? <Analytics locale={locale} id={analyticsId} provider={analyticsProvider} /> : null}
      </body>
    </html>
  );
}
