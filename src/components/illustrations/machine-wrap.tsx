import { SYMBOL, TAGLINE_OUTLINE, WORDMARK } from "@/components/brand/logo-data";
import { SnackMachine } from "./machines";

/**
 * Branded vending-machine wrap concept: front elevation (the illustrated
 * machine) and side elevation (full-height wrap). Design concept only.
 */

export function SidePanel({ className }: { className?: string }) {
  const W = 240;
  const H = 760;
  // Zoning: cropped Fach-S on top · vertical slogan left · wordmark bottom right
  const symScale = 360 / SYMBOL.size;
  const tagLen = TAGLINE_OUTLINE.x2 - TAGLINE_OUTLINE.x1;
  const tagScale = 360 / tagLen;
  const wordScale = 118 / WORDMARK.width;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label="Seitenansicht: Folierung mit Snackora-Symbol und Slogan" focusable="false">
      <defs>
        <clipPath id="side-clip">
          <rect x={16} y={16} width={W - 32} height={712} rx={18} />
        </clipPath>
      </defs>
      <ellipse cx={W / 2} cy={744} rx={W / 2 - 12} ry={9} fill="#0E1A14" opacity={0.18} />
      <rect x={32} y={724} width={26} height={16} rx={3} fill="#0E1A14" />
      <rect x={W - 58} y={724} width={26} height={16} rx={3} fill="#0E1A14" />
      <g clipPath="url(#side-clip)">
        <rect x={16} y={16} width={W - 32} height={712} fill="#C9F26B" />
        {/* oversized, cropped symbol – recognisable without the word */}
        <g transform={`translate(${-36} ${-58}) scale(${symScale})`}>
          <path d={SYMBOL.s} fill="#12382A" />
          <path d={SYMBOL.block} fill="#0E1A14" />
        </g>
        {/* vertical slogan, reading upwards */}
        <g transform={`translate(${76} ${700}) rotate(-90)`}>
          <path d={TAGLINE_OUTLINE.d} fill="#0E1A14" transform={`scale(${tagScale}) translate(${-TAGLINE_OUTLINE.x1} 0)`} />
        </g>
        <rect x={96} y={604} width={104} height={1.5} fill="#0E1A14" opacity={0.25} />
        <path d={WORDMARK.d} fill="#12382A" transform={`translate(${200 - 118} ${694 - WORDMARK.height * wordScale}) scale(${wordScale})`} />
      </g>
      <rect x={16} y={16} width={W - 32} height={712} rx={18} fill="none" stroke="#0E1A14" strokeOpacity={0.12} />
    </svg>
  );
}

export function MachineWrapConcept() {
  return (
    <figure id="automat-konzept" className="rounded-panel border border-line bg-paper p-5 sm:p-8">
      <div className="grid grid-cols-[1fr_auto] items-end gap-4 sm:gap-10 md:grid-cols-2">
        <div className="text-center">
          <SnackMachine className="mx-auto h-auto w-full max-w-[17rem]" title="Frontansicht: Snackora-Automat mit Markenpanel und Slogan-Band" />
          <p className="slot-label mt-4 text-muted">Front</p>
        </div>
        <div className="text-center">
          <SidePanel className="mx-auto h-auto w-[34vw] max-w-[10.5rem] md:w-full" />
          <p className="slot-label mt-4 text-muted">Seite</p>
        </div>
      </div>
      <ul className="mt-8 grid gap-4 border-t border-line pt-6 text-sm sm:grid-cols-3">
        <li>
          <p className="font-semibold">Markenpanel</p>
          <p className="mt-1 text-ink/70">Symbol und Wortmarke auf Augenhöhe – auch aus der Entfernung erkennbar.</p>
        </li>
        <li>
          <p className="font-semibold">Slogan-Band</p>
          <p className="mt-1 text-ink/70">„Deine Pause. Jederzeit.“ in Limette über dem Sockel.</p>
        </li>
        <li>
          <p className="font-semibold">Seitenfolierung</p>
          <p className="mt-1 text-ink/70">Angeschnittenes Fach-S und senkrechter Slogan – wiedererkennbar auch ohne Schriftzug.</p>
        </li>
      </ul>
      <figcaption className="mt-6 text-xs text-muted">
        Designkonzept zur Anwendung der Marke. Die tatsächliche Gestaltung richtet sich nach dem eingesetzten Gerät und der Vereinbarung
        am Standort.
      </figcaption>
    </figure>
  );
}
