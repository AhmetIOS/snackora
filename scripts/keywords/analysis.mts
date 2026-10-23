/**
 * Pure analysis + rendering for `npm run report:keywords` (no I/O, unit-tested).
 * Input: raw Search Console searchAnalytics rows per period.
 */

export type ScRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };
export type Metrics = { clicks: number; impressions: number; ctr: number; position: number | null };

export type PeriodData = {
  days: number;
  start: string;
  end: string;
  /** Totals for the selected country (no dimensions → includes anonymized queries). */
  total: Metrics;
  /** Totals across all countries, for context. */
  totalAllCountries: Metrics;
  devices: ScRow[]; // dims: device
  queries: ScRow[]; // dims: query
  queryDevice: ScRow[]; // dims: query, device
  queryPage: ScRow[]; // dims: query, page
  pages: ScRow[]; // dims: page, all countries
};

export type Category = "brand" | "local" | "commercial" | "location" | "other";
export type Bucket = "top3" | "page1" | "page2" | "improve" | "low" | "none";
export type Device = "MOBILE" | "DESKTOP" | "TABLET";

export type QueryStat = Metrics & {
  query: string;
  category: Category;
  cities: string[];
  leadIntent: boolean;
  bucket: Bucket;
  topPage: string | null;
  devices: Partial<Record<Device, Metrics>>;
};

export const CATEGORY_LABEL: Record<Category, string> = {
  brand: "A Marke",
  local: "B Lokal",
  commercial: "C Gewerblich",
  location: "D Standortgeber",
  other: "Sonstige",
};

export const BUCKET_LABEL: Record<Bucket, string> = {
  top3: "1–3 Top-Platzierung",
  page1: "4–10 meist Seite 1",
  page2: "11–20 meist Seite 2",
  improve: "21–50 ausbaufähig",
  low: "51+ geringe Sichtbarkeit",
  none: "keine Daten",
};

/** Target keywords from the SEO brief. Shown even when Search Console has no data for them. */
export const TARGET_KEYWORDS: Record<Exclude<Category, "other">, string[]> = {
  brand: ["snackora", "snackora.de", "snackora automaten"],
  local: [
    "snackautomaten esslingen",
    "getränkeautomaten esslingen",
    "verkaufsautomaten esslingen",
    "snackautomaten waiblingen",
    "getränkeautomaten waiblingen",
    "automatenaufstellung esslingen",
    "automatenaufstellung waiblingen",
    "snackautomaten stuttgart",
  ],
  commercial: [
    "snackautomat aufstellen lassen",
    "snackautomat für firma",
    "snackautomaten für unternehmen",
    "getränkeautomat für firma",
    "verkaufsautomat aufstellen",
    "automatenaufstellung kostenlos",
    "snackautomaten betreiber",
    "kombiautomat für unternehmen",
  ],
  location: [
    "stellplatz für snackautomat vermieten",
    "standort für verkaufsautomat anbieten",
    "automatenaufsteller gesucht",
    "snackautomat standort anbieten",
    "snackautomat aufstellen betrieb",
  ],
};

/** Search Console has no city filter – local intent is read from city names inside the query. */
export const FOCUS_CITIES = ["esslingen", "waiblingen", "stuttgart"] as const;
const REGION_CITIES = [
  "fellbach", "ludwigsburg", "ostfildern", "plochingen", "nuertingen", "filderstadt", "leinfelden", "echterdingen",
  "boeblingen", "sindelfingen", "winnenden", "schorndorf", "backnang", "kernen", "weinstadt", "remseck",
  "kornwestheim", "goeppingen", "wendlingen", "denkendorf", "rems-murr",
];

const BRAND_RE = /\bsna(?:c?k)+\s*-?\s*or+a\b/;
const LOCATION_RE = /stellplatz|standort|aufsteller gesucht|automatenaufsteller|vermiet|anbiete|verpacht|aufstellen betrieb/;
const MACHINE_RE = /automat|vending|snack|getraenk|kaffee|kiosk/;
const LEAD_RE = /aufstell|firma|firmen|unternehm|betrieb|buero|betreiber|mitarbeit|kostenlos|miete|leasing|standort|stellplatz|\bfuer\b|gewerb|halle|verein/;

