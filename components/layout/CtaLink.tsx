"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { track } from "@/components/analytics/track";

export function CtaLink({
  href,
  children,
  className,
  place,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  place: string;
}) {
  return (
    <Link href={href} className={className} onClick={() => track("contact_cta_click", { place })}>
      {children}
    </Link>
  );
}
