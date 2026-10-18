import {
  footfalls,
  headcounts,
  inquiryTypes,
  locationTypes,
  machineTypes,
  placements,
  powerOptions,
} from "@/lib/inquiry/options";
import { LIMITS, type FormKind } from "@/lib/inquiry/schema";

/**
 * Declarative form definitions. All three website forms are rendered by the
 * same engine (InquiryForm) from these configs.
 */

type Opt = readonly { readonly value: string; readonly label: string }[];

interface Base {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  span?: "full" | "half";
}

export type FieldDef =
  | (Base & {
      kind: "text";
      type?: "text" | "email" | "tel";
      autoComplete?: string;
      inputMode?: "text" | "email" | "tel" | "numeric";
      placeholder?: string;
      maxLength?: number;
    })
  | (Base & { kind: "select"; options: Opt; placeholder?: string })
  | (Base & { kind: "radio"; options: Opt })
  | (Base & { kind: "textarea"; placeholder?: string; rows?: number; maxLength?: number });

export interface FormGroup {
  legend: string;
  fields: FieldDef[];
}

export interface FormConfig {
  kind: FormKind;
  groups: FormGroup[];
  submitLabel: string;
  successTitle: string;
  successText: string;
  /** Map of query-string keys to field names allowed for prefilling. */
  prefill?: Record<string, string>;
  defaults?: Record<string, string>;
}

const contact: FieldDef[] = [
  { kind: "text", name: "name", label: "Name", required: true, autoComplete: "name", maxLength: LIMITS.name, span: "half" },
  {
    kind: "text",
    name: "company",
    label: "Firma / Organisation",
    autoComplete: "organization",
    maxLength: LIMITS.company,
    span: "half",
  },
  {
    kind: "text",
    name: "email",
    label: "E-Mail",
    type: "email",
    required: true,
    autoComplete: "email",
    inputMode: "email",
    placeholder: "name@firma.de",
    maxLength: LIMITS.email,
    span: "half",
  },
  {
    kind: "text",
    name: "phone",
    label: "Telefon",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
    placeholder: "z. B. 0711 123456",
    hint: "Optional – falls Sie einen Rückruf bevorzugen.",
    maxLength: LIMITS.phone,
    span: "half",
  },
];

const postal: FieldDef[] = [
  {
    kind: "text",
    name: "postalCode",
    label: "Postleitzahl",
    required: true,
    autoComplete: "postal-code",
    inputMode: "numeric",
    placeholder: "z. B. 73728",
    maxLength: 5,
    span: "half",
  },
  { kind: "text", name: "city", label: "Ort", required: true, autoComplete: "address-level2", placeholder: "z. B. Esslingen", maxLength: LIMITS.city, span: "half" },
];

export const formConfigs: Record<FormKind, FormConfig> = {
  anfrage: {
    kind: "anfrage",
    submitLabel: "Anfrage unverbindlich senden",
    successTitle: "Vielen Dank – Ihre Anfrage ist bei uns eingegangen.",
    successText: "Wir sehen uns Ihre Angaben in Ruhe an und melden uns bei Ihnen, um die nächsten Schritte zu besprechen.",
    prefill: { anliegen: "inquiryType", automat: "machineType" },
    defaults: { inquiryType: "unternehmen", machineType: "offen" },
    groups: [
      {
        legend: "Worum geht es?",
        fields: [
          { kind: "radio", name: "inquiryType", label: "Art der Anfrage", required: true, options: inquiryTypes, span: "full" },
          { kind: "radio", name: "machineType", label: "Gewünschte Automatenlösung", required: true, options: machineTypes, span: "full" },
        ],
      },
      { legend: "Ihre Kontaktdaten", fields: contact },
      {
        legend: "Ihr Standort",
        fields: [
          ...postal,
          { kind: "select", name: "locationType", label: "Art des Standorts", options: locationTypes, placeholder: "Bitte wählen (optional)", span: "half" },
          { kind: "select", name: "headcount", label: "Mitarbeitende / Besucher vor Ort", options: headcounts, placeholder: "Bitte wählen (optional)", span: "half" },
        ],
      },
      {
        legend: "Ihre Nachricht",
        fields: [
          {
            kind: "textarea",
            name: "message",
            label: "Nachricht",
            required: true,
            rows: 6,
            maxLength: LIMITS.message,
            placeholder: "Zum Beispiel: Wir sind ein Logistikbetrieb mit rund 80 Mitarbeitenden im Zweischichtbetrieb und suchen eine Lösung für Snacks und kalte Getränke im Pausenraum.",
            span: "full",
          },
        ],
      },
    ],
  },
  standort: {
    kind: "standort",
    submitLabel: "Standort vorschlagen",
    successTitle: "Vielen Dank für Ihren Standortvorschlag.",
    successText: "Wir prüfen Ihre Angaben und melden uns, wenn der Standort für einen Snackora-Automaten infrage kommt.",
    prefill: { automat: "machineType" },
    groups: [
      { legend: "Ihre Kontaktdaten", fields: contact },
      {
        legend: "Der Standort",
        fields: [
          {
            kind: "text",
            name: "street",
            label: "Straße / Lage",
            autoComplete: "street-address",
            placeholder: "z. B. Gewerbegebiet Nord",
            hint: "Optional. Für eine erste Einschätzung reichen PLZ und Ort.",
            maxLength: LIMITS.street,
            span: "full",
          },
          ...postal,
          { kind: "select", name: "locationType", label: "Art des Standorts", required: true, options: locationTypes, placeholder: "Bitte wählen", span: "half" },
          { kind: "select", name: "footfall", label: "Geschätzte Personen pro Tag", options: footfalls, placeholder: "Bitte wählen (optional)", span: "half" },
          { kind: "radio", name: "placement", label: "Wo würde der Automat stehen?", required: true, options: placements, span: "full" },
          { kind: "radio", name: "power", label: "Ist ein Stromanschluss vorhanden?", required: true, options: powerOptions, span: "full" },
          { kind: "radio", name: "machineType", label: "Gewünschter Automatentyp", options: machineTypes, hint: "Optional.", span: "full" },
        ],
      },
      {
        legend: "Weitere Informationen",
        fields: [
          {
            kind: "textarea",
            name: "message",
            label: "Ergänzende Hinweise",
            rows: 5,
            maxLength: LIMITS.message,
            placeholder: "Zum Beispiel: Zugang, Öffnungszeiten, vorhandene Fläche oder Besonderheiten des Standorts.",
            hint: "Optional.",
            span: "full",
          },
        ],
      },
    ],
  },
  kontakt: {
    kind: "kontakt",
    submitLabel: "Nachricht senden",
    successTitle: "Vielen Dank für Ihre Nachricht.",
    successText: "Wir haben Ihre Nachricht erhalten und melden uns bei Ihnen.",
    groups: [
      { legend: "Ihre Kontaktdaten", fields: contact },
      {
        legend: "Ihre Nachricht",
        fields: [{ kind: "textarea", name: "message", label: "Nachricht", required: true, rows: 6, maxLength: LIMITS.message, span: "full" }],
      },
    ],
  },
};
