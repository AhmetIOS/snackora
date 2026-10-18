import { describe, expect, it } from "vitest";
import { createMemoryTransport } from "@/lib/email/transport";
import { processInquiry } from "@/lib/inquiry/process";
import type { RateLimiter } from "@/lib/security/rate-limit";
import { envelope, makeDeps, validFields } from "./helpers";

const ctx = { ip: "203.0.113.7" };

describe("processInquiry", () => {
  it("delivers a valid inquiry and only then reports success", async () => {
    const { deps, transport } = makeDeps();
    const res = await processInquiry(envelope("anfrage"), ctx, deps);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
    if (!res.body.ok) throw new Error("unexpected");
    expect(res.body.inquiryId).toMatch(/^SNK-261018-[A-Z2-9]{5}$/);
    expect(transport.sent).toHaveLength(1);
    const mail = transport.sent[0]!;
    expect(mail.to).toEqual(["kontakt@snackora.de"]);
    expect(mail.from).toBe("Snackora Website <website@snackora.de>");
    expect(mail.replyTo).toBe("erika@example.com"); // visitor address only as Reply-To, never as From
    expect(mail.idempotencyKey).toBe("inquiry-3f1c9a52-6a4b-4b7e-9a35-2d4f0b1c8e11");
    expect(mail.subject).toContain("SNK-261018-");
  });

  it("works for all three forms", async () => {
    for (const form of ["anfrage", "standort", "kontakt"] as const) {
      const { deps, transport } = makeDeps();
      const res = await processInquiry(envelope(form), ctx, deps);
      expect(res.status, form).toBe(200);
      expect(transport.sent, form).toHaveLength(1);
    }
  });

  it("returns field errors for invalid input without sending", async () => {
    const { deps, transport } = makeDeps();
    const res = await processInquiry(envelope("kontakt", { ...validFields.kontakt, email: "kein-email", privacy: false }), ctx, deps);
    expect(res.status).toBe(422);
    expect(res.body.ok).toBe(false);
    if (res.body.ok) throw new Error("unexpected");
    expect(Object.keys(res.body.fieldErrors ?? {})).toEqual(expect.arrayContaining(["email", "privacy"]));
    expect(transport.sent).toHaveLength(0);
  });

  it("rejects malformed envelopes", async () => {
    const { deps } = makeDeps();
    expect((await processInquiry({ hello: "world" }, ctx, deps)).status).toBe(400);
    expect((await processInquiry(null, ctx, deps)).status).toBe(400);
  });

  it("silently drops honeypot submissions", async () => {
    const { deps, transport, logger } = makeDeps();
    const res = await processInquiry(envelope("kontakt", undefined, { website: "https://spam.example" }), ctx, deps);
    expect(res.status).toBe(200);
    expect(transport.sent).toHaveLength(0);
    expect(logger.events).toContain("inquiry.spam.honeypot");
  });

  it("rejects submissions sent faster than a human can type", async () => {
    const { deps, transport } = makeDeps();
    const res = await processInquiry(envelope("kontakt", undefined, { startedAt: Date.parse("2026-10-18T09:59:59.5Z") }), ctx, deps);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ ok: false, error: "too_fast" });
    expect(transport.sent).toHaveLength(0);
  });

  it("rate-limits repeated submissions from the same IP", async () => {
    const { deps, transport } = makeDeps();
    const results = [];
    for (let i = 0; i < 6; i++) results.push(await processInquiry(envelope("kontakt"), ctx, deps));
    expect(results.slice(0, 5).every((r) => r.status === 200)).toBe(true);
    expect(results[5]!.status).toBe(429);
    expect(results[5]!.headers?.["Retry-After"]).toBeDefined();
    expect(transport.sent).toHaveLength(5);
    // another IP is unaffected
    expect((await processInquiry(envelope("kontakt"), { ip: "198.51.100.1" }, deps)).status).toBe(200);
  });

  it("fails open (but logs) when the rate limiter is unavailable", async () => {
    const broken: RateLimiter = { kind: "upstash", hit: async () => Promise.reject(new Error("down")) };
    const { deps, transport, logger } = makeDeps({ limiter: broken });
    const res = await processInquiry(envelope("kontakt"), ctx, deps);
    expect(res.status).toBe(200);
    expect(transport.sent).toHaveLength(1);
    expect(logger.events).toContain("inquiry.rate_limit.unavailable");
  });

  it("returns 503 – never fake success – when e-mail is not configured", async () => {
    const { deps } = makeDeps({ transport: null, email: null });
    const res = await processInquiry(envelope("kontakt"), ctx, deps);
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ ok: false, error: "unavailable" });
  });

  it("returns 502 when the provider rejects the e-mail", async () => {
    const { deps, logger } = makeDeps({ transport: createMemoryTransport({ fail: true }) });
    const res = await processInquiry(envelope("anfrage"), ctx, deps);
    expect(res.status).toBe(502);
    expect(res.body).toMatchObject({ ok: false, error: "delivery_failed" });
    expect(logger.events).toContain("inquiry.email.failed");
  });

  it("sends an acknowledgment when enabled, without affecting the result if it fails", async () => {
    const t = createMemoryTransport();
    const { deps } = makeDeps({ transport: t, autoReply: true });
    expect((await processInquiry(envelope("kontakt"), ctx, deps)).status).toBe(200);
    expect(t.sent).toHaveLength(2);
    expect(t.sent[1]!.to).toEqual(["max@example.com"]);
    expect(t.sent[1]!.replyTo).toBe("kontakt@snackora.de");

    const failingAck = createMemoryTransport({ fail: (m) => m.to[0] === "max@example.com" });
    const second = makeDeps({ transport: failingAck, autoReply: true });
    const res = await processInquiry(envelope("kontakt"), ctx, second.deps);
    expect(res.status).toBe(200);
    expect(second.logger.events).toContain("inquiry.ack.failed");
  });

  it("limits acknowledgments per recipient address", async () => {
    const t = createMemoryTransport();
    const { deps } = makeDeps({ transport: t, autoReply: true });
    for (let i = 0; i < 4; i++) await processInquiry(envelope("kontakt"), { ip: `192.0.2.${i}` }, deps);
    const acks = t.sent.filter((m) => m.to[0] === "max@example.com");
    expect(acks).toHaveLength(3);
  });

  it("never logs personal data", async () => {
    const events: unknown[] = [];
    const logger = {
      info: (e: string, d?: unknown) => void events.push([e, d]),
      warn: (e: string, d?: unknown) => void events.push([e, d]),
      error: (e: string, d?: unknown) => void events.push([e, d]),
    };
    const { deps } = makeDeps({ logger, transport: createMemoryTransport({ fail: true }) });
    await processInquiry(envelope("anfrage"), ctx, deps);
    const log = JSON.stringify(events);
    for (const pii of ["Erika", "erika@example.com", "0711", "Esslingen", "203.0.113.7"]) expect(log).not.toContain(pii);
  });
});