/** Lowercase, collapse whitespace, fold umlauts so "getränke" and "getraenke" match. */
export function normalize(q: string): string {
  return q
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/\s+/g, " ")
    .trim();
}

export function citiesIn(query: string): string[] {
  const n = normalize(query);
  return [...FOCUS_CITIES, ...REGION_CITIES].filter((c) => n.includes(c));
}

export const isBrand = (query: string) => BRAND_RE.test(normalize(query));

const TARGET_CATEGORY = new Map(
  (Object.entries(TARGET_KEYWORDS) as [Category, string[]][]).flatMap(([cat, kws]) => kws.map((k) => [normalize(k), cat] as const)),
);

export function categorize(query: string): Category {
  const n = normalize(query);
  const target = TARGET_CATEGORY.get(n);
  if (target) return target;
  if (BRAND_RE.test(n)) return "brand";
  if (LOCATION_RE.test(n)) return "location";
  if (citiesIn(n).length) return "local";
  if (MACHINE_RE.test(n)) return "commercial";
  return "other";
}

export const hasLeadIntent = (query: string) => !isBrand(query) && LEAD_RE.test(normalize(query));

/** Average position is an impression-weighted mean, not a live Google rank. */
export function bucketOf(position: number | null | undefined): Bucket {
  if (!position) return "none";
  if (position <= 3) return "top3";
  if (position <= 10) return "page1";
  if (position <= 20) return "page2";
  if (position <= 50) return "improve";
  return "low";
}

const metricsOf = (r: ScRow): Metrics => ({ clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.impressions ? r.position : null });
export const EMPTY: Metrics = { clicks: 0, impressions: 0, ctr: 0, position: null };

/** Impression-weighted aggregate of several rows. */
export function sumMetrics(rows: Metrics[]): Metrics {
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const weighted = rows.reduce((s, r) => s + (r.position ?? 0) * r.impressions, 0);
  return { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position: impressions ? weighted / impressions : null };
}

export function buildQueryStats(p: PeriodData): QueryStat[] {
  const topPage = new Map<string, ScRow>();
  for (const r of p.queryPage) {
    const [q] = r.keys ?? [];
    const cur = topPage.get(q);
    if (!cur || r.impressions > cur.impressions) topPage.set(q, r);
  }
  const devices = new Map<string, Partial<Record<Device, Metrics>>>();
  for (const r of p.queryDevice) {
    const [q, d] = r.keys ?? [];
    devices.set(q, { ...devices.get(q), [d as Device]: metricsOf(r) });
  }
  return p.queries
    .map((r) => {
      const query = r.keys?.[0] ?? "";
      const m = metricsOf(r);
      return {
        query,
        ...m,
        category: categorize(query),
        cities: citiesIn(query),
        leadIntent: hasLeadIntent(query),
        bucket: bucketOf(m.position),
        topPage: topPage.get(query)?.keys?.[1] ?? null,
        devices: devices.get(query) ?? {},
      };
    })
    .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks || a.query.localeCompare(b.query));
}

/** Impressions/clicks Search Console does not attribute to any query (anonymized, rare queries). */
export function hiddenShare(p: PeriodData) {
  const visible = sumMetrics(p.queries.map(metricsOf));
  return {
    visibleImpressions: visible.impressions,
    hiddenImpressions: Math.max(0, p.total.impressions - visible.impressions),
    hiddenClicks: Math.max(0, p.total.clicks - visible.clicks),
  };
}

export const strikingDistance = (qs: QueryStat[]) => qs.filter((q) => q.position !== null && q.position >= 8 && q.position <= 20);
export const lowCtr = (qs: QueryStat[], minImpressions = 20) =>
  qs.filter((q) => q.impressions >= minImpressions && q.ctr < 0.02 && q.position !== null && q.position <= 20);
export const topTen = (qs: QueryStat[]) => qs.filter((q) => q.position !== null && q.position <= 10);

