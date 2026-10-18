/**
 * Select / radio options for the inquiry forms. Values are stable keys sent
 * to the server; labels are what the user sees and what appears in e-mails.
 */

export const inquiryTypes = [
  { value: "unternehmen", label: "Automat für Unternehmen" },
  { value: "standort", label: "Standort anbieten" },
  { value: "kooperation", label: "Kooperation / Partnerschaft" },
  { value: "allgemein", label: "Allgemeine Anfrage" },
] as const;

export const machineTypes = [
  { value: "snackautomat", label: "Snackautomat" },
  { value: "getraenkeautomat", label: "Getränkeautomat" },
  { value: "kombiautomat", label: "Kombiautomat" },
  { value: "kaffeeautomat", label: "Kaffeeautomat" },
  { value: "offen", label: "Noch offen" },
] as const;

export const locationTypes = [
  { value: "buero", label: "Büro / Verwaltung" },
  { value: "produktion", label: "Produktion / Industrie" },
  { value: "logistik", label: "Lager / Logistik" },
  { value: "werkstatt", label: "Werkstatt / Handwerk" },
  { value: "fitness", label: "Fitness / Sport / Verein" },
  { value: "hotel", label: "Hotel / Unterkunft" },
  { value: "gewerbeimmobilie", label: "Gewerbeimmobilie / Bürogebäude" },
  { value: "publikumsverkehr", label: "Fläche mit Publikumsverkehr" },
  { value: "sonstiges", label: "Sonstiges" },
] as const;

export const headcounts = [
  { value: "1-25", label: "bis 25 Personen" },
  { value: "26-75", label: "26 bis 75 Personen" },
  { value: "76-200", label: "76 bis 200 Personen" },
  { value: "201-500", label: "201 bis 500 Personen" },
  { value: "500+", label: "mehr als 500 Personen" },
  { value: "unbekannt", label: "Weiß ich noch nicht" },
] as const;

export const footfalls = [
  { value: "unter-50", label: "unter 50 Personen am Tag" },
  { value: "50-150", label: "50 bis 150 Personen am Tag" },
  { value: "150-500", label: "150 bis 500 Personen am Tag" },
  { value: "500+", label: "mehr als 500 Personen am Tag" },
  { value: "unbekannt", label: "Weiß ich nicht" },
] as const;

export const placements = [
  { value: "innen", label: "Innenbereich" },
  { value: "aussen", label: "Außenbereich" },
  { value: "unklar", label: "Noch unklar" },
] as const;

export const powerOptions = [
  { value: "ja", label: "Ja" },
  { value: "nein", label: "Nein" },
  { value: "unbekannt", label: "Weiß ich nicht" },
] as const;

type Opt = readonly { readonly value: string; readonly label: string }[];

export function values<T extends Opt>(opts: T) {
  return opts.map((o) => o.value) as unknown as [T[number]["value"], ...T[number]["value"][]];
}

export function labelOf(opts: Opt, value: string | undefined | null): string {
  if (!value) return "";
  return opts.find((o) => o.value === value)?.label ?? value;
}
