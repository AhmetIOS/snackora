/**
 * Building blocks for the Snackora machine illustrations.
 * Products are deliberately generic (no real brands, no text on packs).
 */

export const P = {
  body: "#12382A",
  bodyShade: "#0E2E22",
  bodyEdge: "#1B4A37",
  glass: "#0A1D16",
  glassCold: "#0B1F22",
  tray: "#163F30",
  shelf: "#2A5141",
  coil: "#7E9A8C",
  key: "#F5F1E6",
  lime: "#C9F26B",
  cream: "#F5F1E6",
  ink: "#0E1A14",
  paprika: "#E2552D",
  mustard: "#F1B734",
  sky: "#9CCBE6",
  berry: "#B2456E",
  moss: "#2F5D47",
  forestPack: "#1F5A42",
  white: "#FFFFFF",
} as const;

type Pack = { x: number; base: number; w: number; h: number; color: string; accent?: string; className?: string };

/** Crisp/chip bag with crimped top seal. */
export function Bag({ x, base, w, h, color, accent = P.cream, className }: Pack) {
  const top = base - h;
  const teeth = 6;
  const tw = w / teeth;
  let crimp = `M${x} ${top + 5}`;
  for (let i = 0; i < teeth; i++) crimp += `L${x + tw * (i + 0.5)} ${top}L${x + tw * (i + 1)} ${top + 5}`;
  const d = `${crimp}L${x + w - 1} ${base - 4}Q${x + w - 1} ${base} ${x + w - 5} ${base}H${x + 5}Q${x + 1} ${base} ${x + 1} ${base - 4}Z`;
  return (
    <g className={className}>
      <path d={d} fill={color} />
      <rect x={x + 2} y={top + 6} width={w - 4} height={3} fill="#000" opacity={0.12} />
      <circle cx={x + w / 2} cy={top + h * 0.5} r={w * 0.2} fill={accent} opacity={0.9} />
      <rect x={x + w * 0.2} y={top + h * 0.76} width={w * 0.6} height={3} rx={1.5} fill={accent} opacity={0.6} />
      <path d={`M${x + 3} ${top + 10}V${base - 6}`} stroke="#fff" strokeOpacity={0.18} strokeWidth={2} />
    </g>
  );
}

/** Upright chocolate / protein bar. */
export function Bar({ x, base, w, h, color, accent = P.cream, className }: Pack) {
  const top = base - h;
  return (
    <g className={className}>
      <rect x={x} y={top} width={w} height={h} rx={2.5} fill={color} />
      <rect x={x} y={top} width={w} height={5} fill="#000" opacity={0.18} />
      <rect x={x} y={base - 5} width={w} height={5} fill="#000" opacity={0.18} />
      <path d={`M${x} ${top + h * 0.62}L${x + w} ${top + h * 0.38}V${top + h * 0.52}L${x} ${top + h * 0.76}Z`} fill={accent} opacity={0.85} />
      <rect x={x + 2} y={top + 8} width={2} height={h - 16} fill="#fff" opacity={0.18} />
    </g>
  );
}

/** Stand-up pouch (nuts, dried fruit) with window. */
export function Pouch({ x, base, w, h, color, accent = P.mustard, className }: Pack) {
  const top = base - h;
  const d = `M${x + 3} ${top}H${x + w - 3}L${x + w} ${base - 6}Q${x + w} ${base} ${x + w - 6} ${base}H${x + 6}Q${x} ${base} ${x} ${base - 6}Z`;
  return (
    <g className={className}>
      <path d={d} fill={color} />
      <rect x={x + 3} y={top + 2} width={w - 6} height={4} fill="#000" opacity={0.15} />
      <ellipse cx={x + w / 2} cy={top + h * 0.6} rx={w * 0.28} ry={h * 0.17} fill={P.cream} opacity={0.9} />
      <circle cx={x + w / 2 - 3} cy={top + h * 0.6} r={2.2} fill={accent} />
      <circle cx={x + w / 2 + 3} cy={top + h * 0.58} r={2} fill={accent} />
      <circle cx={x + w / 2} cy={top + h * 0.66} r={1.8} fill={accent} />
    </g>
  );
}

