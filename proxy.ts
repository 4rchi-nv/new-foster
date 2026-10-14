import { NextResponse, type NextRequest } from "next/server";

import { notFoundDocument } from "@/lib/http/not-found-document";
import { isPublishedSlug, type SlugSection } from "@/lib/http/published-slug";
import { defaultLocale, isLocale, locales, type Locale } from "@/lib/i18n/locales";

const pages = new Set(["company", "expertise", "documents", "equipment", "projects", "standards", "news", "contacts"]);
const slugPages = new Set<SlugSection>(["equipment", "projects", "news"]);

function notFoundResponse(locale: Locale) {
  return new NextResponse(notFoundDocument(locale), {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex",
      "cache-control": "no-store",
    },
  });
}

const reserved = ["/admin", "/api"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (reserved.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const hasLocale = locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const [, locale, section, slug, extra] = pathname.split("/");
  if (isLocale(locale) && section) {
    const known = pages.has(section);
    const detail = known && slugPages.has(section as SlugSection);
    if (extra || !known || (slug && !detail) || (slug && detail && isPublishedSlug(section as SlugSection, slug) === false)) {
      return notFoundResponse(locale);
    }
  }

  const headers = new Headers(request.headers);
  headers.set("x-nf-path", pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|.*\\..*).*)"],
};
