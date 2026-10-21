"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const DEFAULT_SRC = "/nf-horizontal-logo/two-colors/nf-horizontal-logo-two-colors.png";
const WHITE_SRC = "/nf-horizontal-logo/one-color/nf-horizontal-logo-one-color-white.png";

/** Match the two-color asset box so the white PNG (taller canvas) isn't tiny. */
const LOGO_ASPECT = "3543 / 895";

export type BrandLogoVariant = "auto" | "default" | "white";

type BrandLogoProps = {
  /** `default` = two-color; `white` = white mark; `auto` = by actual header/footer surface. */
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
  id?: string;
};

function luminance(color: string): number | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return null;
  const [r, g, b] = [match[1], match[2], match[3]].map((value) => {
    const channel = Number(value) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function surfaceIsDark(element: Element): boolean {
  const bg = getComputedStyle(element).backgroundColor;
  const value = luminance(bg);
  return value !== null && value < 0.45;
}

function LogoImage({
  src,
  width,
  height,
  className,
  priority,
  id,
  style,
}: {
  src: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  id?: string;
  style?: CSSProperties;
}) {
  return (
    <Image
      id={id}
      src={src}
      alt="New Foster"
      width={width}
      height={height}
      sizes="180px"
      priority={priority}
      className={className}
      style={style}
    />
  );
}

/**
 * - `default` — two-color (light backgrounds).
 * - `white` — white mark (dark backgrounds), sized to the two-color slot.
 * - `auto` — white only when the nearest header/footer surface is actually dark
 *   (Android force-dark). Light header in dark OS still gets two-color.
 */
export function BrandLogo({
  variant = "auto",
  className = "h-9 w-auto",
  priority = false,
  id,
}: BrandLogoProps) {
  if (variant === "default") {
    return (
      <LogoImage
        id={id}
        src={DEFAULT_SRC}
        width={3543}
        height={895}
        className={className}
        priority={priority}
      />
    );
  }

  if (variant === "white") {
    return (
      <LogoImage
        id={id}
        src={WHITE_SRC}
        width={1448}
        height={1086}
        className={`brand-logo__white-fit ${className}`}
        priority={priority}
        style={{ aspectRatio: LOGO_ASPECT }}
      />
    );
  }

  return <AutoBrandLogo className={className} priority={priority} id={id} />;
}

function AutoBrandLogo({
  className,
  priority,
  id,
}: {
  className: string;
  priority?: boolean;
  id?: string;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    const clearTimers = () => {
      for (const id of timers) window.clearTimeout(id);
      timers.length = 0;
    };
    const sync = () => {
      const root = rootRef.current;
      if (!root) return;
      const surface = root.closest("header, footer, [data-logo-surface]") ?? document.body;
      setDark(surfaceIsDark(surface));
    };
    // Force-dark lands a few frames after the OS theme flips — re-check several times.
    const schedule = () => {
      clearTimers();
      sync();
      requestAnimationFrame(sync);
      for (const ms of [50, 150, 350, 700]) {
        timers.push(window.setTimeout(sync, ms));
      }
    };

    schedule();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", schedule);
    window.addEventListener("load", schedule);
    window.addEventListener("focus", schedule);
    window.addEventListener("pageshow", schedule);
    document.addEventListener("visibilitychange", schedule);

    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme", "data-color-mode"],
    });
    const surface = rootRef.current?.closest("header, footer, [data-logo-surface]");
    if (surface) observer.observe(surface, { attributes: true, attributeFilter: ["class", "style"] });

    return () => {
      clearTimers();
      media.removeEventListener("change", schedule);
      window.removeEventListener("load", schedule);
      window.removeEventListener("focus", schedule);
      window.removeEventListener("pageshow", schedule);
      document.removeEventListener("visibilitychange", schedule);
      observer.disconnect();
    };
  }, []);

  return (
    <span
      ref={rootRef}
      className="brand-logo brand-logo--auto inline-flex items-center"
      data-surface={dark ? "dark" : "light"}
    >
      <LogoImage
        id={dark ? undefined : id}
        src={DEFAULT_SRC}
        width={3543}
        height={895}
        className={`brand-logo__default ${className}`}
        priority={priority}
      />
      <LogoImage
        id={dark ? id : undefined}
        src={WHITE_SRC}
        width={1448}
        height={1086}
        className={`brand-logo__white brand-logo__white-fit ${className}`}
        priority={priority}
        style={{ aspectRatio: LOGO_ASPECT }}
      />
    </span>
  );
}