/** Biscuit box. */
export function Box({ x, base, w, h, color, accent = P.cream, className }: Pack) {
  const top = base - h;
  return (
    <g className={className}>
      <rect x={x} y={top} width={w} height={h} rx={3} fill={color} />
      <rect x={x} y={top} width={w} height={h * 0.28} rx={3} fill="#000" opacity={0.14} />
      <circle cx={x + w * 0.35} cy={top + h * 0.62} r={w * 0.13} fill={accent} />
      <circle cx={x + w * 0.62} cy={top + h * 0.62} r={w * 0.13} fill={accent} opacity={0.7} />
    </g>
  );
}

/** PET bottle. */
export function Bottle({ x, base, w, h, color, accent = P.cream, className }: Pack) {
  const top = base - h;
  const neck = w * 0.36;
  const nx = x + (w - neck) / 2;
  const shoulder = top + h * 0.26;
  const d = `M${nx} ${top + 6}H${nx + neck}V${top + h * 0.14}Q${x + w} ${top + h * 0.18} ${x + w} ${shoulder}V${base - 4}Q${x + w} ${base} ${x + w - 4} ${base}H${x + 4}Q${x} ${base} ${x} ${base - 4}V${shoulder}Q${x} ${top + h * 0.18} ${nx} ${top + h * 0.14}Z`;
  return (
    <g className={className}>
      <path d={d} fill={color} />
      <rect x={nx - 1} y={top} width={neck + 2} height={7} rx={1.5} fill={accent === P.cream ? P.ink : accent} />
      <rect x={x} y={top + h * 0.48} width={w} height={h * 0.24} fill={accent} opacity={0.92} />
      <rect x={x + 3} y={shoulder + 2} width={2.5} height={h * 0.6} rx={1} fill="#fff" opacity={0.3} />
    </g>
  );
}

/** Beverage can. */
export function Can({ x, base, w, h, color, accent = P.cream, className }: Pack) {
  const top = base - h;
  return (
    <g className={className}>
      <rect x={x} y={top + 2} width={w} height={h - 2} rx={3} fill={color} />
      <rect x={x + 2} y={top} width={w - 4} height={4} rx={2} fill="#C9D3CD" />
      <rect x={x + 2} y={base - 3} width={w - 4} height={3} rx={1.5} fill="#C9D3CD" opacity={0.8} />
      <path d={`M${x} ${top + h * 0.55}Q${x + w / 2} ${top + h * 0.4} ${x + w} ${top + h * 0.55}V${top + h * 0.68}Q${x + w / 2} ${top + h * 0.53} ${x} ${top + h * 0.68}Z`} fill={accent} opacity={0.9} />
      <rect x={x + 3} y={top + 7} width={2.5} height={h - 14} rx={1} fill="#fff" opacity={0.25} />
    </g>
  );
}

/** Spiral coil under a row of products, seen from the front. */
export function Coil({ x, y, w, loops = 7 }: { x: number; y: number; w: number; loops?: number }) {
  const step = w / loops;
  const items = [];
  for (let i = 0; i < loops; i++) {
    items.push(<ellipse key={i} cx={x + step * (i + 0.5)} cy={y} rx={step * 0.42} ry={3.6} fill="none" stroke={P.coil} strokeWidth={1.4} />);
  }
  return <g opacity={0.85}>{items}</g>;
}

