import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/locales";
import { copy } from "@/lib/i18n/ui";

export function notFoundDocument(locale: Locale) {
  const t = copy(locale);
  const home = localePath(locale);
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>${t.notFound} — ${t.brand}</title>
<style>
  body{margin:0;background:#f3f4f5;color:#1a1d21;font-family:"IBM Plex Sans","Segoe UI",sans-serif}
  main{max-width:1360px;margin:0 auto;padding:6rem 1.5rem}
  .k{font-family:"IBM Plex Mono",ui-monospace,monospace;letter-spacing:.18em;text-transform:uppercase;color:#008dd2;font-size:.75rem}
  h1{font-size:clamp(2rem,5vw,3.25rem);font-weight:500;letter-spacing:-.03em;margin:1rem 0}
  p{color:#5c656e;max-width:36rem;line-height:1.6}
  a{display:inline-flex;margin-top:2rem;background:#008dd2;color:#fff;text-decoration:none;padding:.8rem 1.25rem}
  a:focus-visible{outline:2px solid #008dd2;outline-offset:3px}
</style>
</head>
<body>
<main>
  <p class="k">${t.coordinate} / 00</p>
  <h1>${t.notFound}</h1>
  <p>${t.notFoundText}</p>
  <p class="k">X 00.00 · Y 00.00</p>
  <a href="${home}">${t.backHome}</a>
</main>
</body>
</html>`;
}
