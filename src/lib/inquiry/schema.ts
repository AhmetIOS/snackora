import { z } from "zod";
import { footfalls, headcounts, inquiryTypes, locationTypes, machineTypes, placements, powerOptions, values } from "./options";

/**
 * Validation schemas shared by the browser (React Hook Form) and the server
 * (route handler). The server always re-validates – client validation is a
 * convenience, never a security boundary.
 */

export const LIMITS = {
  name: 80,
  company: 120,
  email: 254,
  phone: 30,
  street: 120,
  city: 80,
  message: 3000,
  maxLinks: 3,
} as const;

const URL_RE = /(https?:\/\/|www\.)\S+/gi;
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function countLinks(text: string): number {
  return (text.match(URL_RE) ?? []).length;
}

/** Single-line text: trimmed, no line breaks or control chars (safe for e-mail subjects). */
const singleLine = (max: number) =>
  z
    .string({ error: "Bitte ausfüllen." })
    .trim()
    .max(max, { error: `Bitte höchstens ${max} Zeichen.` })
    .refine((v) => !/[\r\n]/.test(v) && !CONTROL_RE.test(v), { error: "Bitte ohne Zeilenumbrüche oder Sonderzeichen." });

const name = singleLine(LIMITS.name)
  .min(2, { error: "Bitte geben Sie Ihren Namen an." })
  .refine((v) => countLinks(v) === 0, { error: "Bitte geben Sie hier nur Ihren Namen an." });

const optionalLine = (max: number) => singleLine(max).optional().default("");

const email = z
  .string({ error: "Bitte geben Sie Ihre E-Mail-Adresse an." })
  .trim()
  .min(1, { error: "Bitte geben Sie Ihre E-Mail-Adresse an." })
  .max(LIMITS.email, { error: "Diese E-Mail-Adresse ist zu lang." })
  .pipe(z.email({ error: "Bitte geben Sie eine gültige E-Mail-Adresse an, z. B. name@firma.de." }));

const phone = z
  .string()
  .trim()
  .max(LIMITS.phone, { error: "Bitte höchstens 30 Zeichen." })
  .refine((v) => v === "" || (/^[+()\d\s/.-]+$/.test(v) && (v.match(/\d/g) ?? []).length >= 6), {
    error: "Bitte geben Sie eine gültige Telefonnummer an, z. B. 0711 123456.",
  })
  .optional()
  .default("");

const postalCode = z
  .string({ error: "Bitte geben Sie die Postleitzahl an." })
  .trim()
  .regex(/^\d{5}$/, { error: "Bitte geben Sie eine fünfstellige Postleitzahl an." });

const city = singleLine(LIMITS.city).min(2, { error: "Bitte geben Sie den Ort an." });

const message = (required: boolean, min = 10) =>
  z
    .string()
    .trim()
    .max(LIMITS.message, { error: `Bitte höchstens ${LIMITS.message} Zeichen.` })
    .refine((v) => !CONTROL_RE.test(v.replace(/[\t]/g, "")), { error: "Die Nachricht enthält ungültige Zeichen." })
    .refine((v) => (required ? v.length >= min : v.length === 0 || v.length >= 3), {
      error: required ? `Bitte schreiben Sie uns ein paar Worte (mindestens ${min} Zeichen).` : "Bitte etwas ausführlicher oder leer lassen.",
    })
    .refine((v) => countLinks(v) <= LIMITS.maxLinks, { error: "Bitte verwenden Sie höchstens drei Links." });

const privacy = z.literal(true, { error: "Bitte bestätigen Sie, dass Sie die Datenschutzhinweise gelesen haben." });

const requiredChoice = <T extends readonly { value: string; label: string }[]>(opts: T, msg: string) =>
  z.enum(values(opts), { error: msg });

const optionalChoice = <T extends readonly { value: string; label: string }[]>(opts: T) =>
  z.union([z.enum(values(opts)), z.literal("")]).optional().default("");

export const anfrageSchema = z.object({
  inquiryType: requiredChoice(inquiryTypes, "Bitte wählen Sie die Art Ihrer Anfrage."),
  name,
  company: optionalLine(LIMITS.company),
  email,
  phone,
  postalCode,
  city,
  machineType: requiredChoice(machineTypes, "Bitte wählen Sie eine Automatenlösung oder „Noch offen“."),
  locationType: optionalChoice(locationTypes),
  headcount: optionalChoice(headcounts),
  message: message(true, 20),
  privacy,
});

export const standortSchema = z.object({
  name,
  company: optionalLine(LIMITS.company),
  email,
  phone,
  street: optionalLine(LIMITS.street),
  postalCode,
  city,
  locationType: requiredChoice(locationTypes, "Bitte wählen Sie die Art des Standorts."),
  footfall: optionalChoice(footfalls),
  placement: requiredChoice(placements, "Bitte wählen Sie, ob der Platz innen oder außen liegt."),
  power: requiredChoice(powerOptions, "Bitte wählen Sie eine Option."),
  machineType: optionalChoice(machineTypes),
  message: message(false),
  privacy,
});

export const kontaktSchema = z.object({
  name,
  company: optionalLine(LIMITS.company),
  email,
  phone,
  message: message(true, 10),
  privacy,
});

export const formSchemas = {
  anfrage: anfrageSchema,
  standort: standortSchema,
  kontakt: kontaktSchema,
} as const;

export type FormKind = keyof typeof formSchemas;
export type AnfrageInput = z.input<typeof anfrageSchema>;
export type AnfrageData = z.output<typeof anfrageSchema>;
export type StandortData = z.output<typeof standortSchema>;
export type KontaktData = z.output<typeof kontaktSchema>;

export type InquiryData =
  | { form: "anfrage"; fields: AnfrageData }
  | { form: "standort"; fields: StandortData }
  | { form: "kontakt"; fields: KontaktData };

/** Envelope sent by the browser. `fields` is validated per form kind. */
export const envelopeSchema = z.object({
  form: z.enum(["anfrage", "standort", "kontakt"]),
  fields: z.record(z.string(), z.unknown()),
  meta: z.object({
    submissionId: z.uuid(),
    startedAt: z.number().int().nonnegative(),
    // Honeypot – must stay empty. Real users never see this field.
    website: z.string().max(500).optional().default(""),
  }),
});

export type Envelope = z.infer<typeof envelopeSchema>;

/** API response contract between route handler and form UI. */
export type ApiResponse =
  | { ok: true; inquiryId: string }
  | {
      ok: false;
      error: "bad_request" | "validation" | "too_fast" | "rate_limited" | "unavailable" | "delivery_failed" | "server_error" | "forbidden" | "too_large";
      message: string;
      fieldErrors?: Record<string, string>;
    };
