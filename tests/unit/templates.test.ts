import { describe, expect, it } from "vitest";
import { escapeHtml, headerSafe, renderAcknowledgment, renderNotification, type InquiryRecord } from "@/lib/email/templates";
import { anfrageSchema, kontaktSchema, standortSchema } from "@/lib/inquiry/schema";
import { NOW, validFields } from "./helpers";

const record = (data: InquiryRecord["data"]): InquiryRecord => ({ id: "SNK-261018-ABCDE", createdAt: NOW, data });

describe("email templates", () => {
  it("escapes HTML in all user-provided values", () => {
    const fields = kontaktSchema.parse({
      ...validFields.kontakt,
      name: "<img src=x onerror=alert(1)>",
      message: "<script>alert('x')</script> & \"quotes\"",
    });
    const { html, text } = renderNotification(record({ form: "kontakt", fields }));
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp; &quot;quotes&quot;");
    // the plain-text part keeps the original characters
    expect(text).toContain("<script>alert('x')</script>");
  });

  it("builds a descriptive subject for each form", () => {
    const a = renderNotification(record({ form: "anfrage", fields: anfrageSchema.parse(validFields.anfrage) }));
    expect(a.subject).toBe("Neue Anfrage: Automat für Unternehmen · 73728 Esslingen [SNK-261018-ABCDE]");
    const s = renderNotification(record({ form: "standort", fields: standortSchema.parse(validFields.standort) }));
    expect(s.subject).toContain("Neuer Standortvorschlag: Fitness / Sport / Verein · 70173 Stuttgart");
  });

  it("includes all relevant inquiry details, timestamp and source", () => {
    const { html, text } = renderNotification(record({ form: "anfrage", fields: anfrageSchema.parse(validFields.anfrage) }));
    for (const v of ["Erika Musterfrau", "Muster Logistik GmbH", "erika@example.com", "Kombiautomat", "Lager / Logistik", "76 bis 200 Personen", "SNK-261018-ABCDE", "Anfrageformular"]) {
      expect(text).toContain(v);
      expect(html).toContain(escapeHtml(v));
    }
    expect(text).toMatch(/Eingang: .*2026/);
  });

  it("acknowledgment does not echo the free-text message", () => {
    const fields = kontaktSchema.parse({ ...validFields.kontakt, message: "Geheime Nachricht mit Inhalt" });
    const ack = renderAcknowledgment(record({ form: "kontakt", fields }));
    expect(ack.text).not.toContain("Geheime Nachricht");
    expect(ack.html).not.toContain("Geheime Nachricht");
    expect(ack.text).toContain("SNK-261018-ABCDE");
    expect(ack.text).not.toMatch(/24 Stunden|innerhalb von/);
  });

  it("headerSafe strips control characters and newlines", () => {
    expect(headerSafe("a\r\nBcc: x@y.z\tb")).toBe("a Bcc: x@y.z b");
    expect(headerSafe("x".repeat(500)).length).toBe(150);
  });
});