/* ───────────────────────── rendering ───────────────────────── */

export const pct = (n: number) => `${(n * 100).toFixed(1)} %`;
export const pos = (n: number | null) => (n === null ? "–" : n.toFixed(1));
const shortUrl = (u: string | null) => (u ? u.replace(/^https?:\/\/(www\.)?snackora\.de/, "") || "/" : "–");
const md = (s: string) => s.replace(/\|/g, "\\|");

export function table(head: string[], rows: (string | number)[][], empty = "_keine Daten_"): string {
  if (!rows.length) return empty;
  return [`| ${head.join(" | ")} |`, `|${head.map((_, i) => (i === 0 ? "---" : "---:")).join("|")}|`, ...rows.map((r) => `| ${r.map(String).join(" | ")} |`)].join("\n");
}

const queryRow = (q: QueryStat) => [md(q.query), q.impressions, q.clicks, pct(q.ctr), pos(q.position), BUCKET_LABEL[q.bucket], shortUrl(q.topPage)];
const QUERY_HEAD = ["Suchanfrage", "Impr.", "Klicks", "CTR", "Ø Pos.", "Status", "URL"];

export type IndexStatus = { url: string; verdict: string; coverage: string; lastCrawl: string | null; googleCanonical: string | null };
export type SitemapInfo = { path: string; lastDownloaded: string | null; submitted: number; indexed: number; errors: number; warnings: number };

export type ReportInput = {
  generatedAt: string;
  site: string;
  country: string; // ISO-3166-1 alpha-3 or "alle"
  periods: PeriodData[];
  sitemaps: SitemapInfo[];
  index: IndexStatus[];
  warnings: string[];
};

