import { describe, expect, it } from "vitest";
import {
  bucketOf,
  buildQueryStats,
  categorize,
  citiesIn,
  hasLeadIntent,
  hiddenShare,
  isBrand,
  lowCtr,
  renderCsv,
  renderMarkdown,
  strikingDistance,
  sumMetrics,
  topTen,
  type PeriodData,
  type ReportInput,
} from "../../scripts/keywords/analysis.mts";

const row = (keys: string[], impressions: number, clicks: number, position: number) => ({ keys, impressions, clicks, ctr: impressions ? clicks / impressions : 0, position });

const EMPTY_PERIOD: PeriodData = {
  days: 28,
  start: "2026-09-24",
  end: "2026-10-21",
  total: { clicks: 0, impressions: 0, ctr: 0, position: null },
  totalAllCountries: { clicks: 0, impressions: 0, ctr: 0, position: null },
  devices: [],
  queries: [],
  queryDevice: [],
  queryPage: [],
  pages: [],
};

const PERIOD: PeriodData = {
  ...EMPTY_PERIOD,
  total: { clicks: 4, impressions: 260, ctr: 4 / 260, position: 9 },
  queries: [
    row(["snackora"], 10, 3, 1.2),
    row(["snackautomaten esslingen"], 120, 1, 12.4),
    row(["Getränkeautomat für Firma"], 80, 0, 6),
    row(["kaffee rezept"], 5, 0, 70),
  ],
  queryDevice: [row(["snackautomaten esslingen", "MOBILE"], 90, 1, 11), row(["snackautomaten esslingen", "DESKTOP"], 30, 0, 16.6)],
  queryPage: [
    row(["snackautomaten esslingen", "https://snackora.de/"], 20, 0, 30),
    row(["snackautomaten esslingen", "https://snackora.de/automaten/snackautomaten"], 100, 1, 9),
  ],
  pages: [row(["https://snackora.de/"], 200, 4, 8)],
};

describe("keyword classification", () => {
  it("detects brand queries incl. common misspellings", () => {
    expect(isBrand("snackora")).toBe(true);
    expect(isBrand("Snackora.de")).toBe(true);
    expect(isBrand("snakora automaten")).toBe(true);
    expect(isBrand("snackautomat")).toBe(false);
  });

  it("uses the brief's categories for target keywords", () => {
    expect(categorize("snackautomat aufstellen betrieb")).toBe("location");
    expect(categorize("Automatenaufstellung Waiblingen")).toBe("local");
    expect(categorize("automatenaufstellung kostenlos")).toBe("commercial");
    expect(categorize("snackora automaten")).toBe("brand");
  });

  it("classifies unknown queries heuristically", () => {
    expect(categorize("standort für kaffeeautomat gesucht")).toBe("location");
    expect(categorize("getränkeautomat fellbach")).toBe("local");
    expect(categorize("snackautomat kaufen")).toBe("commercial");
    expect(categorize("pausenraum ideen")).toBe("other");
  });

  it("reads city names from the query, umlaut-insensitive", () => {
    expect(citiesIn("Automaten Esslingen am Neckar")).toEqual(["esslingen"]);
    expect(citiesIn("snackautomat nürtingen")).toEqual(["nuertingen"]);
    expect(citiesIn("snackautomat")).toEqual([]);
  });

  it("flags lead intent for non-brand B2B / location queries only", () => {
    expect(hasLeadIntent("snackautomat für firma")).toBe(true);
    expect(hasLeadIntent("stellplatz vermieten automat")).toBe(true);
    expect(hasLeadIntent("snackora firma")).toBe(false);
    expect(hasLeadIntent("snackautomat")).toBe(false);
  });

  it("buckets average positions", () => {
    expect([null, 0, 1, 3, 3.1, 10, 10.4, 20, 20.1, 50, 51].map(bucketOf)).toEqual([
      "none", "none", "top3", "top3", "page1", "page1", "page2", "page2", "improve", "improve", "low",
    ]);
  });
});

describe("query stats", () => {
  const qs = buildQueryStats(PERIOD);

  it("sorts by impressions and attaches top URL + device split", () => {
    expect(qs.map((q) => q.query)[0]).toBe("snackautomaten esslingen");
    expect(qs[0].topPage).toBe("https://snackora.de/automaten/snackautomaten");
    expect(qs[0].devices.MOBILE?.impressions).toBe(90);
    expect(qs[0].bucket).toBe("page2");
  });

  it("finds opportunities", () => {
    expect(topTen(qs).map((q) => q.query)).toEqual(["Getränkeautomat für Firma", "snackora"]);
    expect(strikingDistance(qs).map((q) => q.query)).toEqual(["snackautomaten esslingen"]);
    expect(lowCtr(qs).map((q) => q.query)).toEqual(["snackautomaten esslingen", "Getränkeautomat für Firma"]);
  });

  it("computes anonymized impressions and weighted sums", () => {
    expect(hiddenShare(PERIOD)).toEqual({ visibleImpressions: 215, hiddenImpressions: 45, hiddenClicks: 0 });
    expect(sumMetrics([{ clicks: 1, impressions: 10, ctr: 0.1, position: 2 }, { clicks: 0, impressions: 30, ctr: 0, position: 6 }])).toEqual({
      clicks: 1, impressions: 40, ctr: 0.025, position: 5,
    });
    expect(sumMetrics([]).position).toBeNull();
  });
});

describe("rendering", () => {
  const input = (periods: PeriodData[]): ReportInput => ({ generatedAt: "x", site: "sc-domain:snackora.de", country: "DEU", periods, sitemaps: [], index: [], warnings: [] });

  it("renders empty data honestly instead of inventing positions", () => {
    const md = renderMarkdown(input([{ ...EMPTY_PERIOD, days: 7 }, EMPTY_PERIOD]));
    expect(md).toContain("_keine Suchanfrage mit Ø Position ≤ 10_");
    expect(md).toContain("kein exakter, aktueller Google-Rang");
    expect(md).toMatch(/\| snackautomaten waiblingen \| 0 \| – \| 0 \| – \| keine Daten \|/);
    const csv = renderCsv(input([EMPTY_PERIOD])).trim().split("\n");
    expect(csv).toHaveLength(1 + 24); // header + every target keyword with empty metrics
    expect(csv[1]).toMatch(/,ALL,,0,0,,,none$/);
  });

  it("renders real rows with top-10 section, city table and escaped CSV", () => {
    const md = renderMarkdown(input([PERIOD]));
    expect(md).toContain("| Getränkeautomat für Firma | 80 | 0 | 0.0 % | 6.0 | 4–10 meist Seite 1 | – |");
    expect(md).toMatch(/\| esslingen \| 1 \| 120 \| 12\.4 \|/);
    const csv = renderCsv(input([PERIOD]));
    expect(csv).toContain("28,2026-09-24,2026-10-21,snackautomaten esslingen,B Lokal,false,esslingen,false,true,MOBILE,,90,1,0.0111,11.00,page2");
  });
});
