import type { Metadata } from "next";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { DEFAULT_RANGE, getDashboardData, isRangeKey } from "@/lib/admin/analytics";
import { ADMIN_COOKIE, isValidSession, readAdminConfig } from "@/lib/admin/session";
import { Dashboard } from "./dashboard";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Yönetim paneli",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="container-site py-10 sm:py-14">
      <Suspense
        fallback={
          <p className="flex items-center gap-2 text-ink/70">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Yükleniyor…
          </p>
        }
      >
        <AdminGate searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** Session read at request time – behind the Suspense boundary (cacheComponents). */
async function AdminGate({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  // Request-time only: session expiry uses the clock, and prefetches must never trigger Google API calls.
  await connection();
  const config = readAdminConfig();
  if (!config) {
    return (
      <div className="mx-auto max-w-md rounded-panel border border-line bg-paper p-7">
        <h1 className="text-3xl">Yönetim paneli</h1>
        <p className="mt-3 text-ink/75">Panel henüz yapılandırılmamış: Vercel&apos;de ADMIN_PASSWORD ve ADMIN_SESSION_SECRET ayarlanmalı.</p>
      </div>
    );
  }
  const session = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isValidSession(session, config)) return <LoginForm />;

  const { range } = await searchParams;
  const data = await getDashboardData(isRangeKey(range) ? range : DEFAULT_RANGE);
  return <Dashboard data={data} />;
}
