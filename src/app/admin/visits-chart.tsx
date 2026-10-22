"use client";

import { useId, useRef, useState } from "react";

export interface ChartPoint {
  label: string;
  short: string;
  users: number;
  sessions: number;
  views: number;
}

const SERIES = "#3b8f63"; // validated against the paper surface (dataviz validator)
const W = 720;
const H = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 36 };
const fmt = new Intl.NumberFormat("tr-TR");

function niceMax(v: number) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * pow).find((s) => s * 4 >= v) ?? pow * 10;
  return step * 4;
}

/** Users per day (or hour) – single series: area wash + 2px line, crosshair tooltip on hover/focus. */
export function VisitsChart({ points, title }: { points: ChartPoint[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const titleId = useId();
  if (!points.length) return null;

  const max = niceMax(Math.max(...points.map((p) => p.users)));
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => PAD.top + ih - (v / max) * ih;
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.users).toFixed(1)}`).join("");
  const area = `${line}L${x(points.length - 1).toFixed(1)},${PAD.top + ih}L${x(0).toFixed(1)},${PAD.top + ih}Z`;
  const ticks = [0, 1, 2, 3, 4].map((t) => (max / 4) * t);
  const labelEvery = Math.max(1, Math.ceil(points.length / 7));

  const onMove = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.left) / iw) * (points.length - 1));
    setActive(Math.min(points.length - 1, Math.max(0, i)));
  };
  const a = active !== null ? points[active] : null;

  return (
    <figure className="relative" aria-labelledby={titleId}>
      <figcaption id={titleId} className="sr-only">
        {title}
      </figcaption>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-pan-y select-none"
        role="img"
        aria-label={`${title}. Ayrıntılar aşağıdaki tabloda.`}
        tabIndex={0}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setActive((v) => Math.min(points.length - 1, (v ?? -1) + 1));
          if (e.key === "ArrowLeft") setActive((v) => Math.max(0, (v ?? points.length) - 1));
        }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#e4ddcc" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#55615a" style={{ fontVariantNumeric: "tabular-nums" }}>
              {fmt.format(t)}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text key={p.label} x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fill="#55615a">
              {p.short}
            </text>
          ) : null
        )}
        <path d={area} fill={SERIES} opacity={0.1} />
        <path d={line} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {a && active !== null ? (
          <g>
            <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + ih} stroke="#0e1a14" strokeOpacity={0.25} strokeWidth={1} />
            <circle cx={x(active)} cy={y(a.users)} r={5} fill={SERIES} stroke="#fbf9f3" strokeWidth={2} />
          </g>
        ) : (
          <circle cx={x(points.length - 1)} cy={y(points[points.length - 1]!.users)} r={4} fill={SERIES} stroke="#fbf9f3" strokeWidth={2} />
        )}
        {/* oversized invisible hit area */}
        <rect x={PAD.left} y={0} width={iw} height={H} fill="transparent" />
      </svg>
      {a && active !== null ? (
        <div
          role="status"
          className="pointer-events-none absolute top-2 z-10 min-w-40 rounded-key border border-line bg-paper px-3 py-2 text-sm shadow-lg"
          style={{ left: `clamp(0px, calc(${(x(active) / W) * 100}% - 5rem), calc(100% - 10rem))` }}
        >
          <p className="font-semibold">{a.label}</p>
          <p className="mt-1 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-0.5 w-3 rounded" style={{ background: SERIES }} />
            Kullanıcı: <strong className="tabular-nums">{fmt.format(a.users)}</strong>
          </p>
          <p className="text-ink/70">Oturum: {fmt.format(a.sessions)} · Görüntüleme: {fmt.format(a.views)}</p>
        </div>
      ) : null}
      <details className="mt-3 text-sm">
        <summary className="font-semibold text-forest">Tablo olarak göster</summary>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full text-left tabular-nums">
            <thead className="text-ink/60">
              <tr>
                <th className="py-1 pr-4 font-medium">Zaman</th>
                <th className="py-1 pr-4 text-right font-medium">Kullanıcı</th>
                <th className="py-1 pr-4 text-right font-medium">Oturum</th>
                <th className="py-1 text-right font-medium">Görüntüleme</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.label} className="border-t border-line">
                  <td className="py-1 pr-4">{p.label}</td>
                  <td className="py-1 pr-4 text-right">{fmt.format(p.users)}</td>
                  <td className="py-1 pr-4 text-right">{fmt.format(p.sessions)}</td>
                  <td className="py-1 text-right">{fmt.format(p.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
