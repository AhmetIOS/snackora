/**
 * Fixed-window rate limiting.
 *
 * Production: Upstash Redis via its REST API (works across all serverless
 * instances, no SDK needed). Without Upstash credentials an in-memory
 * limiter is used – it only protects a single warm instance and is meant
 * for local development; the launch checklist requires Upstash.
 */

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  readonly kind: "upstash" | "memory";
  hit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
}

export function createMemoryRateLimiter(now: () => number = Date.now): RateLimiter {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return {
    kind: "memory",
    async hit(key, limit, windowSeconds) {
      const t = now();
      if (buckets.size > 10_000) {
        for (const [k, b] of buckets) if (b.resetAt <= t) buckets.delete(k);
      }
      let b = buckets.get(key);
      if (!b || b.resetAt <= t) {
        b = { count: 0, resetAt: t + windowSeconds * 1000 };
        buckets.set(key, b);
      }
      b.count += 1;
      return {
        allowed: b.count <= limit,
        count: b.count,
        limit,
        retryAfterSeconds: Math.max(1, Math.ceil((b.resetAt - t) / 1000)),
      };
    },
  };
}

export function createUpstashRateLimiter(url: string, token: string, fetchImpl: typeof fetch = fetch): RateLimiter {
  return {
    kind: "upstash",
    async hit(key, limit, windowSeconds) {
      const k = `snackora:rl:${key}`;
      const res = await fetchImpl(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          ["SET", k, "0", "EX", String(windowSeconds), "NX"],
          ["INCR", k],
          ["TTL", k],
        ]),
        signal: AbortSignal.timeout(4_000),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
      const out = (await res.json()) as { result?: unknown; error?: string }[];
      const count = Number(out[1]?.result);
      const ttl = Number(out[2]?.result);
      if (!Number.isFinite(count)) throw new Error("Upstash: unexpected response");
      return { allowed: count <= limit, count, limit, retryAfterSeconds: ttl > 0 ? ttl : windowSeconds };
    },
  };
}

/** Pseudonymises identifiers (IP, e-mail) before they are used as keys. */
export async function hashKey(value: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${value.toLowerCase()}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Abuse policy – adjust here. */
export const RATE_LIMITS = {
  perIpShort: { limit: 5, window: 10 * 60 },
  perIpDay: { limit: 20, window: 24 * 60 * 60 },
  globalDay: { limit: 300, window: 24 * 60 * 60 },
  autoReplyPerAddressDay: { limit: 3, window: 24 * 60 * 60 },
} as const;
