/**
 * E-mail transport boundary. Application code only depends on
 * `EmailTransport`; the provider (Resend) is one implementation and tests
 * inject an in-memory one. Swapping providers = adding one file here.
 */

export interface EmailMessage {
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  /** Provider-side de-duplication key (retries / double submits). */
  idempotencyKey?: string;
  tags?: { name: string; value: string }[];
}

export interface EmailTransport {
  readonly name: string;
  send(message: EmailMessage): Promise<{ id: string }>;
}

export class EmailDeliveryError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly retryable = false
  ) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

/** Resend REST API (https://resend.com/docs/api-reference/emails/send-email). */
export function createResendTransport(apiKey: string, fetchImpl: typeof fetch = fetch): EmailTransport {
  return {
    name: "resend",
    async send(message) {
      let res: Response;
      try {
        res = await fetchImpl("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            ...(message.idempotencyKey ? { "Idempotency-Key": message.idempotencyKey } : {}),
          },
          body: JSON.stringify({
            from: message.from,
            to: message.to,
            subject: message.subject,
            html: message.html,
            text: message.text,
            ...(message.replyTo ? { reply_to: message.replyTo } : {}),
            ...(message.tags ? { tags: message.tags } : {}),
          }),
          signal: AbortSignal.timeout(10_000),
        });
      } catch (err) {
        throw new EmailDeliveryError(`Resend request failed: ${(err as Error).name}`, undefined, true);
      }
      if (!res.ok) {
        // Provider error bodies may echo recipient data – log only the status.
        throw new EmailDeliveryError(`Resend responded with HTTP ${res.status}`, res.status, res.status >= 500 || res.status === 429);
      }
      const data = (await res.json().catch(() => ({}))) as { id?: string };
      return { id: data.id ?? "unknown" };
    },
  };
}

/** In-memory transport for tests. */
export function createMemoryTransport(options: { fail?: boolean | ((m: EmailMessage) => boolean) } = {}) {
  const sent: EmailMessage[] = [];
  const transport: EmailTransport & { sent: EmailMessage[] } = {
    name: "memory",
    sent,
    async send(message) {
      const shouldFail = typeof options.fail === "function" ? options.fail(message) : options.fail;
      if (shouldFail) throw new EmailDeliveryError("Simulated failure", 500, true);
      sent.push(message);
      return { id: `mem_${sent.length}` };
    },
  };
  return transport;
}
