/**
 * Snackora – Google Ads günlük raporu (salt okuma).
 *
 *   npm run report:ads                      # markttest-1, başlangıçtan bugüne
 *   npm run report:ads -- --campaign NAME   # başka kampanya
 *   npm run report:ads -- --no-open         # tarayıcıyı açma
 *
 * Yazar: reports/ads-YYYY-MM-DD.md (git-ignored) ve konsola kısa özet.
 * Sadece okuma (GAQL search) yapar, hiçbir şeyi değiştirmez.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { eur, search, type Row } from "./client.mts";

const args = process.argv.slice(2);
const NAME = args.includes("--campaign") ? args[args.indexOf("--campaign") + 1] : "markttest-1";
const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date());

const pct = (v: number | undefined) => (v == null ? "–" : `${(v * 100).toFixed(1).replace(".", ",")} %`);
const num = (v: unknown) => Number(v ?? 0);
const table = (head: string[], rows: (string | number)[][]) =>
  rows.length ? [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n") : "_veri yok_";
const esc = (s: string) => s.replace(/'/g, "\\'");

const [c] = await search(
  `SELECT campaign.id, campaign.name, campaign.status, campaign.primary_status, campaign.primary_status_reasons, campaign.start_date_time, campaign.end_date_time, campaign_budget.amount_micros FROM campaign WHERE campaign.name = '${esc(NAME)}' AND campaign.status != 'REMOVED'`,
);
if (!c) {
  console.error(`✖ Kampanya "${NAME}" bulunamadı.`);
  process.exit(1);
}
const id = c.campaign.id;
const start = c.campaign.startDateTime.slice(0, 10);
const from = start <= today ? start : today;
const range = `segments.date BETWEEN '${from}' AND '${today}'`;
const M = "metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.average_cpc, metrics.ctr";

const [total] = await search(
  `SELECT ${M}, metrics.search_impression_share, metrics.search_rank_lost_impression_share, metrics.search_budget_lost_impression_share FROM campaign WHERE campaign.id = ${id} AND ${range}`,
);
const days = await search(`SELECT segments.date, ${M} FROM campaign WHERE campaign.id = ${id} AND ${range} ORDER BY segments.date`);
const kws = await search(
  `SELECT ad_group.name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status, ad_group_criterion.system_serving_status, ad_group_criterion.effective_cpc_bid_micros, ad_group_criterion.position_estimates.first_page_cpc_micros, ad_group_criterion.position_estimates.top_of_page_cpc_micros, ad_group_criterion.quality_info.quality_score, ${M}, metrics.search_impression_share, metrics.search_rank_lost_impression_share FROM keyword_view WHERE campaign.id = ${id} AND ${range}`,
);
// keyword_view with a date range omits keywords without any row – fetch the full list too.
const allKws = await search(
  `SELECT ad_group.name, ad_group_criterion.criterion_id, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.status, ad_group_criterion.system_serving_status, ad_group_criterion.effective_cpc_bid_micros, ad_group_criterion.position_estimates.first_page_cpc_micros, ad_group_criterion.position_estimates.top_of_page_cpc_micros, ad_group_criterion.quality_info.quality_score FROM ad_group_criterion WHERE campaign.id = ${id} AND ad_group_criterion.type = 'KEYWORD' AND ad_group_criterion.negative = FALSE AND ad_group_criterion.status != 'REMOVED'`,
);
const terms = await search(
  `SELECT search_term_view.search_term, search_term_view.status, segments.keyword.info.text, ${M} FROM search_term_view WHERE campaign.id = ${id} AND ${range} ORDER BY metrics.impressions DESC`,
);
const geo = await search(`SELECT segments.geo_target_city, ${M} FROM geographic_view WHERE campaign.id = ${id} AND ${range}`).catch(() => []);
const ads = await search(
  `SELECT ad_group.name, ad_group_ad.status, ad_group_ad.policy_summary.review_status, ad_group_ad.policy_summary.approval_status, ad_group_ad.policy_summary.policy_topic_entries, ad_group_ad.ad_strength FROM ad_group_ad WHERE campaign.id = ${id} AND ad_group_ad.status != 'REMOVED'`,
);

// City names for geo rows.
const cityIds = [...new Set(geo.map((g) => g.segments?.geoTargetCity).filter(Boolean))] as string[];
const cityNames = new Map<string, string>();
if (cityIds.length) {
  for (const r of await search(`SELECT geo_target_constant.resource_name, geo_target_constant.name FROM geo_target_constant WHERE geo_target_constant.resource_name IN (${cityIds.map((x) => `'${x}'`).join(",")})`)) {
    cityNames.set(r.geoTargetConstant.resourceName, r.geoTargetConstant.name);
  }
}

const kwMetrics = new Map(kws.map((k) => [`${k.adGroup.name}|${k.adGroupCriterion.keyword.text}|${k.adGroupCriterion.keyword.matchType}`, k]));
const hint = (k: Row, m: Row | undefined): string => {
  const s = k.adGroupCriterion.systemServingStatus;
  if (s === "RARELY_SERVED") return "düşük arama hacmi – teklif artırma işe yaramaz";
  const rankLost = m?.metrics?.searchRankLostImpressionShare;
  const firstPage = num(k.adGroupCriterion.positionEstimates?.firstPageCpcMicros);
  const bid = num(k.adGroupCriterion.effectiveCpcBidMicros);
  if (firstPage && bid < firstPage) return `teklif ilk sayfa tahmininin altında (${eur(firstPage)})`;
  if (rankLost != null && rankLost > 0.5) return "teklif/kalite yüzünden gösterim kaybı yüksek";
  if (num(m?.metrics?.clicks) > 0 && num(m?.metrics?.averageCpc) < bid * 0.6) return "ödenen fiyat düşük – teklif düşürülebilir";
  return "";
};

const cost = num(total?.metrics?.costMicros);
const budget = num(c.campaignBudget.amountMicros);
const md = [
  `# Google Ads raporu – ${NAME}`,
  ``,
  `Oluşturuldu: ${today} · Dönem: ${from} – ${today} · Kampanya: ${c.campaign.startDateTime.slice(0, 10)} – ${c.campaign.endDateTime?.slice(0, 10) ?? "açık"}`,
  ``,
  `## Özet`,
  ``,
  table(
    ["Durum", "Bütçe/gün", "Gösterim", "Tıklama", "TO", "Ø TBM", "Maliyet (net)", "Gösterim payı", "Kayıp (sıralama)", "Kayıp (bütçe)"],
    [[
      `${c.campaign.status} / ${c.campaign.primaryStatus}`,
      eur(budget),
      num(total?.metrics?.impressions),
      num(total?.metrics?.clicks),
      pct(total?.metrics?.ctr),
      eur(total?.metrics?.averageCpc),
      eur(cost),
      pct(total?.metrics?.searchImpressionShare),
      pct(total?.metrics?.searchRankLostImpressionShare),
      pct(total?.metrics?.searchBudgetLostImpressionShare),
    ]],
  ),
  ``,
  `MwSt dahil tahmini kart çekimi: **${eur(cost * 1.19)}**`,
  ``,
  `## Günlük`,
  ``,
  table(["Gün", "Gösterim", "Tıklama", "Ø TBM", "Maliyet"], days.map((d) => [d.segments.date, num(d.metrics.impressions), num(d.metrics.clicks), eur(d.metrics.averageCpc), eur(d.metrics.costMicros)])),
  ``,
  `## Anahtar kelimeler`,
  ``,
  table(
    ["Grup", "Kelime", "Eşleme", "Durum", "Teklif", "İlk sayfa tahmini", "Sayfa üstü tahmini", "KP", "Gösterim", "Tıklama", "Ø TBM", "Kayıp (sıralama)", "Not"],
    allKws.map((k) => {
      const m = kwMetrics.get(`${k.adGroup.name}|${k.adGroupCriterion.keyword.text}|${k.adGroupCriterion.keyword.matchType}`);
      return [
        k.adGroup.name,
        k.adGroupCriterion.keyword.text,
        k.adGroupCriterion.keyword.matchType,
        k.adGroupCriterion.systemServingStatus ?? k.adGroupCriterion.status,
        eur(k.adGroupCriterion.effectiveCpcBidMicros),
        eur(k.adGroupCriterion.positionEstimates?.firstPageCpcMicros),
        eur(k.adGroupCriterion.positionEstimates?.topOfPageCpcMicros),
        k.adGroupCriterion.qualityInfo?.qualityScore ?? "–",
        num(m?.metrics?.impressions),
        num(m?.metrics?.clicks),
        eur(m?.metrics?.averageCpc),
        pct(m?.metrics?.searchRankLostImpressionShare),
        hint(k, m),
      ];
    }),
  ),
  ``,
  `## Arama terimleri (insanların gerçekten aradığı)`,
  ``,
  table(
    ["Arama terimi", "Eşleşen kelime", "Gösterim", "Tıklama", "Maliyet", "Durum"],
    terms.map((t) => [t.searchTermView.searchTerm, t.segments?.keyword?.info?.text ?? "–", num(t.metrics.impressions), num(t.metrics.clicks), eur(t.metrics.costMicros), t.searchTermView.status]),
  ),
  ``,
  `## Şehirler`,
  ``,
  table(["Şehir", "Gösterim", "Tıklama", "Maliyet"], geo.map((g) => [cityNames.get(g.segments?.geoTargetCity) ?? g.segments?.geoTargetCity ?? "–", num(g.metrics.impressions), num(g.metrics.clicks), eur(g.metrics.costMicros)])),
  ``,
  `## Reklamlar`,
  ``,
  table(
    ["Grup", "Durum", "İnceleme", "Onay", "Güç", "Politika"],
    ads.map((a) => [
      a.adGroup.name,
      a.adGroupAd.status,
      a.adGroupAd.policySummary?.reviewStatus ?? "–",
      a.adGroupAd.policySummary?.approvalStatus ?? "–",
      a.adGroupAd.adStrength ?? "–",
      (a.adGroupAd.policySummary?.policyTopicEntries ?? []).map((p: { topic: string }) => p.topic).join(", ") || "–",
    ]),
  ),
  ``,
  `> Formlar/talepler Google Ads'te değil: GA4 / /admin (kaynak google / cpc, kampanya markttest-1) ve gelen e-postalar.`,
].join("\n");

mkdirSync("reports", { recursive: true });
const file = `reports/ads-${today}.md`;
writeFileSync(file, md + "\n");

// Same report as a local web page (reports/ads-latest.html), opened in the browser unless --no-open.
const h = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s: string) => h(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/_(.+?)_/g, "<em>$1</em>");
const cells = (l: string) => l.slice(1, -1).split(" | ").map((x) => x.trim());
const body: string[] = [];
const lines = md.split("\n");
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.startsWith("# ")) body.push(`<h1>${inline(l.slice(2))}</h1>`);
  else if (l.startsWith("## ")) body.push(`<h2>${inline(l.slice(3))}</h2>`);
  else if (l.startsWith("> ")) body.push(`<p class="note">${inline(l.slice(2))}</p>`);
  else if (l.startsWith("| ")) {
    const head = cells(l);
    const rows: string[][] = [];
    i += 2; // skip separator
    while (i < lines.length && lines[i].startsWith("| ")) rows.push(cells(lines[i++]));
    i--;
    body.push(
      `<div class="scroll"><table><thead><tr>${head.map((x) => `<th>${inline(x)}</th>`).join("")}</tr></thead><tbody>${rows
        .map((r) => `<tr>${r.map((x) => `<td>${inline(x)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table></div>`,
    );
  } else if (l.trim()) body.push(`<p>${inline(l)}</p>`);
}
const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ads – ${h(NAME)} – ${today}</title><style>
:root{--bg:#f7f6f2;--fg:#1d2b24;--muted:#5f6b64;--line:#dcdcd2;--card:#fff;--accent:#2f5d46}
@media (prefers-color-scheme:dark){:root{--bg:#131815;--fg:#e8ece9;--muted:#9aa59f;--line:#2b332e;--card:#1a201c;--accent:#8fc4a6}}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,sans-serif}
main{max-width:1200px;margin:0 auto;padding:24px 16px 64px}
h1{font-size:24px;margin:0 0 4px}h2{font-size:17px;margin:32px 0 8px;color:var(--accent)}
p{margin:6px 0;color:var(--muted)}p strong{color:var(--fg)}.note{border-left:3px solid var(--accent);padding-left:10px}
.scroll{overflow-x:auto;background:var(--card);border:1px solid var(--line);border-radius:10px}
table{border-collapse:collapse;width:100%;font-size:13.5px;font-variant-numeric:tabular-nums}
th,td{padding:7px 10px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}
th{font-weight:600;color:var(--muted);background:var(--bg)}tr:last-child td{border-bottom:0}
</style></head><body><main>${body.join("\n")}<p>Yenilemek için: <code>npm run report:ads</code></p></main></body></html>`;
const htmlFile = path.resolve("reports/ads-latest.html");
writeFileSync(htmlFile, html);

console.log(`${NAME}: ${c.campaign.status}/${c.campaign.primaryStatus} · ${from}–${today}`);
console.log(`  Gösterim ${num(total?.metrics?.impressions)} · Tıklama ${num(total?.metrics?.clicks)} · Ø TBM ${eur(total?.metrics?.averageCpc)} · Maliyet ${eur(cost)} (MwSt ile ≈ ${eur(cost * 1.19)})`);
console.log(`  Arama terimi: ${terms.length} · Reklamlar: ${ads.map((a) => `${a.adGroup.name}=${a.adGroupAd.policySummary?.approvalStatus ?? "?"}`).join(", ")}`);
console.log(`✔ ${file}`);
console.log(`✔ ${pathToFileURL(htmlFile).href}`);
if (!args.includes("--no-open") && process.platform === "darwin") execFileSync("open", [htmlFile]);
