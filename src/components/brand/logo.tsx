import { SYMBOL, WORDMARK } from "./logo-data";

const GAP = 38;
const TILE = WORDMARK.height;
const LOGO_W = TILE + GAP + WORDMARK.width;

const COLORWAYS = {
  // light backgrounds
  primary: { tile: "#12382A", s: "#F5F1E6", block: "#C9F26B", word: "#12382A" },
  // dark backgrounds
  reversed: { tile: "#C9F26B", s: "#0E1A14", block: "#0E1A14", word: "#F5F1E6" },
} as const;

type Colorway = keyof typeof COLORWAYS;

interface LogoProps {
  variant?: Colorway;
  className?: string;
  /** Set when the logo is the only content of a link (the link gets the name). */
  title?: string;
}

/** Horizontal lockup: symbol + wordmark. */
export function Logo({ variant = "primary", className, title = "Snackora" }: LogoProps) {
  const c = COLORWAYS[variant];
  const k = TILE / SYMBOL.size;
  return (
    <svg
      viewBox={`0 0 ${LOGO_W} ${TILE}`}
      width={LOGO_W}
      height={TILE}
      className={className}
      role="img"
      aria-label={title}
      focusable="false"
    >
      <g transform={`scale(${k})`}>
        <path d={SYMBOL.tile} fill={c.tile} />
        <path d={SYMBOL.s} fill={c.s} />
        <path d={SYMBOL.block} fill={c.block} />
      </g>
      <path d={WORDMARK.d} fill={c.word} transform={`translate(${TILE + GAP} 0)`} />
    </svg>
  );
}

/** Stand-alone symbol ("Fach-S"). Decorative by default. */
export function BrandSymbol({
  variant = "primary",
  className,
  title,
  tile = true,
}: LogoProps & { tile?: boolean }) {
  const c = COLORWAYS[variant];
  return (
    <svg
      viewBox={`0 0 ${SYMBOL.size} ${SYMBOL.size}`}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {tile ? <path d={SYMBOL.tile} fill={c.tile} /> : null}
      <path d={SYMBOL.s} fill={tile ? c.s : "currentColor"} />
      <path d={SYMBOL.block} fill={tile ? c.block : "currentColor"} />
    </svg>
  );
}

/** The product block – the brand's smallest graphic unit (bullets, full stops). */
export function ProductBlock({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`inline-block size-[0.42em] rounded-[2px] bg-current align-baseline ${className}`} />;
}
