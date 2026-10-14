"use client";

import { useEffect, useSyncExternalStore } from "react";

import type { Locale } from "@/lib/i18n/locales";
import { copy } from "@/lib/i18n/ui";

const storageKey = "nf-analytics";
const changeEvent = "nf-analytics-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(changeEvent, onStoreChange);
  return () => window.removeEventListener(changeEvent, onStoreChange);
}

function consentSnapshot() {
  const saved = window.localStorage.getItem(storageKey);
  return saved === "yes" || saved === "no" ? saved : "unknown";
}

export function Analytics({
  locale,
  provider,
  id,
}: {
  locale: Locale;
  provider: string;
  id: string;
}) {
  const t = copy(locale);
  const choice = useSyncExternalStore(subscribe, consentSnapshot, () => "unknown" as const);

  useEffect(() => {
    if (choice !== "yes") return;
    if (provider === "ga4") {
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      script.async = true;
      document.head.appendChild(script);
      const inline = document.createElement("script");
      inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`;
      document.head.appendChild(inline);
    }
    if (provider === "ym") {
      const inline = document.createElement("script");
      inline.text = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${Number(id)},'init',{clickmap:false,trackLinks:false,accurateTrackBounce:true,webvisor:false});`;
      document.head.appendChild(inline);
    }
  }, [choice, provider, id]);

  if (choice !== "unknown") return null;

  function save(next: "yes" | "no") {
    window.localStorage.setItem(storageKey, next);
    window.dispatchEvent(new Event(changeEvent));
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 border border-border bg-surface p-4 shadow-sm sm:inset-x-auto sm:right-4 sm:max-w-sm">
      <p className="text-sm leading-6">{t.analyticsConsent}</p>
      <div className="mt-3 flex gap-3">
        <button type="button" className="bg-foreground px-3 py-2 text-sm text-surface" onClick={() => save("yes")}>
          {t.analyticsAccept}
        </button>
        <button type="button" className="border border-border px-3 py-2 text-sm" onClick={() => save("no")}>
          {t.analyticsDecline}
        </button>
      </div>
    </div>
  );
}

export function ViewBeacon({ event, id }: { event: string; id: string }) {
  useEffect(() => {
    void import("@/components/analytics/track").then(({ track }) => track(event, { id }));
  }, [event, id]);
  return null;
}
