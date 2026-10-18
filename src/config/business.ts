/**
 * Snackora – central business & legal configuration.
 *
 * ▸ This is the ONE place to maintain legal and contact details.
 *   Impressum, Datenschutz, footer, contact page, structured data and
 *   e-mail templates all read from here.
 *
 * ▸ Values that are not yet known are `null`. The site never invents them:
 *   missing legal data is shown as clearly marked "pending" on the legal
 *   pages and reported by `npm run check:launch`.
 *
 * ▸ Keep this file free of imports and non-erasable TypeScript (enums,
 *   namespaces): it is also executed directly by `node scripts/launch-check.ts`.
 *
 * ▸ The legal address is used ONLY in legal contexts (Impressum,
 *   Datenschutz). It is intentionally not shown in marketing sections.
 */

export type ContactChannelStatus = "planned" | "active";

export interface BusinessConfig {
  brand: string;
  slogan: string;
  /** Name as it must appear in the Impressum (Einzelunternehmen: brand + owner). */
  legalName: string;
  owner: string;
  legalForm: string;
  address: {
    street: string | null;
    houseNumber: string | null;
    postalCode: string | null;
    city: string | null;
    country: string;
  };
  email: {
    address: string;
    /**
     * "planned": mailbox not yet confirmed – the address is not advertised in
     * marketing sections (forms are offered instead). Switch to "active" once
     * the mailbox receives mail.
     */
    status: ContactChannelStatus;
  };
  /** Public business phone, e.g. "+49 711 1234567". `null` hides the channel. */
  phone: string | null;
  /** USt-IdNr. – only if actually assigned by the Bundeszentralamt für Steuern. */
  vatId: string | null;
  /** Only if a commercial register entry exists (not the case for a non-registered Einzelunternehmen). */
  register: { court: string; number: string } | null;
  /** Provider hosting the business mailbox (named in the privacy policy), e.g. "IONOS SE, Elgendorfer Str. 57, 56410 Montabaur". */
  mailboxProvider: string | null;
  /** "resend" (Resend API) or "smtp" (e.g. Zoho Mail SMTP). */
  emailDelivery: "resend" | "smtp";
  /**
   * Set to true after the owner (ideally with legal advice) has reviewed
   * Impressum and Datenschutzerklärung. Hides the review notices.
   */
  legalReviewCompleted: boolean;
  website: string;
  domain: string;
  serviceRegion: {
    label: string;
    /** Focus towns – shown as service region, NOT as installed locations. */
    cities: readonly string[];
  };
}

export const business: BusinessConfig = {
  brand: "Snackora",
  slogan: "Deine Pause. Jederzeit.",
  legalName: "Snackora – Inhaber: Ahmet Durmuş",
  owner: "Ahmet Durmuş",
  legalForm: "Einzelunternehmen",
  address: {
    street: "Hohestr.",
    houseNumber: "6",
    postalCode: "73734",
    city: "Esslingen am Neckar",
    country: "Deutschland",
  },
  email: {
    address: "kontakt@snackora.de",
    status: "planned", // TODO: set to "active" once the mailbox works
  },
  phone: null,
  vatId: null,
  register: null,
  // Zoho Mail, EU data centre (account must be created on zoho.eu)
  mailboxProvider: "Zoho Corporation B.V., Beneluxlaan 4B, 3527 HT Utrecht, Niederlande (Zoho Mail, Rechenzentrum in der EU)",
  // Which service delivers the website's form e-mails – must match the
  // environment configuration (RESEND_API_KEY or SMTP_*). Used by the privacy policy.
  emailDelivery: "resend",
  legalReviewCompleted: false,
  website: "https://snackora.de",
  domain: "snackora.de",
  serviceRegion: {
    label: "Region Stuttgart",
    cities: ["Esslingen am Neckar", "Stuttgart", "Waiblingen", "Fellbach", "Ostfildern", "Wernau"],
  },
};

export const isEmailActive = business.email.status === "active";

export function hasLegalAddress(b: BusinessConfig = business): boolean {
  const a = b.address;
  return Boolean(a.street && a.houseNumber && a.postalCode && a.city);
}

/** Human-readable list of missing launch-critical data. Used by the launch check. */
export function getLaunchIssues(b: BusinessConfig = business): string[] {
  const issues: string[] = [];
  if (!hasLegalAddress(b)) issues.push("Ladungsfähige Anschrift (Straße, Hausnummer, PLZ, Ort) fehlt in src/config/business.ts");
  if (b.email.status !== "active") issues.push(`E-Mail-Postfach ${b.email.address} ist noch nicht als "active" bestätigt`);
  if (!b.mailboxProvider) issues.push("Anbieter des E-Mail-Postfachs (mailboxProvider) ist nicht eingetragen (Datenschutzerklärung)");
  if (!b.legalReviewCompleted) issues.push("Impressum und Datenschutzerklärung wurden noch nicht abschließend geprüft (legalReviewCompleted)");
  return issues;
}
