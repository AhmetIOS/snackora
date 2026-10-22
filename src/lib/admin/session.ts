import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Admin session for /admin – a single shared password, no user accounts.
 *
 *   ADMIN_PASSWORD        the login password (Vercel: Production, sensitive)
 *   ADMIN_SESSION_SECRET  random ≥32 chars, signs the session cookie
 *
 * The cookie holds only "<expiry>.<hmac>" – nothing secret, nothing personal.
 * Changing ADMIN_SESSION_SECRET or ADMIN_PASSWORD logs everyone out.
 */

export const ADMIN_COOKIE = "snackora_admin";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

export interface AdminConfig {
  password: string;
  secret: string;
}

export function readAdminConfig(env: Record<string, string | undefined> = process.env): AdminConfig | null {
  const password = env.ADMIN_PASSWORD ?? "";
  const secret = env.ADMIN_SESSION_SECRET ?? "";
  if (!password || secret.length < 32) return null;
  return { password, secret };
}

const sha256 = (v: string) => createHash("sha256").update(v).digest();

/** Constant-time comparison (hashing first equalises the lengths). */
export function passwordMatches(input: string, config: AdminConfig): boolean {
  return timingSafeEqual(sha256(input), sha256(config.password));
}

function sign(expiresAt: number, config: AdminConfig): string {
  // The password is part of the key, so a password change invalidates existing sessions.
  return createHmac("sha256", `${config.secret}:${config.password}`).update(`admin:${expiresAt}`).digest("base64url");
}

export function createSessionValue(config: AdminConfig, now: number = Date.now()): string {
  const expiresAt = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  return `${expiresAt}.${sign(expiresAt, config)}`;
}

export function isValidSession(value: string | undefined, config: AdminConfig | null, now: number = Date.now()): boolean {
  if (!value || !config) return false;
  const [exp, mac] = value.split(".");
  const expiresAt = Number(exp);
  if (!Number.isInteger(expiresAt) || !mac || expiresAt * 1000 <= now) return false;
  const expected = Buffer.from(sign(expiresAt, config));
  const given = Buffer.from(mac);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