export function renderMarkdown(input: ReportInput): string {
  const { periods } = input;
  const stats = new Map(periods.map((p) => [p.days, buildQueryStats(p)]));
  const main = periods.find((p) => p.days === 28) ?? periods[0];
  const out: string[] = [
    `# Snackora – Keyword-Bericht (Google Search Console)`,
    ``,
    `Property \`${input.site}\` · Land: **${input.country}** · erstellt ${input.generatedAt}`,
    ``,
    `> **Hinweise zur Interpretation**`,
    `> - „Ø Position“ ist der impressionsgewichtete Durchschnitt der höchsten Snackora-Position pro Suche – **kein exakter, aktueller Google-Rang**. Ergebnisse sind personalisiert und schwanken.`,
    `> - Search Console verschweigt seltene Suchanfragen aus Datenschutzgründen (anonymisiert). Ihre Impressionen sind in den Summen enthalten, aber keiner Suchanfrage zugeordnet.`,
    `> - „keine Daten“ heißt: in diesem Zeitraum keine erfasste Impression – das ist **nicht** dasselbe wie „bei Google nicht vorhanden“ (z. B. noch nicht indexiert oder nur anonymisiert).`,
    `> - Search Console bietet keinen Stadt-/Regionsfilter. Lokale Auswertung = Städtenamen in der Suchanfrage.`,
    `> - Daten inkl. vorläufiger letzter Tage (\`dataState: all\`); Search Console hängt ~2 Tage hinterher.`,
    ``,
  ];
  for (const w of input.warnings) out.push(`⚠ ${w}`, ``);

  /* overview */
  out.push(`## Überblick`, ``);
  out.push(
    table(
      ["Zeitraum", "Impr.", "Klicks", "CTR", "Ø Pos.", "sichtbare Suchanfragen", "anonymisierte Impr.", "Impr. alle Länder"],
      periods.map((p) => {
        const h = hiddenShare(p);
        return [`${p.days} Tage (${p.start} – ${p.end})`, p.total.impressions, p.total.clicks, pct(p.total.ctr), pos(p.total.position), p.queries.length, h.hiddenImpressions, p.totalAllCountries.impressions];
      }),
    ),
    ``,
  );

  out.push(`### Geräte`, ``);
  out.push(
    table(
      ["Zeitraum", "Gerät", "Impr.", "Klicks", "CTR", "Ø Pos."],
      periods.flatMap((p) => p.devices.map((r) => [`${p.days} Tage`, r.keys?.[0] ?? "", r.impressions, r.clicks, pct(r.ctr), pos(r.position)])),
    ),
    ``,
  );

  /* index status – explains "no data" */
  if (input.sitemaps.length || input.index.length) {
    out.push(`## Indexierung`, ``);
    out.push(table(["Sitemap", "zuletzt gelesen", "eingereicht", "indexiert*", "Fehler", "Warnungen"], input.sitemaps.map((s) => [s.path, s.lastDownloaded ?? "ausstehend", s.submitted, s.indexed, s.errors, s.warnings])), ``);
    out.push(`_* Sitemap-Zähler aktualisiert sich verzögert; maßgeblich ist die URL-Prüfung._`, ``);
    const indexed = input.index.filter((i) => i.verdict === "PASS").length;
    if (input.index.length) {
      out.push(`URL-Prüfung: **${indexed} von ${input.index.length}** Sitemap-URLs indexiert.`, ``);
      out.push(table(["URL", "Status", "zuletzt gecrawlt", "Google-Canonical"], input.index.map((i) => [shortUrl(i.url), i.coverage, i.lastCrawl?.slice(0, 10) ?? "–", i.googleCanonical ?? "–"])), ``);
    }
  }

  /* first-page queries */
  out.push(`## Suchanfragen in den Top 10 (Ø Position ≤ 10)`, ``);
  for (const p of periods) {
    const qs = topTen(stats.get(p.days) ?? []);
    out.push(`### ${p.days} Tage`, ``, table(QUERY_HEAD, qs.map(queryRow), "_keine Suchanfrage mit Ø Position ≤ 10_"), ``);
  }

  /* per-period detail */
  for (const p of periods) {
    const qs = stats.get(p.days) ?? [];
    const brand = qs.filter((q) => q.category === "brand");
    const nonBrand = qs.filter((q) => q.category !== "brand");
    out.push(`## ${p.days} Tage (${p.start} – ${p.end})`, ``);

    out.push(`### Positionsgruppen`, ``);
    out.push(
      table(
        ["Gruppe", "Marke: Anfragen", "Marke: Impr.", "Nicht-Marke: Anfragen", "Nicht-Marke: Impr.", "Nicht-Marke: Klicks"],
        (Object.keys(BUCKET_LABEL) as Bucket[])
          .filter((b) => b !== "none")
          .map((b) => {
            const bq = brand.filter((q) => q.bucket === b);
            const nq = nonBrand.filter((q) => q.bucket === b);
            return [BUCKET_LABEL[b], bq.length, sumMetrics(bq).impressions, nq.length, sumMetrics(nq).impressions, sumMetrics(nq).clicks];
          }),
      ),
      ``,
    );

    out.push(`### Markensuchen`, ``, table(QUERY_HEAD, brand.map(queryRow)), ``);
    out.push(`### Nicht-Marken-Suchanfragen (Top 50 nach Impressionen)`, ``);
    out.push(table(["Kategorie", ...QUERY_HEAD, "Mobil Impr./Pos.", "Desktop Impr./Pos."], nonBrand.slice(0, 50).map((q) => [CATEGORY_LABEL[q.category], ...queryRow(q), dev(q, "MOBILE"), dev(q, "DESKTOP")])), ``);

    out.push(`### Chancen: Ø Position 8–20`, ``, table(QUERY_HEAD, strikingDistance(nonBrand).map(queryRow)), ``);
    out.push(`### Chancen: viele Impressionen, CTR < 2 % (≥ 20 Impr., Ø Pos. ≤ 20)`, ``, table(QUERY_HEAD, lowCtr(qs).map(queryRow)), ``);
    out.push(`### Lead-Potenzial (Nicht-Marke mit Kauf-/Standortabsicht)`, ``, table(["Kategorie", ...QUERY_HEAD], nonBrand.filter((q) => q.leadIntent).map((q) => [CATEGORY_LABEL[q.category], ...queryRow(q)])), ``);
    out.push(
      `### Seiten (alle Länder – ein Länderfilter blendet hier anonymisierte Suchanfragen aus)`,
      ``,
      table(["Seite", "Impr.", "Klicks", "CTR", "Ø Pos."], p.pages.map((r) => [r.keys?.[0] ?? "", r.impressions, r.clicks, pct(r.ctr), pos(r.position)])),
      ``,
    );
  }

  /* local */
  out.push(`## Lokal: Städte in Suchanfragen`, ``);
  out.push(
    table(
      ["Stadt", ...periods.flatMap((p) => [`${p.days} T. Anfragen`, `${p.days} T. Impr.`, `${p.days} T. Ø Pos.`])],
      [...FOCUS_CITIES, "andere Orte der Region"].map((city) => [
        city,
        ...periods.flatMap((p) => {
          const qs = (stats.get(p.days) ?? []).filter((q) =>
            city === "andere Orte der Region" ? q.cities.some((c) => !(FOCUS_CITIES as readonly string[]).includes(c)) : q.cities.includes(city),
          );
          const m = sumMetrics(qs);
          return [qs.length, m.impressions, pos(m.position)];
        }),
      ]),
    ),
    ``,
  );

  /* targets */
  out.push(`## Ziel-Keywords`, ``, `Exakte Übereinstimmung (Groß-/Kleinschreibung und Umlaute ignoriert). „keine Daten“ = nicht in Search Console erfasst.`, ``);
  for (const [cat, kws] of Object.entries(TARGET_KEYWORDS) as [Category, string[]][]) {
    out.push(`### ${CATEGORY_LABEL[cat]}`, ``);
    out.push(
      table(
        ["Keyword", ...periods.flatMap((p) => [`${p.days} T. Impr.`, `${p.days} T. Ø Pos.`]), `Status (${main.days} T.)`],
        kws.map((k) => {
          const per = periods.map((p) => findQuery(stats.get(p.days) ?? [], k));
          const m = findQuery(stats.get(main.days) ?? [], k);
          return [k, ...per.flatMap((q) => [q?.impressions ?? 0, pos(q?.position ?? null)]), BUCKET_LABEL[m?.bucket ?? "none"]];
        }),
      ),
      ``,
    );
  }
  return out.join("\n");
}

