import { business } from "@/config/business";
import { siteUrl } from "@/config/site";
import {
  footfalls,
  headcounts,
  inquiryTypes,
  labelOf,
  locationTypes,
  machineTypes,
  placements,
  powerOptions,
} from "@/lib/inquiry/options";
import type { InquiryData } from "@/lib/inquiry/schema";

/**
 * E-mail templates. Every user-provided value passes through `escapeHtml`
 * before it reaches HTML; plain-text versions are always included.
 * No remote images or tracking pixels.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strips anything that could break an e-mail header line. */
export function headerSafe(value: string, max = 150): string {
  return value.replace(/[\r\n\t\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export interface InquiryRecord {
  id: string;
  createdAt: Date;
  data: InquiryData;
}

const SOURCE: Record<InquiryData["form"], { label: string; path: string }> = {
  anfrage: { label: "Anfrageformular", path: "/anfrage" },
  standort: { label: "Formular „Standort anbieten“", path: "/standort-anbieten" },
  kontakt: { label: "Kontaktformular", path: "/kontakt" },
};

type Row = { label: string; value: string };
type Section = { title: string; rows: Row[] };

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    dateStyle: "full",
    timeStyle: "medium",
  }).format(date);
}

function contactRows(f: { name: string; company?: string; email: string; phone?: string }): Row[] {
  return [
    { label: "Name", value: f.name },
    { label: "Firma / Organisation", value: f.company || "–" },
    { label: "E-Mail", value: f.email },
    { label: "Telefon", value: f.phone || "–" },
  ];
}

export function buildSections(data: InquiryData): Section[] {
  switch (data.form) {
    case "anfrage": {
      const f = data.fields;
      return [
        { title: "Kontakt", rows: contactRows(f) },
        {
          title: "Anliegen",
          rows: [
            { label: "Anfrageart", value: labelOf(inquiryTypes, f.inquiryType) },
            { label: "Gewünschte Automatenlösung", value: labelOf(machineTypes, f.machineType) },
            { label: "Standorttyp", value: labelOf(locationTypes, f.locationType) || "–" },
            { label: "Mitarbeitende / Besucher", value: labelOf(headcounts, f.headcount) || "–" },
          ],
        },
        { title: "Standort", rows: [{ label: "PLZ / Ort", value: `${f.postalCode} ${f.city}` }] },
      ];
    }
    case "standort": {
      const f = data.fields;
      return [
        { title: "Kontakt", rows: contactRows(f) },
        {
          title: "Standort",
          rows: [
            { label: "Straße / Lage", value: f.street || "–" },
            { label: "PLZ / Ort", value: `${f.postalCode} ${f.city}` },
            { label: "Art des Standorts", value: labelOf(locationTypes, f.locationType) },
            { label: "Innen / Außen", value: labelOf(placements, f.placement) },
            { label: "Stromanschluss vorhanden", value: labelOf(powerOptions, f.power) },
            { label: "Geschätzte Frequenz", value: labelOf(footfalls, f.footfall) || "–" },
            { label: "Gewünschter Automatentyp", value: labelOf(machineTypes, f.machineType) || "–" },
          ],
        },
      ];
    }
    case "kontakt":
      return [{ title: "Kontakt", rows: contactRows(data.fields) }];
  }
}

function messageOf(data: InquiryData): string {
  return data.fields.message ?? "";
}

export function notificationSubject(record: InquiryRecord): string {
  const { data, id } = record;
  switch (data.form) {
    case "anfrage":
      return headerSafe(`Neue Anfrage: ${labelOf(inquiryTypes, data.fields.inquiryType)} · ${data.fields.postalCode} ${data.fields.city} [${id}]`);
    case "standort":
      return headerSafe(
        `Neuer Standortvorschlag: ${labelOf(locationTypes, data.fields.locationType)} · ${data.fields.postalCode} ${data.fields.city} [${id}]`
      );
    case "kontakt":
      return headerSafe(`Neue Kontaktanfrage von ${data.fields.name} [${id}]`);
  }
}

const C = {
  ink: "#0E1A14",
  forest: "#12382A",
  lime: "#C9F26B",
  cream: "#F5F1E6",
  paper: "#FBF9F3",
  line: "#D9D2C0",
  muted: "#55615A",
};

function layout(title: string, preheader: string, body: string): string {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.cream};font-family:Arial,Helvetica,sans-serif;color:${C.ink};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:${C.paper};border:1px solid ${C.line};border-radius:14px;overflow:hidden;">
<tr><td style="background:${C.forest};padding:20px 28px;">
<span style="display:inline-block;width:12px;height:12px;background:${C.lime};border-radius:3px;vertical-align:middle;"></span>
<span style="font-size:20px;font-weight:bold;color:${C.cream};letter-spacing:-0.3px;vertical-align:middle;margin-left:8px;">snackora</span>
</td></tr>
${body}
<tr><td style="padding:18px 28px;border-top:1px solid ${C.line};font-size:12px;line-height:18px;color:${C.muted};">
${escapeHtml(business.legalName)} · <a href="${siteUrl}" style="color:${C.forest};">${escapeHtml(business.domain)}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function sectionsHtml(sections: Section[]): string {
  return sections
    .map(
      (s) => `<tr><td style="padding:8px 28px 0;">
<p style="margin:16px 0 6px;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:${C.muted};font-family:'Courier New',monospace;">${escapeHtml(s.title)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.line};">
${s.rows
  .map(
    (r) => `<tr>
<td style="padding:9px 12px 9px 0;border-bottom:1px solid ${C.line};font-size:14px;color:${C.muted};width:42%;vertical-align:top;">${escapeHtml(r.label)}</td>
<td style="padding:9px 0;border-bottom:1px solid ${C.line};font-size:14px;color:${C.ink};vertical-align:top;">${escapeHtml(r.value)}</td>
</tr>`
  )
  .join("")}
</table>
</td></tr>`
    )
    .join("");
}

