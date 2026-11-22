/**
 * Creates the "markttest-1" Search campaign – always PAUSED. Going live is a separate,
 * explicit step (`npm run ads:status -- enable markttest-1`).
 *
 *   npm run ads:create-markttest            # dry run (validateOnly) – nothing is created
 *   npm run ads:create-markttest -- --apply # creates the paused campaign
 *
 * Spec: GOOGLE_ADS_PLAN.md §9.
 */
import { CUSTOMER_ID, micros, mutate, search } from "./client.mts";

const apply = process.argv.includes("--apply");
const C = `customers/${CUSTOMER_ID}`;

const CAMPAIGN = "markttest-1";
// Daily budget 7 € (user decision 2026-11-21). Campaign stops automatically at END.
// 7 days (Mo–So, 07–19) × 7 € ≈ 49 € net (Google may overdeliver up to 2× on single days).
const DAILY_BUDGET_EUR = 7;
const START = "2026-11-21 00:00:00"; // Sa (Nutzerwunsch: ab heute)
const END = "2026-11-27 23:59:59"; // Fr → 7 Kalendertage
const FINAL_URL_SUFFIX = "utm_source=google&utm_medium=cpc&utm_campaign=markttest-1";
const GEO = [
  "geoTargetConstants/1004054", // Stuttgart (Stadt)
  "geoTargetConstants/9114538", // Landkreis Esslingen
  "geoTargetConstants/9114504", // Rems-Murr-Kreis (Waiblingen, Backnang, Schorndorf …)
];
const LANGUAGE_DE = "languageConstants/1001";
const WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

type Kw = { text: string; match: "PHRASE" | "EXACT" };
const AD_GROUPS: { name: string; cpc: number; url: string; path1: string; path2: string; keywords: Kw[] }[] = [
  {
    name: "Aufsteller",
    cpc: 0.5,
    url: "https://snackora.de/fuer-unternehmen",
    path1: "Automaten",
    path2: "Unternehmen",
    keywords: [
      { text: "automatenaufsteller", match: "PHRASE" },
      { text: "automatenaufsteller stuttgart", match: "EXACT" },
      { text: "automatenaufsteller esslingen", match: "EXACT" },
      { text: "automatenaufsteller waiblingen", match: "EXACT" },
      { text: "automaten aufstellen lassen", match: "PHRASE" },
      { text: "snackautomat aufstellen lassen", match: "PHRASE" },
      { text: "getränkeautomat aufstellen lassen", match: "PHRASE" },
    ],
  },
  {
    name: "Firma-Mieten",
    cpc: 0.5,
    url: "https://snackora.de/automaten",
    path1: "Automaten",
    path2: "Firmen",
    keywords: [
      { text: "snackautomat mieten", match: "PHRASE" },
      { text: "getränkeautomat mieten", match: "PHRASE" },
      { text: "snackautomat für firmen", match: "EXACT" },
      { text: "snackautomat firma", match: "EXACT" },
      { text: "getränkeautomat firma", match: "EXACT" },
      { text: "getränkeautomat büro", match: "EXACT" },
      { text: "snackautomat büro", match: "EXACT" },
    ],
  },
];

// Single words → broad negative (blocks any query containing the word); multi-word → phrase.
const NEGATIVES = `kaufen, gebraucht, ebay, kleinanzeigen, selber, selbst bauen, diy,
reparatur, ersatzteile, münzprüfer, schlüssel, aufbrechen, defekt, bedienungsanleitung,
job, jobs, stellenangebot, ausbildung, gehalt, fahrer, minijob,
franchise, nebenberuflich, passives einkommen, geschäftsidee, werden, selbstständig,
verdienst, lohnt sich, erfahrungen, gewerbe anmelden, business,
zigarettenautomat, kondomautomat, pfandautomat, fahrkartenautomat, geldautomat,
spielautomat, casino, glücksspiel, kaugummiautomat, kapselautomat,
miniatur, spielzeug, lego, kinder, privat, zuhause, mini,
party, hochzeit, geburtstag, event, feier, festival, wochenende,
hersteller, großhandel, hack, trick`
  .split(/[,\n]/)
  .map((s) => s.trim())
  .filter(Boolean);