function dev(q: QueryStat, d: Device) {
  const m = q.devices[d];
  return m ? `${m.impressions} / ${pos(m.position)}` : "–";
}

export const findQuery = (qs: QueryStat[], keyword: string) => qs.find((q) => normalize(q.query) === normalize(keyword));

const CSV_HEAD = ["period_days", "start", "end", "query", "category", "brand", "cities", "lead_intent", "target", "device", "top_url", "impressions", "clicks", "ctr", "avg_position", "bucket"];

const csvCell = (v: string | number | boolean | null) => {
  const s = v === null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** One row per period × query (device ALL + each device) plus target keywords without data. */
export function renderCsv(input: ReportInput): string {
  const targets = new Set(Object.values(TARGET_KEYWORDS).flat().map(normalize));
  const lines = [CSV_HEAD.join(",")];
  for (const p of input.periods) {
    const qs = buildQueryStats(p);
    const base = (q: string, device: string, url: string | null, m: Metrics) => [
      p.days, p.start, p.end, q, CATEGORY_LABEL[categorize(q)], isBrand(q), citiesIn(q).join(" "), hasLeadIntent(q), targets.has(normalize(q)),
      device, url ?? "", m.impressions, m.clicks, m.impressions ? m.ctr.toFixed(4) : "", m.position === null ? "" : m.position.toFixed(2), bucketOf(m.position),
    ];
    for (const q of qs) {
      lines.push(base(q.query, "ALL", q.topPage, q).map(csvCell).join(","));
      for (const [d, m] of Object.entries(q.devices)) lines.push(base(q.query, d, null, m).map(csvCell).join(","));
    }
    for (const k of Object.values(TARGET_KEYWORDS).flat()) {
      if (!findQuery(qs, k)) lines.push(base(k, "ALL", null, EMPTY).map(csvCell).join(","));
    }
  }
  return lines.join("\n") + "\n";
}
