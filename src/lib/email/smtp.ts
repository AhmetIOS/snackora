import "server-only";
import { EmailDeliveryError, type EmailTransport } from "./transport";

export interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  password: string;
}

/**
 * SMTP transport (e.g. Zoho Mail: smtppro.zoho.eu:465 with an app-specific
 * password). nodemailer is loaded lazily so Resend-only deployments never
 * load it. SMTP has no provider-side idempotency – duplicate submits are
 * prevented by the form UI and rate limits.
 */
export function createSmtpTransport(settings: SmtpSettings): EmailTransport {
  return {
    name: "smtp",
    async send(message) {
      const { createTransport } = await import("nodemailer");
      const transporter = createTransport({
        host: settings.host,
        port: settings.port,
        secure: settings.port === 465,
        requireTLS: settings.port !== 465,
        auth: { user: settings.user, pass: settings.password },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      });
      try {
        const info = await transporter.sendMail({
          from: message.from,
          to: message.to,
          replyTo: message.replyTo,
          subject: message.subject,
          html: message.html,
          text: message.text,
          ...(message.idempotencyKey ? { messageId: `<${message.idempotencyKey}@snackora.de>` } : {}),
        });
        return { id: info.messageId ?? "smtp" };
      } catch (err) {
        const code = (err as { responseCode?: number; code?: string }).responseCode ?? (err as { code?: string }).code;
        // Never include the server response text: it may contain addresses.
        throw new EmailDeliveryError(`SMTP delivery failed (${code ?? "unknown"})`, typeof code === "number" ? code : undefined, true);
      } finally {
        transporter.close();
      }
    },
  };
}
