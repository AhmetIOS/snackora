import type { ReactNode } from "react";
import { SYMBOL, TAGLINE_OUTLINE, WORDMARK } from "@/components/brand/logo-data";
import { Bag, Bar, Bottle, Box, Can, CeramicCup, Coil, ControlPanel, Glare, OutputTray, P, PaperCup, Pouch, ShelfEdge, Steam } from "./parts";

/**
 * Snackora machine illustrations (illustrative design concepts – not photos
 * of installed equipment). All SVG, no client JavaScript.
 */

const VB_W = 400;
const VB_H = 760;
const WIN = { x: 48, y: 118, w: 238 };

interface MachineProps {
  className?: string;
  /** Render as a nested <svg> at 0,0 (400×760 units) inside another SVG. */
  nested?: boolean;
  /** Accessible label. Pass `decorative` when the image is described nearby. */
  title?: string;
  decorative?: boolean;
  animated?: boolean;
}

function Shell({
  children,
  title,
  decorative,
  className,
  cold,
  screen,
  tray,
  display,
  nested,
}: MachineProps & { children: ReactNode; cold?: boolean; screen?: boolean; tray?: ReactNode; display?: string }) {
  const tileSize = 46;
  const ws = 148 / WORDMARK.width;
  const wordX = 48 + tileSize + 14;
  const wordY = 34 + tileSize - WORDMARK.height * ws;
  const tagScale = 0.165;
  const tagW = (TAGLINE_OUTLINE.x2 - TAGLINE_OUTLINE.x1) * tagScale;
  const tagX = 200 - tagW / 2 - TAGLINE_OUTLINE.x1 * tagScale;
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      {...(nested ? { x: 0, y: 0, width: VB_W, height: VB_H } : {})}
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      focusable="false"
    >
      {!decorative && title ? <title>{title}</title> : null}
      <ellipse cx={200} cy={744} rx={176} ry={10} fill={P.ink} opacity={0.18} />
      <rect x={44} y={724} width={28} height={16} rx={3} fill={P.ink} />
      <rect x={328} y={724} width={28} height={16} rx={3} fill={P.ink} />
      {/* body */}
      <rect x={24} y={16} width={352} height={712} rx={20} fill={P.body} />
      <path d="M44 16H24V728H44C32 728 24 720 24 708V36C24 24 32 16 44 16Z" fill={P.bodyShade} />
      <rect x={364} y={36} width={4} height={672} rx={2} fill={P.bodyEdge} />
      {/* header: brand panel */}
      <g transform={`translate(48 34) scale(${tileSize / SYMBOL.size})`}>
        <path d={SYMBOL.tile} fill={P.lime} />
        <path d={SYMBOL.s} fill={P.ink} />
        <path d={SYMBOL.block} fill={P.ink} />
      </g>
      <path d={WORDMARK.d} fill={P.cream} transform={`translate(${wordX} ${wordY}) scale(${ws})`} />
      <rect x={300} y={44} width={56} height={6} rx={3} fill={P.bodyEdge} />
      <rect x={300} y={56} width={38} height={6} rx={3} fill={P.bodyEdge} />
      <rect x={300} y={68} width={46} height={6} rx={3} fill={P.bodyEdge} />
      {/* window frame */}
      <rect x={WIN.x - 6} y={WIN.y - 6} width={WIN.w + 12} height={452} rx={14} fill={P.bodyShade} />
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={440} rx={10} fill={screen ? "#07140F" : cold ? P.glassCold : P.glass} />
      {children}
      {screen ? null : <Glare x={WIN.x} y={WIN.y} w={WIN.w} h={440} />}
      <ControlPanel x={300} y={WIN.y + 4} display={display ?? (cold ? "B3" : "A2")} cold={cold} />
      <rect x={300} y={WIN.y + 330} width={56} height={34} rx={6} fill={P.bodyShade} />
      <rect x={312} y={WIN.y + 342} width={32} height={10} rx={3} fill="#050E0A" />
      {tray ?? <OutputTray x={WIN.x} y={574} w={WIN.w} h={84} />}
      <rect x={300} y={574} width={56} height={84} rx={8} fill={P.bodyShade} />
      {/* brand band with slogan */}
      <rect x={24} y={672} width={352} height={34} fill={P.lime} />
      <path d={TAGLINE_OUTLINE.d} fill={P.ink} transform={`translate(${tagX} ${697}) scale(${tagScale})`} />
      {/* kick plate */}
      <path d="M24 706H376V708C376 719 367 728 356 728H44C33 728 24 719 24 708Z" fill={P.bodyShade} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={150 + i * 12} y={713} width={6} height={8} rx={2} fill="#06120D" />
      ))}
    </svg>
  );
}