export function renderNotification(record: InquiryRecord): { subject: string; html: string; text: string } {
  const subject = notificationSubject(record);
  const source = SOURCE[record.data.form];
  const sections = buildSections(record.data);
  const message = messageOf(record.data);
  const when = formatTimestamp(record.createdAt);
  const replyName = record.data.fields.name;

  const html = layout(
    subject,
    `${source.label} · ${record.id}`,
    `<tr><td style="padding:28px 28px 4px;">
<p style="margin:0;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:${C.muted};font-family:'Courier New',monospace;">${escapeHtml(source.label)}</p>
<h1 style="margin:8px 0 0;font-size:24px;line-height:30px;color:${C.ink};">${escapeHtml(subject.replace(/ \[.*\]$/, ""))}</h1>
<p style="margin:10px 0 0;font-size:13px;color:${C.muted};">Vorgang <strong style="color:${C.ink};">${escapeHtml(record.id)}</strong> · ${escapeHtml(when)}</p>
</td></tr>
${sectionsHtml(sections)}
${
  message
    ? `<tr><td style="padding:8px 28px 0;">
<p style="margin:16px 0 6px;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:${C.muted};font-family:'Courier New',monospace;">Nachricht</p>
<div style="padding:14px 16px;background:${C.cream};border-radius:10px;font-size:14px;line-height:21px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(message)}</div>
</td></tr>`
    : ""
}
<tr><td style="padding:22px 28px 26px;font-size:13px;line-height:20px;color:${C.muted};">
Antworten Sie direkt auf diese E-Mail, um ${escapeHtml(replyName)} zu erreichen.<br>
Quelle: ${escapeHtml(siteUrl + source.path)}
</td></tr>`
  );

  const lines: string[] = [subject, "", `Quelle: ${source.label} (${siteUrl}${source.path})`, `Vorgang: ${record.id}`, `Eingang: ${when}`, ""];
  for (const s of sections) {
    lines.push(`— ${s.title} —`);
    for (const r of s.rows) lines.push(`${r.label}: ${r.value}`);
    lines.push("");
  }
  if (message) lines.push("— Nachricht —", message, "");
  lines.push(`Antworten Sie direkt auf diese E-Mail, um ${replyName} zu erreichen.`);

  return { subject, html, text: lines.join("\n") };
}

/**
 * Acknowledgment to the visitor. Intentionally does NOT echo the free-text
 * message, so the form cannot be abused to relay arbitrary content.
 */
export function renderAcknowledgment(record: InquiryRecord): { subject: string; html: string; text: string } {
  const name = record.data.fields.name;
  const subject = headerSafe(`Ihre Anfrage bei Snackora [${record.id}]`);
  const html = layout(
    subject,
    "Vielen Dank für Ihre Anfrage bei Snackora.",
    `<tr><td style="padding:28px 28px 8px;font-size:15px;line-height:24px;color:${C.ink};">
<p style="margin:0 0 14px;">Guten Tag ${escapeHtml(name)},</p>
<p style="margin:0 0 14px;">vielen Dank für Ihre Anfrage bei Snackora. Wir haben Ihre Nachricht erhalten und werden uns mit Ihrem Anliegen befassen.</p>
<p style="margin:0 0 14px;">Ihre Vorgangsnummer lautet <strong>${escapeHtml(record.id)}</strong>. Bitte geben Sie sie an, falls Sie uns zu dieser Anfrage noch etwas mitteilen möchten.</p>
<p style="margin:0 0 4px;">Freundliche Grüße</p>
<p style="margin:0;"><strong>${escapeHtml(business.owner)}</strong><br>${escapeHtml(business.brand)} – ${escapeHtml(business.slogan)}</p>
</td></tr>
<tr><td style="padding:16px 28px 24px;font-size:12px;line-height:18px;color:${C.muted};">
Diese E-Mail wurde automatisch versendet, weil über ${escapeHtml(business.domain)} eine Anfrage mit dieser Adresse gestellt wurde. Falls Sie das nicht waren, können Sie diese Nachricht ignorieren.
Hinweise zum Datenschutz: <a href="${siteUrl}/datenschutz" style="color:${C.forest};">${escapeHtml(siteUrl)}/datenschutz</a>
</td></tr>`
  );
  const text = [
    `Guten Tag ${name},`,
    "",
    "vielen Dank für Ihre Anfrage bei Snackora. Wir haben Ihre Nachricht erhalten und werden uns mit Ihrem Anliegen befassen.",
    "",
    `Ihre Vorgangsnummer lautet ${record.id}. Bitte geben Sie sie an, falls Sie uns zu dieser Anfrage noch etwas mitteilen möchten.`,
    "",
    "Freundliche Grüße",
    business.owner,
    `${business.brand} – ${business.slogan}`,
    "",
    "---",
    `Diese E-Mail wurde automatisch versendet, weil über ${business.domain} eine Anfrage mit dieser Adresse gestellt wurde. Falls Sie das nicht waren, können Sie diese Nachricht ignorieren.`,
    `Datenschutz: ${siteUrl}/datenschutz`,
    business.legalName,
  ].join("\n");
  return { subject, html, text };
}
