import { describe, expect, it } from "vitest";
import { SESSION_TTL_SECONDS, createSessionValue, isValidSession, passwordMatches, readAdminConfig } from "@/lib/admin/session";

const config = { password: "correct horse", secret: "s".repeat(40) };

describe("admin config", () => {
  it("requires a password and a secret of at least 32 characters", () => {
    expect(readAdminConfig({})).toBeNull();
    expect(readAdminConfig({ ADMIN_PASSWORD: "x", ADMIN_SESSION_SECRET: "short" })).toBeNull();
    expect(readAdminConfig({ ADMIN_PASSWORD: "x", ADMIN_SESSION_SECRET: "y".repeat(32) })).toEqual({ password: "x", secret: "y".repeat(32) });
  });
});

describe("admin password", () => {
  it("matches only the exact password", () => {
    expect(passwordMatches("correct horse", config)).toBe(true);
    expect(passwordMatches("correct horse ", config)).toBe(false);
    expect(passwordMatches("", config)).toBe(false);
  });
});

describe("admin session cookie", () => {
  const now = Date.UTC(2026, 9, 22, 12);

  it("accepts a fresh session and rejects it after expiry", () => {
    const v = createSessionValue(config, now);
    expect(isValidSession(v, config, now + 1000)).toBe(true);
    expect(isValidSession(v, config, now + SESSION_TTL_SECONDS * 1000 + 1)).toBe(false);
  });

  it("rejects tampered, foreign or missing values", () => {
    const v = createSessionValue(config, now);
    const [exp, mac] = v.split(".");
    expect(isValidSession(`${Number(exp) + 3600}.${mac}`, config, now)).toBe(false);
    expect(isValidSession(`${exp}.${mac}x`, config, now)).toBe(false);
    expect(isValidSession(v, { ...config, secret: "t".repeat(40) }, now)).toBe(false);
    expect(isValidSession(undefined, config, now)).toBe(false);
    expect(isValidSession("garbage", config, now)).toBe(false);
    expect(isValidSession(v, null, now)).toBe(false);
  });

  it("is invalidated by a password change", () => {
    const v = createSessionValue(config, now);
    expect(isValidSession(v, { ...config, password: "new password" }, now)).toBe(false);
  });
});