type Item = { kind: "bag" | "bar" | "pouch" | "box" | "bottle" | "can"; color: string; accent?: string; w: number; h: number; anim?: boolean };

function Row({ top, height, row, items, cols }: { top: number; height: number; row: string; items: Item[]; cols?: number }) {
  const n = cols ?? items.length;
  const inner = WIN.w - 16;
  const cw = inner / n;
  const shelfY = top + height - 11;
  const base = shelfY - 5;
  return (
    <g>
      {items.map((it, i) => {
        const x = WIN.x + 8 + cw * i + (cw - it.w) / 2;
        const props = { x, base, w: it.w, h: it.h, color: it.color, accent: it.accent, className: it.anim ? "anim-dispense" : undefined };
        switch (it.kind) {
          case "bag":
            return <Bag key={i} {...props} />;
          case "bar":
            return <Bar key={i} {...props} />;
          case "pouch":
            return <Pouch key={i} {...props} />;
          case "box":
            return <Box key={i} {...props} />;
          case "bottle":
            return <Bottle key={i} {...props} />;
          case "can":
            return <Can key={i} {...props} />;
        }
      })}
      {items[0].kind !== "bottle" && items[0].kind !== "can" ? <Coil x={WIN.x + 8} y={shelfY - 2} w={inner} loops={n * 3} /> : null}
      <ShelfEdge x={WIN.x} y={shelfY} w={WIN.w} row={row} cols={n} />
    </g>
  );
}

const CHOC = "#7A4A33";

const snackRows: { row: string; items: Item[] }[] = [
  {
    row: "A",
    items: [
      { kind: "bag", color: P.paprika, w: 40, h: 50 },
      { kind: "bag", color: P.mustard, accent: P.ink, w: 40, h: 50 },
      { kind: "bag", color: P.lime, accent: P.ink, w: 40, h: 50, anim: true },
      { kind: "bag", color: P.sky, accent: P.ink, w: 40, h: 50 },
    ],
  },
  {
    row: "B",
    items: [
      { kind: "bar", color: CHOC, accent: P.mustard, w: 30, h: 48 },
      { kind: "bar", color: P.berry, w: 30, h: 48 },
      { kind: "bar", color: P.cream, accent: P.paprika, w: 30, h: 48 },
      { kind: "bar", color: CHOC, accent: P.lime, w: 30, h: 48 },
    ],
  },
  {
    row: "C",
    items: [
      { kind: "pouch", color: P.moss, accent: P.mustard, w: 38, h: 46 },
      { kind: "pouch", color: P.paprika, accent: P.mustard, w: 38, h: 46 },
      { kind: "pouch", color: P.sky, accent: CHOC, w: 38, h: 46 },
      { kind: "pouch", color: P.mustard, accent: CHOC, w: 38, h: 46 },
    ],
  },
  {
    row: "D",
    items: [
      { kind: "bar", color: P.ink, accent: P.lime, w: 22, h: 52 },
      { kind: "bar", color: P.sky, accent: P.ink, w: 22, h: 52 },
      { kind: "bar", color: P.ink, accent: P.paprika, w: 22, h: 52 },
      { kind: "bar", color: P.lime, accent: P.ink, w: 22, h: 52 },
    ],
  },
  {
    row: "E",
    items: [
      { kind: "box", color: P.sky, w: 42, h: 36 },
      { kind: "box", color: P.paprika, w: 42, h: 36 },
      { kind: "box", color: P.mustard, accent: CHOC, w: 42, h: 36 },
      { kind: "box", color: P.berry, w: 42, h: 36 },
    ],
  },
  {
    row: "F",
    items: [
      { kind: "bag", color: P.mustard, accent: P.paprika, w: 34, h: 42 },
      { kind: "bag", color: P.cream, accent: P.paprika, w: 34, h: 42 },
      { kind: "bag", color: P.paprika, w: 34, h: 42 },
      { kind: "bag", color: P.lime, accent: P.ink, w: 34, h: 42 },
    ],
  },
];

