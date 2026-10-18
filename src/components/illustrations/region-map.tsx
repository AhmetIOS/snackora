/**
 * Schematic map of the focus region. Positions are projected from real
 * coordinates (≈ 20 px per km), the Neckar is simplified. It shows the
 * service region – not installed machines.
 */

const KM = 20;
const project = (lon: number, lat: number) => ({
  x: Math.round(30 + (lon - 9.1) * 73 * KM),
  y: Math.round(30 + (48.87 - lat) * 111 * KM),
});

const cities = [
  { name: "Stuttgart", lon: 9.1829, lat: 48.7758, anchor: "end" as const, dx: -14, dy: 5 },
  { name: "Esslingen", lon: 9.3108, lat: 48.7406, anchor: "start" as const, dx: 14, dy: 5 },
  { name: "Waiblingen", lon: 9.3169, lat: 48.8306, anchor: "start" as const, dx: 14, dy: 5 },
  { name: "Fellbach", lon: 9.2757, lat: 48.8096, anchor: "end" as const, dx: -14, dy: 5 },
  { name: "Ostfildern", lon: 9.253, lat: 48.727, anchor: "end" as const, dx: -14, dy: 5 },
  { name: "Wernau", lon: 9.4194, lat: 48.6886, anchor: "end" as const, dx: -14, dy: 5 },
];

const neckar = [
  [9.43, 48.672],
  [9.418, 48.69],
  [9.415, 48.712],
  [9.37, 48.722],
  [9.31, 48.737],
  [9.265, 48.765],
  [9.235, 48.785],
  [9.215, 48.805],
  [9.205, 48.83],
  [9.235, 48.855],
  [9.27, 48.876],
].map(([lon, lat]) => project(lon, lat));

function smoothPath(pts: { x: number; y: number }[]) {
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${pts[i].x} ${pts[i].y} ${mx} ${my}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${last.x} ${last.y}`;
}

export function RegionMap({ className }: { className?: string }) {
  const center = { x: 330, y: 270 };
  return (
    <svg
      viewBox="0 0 600 520"
      className={className}
      role="img"
      aria-label="Schematische Karte des Schwerpunktgebiets mit Stuttgart, Esslingen, Waiblingen, Fellbach, Ostfildern und Wernau entlang des Neckars"
    >
      <defs>
        <pattern id="km-grid" width={KM * 5} height={KM * 5} patternUnits="userSpaceOnUse">
          <path d={`M${KM * 5} 0H0V${KM * 5}`} fill="none" stroke="#0E1A14" strokeOpacity={0.07} />
        </pattern>
      </defs>
      <rect width={600} height={520} fill="url(#km-grid)" />
      <circle cx={center.x} cy={center.y} r={232} fill="#C9F26B" fillOpacity={0.22} />
      <circle cx={center.x} cy={center.y} r={232} fill="none" stroke="#12382A" strokeOpacity={0.35} strokeDasharray="2 7" strokeWidth={1.5} />
      <path d={smoothPath(neckar)} fill="none" stroke="#9CCBE6" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <text x={neckar[4].x + 14} y={neckar[4].y + 30} className="font-mono" fontSize={11} fill="#4A7F9C" letterSpacing={1.5}>
        NECKAR
      </text>
      {cities.map((c) => {
        const p = project(c.lon, c.lat);
        return (
          <g key={c.name}>
            <rect x={p.x - 7} y={p.y - 7} width={14} height={14} rx={2.5} fill="#12382A" />
            <rect x={p.x - 2.5} y={p.y - 2.5} width={5} height={5} rx={1} fill="#C9F26B" />
            <text x={p.x + c.dx} y={p.y + c.dy} textAnchor={c.anchor} className="font-display" fontSize={17} fontWeight={600} fill="#0E1A14">
              {c.name}
            </text>
          </g>
        );
      })}
      {/* north arrow & scale */}
      <g transform="translate(560 44)" className="font-mono" fontSize={10} fill="#0E1A14">
        <path d="M0 -14L6 4L0 0L-6 4Z" fill="#12382A" />
        <text x={0} y={20} textAnchor="middle">
          N
        </text>
      </g>
      <g transform="translate(30 488)" className="font-mono" fontSize={10} fill="#0E1A14">
        <rect width={KM * 5} height={4} fill="#12382A" />
        <rect x={KM * 5} width={KM * 5} height={4} fill="#12382A" fillOpacity={0.3} />
        <text x={0} y={18}>
          0
        </text>
        <text x={KM * 5} y={18} textAnchor="middle">
          5
        </text>
        <text x={KM * 10} y={18} textAnchor="middle">
          10 km
        </text>
      </g>
    </svg>
  );
}
