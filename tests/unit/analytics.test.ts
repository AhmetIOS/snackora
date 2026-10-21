import { describe, expect, it } from "vitest";
import { CONSENT_MAX_AGE_MS, CONSENT_VERSION, parseConsent } from "@/lib/consent/consent";
import { contactClickEvent, formSuccessEvents, KEY_EVENTS } from "@/lib/analytics/events";

describe("consent parsing", () => {
  const now = Date.UTC(2026, 9, 21);
  const valid = (o: object = {}) => JSON.stringify({ version: CONSENT_VERSION, analytics: true, decidedAt: now - 1000, ...o });

  it("accepts a current decision", () => {
    expect(parseConsent(valid(), now)).toEqual({ version: CONSENT_VERSION, analytics: true, decidedAt: now - 1000 });
    expect(parseConsent(valid({ analytics: false }), now)?.analytics).toBe(false);
  });

  it("treats missing, malformed or outdated decisions as 'not decided'", () => {
    expect(parseConsent(null, now)).toBeNull();
    expect(parseConsent("not json", now)).toBeNull();
    expect(parseConsent(valid({ version: CONSENT_VERSION + 1 }), now)).toBeNull();
    expect(parseConsent(valid({ analytics: "yes" }), now)).toBeNull();
    expect(parseConsent(valid({ decidedAt: now - CONSENT_MAX_AGE_MS - 1 }), now)).toBeNull();
    expect(parseConsent(valid({ decidedAt: now + 60_000 }), now)).toBeNull();
  });
});

describe("form conversion events", () => {
  const leads = (events: { name: string }[]) => events.filter((e) => (KEY_EVENTS as readonly string[]).includes(e.name)).length;

  it("counts every sales inquiry exactly once as generate_lead", () => {
    for (const type of ["unternehmen", "standort", "kooperation", "allgemein"]) {
      expect(leads(formSuccessEvents("anfrage", type))).toBe(1);
    }
    expect(leads(formSuccessEvents("standort"))).toBe(1);
  });

  it("does not count contact messages as leads", () => {
    expect(formSuccessEvents("kontakt")).toEqual([{ name: "kontakt_submit", params: { form_name: "kontakt" } }]);
  });

  it("adds standortanfrage_submit for location offers from both forms", () => {
    expect(formSuccessEvents("standort").map((e) => e.name)).toContain("standortanfrage_submit");
    expect(formSuccessEvents("anfrage", "standort").map((e) => e.name)).toContain("standortanfrage_submit");
    expect(formSuccessEvents("anfrage", "unternehmen").map((e) => e.name)).not.toContain("standortanfrage_submit");
  });

  it("only sends fixed keys, never free text", () => {
    const all = [...formSuccessEvents("anfrage", "standort"), ...formSuccessEvents("standort"), ...formSuccessEvents("kontakt")];
    for (const e of all) {
      expect(Object.keys(e.params).every((k) => ["form_name", "lead_type"].includes(k))).toBe(true);
      expect(e.name).toMatch(/^[a-z][a-z0-9_]{0,39}$/); // GA4 naming rules
    }
  });
});

describe("contact link clicks", () => {
  it("maps mailto/tel without the address", () => {
    expect(contactClickEvent("mailto:kontakt@snackora.de", "/kontakt")).toEqual({ name: "click_email", params: { link_location: "/kontakt" } });
    expect(contactClickEvent("tel:+49711123", "/")).toEqual({ name: "click_phone", params: { link_location: "/" } });
    expect(contactClickEvent("/anfrage", "/")).toBeNull();
  });
});
