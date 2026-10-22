import "server-only";
import { getGoogleAccessToken } from "./google-auth";

/**
 * Read-only data for /admin from the GA4 Data API and the Search Console API.
 * GA4 only contains visitors who consented to statistics, and never personal
 * data – the "visit log" is aggregated by hour, city, source and page.
 */

export const GA_PROPERTY = "properties/560118080";
const SC_SITE = "sc-domain:snackora.de";

export const RANGES = { heute: 1, "7": 7, "28": 28, "90": 90 } as const;
export type RangeKey = keyof typeof RANGES;
/** Display order (object keys that look like numbers would otherwise come first). */
export const RANGE_ORDER: readonly RangeKey[] = ["heute", "7", "28", "90"];
export const DEFAULT_RANGE: RangeKey = "28";
export const isRangeKey = (v: unknown): v is RangeKey => typeof v === "string" && v in RANGES;

export const LEAD_EVENTS = ["generate_lead", "standortanfrage_submit", "kontakt_submit", "click_email", "click_phone"] as const;

export type Section<T> = { ok: true; data: T } | { ok: false; error: string };

export interface Totals {
  users: number;
  newUsers: number;
  sessions: number;
  views: number;
  avgSessionSeconds: number;
}
export interface DashboardData {
  range: RangeKey;
  generatedAt: string;
  totals: Section<{ current: Totals; previous: Totals }>;
  series: Section<{ granularity: "hour" | "day"; points: { key: string; users: number; sessions: number; views: number }[] }>;
  channels: Section<{ name: string; sessions: number; users: number }[]>;
  sources: Section<{ name: string; sessions: number }[]>;
  pages: Section<{ path: string; views: number; users: number }[]>;
  cities: Section<{ city: string; country: string; users: number }[]>;
  devices: Section<{ name: string; users: number }[]>;
  events: Section<{ name: string; current: number; previous: number }[]>;
  visits: Section<{ hour: string; city: string; source: string; landing: string; device: string; sessions: number }[]>;
  realtime: Section<{ activeUsers: number; pages: { title: string; users: number }[] }>;
  search: Section<{
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    queries: { query: string; clicks: number; impressions: number; position: number }[];
  }>;
}

/* ── GA4 helpers ── */

interface GaRow {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}
interface GaReport {
  rows?: GaRow[];
  dimensionHeaders?: { name: string }[];
}

const num = (v: string | undefined) => (v ? Number(v) : 0);
const dim = (r: GaRow, i: number) => r.dimensionValues?.[i]?.value ?? "";
const met = (r: GaRow, i: number) => num(r.metricValues?.[i]?.value);

function dateRanges(days: number) {
  return {
    current: { startDate: days === 1 ? "today" : `${days - 1}daysAgo`, endDate: "today", name: "current" },
    previous: { startDate: `${2 * days - 1}daysAgo`, endDate: `${days}daysAgo`, name: "previous" },
  };
}

async function google<T>(url: string, body?: unknown): Promise<T> {
  const token = await getGoogleAccessToken();
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  return json;
}

