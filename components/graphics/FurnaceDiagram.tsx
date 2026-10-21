import { useId } from "react";

export function FurnaceDiagram({
  title,
  caption,
}: {
  title: string;
  caption: string;
}) {
  const grid = useId().replace(/:/g, "");
  return (
    <figure className="nf-brand-lock border border-border bg-surface">
      <svg viewBox="0 0 640 420" className="h-auto w-full" role="img" aria-label={title}>
        <defs>
          <pattern id={grid} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0 H0 V32" fill="none" stroke="var(--border)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="640" height="420" fill={`url(#${grid})`} />
        <text x="28" y="36" fill="var(--foreground-muted)" fontFamily="ui-monospace, monospace" fontSize="12" letterSpacing="1.2">{title}</text>
        <g fill="none" stroke="var(--foreground)" strokeWidth="1.4">
          <path d="M250 78 h140 v36 h-140 z" />
          <path d="M292 78 V48 h56 v30" />
          <path d="M308 48 V28 h24 v20" />
          <path d="M214 114 h212 v210 H214 z" />
          <path d="M248 132 v150" />
          <path d="M292 132 v150" />
          <path d="M336 132 v150" />
          <path d="M380 132 v150" />
          <path d="M214 324 h212 v28 H214 z" />
        </g>
        <g fill="none" stroke="#008dd2" strokeWidth="1.6">
          <path d="M72 190 H214" />
          <path d="M64 182 v16 M214 182 v16" />
          <path d="M426 250 H568" />
          <path d="M426 242 v16 M560 242 v16" />
          <path d="M118 178 l12 12 M130 178 l-12 12" />
          <path d="M500 238 l12 12 M512 238 l-12 12" />
        </g>
        <text x="28" y="400" fill="var(--foreground-muted)" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1">{caption}</text>
      </svg>
    </figure>
  );
}
