import type { FormKind } from "@/lib/inquiry/schema";

/**
 * GA4 conversion events for the website forms.
 *
 * Rules:
 *   ▸ Fired only after the server confirmed a successful submission.
 *   ▸ Never contains form input (name, e-mail, phone, message, address) –
 *     only fixed keys from our own option lists.
 *   ▸ `generate_lead` is the single key event (conversion). It is sent
 *     exactly once per sales inquiry; the detail events below are for
 *     reporting only and must NOT be marked as key events, otherwise one
 *     inquiry would be counted twice.
 *
 *   Form                               Events
 *   anfrage (Unternehmen, Kooperation,  generate_lead
 *            Allgemein)
 *   anfrage (Art "Standort anbieten")   generate_lead + standortanfrage_submit
 *   standort                            generate_lead + standortanfrage_submit
 *   kontakt                             kontakt_submit   (may be service → no lead)
 */

export type AnalyticsParams = Record<string, string | number | boolean>;
export interface AnalyticsEvent {
  name: string;
  params: AnalyticsParams;
}

export const KEY_EVENTS = ["generate_lead"] as const;

export function formSuccessEvents(kind: FormKind, inquiryType?: string): AnalyticsEvent[] {
  switch (kind) {
    case "anfrage": {
      const leadType = inquiryType || "unternehmen";
      const events: AnalyticsEvent[] = [{ name: "generate_lead", params: { form_name: "anfrage", lead_type: leadType } }];
      if (leadType === "standort") events.push({ name: "standortanfrage_submit", params: { form_name: "anfrage" } });
      return events;
    }
    case "standort":
      return [
        { name: "generate_lead", params: { form_name: "standort", lead_type: "standort" } },
        { name: "standortanfrage_submit", params: { form_name: "standort" } },
      ];
    case "kontakt":
      return [{ name: "kontakt_submit", params: { form_name: "kontakt" } }];
  }
}

/** Click on a mailto:/tel: link. Only the link type and the page are sent, never the address. */
export function contactClickEvent(href: string, pagePath: string): AnalyticsEvent | null {
  const h = href.trim().toLowerCase();
  if (h.startsWith("mailto:")) return { name: "click_email", params: { link_location: pagePath } };
  if (h.startsWith("tel:")) return { name: "click_phone", params: { link_location: pagePath } };
  return null;
}
