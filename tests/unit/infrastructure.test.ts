import { describe, expect, it, vi } from "vitest";
import { getLaunchIssues, business } from "@/config/business";
import { createResendTransport, EmailDeliveryError } from "@/lib/email/transport";
import { createMemoryRateLimiter, createUpstashRateLimiter, hashKey } from "@/lib/security/rate-limit";
import { readServerConfig } from "@/lib/server/config";

describe("Resend transport", () => {
  it("maps the message to the Resend API with idempotency key", async () => {
    const fetchMock = vi.fn(async () => Response.json({ id: "re_123" }));
    const t = createResendTransport("re_test_key", fetchMock as unknown as typeof fetch);
    const res = await t.send({
      from: "Snackora <website@snackora.de>",
      to: ["kontakt@snackora.de"],
      replyTo: "kunde@example.com",
      subject: "S",
      html: "<p>x</p>",
      text: "x",
      idempotencyKey: "inquiry-1",
    });
    expect(res.id).toBe("re_123");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer re_test_key");
    expect(headers["Idempotency-Key"]).toBe("inquiry-1");
    expect(JSON.parse(String(init.body))).toMatchObject({ reply_to: "kunde@example.com", to: ["kontakt@snackora.de"] });
  });

  it("throws a typed error without leaking the response body", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ message: "kunde@example.com invalid" }), { status: 422 }));
    const t = createResendTransport("k", fetchMock as unknown as typeof fetch);
    const err = await t.send({ from: "a@b.de", to: ["c@d.de"], subject: "s", html: "h", text: "t" }).catch((e) => e);
    expect(err).toBeInstanceOf(EmailDeliveryError);
    expect(err.message).toBe("Resend responded with HTTP 422");
    expect(err.message).not.toContain("kunde@");
  });
});

describe("rate limiters", () => {
  it("memory limiter enforces the window and resets", async () => {
    let now = 0;
    const l = createMemoryRateLimiter(() => now);
    for (let i = 0; i < 3; i++) expect((await l.hit("k", 3, 60)).allowed).toBe(true);
    expect((await l.hit("k", 3, 60)).allowed).toBe(false);
    now = 61_000;
    expect((await l.hit("k", 3, 60)).allowed).toBe(true);
  });

  it("upstash limiter uses one pipelined request", async () => {
    const fetchMock = vi.fn(async () => Response.json([{ result: "OK" }, { result: 4 }, { result: 120 }]));
    const l = createUpstashRateLimiter("https://eu1.upstash.io", "tok", fetchMock as unknown as typeof fetch);
    const r = await l.hit("ip:abc", 3, 600);
    expect(r).toMatchObject({ allowed: false, count: 4, retryAfterSeconds: 120 });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://eu1.upstash.io/pipeline");
    expect(JSON.parse(String(init.body))[0]).toEqual(["SET", "snackora:rl:ip:abc", "0", "EX", "600", "NX"]);
  });

  it("hashKey pseudonymises identifiers deterministically", async () => {
    const a = await hashKey("203.0.113.7", "salt");
    expect(a).toMatch(/^[0-9a-f]{24}$/);
    expect(a).toBe(await hashKey("203.0.113.7", "salt"));
    expect(a).not.toBe(await hashKey("203.0.113.7", "other"));
    expect(a).not.toContain("203");
  });
});

describe("server config", () => {
  it("disables e-mail when credentials are incomplete", () => {
    const c = readServerConfig({ RESEND_API_KEY: "k", CONTACT_EMAIL: "kontakt@snackora.de" });
    expect(c.email).toBeNull();
    expect(c.emailIssue).toMatch(/EMAIL_FROM/);
    expect(c.autoReply).toBe(false);
  });

  it("parses a complete configuration", () => {
    const c = readServerConfig({
      RESEND_API_KEY: "re_x",
      CONTACT_EMAIL: "kontakt@snackora.de, anfrage@snackora.de",
      EMAIL_FROM: "Snackora Website <website@snackora.de>",
      AUTO_REPLY_ENABLED: "true",
      UPSTASH_REDIS_REST_URL: "https://eu1.upstash.io/",
      UPSTASH_REDIS_REST_TOKEN: "t",
    });
    expect(c.email?.provider.kind).toBe("resend");
    expect(c.email?.to).toEqual(["kontakt@snackora.de", "anfrage@snackora.de"]);
    expect(c.email?.replyTo).toBe("kontakt@snackora.de");
    expect(c.autoReply).toBe(true);
    expect(c.upstash?.url).toBe("https://eu1.upstash.io");
  });

  it("supports SMTP (e.g. Zoho Mail) when no Resend key is set", () => {
    const c = readServerConfig({
      SMTP_HOST: "smtppro.zoho.eu",
      SMTP_USER: "kontakt@snackora.de",
      SMTP_PASSWORD: "app-password",
      CONTACT_EMAIL: "kontakt@snackora.de",
      EMAIL_FROM: "Snackora Website <kontakt@snackora.de>",
    });
    expect(c.email?.provider).toEqual({ kind: "smtp", host: "smtppro.zoho.eu", port: 465, user: "kontakt@snackora.de", password: "app-password" });
  });

  it("rejects a From header containing line breaks", () => {
    const c = readServerConfig({ RESEND_API_KEY: "k", CONTACT_EMAIL: "a@b.de", EMAIL_FROM: "X\r\nBcc: <a@b.de>" });
    expect(c.email).toBeNull();
  });
});

describe("business configuration", () => {
  it("never ships invented legal data", () => {
    expect(business.legalForm).toBe("Einzelunternehmen");
    expect(business.owner).toBe("Ahmet Durmuş");
    expect(business.vatId).toBeNull();
    expect(business.register).toBeNull();
  });

  it("reports missing launch data", () => {
    const issues = getLaunchIssues({ ...business, address: { ...business.address, street: null } });
    expect(issues.some((i) => i.includes("Anschrift"))).toBe(true);
    const complete = getLaunchIssues({
      ...business,
      address: { street: "Teststraße", houseNumber: "1", postalCode: "73728", city: "Esslingen", country: "Deutschland" },
      email: { address: "kontakt@snackora.de", status: "active" },
      mailboxProvider: "Provider",
      legalReviewCompleted: true,
    });
    expect(complete).toEqual([]);
  });
});
