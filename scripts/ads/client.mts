/**
 * Minimal Google Ads API (REST) client for Snackora's own account.
 *
 * Auth: keyless – a short-lived token minted via gcloud impersonation of the integration
 * service account (same as `report:google` / `report:keywords`). The service account is a
 * "Standard" user in the Ads account; the Cloud project has Explorer access.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

export const CUSTOMER_ID = "3809905237";
export const API = "https://googleads.googleapis.com/v26";
const SA = "snackora-integrations@snackora-web-integrations.iam.gserviceaccount.com";
const PROJECT = "snackora-web-integrations";
const SCOPE = "https://www.googleapis.com/auth/adwords";

function gcloudEnv(): NodeJS.ProcessEnv {
  if (process.env.CLOUDSDK_PYTHON) return process.env;
  const dir = path.join(homedir(), ".local/share/uv/python");
  const py = existsSync(dir)
    ? readdirSync(dir)
        .filter((d) => /^cpython-3\.1\d/.test(d))
        .map((d) => path.join(dir, d, "bin", `python${d.match(/^cpython-(3\.\d+)/)?.[1]}`))
        .find(existsSync)
    : undefined;
  return py ? { ...process.env, CLOUDSDK_PYTHON: py } : process.env;
}

let cached: string | undefined;
function token(): string {
  if (cached) return cached;
  const local = path.join(homedir(), ".local/share/google-cloud-sdk/bin/gcloud");
  try {
    cached = execFileSync(existsSync(local) ? local : "gcloud", ["auth", "print-access-token", `--impersonate-service-account=${SA}`, `--scopes=${SCOPE}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      env: gcloudEnv(),
    }).trim();
    return cached;
  } catch {
    console.error("✖ Kein Token. Bitte `gcloud auth login` (info@snackora.de) ausführen.");
    process.exit(1);
  }
}

export async function call<R = unknown>(pathname: string, body: unknown): Promise<R> {
  const res = await fetch(`${API}/${pathname}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "x-goog-user-project": PROJECT, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const details = json.error?.details?.[0]?.errors ?? [];
    const msg = details.length
      ? details.map((e: { errorCode: unknown; message: string; location?: unknown }) => `${JSON.stringify(e.errorCode)} ${e.message} ${e.location ? JSON.stringify(e.location) : ""}`).join("\n")
      : json.error?.message;
    throw new Error(`${res.status}\n${msg}`);
  }
  return json as R;
}

/** A GAQL result row – deeply nested, shape depends on the SELECT clause. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

/** GAQL search with paging. */
export async function search<T = Row>(query: string): Promise<T[]> {
  const rows: T[] = [];
  let pageToken: string | undefined;
  do {
    const r = await call<{ results?: T[]; nextPageToken?: string }>(`customers/${CUSTOMER_ID}/googleAds:search`, { query, pageToken });
    rows.push(...(r.results ?? []));
    pageToken = r.nextPageToken;
  } while (pageToken);
  return rows;
}

export async function mutate(mutateOperations: unknown[], validateOnly: boolean) {
  return call<{ mutateOperationResponses?: unknown[] }>(`customers/${CUSTOMER_ID}/googleAds:mutate`, { mutateOperations, validateOnly });
}

export const eur = (micros: number | string | undefined) => (micros == null ? "–" : `${(Number(micros) / 1e6).toFixed(2).replace(".", ",")} €`);
export const micros = (euro: number) => String(Math.round(euro * 1e6));
