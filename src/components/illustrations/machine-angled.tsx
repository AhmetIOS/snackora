import { SYMBOL, TAGLINE_OUTLINE, WORDMARK } from "@/components/brand/logo-data";
import { SnackMachine } from "./machines";
import { P } from "./parts";

/**
 * Snackora machine in a three-quarter view: the illustrated front plus a
 * side panel in oblique projection carrying the lime brand wrap.
 * Illustration / design concept – not a photo of installed equipment.
 */

const SIDE_W = 164;
const SIDE_H = 712;

/** Side panel artwork (flat); perspective is applied with CSS 3D. */
function SidePanelArt({ className }: { className?: string }) {
  const symbolSize = 84;
  const wordScale = 124 / WORDMARK.width;
  const tagScale = 300 / (TAGLINE_OUTLINE.x2 - TAGLINE_OUTLINE.x1);
  return (
    <svg viewBox={`0 0 ${SIDE_W} ${SIDE_H}`} className={className} aria-hidden="true" focusable="false" preserveAspectRatio="none">
      <defs>
        <linearGradient id="side-shade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <clipPath id="side-clip-angled">
          <rect width={SIDE_W} height={SIDE_H} rx={10} />
        </clipPath>
      </defs>
      <g clipPath="url(#side-clip-angled)">
        <rect width={SIDE_W} height={SIDE_H} fill="#0A2018" />
        <path d={`M0 ${SIDE_H}V470C46 432 118 378 ${SIDE_W} 250V${SIDE_H}Z`} fill={P.lime} />
        <path d={`M0 330C64 300 134 226 ${SIDE_W} 112`} fill="none" stroke={P.lime} strokeWidth={2.5} opacity={0.55} />
        <g transform={`translate(${(SIDE_W - symbolSize) / 2} 96) scale(${symbolSize / SYMBOL.size})`}>
          <path d={SYMBOL.tile} fill={P.lime} />
          <path d={SYMBOL.s} fill={P.ink} />
          <path d={SYMBOL.block} fill={P.ink} />
        </g>
        <path d={WORDMARK.d} fill={P.cream} transform={`translate(${(SIDE_W - 124) / 2} 200) scale(${wordScale})`} />
        <g transform={`translate(${SIDE_W - 30} 690) rotate(-90)`}>
          <path d={TAGLINE_OUTLINE.d} fill={P.ink} transform={`scale(${tagScale}) translate(${-TAGLINE_OUTLINE.x1} 0)`} />
        </g>
        <rect width={SIDE_W} height={SIDE_H} fill="url(#side-shade)" />
      </g>
    </svg>
  );
}

/**
 * Container is a 560×820 box. The front (400×760 units) sits at the left;
 * the side panel is hinged on the body's right edge and rotated away with
 * CSS 3D perspective, so it narrows towards the back like a real cabinet.
 */
export function AngledMachine({ className, animated }: { className?: string; animated?: boolean }) {
  return (
    <div
      className={className}
      role="img"
      aria-label="Illustration: Snackora-Automat mit Markenfolierung an der Seite"
      style={{ aspectRatio: "560 / 820", perspective: "1500px", perspectiveOrigin: "30% 45%" }}
    >
      <div aria-hidden="true" className="absolute bottom-[0.5%] left-[4%] h-[3.5%] w-[86%] rounded-[50%] bg-ink/20 blur-[6px]" />
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: `${(366 / 560) * 100}%`,
          top: `${((30 + 16) / 820) * 100}%`,
          width: `${(SIDE_W / 560) * 100}%`,
          height: `${(SIDE_H / 820) * 100}%`,
          transformOrigin: "left center",
          transform: "rotateY(46deg)",
        }}
      >
        <SidePanelArt className="h-full w-full" />
      </div>
      <div aria-hidden="true" className="absolute" style={{ left: 0, top: `${(30 / 820) * 100}%`, width: `${(400 / 560) * 100}%` }}>
        <SnackMachine decorative animated={animated} className="block h-auto w-full" />
      </div>
    </div>
  );
}

/** Stylised potted plant for the hero scene. */
export function Plant({ className, flip }: { className?: string; flip?: boolean }) {
  const leaves = [
    { x: 60, y: 150, rx: 16, ry: 62, r: -38, c: "#2F5D47" },
    { x: 92, y: 132, rx: 15, ry: 70, r: -8, c: "#1F5A42" },
    { x: 124, y: 140, rx: 16, ry: 64, r: 24, c: "#3E7A55" },
    { x: 150, y: 176, rx: 14, ry: 54, r: 52, c: "#2F5D47" },
    { x: 40, y: 196, rx: 13, ry: 50, r: -62, c: "#3E7A55" },
    { x: 104, y: 92, rx: 12, ry: 52, r: 6, c: "#4C8A62" },
    { x: 76, y: 100, rx: 11, ry: 46, r: -24, c: "#4C8A62" },
  ];
  return (
    <svg viewBox="0 0 200 360" className={className} aria-hidden="true" focusable="false" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      {leaves.map((l, i) => (
        <g key={i}>
          <ellipse cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} fill={l.c} transform={`rotate(${l.r} ${l.x} ${l.y})`} />
          <path d={`M${l.x} ${l.y + l.ry * 0.9}L${l.x} ${l.y - l.ry * 0.8}`} stroke="#0E2E22" strokeOpacity={0.35} strokeWidth={1.4} transform={`rotate(${l.r} ${l.x} ${l.y})`} />
        </g>
      ))}
      <path d="M100 250V170" stroke="#1F5A42" strokeWidth={4} />
      <path d="M52 246H148L138 352Q137 358 131 358H69Q63 358 62 352Z" fill="#26302B" />
      <rect x={48} y={240} width={104} height={14} rx={4} fill="#323D37" />
    </svg>
  );
}
