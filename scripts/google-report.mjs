#!/usr/bin/env node
/**
 * Snackora – Google report (Search Console + GA4 + technical SEO).
 *
 *   npm run report:google            # last 28 days, Markdown to stdout + reports/
 *   npm run report:google -- --days 7
 *
 * Auth: keyless. A short-lived token is minted via `gcloud` by impersonating
 * the integration service account (requires `gcloud auth login` as a user with
 * roles/iam.serviceAccountTokenCreator on it). No credentials are stored or
 * printed. See GOOGLE_INTEGRATION_NOTES.md.
 *
 * Note: Search Console data lags ~2–3 days, GA4 standard reports up to ~24–48 h.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const SA = "snackora-integrations@snackora-web-integrations.iam.gserviceaccount.com";
const SC_SITE = "sc-domain:snackora.de";
const SITE = "https://snackora.de";
const SCOPES = ["webmasters.readonly", "analytics.readonly"].map((s) => `https://www.googleapis.com/auth/${s}`).join(",");
const LEAD_EVENTS = ["generate_lead", "standortanfrage_submit", "kontakt_submit", "click_email", "click_phone"];

const args = process.argv.slice(2);
const days = Number(args[args.indexOf("--days") + 1]) || 28;

function gcloudBin() {
  const local = path.join(homedir(), ".local/share/google-cloud-sdk/bin/gcloud");
  return existsSync(local) ? local : "gcloud";
}

function token() {
  try {
    return execFileSync(gcloudBin(), ["auth", "print-access-token", `--impersonate-service-account=${SA}`, `--scopes=${SCOPES}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    console.error("✖ Kein Token. Bitte `gcloud auth login` (info@snackora.de) ausführen.");
    process.exit(1);
  }
}

const T = token();
async function api(url, body) {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${T}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${json.error?.message ?? ""}`.trim());
  return json;
}

const iso = (d) => d.toISOString().slice(0, 10);
const end = new Date(Date.now() - 2 * 864e5); // SC data is ~2 days behind
const start = new Date(end.getTime() - (days - 1) * 864e5);
const pct = (n) => `${(n * 100).toFixed(1)} %`;
const table = (head, rows) =>
  rows.length ? [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n") : "_keine Daten_";

const out = [`# Snackora – Google-Bericht`, ``, `Zeitraum: ${iso(start)} – ${iso(end)} (${days} Tage) · erstellt ${new Date().toLocaleString("de-DE")}`, ``];

/* ── Search Console ── */
out.push(`## Search Console`);
try {
  const sc = (body) => api(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SC_SITE)}/searchAnalytics/query`, { startDate: iso(start), endDate: iso(end), ...body });
  const [total, queries, pages] = await Promise.all([sc({}), sc({ dimensions: ["query"], rowLimit: 15 }), sc({ dimensions: ["page"], rowLimit: 15 })]);
  const t = total.rows?.[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  out.push(`Klicks **${t.clicks}** · Impressionen **${t.impressions}** · CTR **${pct(t.ctr)}** · Ø Position **${t.position ? t.position.toFixed(1) : "–"}**`, ``);
  out.push(`### Top-Suchanfragen`, table(["Suchanfrage", "Klicks", "Impr.", "CTR", "Pos."], (queries.rows ?? []).map((r) => [r.keys[0], r.clicks, r.impressions, pct(r.ctr), r.position.toFixed(1)])), ``);
  out.push(`### Top-Seiten`, table(["Seite", "Klicks", "Impr.", "Pos."], (pages.rows ?? []).map((r) => [r.keys[0].replace(SITE, "") || "/", r.clicks, r.impressions, r.position.toFixed(1)])), ``);
  const sm = await api(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SC_SITE)}/sitemaps`);
  out.push(`### Sitemaps`, table(["Sitemap", "zuletzt gelesen", "Fehler", "Warnungen"], (sm.sitemap ?? []).map((s) => [s.path, s.lastDownloaded ?? "ausstehend", s.errors, s.warnings])), ``);
} catch (e) {
  out.push(`⚠ Search Console nicht abrufbar: ${e.message}`, ``);
}

/* ── GA4 ── */
out.push(`## Google Analytics 4`);
try {
  const summaries = await api("https://analyticsadmin.googleapis.com/v1beta/accountSummaries");
  const prop = summaries.accountSummaries?.flatMap((a) => a.propertySummaries ?? []).find((p) => /snackora/i.test(p.displayName)) ?? null;
  if (!prop) throw new Error("keine GA4-Property für den Servicekonto-Zugriff gefunden");
  const run = (body) => api(`https://analyticsdata.googleapis.com/v1beta/${prop.property}:runReport`, { dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }], ...body });
  const [totals, sources, pagesR, events] = await Promise.all([
    run({ metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "screenPageViews" }] }),
    run({ dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }] }),
    run({ dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 15 }),
    run({ dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: LEAD_EVENTS } } } }),
  ]);
  const v = totals.rows?.[0]?.metricValues?.map((m) => m.value) ?? ["0", "0", "0"];
  out.push(`Property: ${prop.displayName} (${prop.property})`, ``, `Nutzer **${v[0]}** · Sitzungen **${v[1]}** · Seitenaufrufe **${v[2]}**`, ``);
  out.push(`_Hinweis: nur Besucher mit Einwilligung werden gemessen._`, ``);
  out.push(`### Traffic-Quellen`, table(["Kanal", "Sitzungen"], (sources.rows ?? []).map((r) => [r.dimensionValues[0].value, r.metricValues[0].value])), ``);
  out.push(`### Top-Seiten`, table(["Seite", "Aufrufe"], (pagesR.rows ?? []).map((r) => [r.dimensionValues[0].value, r.metricValues[0].value])), ``);
  const ev = Object.fromEntries((events.rows ?? []).map((r) => [r.dimensionValues[0].value, r.metricValues[0].value]));
  out.push(`### Leads & Kontakte`, table(["Event", "Anzahl"], LEAD_EVENTS.map((e) => [e, ev[e] ?? "0"])), ``);
} catch (e) {
  out.push(`⚠ GA4 nicht abrufbar: ${e.message}`, ``);
}

/* ── Technical SEO ── */
out.push(`## Technisches SEO`);
try {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const rows = [];
  for (const u of urls) {
    const res = await fetch(u, { redirect: "manual" });
    const html = res.status === 200 ? await res.text() : "";
    const issues = [];
    if (res.status !== 200) issues.push(`HTTP ${res.status}`);
    if (html && !/<title>[^<]+<\/title>/.test(html)) issues.push("Title fehlt");
    if (html && !/<meta name="description" content="[^"]+"/.test(html)) issues.push("Description fehlt");
    if (html && (html.match(/<h1[\s>]/g) ?? []).length !== 1) issues.push("H1-Anzahl ≠ 1");
    if (html && !/<link rel="canonical"/.test(html)) issues.push("Canonical fehlt");
    if (/noindex/.test(html)) issues.push("noindex");
    if (issues.length) rows.push([u.replace(SITE, "") || "/", issues.join(", ")]);
  }
  out.push(`${urls.length} URLs in der Sitemap geprüft.`, ``, rows.length ? table(["Seite", "Problem"], rows) : "✔ Keine Probleme gefunden.", ``);
} catch (e) {
  out.push(`⚠ Prüfung fehlgeschlagen: ${e.message}`, ``);
}

const md = out.join("\n");
console.log(md);
mkdirSync("reports", { recursive: true });
const file = path.join("reports", `google-${iso(new Date())}.md`);
writeFileSync(file, md);
console.error(`\n→ gespeichert: ${file}`);