const settle = async <T,>(p: Promise<T>): Promise<Section<T>> => {
  try {
    return { ok: true, data: await p };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

const totalsFrom = (r: GaRow | undefined): Totals => ({
  users: r ? met(r, 0) : 0,
  newUsers: r ? met(r, 1) : 0,
  sessions: r ? met(r, 2) : 0,
  views: r ? met(r, 3) : 0,
  avgSessionSeconds: r ? met(r, 4) : 0,
});

export async function getDashboardData(range: RangeKey): Promise<DashboardData> {
  const days = RANGES[range];
  const { current, previous } = dateRanges(days);
  const batch = (requests: unknown[]) =>
    google<{ reports: GaReport[] }>(`https://analyticsdata.googleapis.com/v1beta/${GA_PROPERTY}:batchRunReports`, { requests }).then((r) => r.reports);

  const byHour = days === 1;
  const first = batch([
    {
      dateRanges: [current, previous],
      metrics: ["totalUsers", "newUsers", "sessions", "screenPageViews", "averageSessionDuration"].map((name) => ({ name })),
    },
    {
      dateRanges: [current],
      dimensions: [{ name: byHour ? "dateHour" : "date" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
      orderBys: [{ dimension: { dimensionName: byHour ? "dateHour" : "date" } }],
      keepEmptyRows: true,
    },
    {
      dateRanges: [current],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    },
    {
      dateRanges: [current],
      dimensions: [{ name: "sessionSourceMedium" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    },
    {
      dateRanges: [current],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    },
  ]);
  const second = batch([
    {
      dateRanges: [current],
      dimensions: [{ name: "city" }, { name: "country" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: 10,
    },
    {
      dateRanges: [current],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
    },
    {
      dateRanges: [current, previous],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: [...LEAD_EVENTS] } } },
    },
    {
      dateRanges: [current],
      dimensions: [{ name: "dateHour" }, { name: "city" }, { name: "sessionSourceMedium" }, { name: "landingPage" }, { name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "dateHour" }, desc: true }],
      limit: 30,
    },
  ]);

  const [a, b] = await Promise.allSettled([first, second]);
  const pick = <T,>(res: PromiseSettledResult<GaReport[]>, i: number, map: (r: GaReport) => T): Section<T> =>
    res.status === "fulfilled"
      ? { ok: true, data: map(res.value[i] ?? {}) }
      : { ok: false, error: res.reason instanceof Error ? res.reason.message : String(res.reason) };

  // With two date ranges GA adds a "dateRange" dimension as the last dimension.
  const rangeOf = (r: GaRow, report: GaReport) => dim(r, (report.dimensionHeaders?.length ?? 1) - 1);

  const [realtime, search] = await Promise.all([
    settle(
      Promise.all([
        google<GaReport>(`https://analyticsdata.googleapis.com/v1beta/${GA_PROPERTY}:runRealtimeReport`, { metrics: [{ name: "activeUsers" }] }),
        google<GaReport>(`https://analyticsdata.googleapis.com/v1beta/${GA_PROPERTY}:runRealtimeReport`, {
          dimensions: [{ name: "unifiedScreenName" }],
          metrics: [{ name: "activeUsers" }],
          limit: 5,
        }),
      ]).then(([t, p]) => ({
        activeUsers: t.rows?.[0] ? met(t.rows[0], 0) : 0,
        pages: (p.rows ?? []).map((r) => ({ title: dim(r, 0), users: met(r, 0) })),
      }))
    ),
    settle(getSearch(days)),
  ]);

  return {
    range,
    generatedAt: new Date().toISOString(),
    totals: pick(a, 0, (rep) => {
      const rows = rep.rows ?? [];
      const find = (name: string) => rows.find((r) => rangeOf(r, rep) === name);
      return { current: totalsFrom(find("current") ?? (rows.length === 1 ? rows[0] : undefined)), previous: totalsFrom(find("previous")) };
    }),
    series: pick(a, 1, (rep) => ({
      granularity: byHour ? "hour" : "day",
      points: (rep.rows ?? []).map((r) => ({ key: dim(r, 0), users: met(r, 0), sessions: met(r, 1), views: met(r, 2) })),
    })),
    channels: pick(a, 2, (rep) => (rep.rows ?? []).map((r) => ({ name: dim(r, 0), sessions: met(r, 0), users: met(r, 1) }))),
    sources: pick(a, 3, (rep) => (rep.rows ?? []).map((r) => ({ name: dim(r, 0), sessions: met(r, 0) }))),
    pages: pick(a, 4, (rep) => (rep.rows ?? []).map((r) => ({ path: dim(r, 0), views: met(r, 0), users: met(r, 1) }))),
    cities: pick(b, 0, (rep) => (rep.rows ?? []).map((r) => ({ city: dim(r, 0), country: dim(r, 1), users: met(r, 0) }))),
    devices: pick(b, 1, (rep) => (rep.rows ?? []).map((r) => ({ name: dim(r, 0), users: met(r, 0) }))),
    events: pick(b, 2, (rep) =>
      LEAD_EVENTS.map((name) => {
        const rows = (rep.rows ?? []).filter((r) => dim(r, 0) === name);
        const v = (range: string) => rows.filter((r) => rangeOf(r, rep) === range).reduce((s, r) => s + met(r, 0), 0);
        return { name, current: v("current"), previous: v("previous") };
      })
    ),
    visits: pick(b, 3, (rep) =>
      (rep.rows ?? []).map((r) => ({ hour: dim(r, 0), city: dim(r, 1), source: dim(r, 2), landing: dim(r, 3), device: dim(r, 4), sessions: met(r, 0) }))
    ),
    realtime,
    search,
  };
}

async function getSearch(days: number) {
  const end = new Date();
  // at least 7 days: Search Console data arrives with a 2–3 day delay
  const start = new Date(end.getTime() - (Math.max(days, 7) - 1) * 864e5);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SC_SITE)}/searchAnalytics/query`;
  type ScRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };
  const [total, queries] = await Promise.all([
    google<{ rows?: ScRow[] }>(url, { startDate: iso(start), endDate: iso(end) }),
    google<{ rows?: ScRow[] }>(url, { startDate: iso(start), endDate: iso(end), dimensions: ["query"], rowLimit: 10 }),
  ]);
  const t = total.rows?.[0];
  return {
    clicks: t?.clicks ?? 0,
    impressions: t?.impressions ?? 0,
    ctr: t?.ctr ?? 0,
    position: t?.position ?? 0,
    queries: (queries.rows ?? []).map((r) => ({ query: r.keys?.[0] ?? "", clicks: r.clicks, impressions: r.impressions, position: r.position })),
  };
}
