import "server-only";
import { z } from "zod";

/**
 * Server-side configuration from environment variables. Read lazily at
 * request time (never at build time) and never sent to the browser.
 * See .env.example for documentation of every variable.
 */

const emailList = z
  .string()
  .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean))
  .pipe(z.array(z.email()).min(1));

const bool = z
  .string()
  .optional()
  .transform((v) => ["1", "true", "yes", "on"].includes((v ?? "").trim().toLowerCase()));

const envSchema = z.object({
  RESEND_API_KEY: z.string().trim().optional(),
  CONTACT_EMAIL: z.string().trim().optional(),
  EMAIL_FROM: z.string().trim().optional(),
  EMAIL_REPLY_TO: z.string().trim().optional(),
  AUTO_REPLY_ENABLED: bool,
  UPSTASH_REDIS_REST_URL: z.string().trim().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().trim().optional(),
  RATE_LIMIT_SALT: z.string().trim().optional(),
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.string().trim().optional(),
  SMTP_USER: z.string().trim().optional(),
  SMTP_PASSWORD: z.string().optional(),
});

export interface ServerConfig {
  email: {
    provider: { kind: "resend"; apiKey: string } | { kind: "smtp"; host: string; port: number; user: string; password: string };
    /** CONTACT_EMAIL: if set, ALL forms go here instead of the routed inboxes (testing). */
    overrideTo: string[] | null;
    from: string;
    /** Reply-To of the visitor acknowledgment; null = the routed inbox. */
    replyTo: string | null;
  } | null;
  /** Why e-mail is not configured (for logs only). */
  emailIssue: string | null;
  autoReply: boolean;
  upstash: { url: string; token: string } | null;
  rateLimitSalt: string;
}

/** `Name <addr@domain>` or plain address. */
const FROM_RE = /^(?:[^<>\r\n]{1,80}<\s*[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+\s*>|[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)$/;

export function readServerConfig(env: Record<string, string | undefined> = process.env): ServerConfig {
  const e = envSchema.parse(env);
  let email: ServerConfig["email"] = null;
  let emailIssue: string | null = null;

  const override = e.CONTACT_EMAIL ? emailList.safeParse(e.CONTACT_EMAIL) : null;
  const port = Number(e.SMTP_PORT || 465);
  // Resend takes precedence; SMTP (e.g. Zoho Mail) is the alternative.
  const provider: NonNullable<ServerConfig["email"]>["provider"] | null = e.RESEND_API_KEY
    ? { kind: "resend", apiKey: e.RESEND_API_KEY }
    : e.SMTP_HOST && e.SMTP_USER && e.SMTP_PASSWORD && Number.isInteger(port) && port > 0
      ? { kind: "smtp", host: e.SMTP_HOST, port, user: e.SMTP_USER, password: e.SMTP_PASSWORD }
      : null;

  if (!provider) emailIssue = "No e-mail provider configured (RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASSWORD)";
  else if (override && !override.success) emailIssue = "CONTACT_EMAIL invalid";
  else if (!e.EMAIL_FROM || !FROM_RE.test(e.EMAIL_FROM)) emailIssue = "EMAIL_FROM missing or invalid";
  else {
    const replyTo = e.EMAIL_REPLY_TO && z.email().safeParse(e.EMAIL_REPLY_TO).success ? e.EMAIL_REPLY_TO : null;
    email = { provider, overrideTo: override?.success ? override.data : null, from: e.EMAIL_FROM, replyTo };
  }

  const upstash =
    e.UPSTASH_REDIS_REST_URL && e.UPSTASH_REDIS_REST_TOKEN && /^https:\/\//.test(e.UPSTASH_REDIS_REST_URL)
      ? { url: e.UPSTASH_REDIS_REST_URL.replace(/\/+$/, ""), token: e.UPSTASH_REDIS_REST_TOKEN }
      : null;

  return {
    email,
    emailIssue,
    autoReply: e.AUTO_REPLY_ENABLED && email !== null,
    upstash,
    rateLimitSalt: e.RATE_LIMIT_SALT || "snackora-rl-v1",
  };
}
