import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/inquiry/route";
import { envelope } from "./helpers";

function request(body: unknown, headers: Record<string, string> = {}) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("https://snackora.de/api/inquiry", {
    method: "POST",
    headers: { origin: "https://snackora.de", host: "snackora.de", "content-type": "application/json", ...headers },
    body: raw,
  });
}

describe("POST /api/inquiry", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("rejects cross-site requests", async () => {
    const res = await POST(request(envelope("kontakt"), { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });

  it("rejects requests without Origin", async () => {
    const req = new Request("https://snackora.de/api/inquiry", {
      method: "POST",
      headers: { "content-type": "application/json", host: "snackora.de" },
      body: "{}",
    });
    expect((await POST(req)).status).toBe(403);
  });

  it("rejects non-JSON and invalid JSON bodies", async () => {
    expect((await POST(request("a=b", { "content-type": "application/x-www-form-urlencoded" }))).status).toBe(400);
    expect((await POST(request("{not json"))).status).toBe(400);
  });

  it("rejects oversized payloads", async () => {
    const big = envelope("kontakt", { message: "x".repeat(20_000) });
    expect((await POST(request(big))).status).toBe(413);
  });

  it("answers 503 with a German message when e-mail is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const res = await POST(request({ ...envelope("kontakt"), meta: { ...envelope("kontakt").meta, startedAt: Date.now() - 30_000 } }));
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.json();
    expect(body).toMatchObject({ ok: false, error: "unavailable" });
    expect(body.message).toMatch(/vorübergehend nicht verfügbar/);
  });
});