const drinkRows: { row: string; items: Item[] }[] = [
  {
    row: "A",
    items: Array.from({ length: 5 }, (_, i) => ({ kind: "bottle", color: i % 2 ? "#BFE0F2" : P.sky, accent: P.cream, w: 26, h: 70 }) as Item),
  },
  {
    row: "B",
    items: [P.paprika, P.lime, P.mustard, P.berry, P.sky].map((c) => ({ kind: "can", color: c, accent: c === P.lime ? P.ink : P.cream, w: 28, h: 48 }) as Item),
  },
  {
    row: "C",
    items: [P.mustard, "#F5C96A", P.mustard, "#F5C96A", P.mustard].map((c) => ({ kind: "bottle", color: c, accent: P.cream, w: 26, h: 70 }) as Item),
  },
  {
    row: "D",
    items: [P.ink, P.sky, P.paprika, P.ink, P.lime].map((c) => ({ kind: "can", color: c, accent: c === P.lime ? P.ink : P.lime, w: 28, h: 48 }) as Item),
  },
  {
    row: "E",
    items: [P.lime, "#DDF59A", P.lime, "#DDF59A", P.lime].map((c) => ({ kind: "bottle", color: c, accent: P.ink, w: 26, h: 70 }) as Item),
  },
];

export function SnackMachine({ className, title = "Illustration eines Snackora-Snackautomaten", decorative, animated, nested }: MachineProps) {
  const rowH = 440 / 6;
  return (
    <Shell className={className} title={title} decorative={decorative} nested={nested}>
      {snackRows.map((r, i) => (
        <Row
          key={r.row}
          top={WIN.y + i * rowH}
          height={rowH}
          row={r.row}
          items={animated ? r.items : r.items.map((it) => ({ ...it, anim: false }))}
        />
      ))}
    </Shell>
  );
}

export function DrinkMachine({ className, title = "Illustration eines Snackora-Getränkeautomaten", decorative }: MachineProps) {
  const rowH = 440 / 5;
  return (
    <Shell className={className} title={title} decorative={decorative} cold>
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={440} rx={10} fill={P.sky} opacity={0.05} />
      {drinkRows.map((r, i) => (
        <Row key={r.row} top={WIN.y + i * rowH} height={rowH} row={r.row} items={r.items} />
      ))}
    </Shell>
  );
}

export function ComboMachine({ className, title = "Illustration eines Snackora-Kombiautomaten", decorative }: MachineProps) {
  const snackH = 70;
  const drinkTop = WIN.y + snackH * 3 + 12;
  const drinkH = (440 - snackH * 3 - 12) / 2;
  return (
    <Shell className={className} title={title} decorative={decorative}>
      {snackRows.slice(0, 3).map((r, i) => (
        <Row key={r.row} top={WIN.y + i * snackH} height={snackH} row={r.row} items={r.items.map((it) => ({ ...it, anim: false }))} />
      ))}
      {/* cooled compartment */}
      <rect x={WIN.x} y={drinkTop - 8} width={WIN.w} height={8} fill={P.bodyShade} />
      <rect x={WIN.x} y={drinkTop} width={WIN.w} height={440 - snackH * 3 - 12} fill={P.sky} opacity={0.07} />
      <g transform={`translate(${WIN.x + WIN.w - 16} ${drinkTop + 12})`} stroke={P.sky} strokeWidth={1.3} strokeLinecap="round" opacity={0.9}>
        <path d="M0 -5V5M-4.3 -2.5L4.3 2.5M-4.3 2.5L4.3 -2.5" />
      </g>
      <Row top={drinkTop} height={drinkH} row="D" items={drinkRows[1].items.slice(0, 4)} />
      <Row top={drinkTop + drinkH} height={drinkH} row="E" items={drinkRows[0].items.slice(0, 4).map((b) => ({ ...b, h: 66 }))} />
    </Shell>
  );
}