/** Shelf front edge with slot codes. */
export function ShelfEdge({ x, y, w, row, cols, codeOffset = 0 }: { x: number; y: number; w: number; row: string; cols: number; codeOffset?: number }) {
  const cw = w / cols;
  return (
    <g>
      <rect x={x} y={y} width={w} height={9} fill={P.shelf} />
      {Array.from({ length: cols }, (_, i) => (
        <g key={i}>
          <rect x={x + cw * i + cw / 2 - 9} y={y + 1.5} width={18} height={6} rx={1.5} fill={P.ink} opacity={0.55} />
          <text x={x + cw * i + cw / 2} y={y + 6.6} textAnchor="middle" fontSize={5.4} fill={P.cream} className="font-mono" letterSpacing={0.3}>
            {row}
            {i + 1 + codeOffset}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Glass reflection overlay for a window area. */
export function Glare({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g opacity={1} style={{ mixBlendMode: "screen" }}>
      <path d={`M${x + w * 0.52} ${y}H${x + w * 0.68}L${x + w * 0.2} ${y + h}H${x + w * 0.04}Z`} fill="#fff" opacity={0.045} />
      <path d={`M${x + w * 0.76} ${y}H${x + w * 0.8}L${x + w * 0.32} ${y + h}H${x + w * 0.28}Z`} fill="#fff" opacity={0.05} />
    </g>
  );
}

/** Selection panel: display, keypad, contactless reader, coin slot. */
export function ControlPanel({ x, y, display = "A2", cold = false }: { x: number; y: number; display?: string; cold?: boolean }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"];
  return (
    <g>
      <rect x={x} y={y} width={56} height={34} rx={6} fill="#07140F" />
      <text x={x + 9} y={y + 23} fontSize={15} fill={P.lime} className="font-mono" fontWeight={500} letterSpacing={1}>
        {display}
      </text>
      <rect x={x + 37} y={y + 11} width={11} height={2.5} rx={1} fill={P.lime} opacity={0.5} />
      <rect x={x + 37} y={y + 17} width={8} height={2.5} rx={1} fill={P.lime} opacity={0.35} />
      {cold && (
        <g transform={`translate(${x + 42} ${y + 25})`} stroke={P.sky} strokeWidth={1.2} strokeLinecap="round">
          <path d="M0 -4V4M-3.5 -2L3.5 2M-3.5 2L3.5 -2" />
        </g>
      )}
      {keys.map((k, i) => {
        const cx = x + 2 + (i % 3) * 18;
        const cy = y + 46 + Math.floor(i / 3) * 16;
        const accent = k === "OK";
        return (
          <g key={k}>
            <rect x={cx} y={cy} width={16} height={13} rx={3.5} fill={accent ? P.lime : P.key} />
            <rect x={cx} y={cy + 10} width={16} height={3} rx={1.5} fill="#000" opacity={0.12} />
            <text x={cx + 8} y={cy + 9} textAnchor="middle" fontSize={k === "OK" ? 5.5 : 6.5} fill={P.ink} className="font-mono" fontWeight={500}>
              {k}
            </text>
          </g>
        );
      })}
      {/* contactless reader */}
      <rect x={x} y={y + 118} width={56} height={40} rx={7} fill="#07140F" />
      <g fill="none" stroke={P.lime} strokeWidth={1.8} strokeLinecap="round" transform={`translate(${x + 22} ${y + 138})`}>
        <path d="M0 -6A8 8 0 0 1 0 6" />
        <path d="M5 -10A13 13 0 0 1 5 10" />
        <path d="M10 -13.5A18 18 0 0 1 10 13.5" opacity={0.6} />
      </g>
      {/* coin slot */}
      <rect x={x + 8} y={y + 172} width={40} height={22} rx={5} fill={P.bodyShade} />
      <rect x={x + 26} y={y + 177} width={4} height={12} rx={2} fill="#050E0A" />
    </g>
  );
}

/** Product output tray with flap. */
export function OutputTray({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={P.glass} />
      <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx={7} fill={P.tray} />
      <rect x={x + w / 2 - 40} y={y + 18} width={80} height={6} rx={3} fill={P.moss} />
      <path d={`M${x + w / 2 - 5} ${y + h - 26}l5 5l5 -5`} fill="none" stroke={P.lime} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}
