"use client";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  ym?: (id: number, method: string, target: string, params?: Record<string, string>) => void;
};

export function track(name: string, params?: Record<string, string>) {
  if (typeof window === "undefined") return;
  const host = window as AnalyticsWindow;
  host.dataLayer = host.dataLayer || [];
  host.dataLayer.push({ event: name, ...params });
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  const id = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  if (!id) return;
  if (provider === "ga4" && host.gtag) host.gtag("event", name, params);
  if (provider === "ym" && host.ym) host.ym(Number(id), "reachGoal", name, params);
}
