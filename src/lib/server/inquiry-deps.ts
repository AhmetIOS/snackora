import "server-only";
import { business } from "@/config/business";
import { createSmtpTransport } from "@/lib/email/smtp";
import { createResendTransport, type EmailTransport } from "@/lib/email/transport";
import type { InquiryDeps, Logger } from "@/lib/inquiry/process";
import { createMemoryRateLimiter, createUpstashRateLimiter, type RateLimiter } from "@/lib/security/rate-limit";
import { readServerConfig } from "./config";

/** Structured, PII-free logging (JSON lines → Vercel / any log drain). */
export const logger: Logger = {
  info: (event, data) => console.info(JSON.stringify({ level: "info", event, ...data })),
  warn: (event, data) => console.warn(JSON.stringify({ level: "warn", event, ...data })),
  error: (event, data) => console.error(JSON.stringify({ level: "error", event, ...data })),
};

let memoryLimiter: RateLimiter | null = null;
let warnedMemory = false;

export function getInquiryDeps(env: Record<string, string | undefined> = process.env): InquiryDeps {
  const config = readServerConfig(env);

  let limiter: RateLimiter;
  if (config.upstash) {
    limiter = createUpstashRateLimiter(config.upstash.url, config.upstash.token);
  } else {
    memoryLimiter ??= createMemoryRateLimiter();
    limiter = memoryLimiter;
    if (process.env.NODE_ENV === "production" && !warnedMemory) {
      warnedMemory = true;
      logger.warn("rate_limit.memory_fallback", { hint: "Set UPSTASH_REDIS_REST_URL/TOKEN for distributed rate limiting" });
    }
  }

  if (!config.email && config.emailIssue) logger.warn("email.not_configured", { reason: config.emailIssue });

  let transport: EmailTransport | null = null;
  if (config.email?.provider.kind === "resend") transport = createResendTransport(config.email.provider.apiKey);
  else if (config.email?.provider.kind === "smtp") transport = createSmtpTransport(config.email.provider);

  return {
    transport,
    email: config.email
      ? { inboxes: business.inboxes, overrideTo: config.email.overrideTo, from: config.email.from, replyTo: config.email.replyTo }
      : null,
    autoReply: config.autoReply,
    limiter,
    salt: config.rateLimitSalt,
    logger,
  };
}
