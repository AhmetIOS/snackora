import { siteUrl } from "@/config/site";
import { processInquiry, type InquiryResult } from "@/lib/inquiry/process";
import { getInquiryDeps, logger } from "@/lib/server/inquiry-deps";

/**
 * POST /api/inquiry – receives all website forms (Anfrage, Standort, Kontakt).
 * Transport-level checks live here; business logic in lib/inquiry/process.ts.
 */

const MAX_BODY_BYTES = 16 * 1024;

function json(result: InquiryResult): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store", ...result.headers },
  });
}

function reject(status: number, error: "bad_request" | "forbidden" | "too_large", message: string): Response {
  return json({ status, body: { ok: false, error, message } });
}

/** Same-origin check: browsers always send Origin on cross-site and fetch POSTs. */
function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const allowed = new Set([new URL(siteUrl).host, `www.${new URL(siteUrl).host}`]);
  if (host) allowed.add(host);
  return allowed.has(originHost);
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request): Promise<Response> {
  if (!isAllowedOrigin(request)) {
    logger.warn("inquiry.forbidden_origin");
    return reject(403, "forbidden", "Anfrage nicht erlaubt.");
  }
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return reject(400, "bad_request", "Ungültiges Anfrageformat.");
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return reject(413, "too_large", "Die Anfrage ist zu groß.");

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return reject(400, "bad_request", "Ungültige Anfrage.");
  }
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return reject(413, "too_large", "Die Anfrage ist zu groß.");

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return reject(400, "bad_request", "Ungültige Anfrage.");
  }

  try {
    const result = await processInquiry(body, { ip: clientIp(request) }, getInquiryDeps());
    return json(result);
  } catch (err) {
    logger.error("inquiry.unhandled", { reason: (err as Error).message });
    return json({
      status: 500,
      body: { ok: false, error: "server_error", message: "Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut." },
    });
  }
}
