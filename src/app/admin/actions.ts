"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, SESSION_TTL_SECONDS, createSessionValue, passwordMatches, readAdminConfig } from "@/lib/admin/session";
import { createMemoryRateLimiter, createUpstashRateLimiter, hashKey, type RateLimiter } from "@/lib/security/rate-limit";
import { readServerConfig } from "@/lib/server/config";

export interface LoginState {
  error?: string;
}

/** 10 attempts per 15 minutes and IP – shared across instances via Upstash in production. */
const LOGIN_LIMIT = { limit: 10, window: 15 * 60 };
let memoryLimiter: RateLimiter | null = null;

function limiter(): { limiter: RateLimiter; salt: string } {
  const config = readServerConfig();
  if (config.upstash) return { limiter: createUpstashRateLimiter(config.upstash.url, config.upstash.token), salt: config.rateLimitSalt };
  memoryLimiter ??= createMemoryRateLimiter();
  return { limiter: memoryLimiter, salt: config.rateLimitSalt };
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const config = readAdminConfig();
  if (!config) return { error: "Admin girişi yapılandırılmamış (ADMIN_PASSWORD / ADMIN_SESSION_SECRET)." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const { limiter: rl, salt } = limiter();
  try {
    const hit = await rl.hit(`admin-login:${await hashKey(ip, salt)}`, LOGIN_LIMIT.limit, LOGIN_LIMIT.window);
    if (!hit.allowed) return { error: `Çok fazla deneme. Lütfen ${Math.ceil(hit.retryAfterSeconds / 60)} dakika sonra tekrar deneyin.` };
  } catch {
    // limiter unavailable – fail closed
    return { error: "Giriş şu anda mümkün değil. Lütfen daha sonra tekrar deneyin." };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || !passwordMatches(password, config)) return { error: "Şifre yanlış." };

  (await cookies()).set(ADMIN_COOKIE, createSessionValue(config), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin");
}
