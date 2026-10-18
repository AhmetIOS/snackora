import { createMemoryTransport } from "@/lib/email/transport";
import type { InquiryDeps, Logger } from "@/lib/inquiry/process";
import { createMemoryRateLimiter } from "@/lib/security/rate-limit";

export const NOW = new Date("2026-10-18T10:00:00Z");

export const silentLogger = (): Logger & { events: string[] } => {
  const events: string[] = [];
  return {
    events,
    info: (e) => void events.push(e),
    warn: (e) => void events.push(e),
    error: (e) => void events.push(e),
  };
};

export function makeDeps(overrides: Partial<InquiryDeps> = {}) {
  const transport = createMemoryTransport();
  const logger = silentLogger();
  const deps: InquiryDeps = {
    transport,
    email: { to: ["kontakt@snackora.de"], from: "Snackora Website <website@snackora.de>", replyTo: "kontakt@snackora.de" },
    autoReply: false,
    limiter: createMemoryRateLimiter(() => NOW.getTime()),
    salt: "test",
    logger,
    now: () => NOW,
    ...overrides,
  };
  return { deps, transport, logger };
}

export const validFields = {
  anfrage: {
    inquiryType: "unternehmen",
    name: "Erika Musterfrau",
    company: "Muster Logistik GmbH",
    email: "erika@example.com",
    phone: "0711 123456",
    postalCode: "73728",
    city: "Esslingen",
    machineType: "kombiautomat",
    locationType: "logistik",
    headcount: "76-200",
    message: "Wir haben rund 120 Mitarbeitende im Zweischichtbetrieb und suchen eine Lösung für den Pausenraum.",
    privacy: true,
  },
  standort: {
    name: "Max Beispiel",
    company: "",
    email: "max@example.com",
    phone: "",
    street: "",
    postalCode: "70173",
    city: "Stuttgart",
    locationType: "fitness",
    footfall: "150-500",
    placement: "innen",
    power: "ja",
    machineType: "",
    message: "",
    privacy: true,
  },
  kontakt: {
    name: "Max Beispiel",
    company: "",
    email: "max@example.com",
    phone: "",
    message: "Ich habe eine kurze Frage zu Ihrem Angebot.",
    privacy: true,
  },
} as const;

export function envelope(form: keyof typeof validFields, fields: Record<string, unknown> = validFields[form], meta: Record<string, unknown> = {}) {
  return {
    form,
    fields,
    meta: {
      submissionId: "3f1c9a52-6a4b-4b7e-9a35-2d4f0b1c8e11",
      startedAt: NOW.getTime() - 60_000,
      website: "",
      ...meta,
    },
  };
}
