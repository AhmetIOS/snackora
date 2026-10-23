/**
 * Snackora – keyword report from Google Search Console.
 *
 *   npm run report:keywords                       # 7 / 28 / 90 days, Germany
 *   npm run report:keywords -- --periods 7,28     # custom periods
 *   npm run report:keywords -- --country all      # no country filter
 *   npm run report:keywords -- --no-inspect       # skip URL Inspection calls
 *
 * Writes reports/google-keywords.md and reports/google-keywords.csv (git-ignored).
 * Auth: keyless, same as `report:google` – a short-lived read-only token minted via
 * gcloud impersonation of the integration service account. Nothing is persisted.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { renderCsv, renderMarkdown, type IndexStatus, type Metrics, type PeriodData, type ScRow, type SitemapInfo } from "./keywords/analysis.mts";

const SA = "snackora-integrations@snackora-web-integrations.iam.gserviceaccount.com";
const SC_SITE = "sc-domain:snackora.de";
const SITE = "https://snackora.de";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const PAGE_SIZE = 25_000; // API maximum per request

const args = process.argv.slice(2);
const arg = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const periods = (arg("--periods") ?? "7,28,90").split(",").map(Number).filter((n) => n > 0);
const country = (arg("--country") ?? "deu").toLowerCase();
const inspect = !args.includes("--no-inspect");

function gcloudEnv(): NodeJS.ProcessEnv {
  if (process.env.CLOUDSDK_PYTHON) return process.env;
  // gcloud needs Python ≥ 3.10; non-interactive shells don't load ~/.zshrc, so look for the uv-managed one.
  const dir = path.join(homedir(), ".local/share/uv/python");
  const py = existsSync(dir)
    ? readdirSync(dir)
        .filter((d) => /^cpython-3\.1\d/.test(d))
        .map((d) => path.join(dir, d, "bin", `python${d.match(/^cpython-(3\.\d+)/)?.[1]}`))
        .find(existsSync)
    : undefined;
  return py ? { ...process.env, CLOUDSDK_PYTHON: py } : process.env;
}

function token(): string {
  const local = path.join(homedir(), ".local/share/google-cloud-sdk/bin/gcloud");
  try {
    return execFileSync(existsSync(local) ? local : "gcloud", ["auth", "print-access-token", `--impersonate-service-account=${SA}`, `--scopes=${SCOPE}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      env: gcloudEnv(),
    }).trim();
  } catch {
    console.error("✖ Kein Token. Bitte `gcloud auth login` (info@snackora.de) ausführen.");
    process.exit(1);
  }
}

const T = token();
async function api<R>(url: string, body?: unknown): Promise<R> {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${T}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${json.error?.message ?? ""}`.trim());
  return json as R;
}

const SC = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SC_SITE)}`;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const countryFilter = (c: string) => (c === "all" ? {} : { dimensionFilterGroups: [{ filters: [{ dimension: "country", operator: "equals", expression: c }] }] });

/** All rows for a dimension set, paging with startRow until a short page comes back. */
async function query(start: string, end: string, dimensions: string[], c = country): Promise<ScRow[]> {
  const rows: ScRow[] = [];
  for (let startRow = 0; ; startRow += PAGE_SIZE) {
    const res = await api<{ rows?: ScRow[] }>(`${SC}/searchAnalytics/query`, {
      startDate: start,
      endDate: end,
      dimensions,
      rowLimit: PAGE_SIZE,
      startRow,
      dataState: "all",
      ...countryFilter(c),
    });
    rows.push(...(res.rows ?? []));
    if ((res.rows?.length ?? 0) < PAGE_SIZE) return rows;
  }
}

const totalOf = (rows: ScRow[]): Metrics => {
  const r = rows[0];
  return r ? { clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.impressions ? r.position : null } : { clicks: 0, impressions: 0, ctr: 0, position: null };
};

async function period(days: number): Promise<PeriodData> {
  const end = new Date(Date.now() - 864e5); // yesterday; today is always empty/partial
  const start = new Date(end.getTime() - (days - 1) * 864e5);
  const [s, e] = [iso(start), iso(end)];
  const [total, totalAll, devices, queries, queryDevice, queryPage, pages] = await Promise.all([
    query(s, e, []),
    query(s, e, [], "all"),
    query(s, e, ["device"]),
    query(s, e, ["query"]),
    query(s, e, ["query", "device"]),
    query(s, e, ["query", "page"]),
    query(s, e, ["page"], "all"), // a country filter drops anonymized-query rows from page data
  ]);
  return { days, start: s, end: e, total: totalOf(total), totalAllCountries: totalOf(totalAll), devices, queries, queryDevice, queryPage, pages };
}

const warnings: string[] = [];

const data = await Promise.all(periods.map(period));

let sitemaps: SitemapInfo[] = [];
try {
  type Sm = { path: string; lastDownloaded?: string; errors?: string; warnings?: string; contents?: { submitted?: string; indexed?: string }[] };
  const sm = await api<{ sitemap?: Sm[] }>(`${SC}/sitemaps`);
  sitemaps = (sm.sitemap ?? []).map((s) => ({
    path: s.path,
    lastDownloaded: s.lastDownloaded?.slice(0, 10) ?? null,
    submitted: Number(s.contents?.[0]?.submitted ?? 0),
    indexed: Number(s.contents?.[0]?.indexed ?? 0),
    errors: Number(s.errors ?? 0),
    warnings: Number(s.warnings ?? 0),
  }));
} catch (e) {
  warnings.push(`Sitemaps nicht abrufbar: ${(e as Error).message}`);
}

const index: IndexStatus[] = [];
if (inspect) {
  try {
    const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    type Insp = { inspectionResult?: { indexStatusResult?: { verdict?: string; coverageState?: string; lastCrawlTime?: string; googleCanonical?: string } } };
    for (const url of urls) {
      const r = await api<Insp>("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", { inspectionUrl: url, siteUrl: SC_SITE, languageCode: "de" });
      const s = r.inspectionResult?.indexStatusResult ?? {};
      index.push({ url, verdict: s.verdict ?? "–", coverage: s.coverageState ?? "–", lastCrawl: s.lastCrawlTime ?? null, googleCanonical: s.googleCanonical ?? null });
    }
  } catch (e) {
    warnings.push(`URL-Prüfung abgebrochen: ${(e as Error).message}`);
  }
}

const input = {
  generatedAt: new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }),
  site: SC_SITE,
  country: country === "all" ? "alle" : country.toUpperCase(),
  periods: data,
  sitemaps,
  index,
  warnings,
};

mkdirSync("reports", { recursive: true });
const mdFile = path.join("reports", "google-keywords.md");
const csvFile = path.join("reports", "google-keywords.csv");
writeFileSync(mdFile, renderMarkdown(input));
writeFileSync(csvFile, renderCsv(input));

for (const p of data) {
  console.log(`${String(p.days).padStart(3)} Tage (${p.start} – ${p.end}): ${p.total.impressions} Impr. · ${p.total.clicks} Klicks · ${p.queries.length} sichtbare Suchanfragen`);
}
if (index.length) console.log(`Indexiert: ${index.filter((i) => i.verdict === "PASS").length}/${index.length} Sitemap-URLs`);
for (const w of warnings) console.log(`⚠ ${w}`);
console.log(`→ ${mdFile}\n→ ${csvFile}`);
