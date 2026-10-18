import { describe, expect, it } from "vitest";
import { anfrageSchema, countLinks, envelopeSchema, kontaktSchema, standortSchema } from "@/lib/inquiry/schema";
import { validFields } from "./helpers";

describe("inquiry schemas", () => {
  it("accepts complete valid submissions for all forms", () => {
    expect(anfrageSchema.safeParse(validFields.anfrage).success).toBe(true);
    expect(standortSchema.safeParse(validFields.standort).success).toBe(true);
    expect(kontaktSchema.safeParse(validFields.kontakt).success).toBe(true);
  });

  it("requires the mandatory fields with German messages", () => {
    const r = anfrageSchema.safeParse({ privacy: false });
    expect(r.success).toBe(false);
    const fields = new Set(r.error!.issues.map((i) => String(i.path[0])));
    for (const f of ["inquiryType", "name", "email", "postalCode", "city", "machineType", "message", "privacy"]) {
      expect(fields).toContain(f);
    }
    const privacyIssue = r.error!.issues.find((i) => i.path[0] === "privacy");
    expect(privacyIssue?.message).toMatch(/Datenschutzhinweise/);
  });

  it("does not require street for location proposals", () => {
    const r = standortSchema.safeParse({ ...validFields.standort, street: undefined });
    expect(r.success).toBe(true);
  });

  it("validates German postal codes", () => {
    expect(standortSchema.safeParse({ ...validFields.standort, postalCode: "7372" }).success).toBe(false);
    expect(standortSchema.safeParse({ ...validFields.standort, postalCode: "ABCDE" }).success).toBe(false);
    expect(standortSchema.safeParse({ ...validFields.standort, postalCode: " 73728 " }).success).toBe(true);
  });

  it("rejects line breaks in single-line fields (header injection)", () => {
    const r = kontaktSchema.safeParse({ ...validFields.kontakt, name: "Max\r\nBcc: victim@example.com" });
    expect(r.success).toBe(false);
  });

  it("rejects links in the name and too many links in messages", () => {
    expect(kontaktSchema.safeParse({ ...validFields.kontakt, name: "Visit https://spam.example" }).success).toBe(false);
    const spam = "a https://a.example b https://b.example c https://c.example d https://d.example";
    expect(kontaktSchema.safeParse({ ...validFields.kontakt, message: spam }).success).toBe(false);
    expect(countLinks(spam)).toBe(4);
  });

  it("enforces length limits", () => {
    expect(kontaktSchema.safeParse({ ...validFields.kontakt, message: "x".repeat(3001) }).success).toBe(false);
    expect(kontaktSchema.safeParse({ ...validFields.kontakt, name: "x".repeat(81) }).success).toBe(false);
  });

  it("validates phone numbers loosely but rejects garbage", () => {
    expect(kontaktSchema.safeParse({ ...validFields.kontakt, phone: "+49 (0)711 / 123-456" }).success).toBe(true);
    expect(kontaktSchema.safeParse({ ...validFields.kontakt, phone: "call me" }).success).toBe(false);
  });

  it("accepts all four machine concepts and rejects unknown option values", () => {
    for (const machineType of ["snackautomat", "getraenkeautomat", "kombiautomat", "kaffeeautomat", "offen"]) {
      expect(anfrageSchema.safeParse({ ...validFields.anfrage, machineType }).success, machineType).toBe(true);
    }
    expect(anfrageSchema.safeParse({ ...validFields.anfrage, machineType: "eisautomat" }).success).toBe(false);
  });

  it("requires a UUID submission id in the envelope", () => {
    const bad = envelopeSchema.safeParse({ form: "kontakt", fields: {}, meta: { submissionId: "123", startedAt: 1 } });
    expect(bad.success).toBe(false);
  });
});