const coffeeMenu = [
  { name: "Kaffee", kind: "cup" as const },
  { name: "Espresso", kind: "espresso" as const },
  { name: "Cappuccino", kind: "foam" as const },
  { name: "Milchkaffee", kind: "foam" as const },
  { name: "Tee", kind: "tea" as const },
  { name: "Kakao", kind: "cup" as const },
];

function CoffeeScreen() {
  const pad = 10;
  const tileW = (WIN.w - pad * 3) / 2;
  const tileH = 112;
  const top = WIN.y + 44;
  return (
    <g>
      <rect x={WIN.x + pad} y={WIN.y + 14} width={6} height={6} rx={1.5} fill={P.lime} />
      <text x={WIN.x + pad + 12} y={WIN.y + 20.5} fontSize={8} fill={P.cream} opacity={0.75} className="font-mono" letterSpacing={1.2}>
        HEISSGETRÄNKE
      </text>
      <rect x={WIN.x + WIN.w - pad - 38} y={WIN.y + 12} width={38} height={10} rx={5} fill={P.forest} />
      <rect x={WIN.x + WIN.w - pad - 35} y={WIN.y + 15} width={18} height={4} rx={2} fill={P.lime} opacity={0.8} />
      {coffeeMenu.map((d, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = WIN.x + pad + col * (tileW + pad);
        const y = top + row * (tileH + pad);
        const selected = i === 2;
        const cx = x + tileW / 2;
        return (
          <g key={d.name}>
            <rect x={x} y={y} width={tileW} height={tileH} rx={9} fill={selected ? "#1B4A37" : P.body} stroke={selected ? P.lime : "none"} strokeWidth={2} />
            <text x={x + 9} y={y + 15} fontSize={7} fill={P.lime} className="font-mono">
              K{i + 1}
            </text>
            {d.kind === "tea" ? (
              <g>
                <CeramicCup cx={cx} base={y + 72} w={40} />
                <path d={`M${cx + 6} ${y + 46}v14`} stroke={P.cream} strokeWidth={1} />
                <rect x={cx + 3} y={y + 58} width={7} height={8} rx={1} fill={P.lime} />
              </g>
            ) : d.kind === "espresso" ? (
              <CeramicCup cx={cx} base={y + 72} w={28} />
            ) : (
              <CeramicCup cx={cx} base={y + 72} w={40} foam={d.kind === "foam"} />
            )}
            <Steam cx={cx} y={y + 40} size={22} />
            <text x={cx} y={y + 96} textAnchor="middle" fontSize={11} fontWeight={600} fill={P.cream} className="font-display">
              {d.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function CupNiche() {
  const x = WIN.x;
  const y = 574;
  const w = WIN.w;
  return (
    <g>
      <rect x={x} y={y} width={w} height={84} rx={10} fill={P.glass} />
      <rect x={x + 10} y={y + 8} width={w - 20} height={68} rx={7} fill={P.bodyShade} />
      <rect x={x + w / 2 - 12} y={y + 8} width={24} height={9} rx={2} fill={P.moss} />
      <rect x={x + w / 2 - 3} y={y + 17} width={6} height={4} rx={1} fill={P.moss} />
      <Steam cx={x + w / 2} y={y + 38} size={16} />
      <PaperCup x={x + w / 2 - 15} base={y + 66} w={30} h={36} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={x + w / 2 - 44 + i * 10} y={y + 67} width={6} height={4} rx={1} fill="#06120D" />
      ))}
    </g>
  );
}

export function CoffeeMachine({ className, title = "Illustration eines Snackora-Kaffeeautomaten", decorative }: MachineProps) {
  return (
    <Shell className={className} title={title} decorative={decorative} screen tray={<CupNiche />} display="K3">
      <CoffeeScreen />
    </Shell>
  );
}

export function MachineIllustration({ kind, ...props }: MachineProps & { kind: "snack" | "drink" | "combo" | "coffee" }) {
  if (kind === "coffee") return <CoffeeMachine {...props} />;
  if (kind === "drink") return <DrinkMachine {...props} />;
  if (kind === "combo") return <ComboMachine {...props} />;
  return <SnackMachine {...props} />;
}
