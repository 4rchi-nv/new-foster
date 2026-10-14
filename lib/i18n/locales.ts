export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localePath(locale: Locale, path = "/") {
  if (!path || path === "/") return `/${locale}`;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${suffix}`;
}

export function swapLocale(pathname: string, next: Locale) {
  const parts = pathname.split("/");
  if (parts[1] === "ru" || parts[1] === "en") {
    parts[1] = next;
    const joined = parts.join("/");
    return joined === "" ? `/${next}` : joined;
  }
  return localePath(next, pathname);
}
