import type { BusinessConfig } from "@/config/business";
import type { InquiryData } from "./schema";

export type Inboxes = BusinessConfig["inboxes"];

/**
 * Which inbox receives a form submission.
 *
 *   Kontakt formular               → kontakt@
 *   Standort anbieten              → standort@
 *   Anfrage, Art "Standort anbieten" → standort@
 *   Anfrage, alle anderen Arten    → kontakt@
 */
export function inboxFor(data: InquiryData, inboxes: Inboxes): string {
  switch (data.form) {
    case "standort":
      return inboxes.standort;
    case "anfrage":
      return data.fields.inquiryType === "standort" ? inboxes.standort : inboxes.kontakt;
    case "kontakt":
      return inboxes.kontakt;
  }
}
