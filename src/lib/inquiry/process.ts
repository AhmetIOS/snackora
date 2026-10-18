import { renderAcknowledgment, renderNotification, type InquiryRecord } from "@/lib/email/templates";
import type { EmailTransport } from "@/lib/email/transport";
import { RATE_LIMITS, hashKey, type RateLimiter } from "@/lib/security/rate-limit";
import { envelopeSchema, formSchemas, type ApiResponse, type InquiryData } from "./schema";

/**
 * Inquiry pipeline – framework-independent so it can be unit-tested and
 * reused (e.g. by a future CRM integration or another hosting platform).
 *
 *   parse → spam checks → validate → rate limit → send → acknowledge
 *
 * Success is only reported after the e-mail provider accepted the
 * business notification.
 */

export interface Logger {
  info(event: string, data?: Record<string, unknown>): void;
  warn(event: string, data?: Record<string, unknown>): void;
  error(event: string, data?: Record<string, unknown>): void;
}

export interface InquiryDeps {
  transport: EmailTransport | null;
  email: { to: string[]; from: string; replyTo: string } | null;
  autoReply: boolean;
  limiter: RateLimiter;
  salt: string;
  logger: Logger;
  now?: () => Date;
  /** Minimum time between form render and submit (bot heuristic). */
  minFillMs?: number;
}

export interface InquiryResult {
  status: number;
  body: ApiResponse;
  headers?: Record<string, string>;
}

const MESSAGES = {
  bad_request: "Ihre Anfrage konnte nicht verarbeitet werden. Bitte laden Sie die Seite neu und versuchen Sie es erneut.",
  validation: "Bitte prüfen Sie die markierten Felder.",
  too_fast: "Das ging schneller als erwartet. Bitte prüfen Sie Ihre Angaben und senden Sie das Formular erneut ab.",
  rate_limited: "Sie haben in kurzer Zeit mehrere Anfragen gesendet. Bitte versuchen Sie es später noch einmal.",
  unavailable: "Das Formular ist vorübergehend nicht verfügbar. Ihre Angaben bleiben erhalten – bitte versuchen Sie es später erneut.",
  delivery_failed: "Ihre Anfrage konnte gerade nicht zugestellt werden. Ihre Angaben bleiben erhalten – bitte versuchen Sie es in einem Moment erneut.",
  server_error: "Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.",
} as const;

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createInquiryId(now: Date): string {
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, "");
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const rand = Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join("");
  return `SNK-${ymd}-${rand}`;
}

function fail(status: number, error: Exclude<ApiResponse, { ok: true }>["error"], extra: Partial<Exclude<ApiResponse, { ok: true }>> = {}, headers?: Record<string, string>): InquiryResult {
  const message = extra.message ?? (MESSAGES as Record<string, string>)[error] ?? MESSAGES.server_error;
  return { status, body: { ok: false, error, message, ...(extra.fieldErrors ? { fieldErrors: extra.fieldErrors } : {}) }, headers };
}

export async function processInquiry(body: unknown, ctx: { ip: string }, deps: InquiryDeps): Promise<InquiryResult> {
  const now = deps.now ?? (() => new Date());
  const minFill = deps.minFillMs ?? 2500;

  // 1. Envelope
  const env = envelopeSchema.safeParse(body);
  if (!env.success) return fail(400, "bad_request");
  const { form, fields, meta } = env.data;

  // 2. Honeypot – silently accept and drop (do not teach bots what failed).
  if (meta.website.trim() !== "") {
    deps.logger.warn("inquiry.spam.honeypot", { form });
    return { status: 200, body: { ok: true, inquiryId: createInquiryId(now()) } };
  }

  // 3. Fill-time heuristic
  const elapsed = now().getTime() - meta.startedAt;
  if (elapsed < minFill || elapsed > 1000 * 60 * 60 * 24 * 7) {
    deps.logger.warn("inquiry.spam.timing", { form, elapsedMs: elapsed });
    return fail(400, "too_fast");
  }

  // 4. Validation
  const parsed = formSchemas[form].safeParse(fields);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fail(422, "validation", { fieldErrors });
  }
  const data = { form, fields: parsed.data } as InquiryData;

  // 5. Rate limits (pseudonymised keys)
  try {
    const ipKey = await hashKey(ctx.ip || "unknown", deps.salt);
    const checks = await Promise.all([
      deps.limiter.hit(`ip:${ipKey}:short`, RATE_LIMITS.perIpShort.limit, RATE_LIMITS.perIpShort.window),
      deps.limiter.hit(`ip:${ipKey}:day`, RATE_LIMITS.perIpDay.limit, RATE_LIMITS.perIpDay.window),
      deps.limiter.hit("global:day", RATE_LIMITS.globalDay.limit, RATE_LIMITS.globalDay.window),
    ]);
    const blocked = checks.find((c) => !c.allowed);
    if (blocked) {
      deps.logger.warn("inquiry.rate_limited", { form, limit: blocked.limit });
      return fail(429, "rate_limited", {}, { "Retry-After": String(blocked.retryAfterSeconds) });
    }
  } catch (err) {
    // Fail open for availability, but make it visible in logs.
    deps.logger.error("inquiry.rate_limit.unavailable", { reason: (err as Error).message });
  }

  // 6. Delivery
  if (!deps.transport || !deps.email) {
    deps.logger.error("inquiry.email.not_configured", { form });
    return fail(503, "unavailable");
  }

  const record: InquiryRecord = { id: createInquiryId(now()), createdAt: now(), data };
  const notification = renderNotification(record);
  try {
    const res = await deps.transport.send({
      from: deps.email.from,
      to: deps.email.to,
      replyTo: data.fields.email,
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
      idempotencyKey: `inquiry-${meta.submissionId}`,
      tags: [{ name: "form", value: form }],
    });
    deps.logger.info("inquiry.delivered", { form, inquiryId: record.id, providerId: res.id });
  } catch (err) {
    deps.logger.error("inquiry.email.failed", { form, inquiryId: record.id, reason: (err as Error).message });
    return fail(502, "delivery_failed");
  }

  // 7. Optional acknowledgment – never affects the result.
  if (deps.autoReply) {
    try {
      const emailKey = await hashKey(data.fields.email, deps.salt);
      const quota = await deps.limiter.hit(
        `ack:${emailKey}`,
        RATE_LIMITS.autoReplyPerAddressDay.limit,
        RATE_LIMITS.autoReplyPerAddressDay.window
      );
      if (quota.allowed) {
        const ack = renderAcknowledgment(record);
        await deps.transport.send({
          from: deps.email.from,
          to: [data.fields.email],
          replyTo: deps.email.replyTo,
          subject: ack.subject,
          html: ack.html,
          text: ack.text,
          idempotencyKey: `ack-${meta.submissionId}`,
          tags: [{ name: "form", value: `${form}-ack` }],
        });
      } else {
        deps.logger.warn("inquiry.ack.skipped_quota", { inquiryId: record.id });
      }
    } catch (err) {
      deps.logger.warn("inquiry.ack.failed", { inquiryId: record.id, reason: (err as Error).message });
    }
  }

  return { status: 200, body: { ok: true, inquiryId: record.id } };
}