const HEADLINES = [
  "Automatenaufsteller Stuttgart",
  "Snackautomat für Ihre Firma",
  "Getränkeautomat für Betriebe",
  "Region Esslingen & Waiblingen",
  "Jetzt unverbindlich anfragen",
  "Inhabergeführt & regional",
  "Für Büro, Produktion & Lager",
  "Sortiment individuell geplant",
  "Snackora – Deine Pause",
];
const DESCRIPTIONS = [
  "Snack- & Getränkeautomaten für Unternehmen in Stuttgart, Esslingen und Waiblingen.",
  "Standort und Sortiment stimmen wir persönlich mit Ihnen ab. Jetzt unverbindlich anfragen.",
  "Für Büros, Produktion, Werkstätten und Fitnessstudios. Inhabergeführt und regional.",
];

for (const h of HEADLINES) if ([...h].length > 30) throw new Error(`Headline > 30: ${h}`);
for (const d of DESCRIPTIONS) if ([...d].length > 90) throw new Error(`Description > 90: ${d}`);

const existing = await search(`SELECT campaign.id, campaign.status FROM campaign WHERE campaign.name = '${CAMPAIGN}' AND campaign.status != 'REMOVED'`);
if (existing.length) {
  console.error(`✖ Kampagne "${CAMPAIGN}" existiert bereits (${JSON.stringify(existing[0])}). Abbruch.`);
  process.exit(1);
}

const budget = `${C}/campaignBudgets/-1`;
const campaign = `${C}/campaigns/-2`;
const ops: unknown[] = [];

ops.push({
  campaignBudgetOperation: {
    create: { resourceName: budget, name: `${CAMPAIGN} daily ${DAILY_BUDGET_EUR}`, period: "DAILY", amountMicros: micros(DAILY_BUDGET_EUR), deliveryMethod: "STANDARD", explicitlyShared: false },
  },
});
ops.push({
  campaignOperation: {
    create: {
      resourceName: campaign,
      name: CAMPAIGN,
      status: "PAUSED",
      advertisingChannelType: "SEARCH",
      campaignBudget: budget,
      startDateTime: START,
      endDateTime: END,
      manualCpc: {},
      networkSettings: { targetGoogleSearch: true, targetSearchNetwork: false, targetContentNetwork: false, targetPartnerSearchNetwork: false },
      geoTargetTypeSetting: { positiveGeoTargetType: "PRESENCE", negativeGeoTargetType: "PRESENCE" },
      finalUrlSuffix: FINAL_URL_SUFFIX,
      containsEuPoliticalAdvertising: "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
    },
  },
});

const crit = (c: Record<string, unknown>) => ({ campaignCriterionOperation: { create: { campaign, ...c } } });
ops.push(crit({ language: { languageConstant: LANGUAGE_DE } }));
for (const g of GEO) ops.push(crit({ location: { geoTargetConstant: g } }));
for (const day of WEEKDAYS) ops.push(crit({ adSchedule: { dayOfWeek: day, startHour: 7, startMinute: "ZERO", endHour: 19, endMinute: "ZERO" } }));
for (const n of NEGATIVES) ops.push(crit({ negative: true, keyword: { text: n, matchType: n.includes(" ") ? "PHRASE" : "BROAD" } }));

AD_GROUPS.forEach((g, i) => {
  const adGroup = `${C}/adGroups/-${10 + i}`;
  ops.push({
    adGroupOperation: { create: { resourceName: adGroup, name: g.name, campaign, status: "ENABLED", type: "SEARCH_STANDARD", cpcBidMicros: micros(g.cpc) } },
  });
  for (const k of g.keywords) {
    ops.push({ adGroupCriterionOperation: { create: { adGroup, status: "ENABLED", keyword: { text: k.text, matchType: k.match } } } });
  }
  ops.push({
    adGroupAdOperation: {
      create: {
        adGroup,
        status: "ENABLED",
        ad: {
          finalUrls: [g.url],
          responsiveSearchAd: {
            headlines: HEADLINES.map((text) => ({ text })),
            descriptions: DESCRIPTIONS.map((text) => ({ text })),
            path1: g.path1,
            path2: g.path2,
          },
        },
      },
    },
  });
});

console.log(`${apply ? "▶ Erstelle" : "◇ Prüfe (validateOnly)"}: ${ops.length} Operationen – Kampagne "${CAMPAIGN}" (PAUSED), ${DAILY_BUDGET_EUR} €/Tag (${START.slice(0, 10)} – ${END.slice(0, 10)}), ` +
  `${AD_GROUPS.reduce((n, g) => n + g.keywords.length, 0)} Keywords, ${NEGATIVES.length} Negative, ${GEO.length} Orte.`);
const res = await mutate(ops, !apply);
console.log(apply ? `✔ Erstellt (${res.mutateOperationResponses?.length ?? 0} Antworten). Status: PAUSIERT.` : "✔ Validierung ok – nichts erstellt.");
