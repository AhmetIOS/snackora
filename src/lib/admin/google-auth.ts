import "server-only";
import { execFile } from "node:child_process";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { headers } from "next/headers";

/**
 * Short-lived Google access token for the read-only admin dashboard – keyless.
 *
 *   Production (Vercel): the function's OIDC token (header x-vercel-oidc-token)
 *   is exchanged at Google STS via Workload Identity Federation, then used to
 *   impersonate the integration service account. Google only accepts tokens for
 *   `owner:ahmetios-projects:project:snackora:environment:production`.
 *   Local development: `gcloud auth print-access-token --impersonate-service-account`.
 *
 * Only read-only scopes are requested. See GOOGLE_INTEGRATION_NOTES.md.
 */

const PROJECT_NUMBER = "524824191370";
const WIF_AUDIENCE = `//iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/vercel/providers/snackora`;
export const SERVICE_ACCOUNT = "snackora-integrations@snackora-web-integrations.iam.gserviceaccount.com";
const SCOPES = ["https://www.googleapis.com/auth/analytics.readonly", "https://www.googleapis.com/auth/webmasters.readonly"];

let cached: { token: string; expiresAt: number } | null = null;

export class GoogleAuthError extends Error {}

export async function getGoogleAccessToken(): Promise<string> {
  if (cached && cached.expiresAt - Date.now() > 5 * 60_000) return cached.token;
  cached = process.env.VERCEL ? await viaWorkloadIdentity() : await viaGcloud();
  return cached.token;
}

async function viaWorkloadIdentity(): Promise<{ token: string; expiresAt: number }> {
  const oidc = (await headers()).get("x-vercel-oidc-token") ?? process.env.VERCEL_OIDC_TOKEN;
  if (!oidc) throw new GoogleAuthError("Vercel OIDC token missing (is OIDC federation enabled for the project?)");

  const sts = await fetch("https://sts.googleapis.com/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grantType: "urn:ietf:params:oauth:grant-type:token-exchange",
      audience: WIF_AUDIENCE,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      requestedTokenType: "urn:ietf:params:oauth:token-type:access_token",
      subjectTokenType: "urn:ietf:params:oauth:token-type:jwt",
      subjectToken: oidc,
    }),
    cache: "no-store",
  });
  const federated = (await sts.json()) as { access_token?: string; error_description?: string };
  if (!sts.ok || !federated.access_token) throw new GoogleAuthError(`STS: ${federated.error_description ?? sts.status}`);

  const res = await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SERVICE_ACCOUNT}:generateAccessToken`, {
    method: "POST",
    headers: { Authorization: `Bearer ${federated.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ scope: SCOPES, lifetime: "3600s" }),
    cache: "no-store",
  });
  const sa = (await res.json()) as { accessToken?: string; expireTime?: string; error?: { message?: string } };
  if (!res.ok || !sa.accessToken) throw new GoogleAuthError(`IAM: ${sa.error?.message ?? res.status}`);
  return { token: sa.accessToken, expiresAt: sa.expireTime ? Date.parse(sa.expireTime) : Date.now() + 3_000_000 };
}

async function viaGcloud(): Promise<{ token: string; expiresAt: number }> {
  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_ALLOW_GCLOUD) {
    throw new GoogleAuthError("No Google credentials outside Vercel");
  }
  const local = path.join(homedir(), ".local/share/google-cloud-sdk/bin/gcloud");
  try {
    const { stdout } = await promisify(execFile)(local, ["auth", "print-access-token", `--impersonate-service-account=${SERVICE_ACCOUNT}`, `--scopes=${SCOPES.join(",")}`]);
    return { token: stdout.trim(), expiresAt: Date.now() + 50 * 60_000 };
  } catch {
    throw new GoogleAuthError("gcloud token failed – run `gcloud auth login` as info@snackora.de");
  }
}
