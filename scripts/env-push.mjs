// Pushes environment variables from a local, git-ignored file to Vercel.
//
//   npm run env:push                         Production only
//   npm run env:push -- --preview            Production + Preview
//   npm run env:push -- --redeploy           …then redeploy the current production build
//   npm run env:push -- --remove-empty       delete variables whose value is empty
//   npm run env:push -- --dry-run            show what would happen, change nothing
//   npm run env:push -- --file other.local   use another source file
//
// Requirements (once): `npx vercel login` and `npx vercel link` in the project folder.
// Values are passed to the Vercel CLI via stdin and are never printed.

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERCEL = ["-y", "vercel@64.5.0"];
const SECRETS = new Set(["RESEND_API_KEY", "UPSTASH_REDIS_REST_TOKEN", "RATE_LIMIT_SALT", "SMTP_PASSWORD", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"]);

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const fileArg = args.indexOf("--file");
const file = join(root, fileArg >= 0 ? args[fileArg + 1] : ".env.vercel.local");
const targets = flag("--preview") ? ["production", "preview"] : ["production"];
const dryRun = flag("--dry-run");

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function vercel(cliArgs, input) {
  const res = spawnSync("npx", [...VERCEL, ...cliArgs, "--non-interactive"], {
    cwd: root,
    input,
    encoding: "utf8",
    env: { ...process.env, VERCEL_TELEMETRY_DISABLED: "1" },
  });
  return { ok: res.status === 0, out: `${res.stdout ?? ""}${res.stderr ?? ""}` };
}

/** Minimal dotenv parser: KEY=VALUE, # comments, optional quotes. */
function parse(text) {
  const vars = new Map();
  for (const [i, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) fail(`${file}:${i + 1}: expected KEY=VALUE`);
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) fail(`${file}:${i + 1}: invalid variable name "${key}"`);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    vars.set(key, value);
  }
  return vars;
}

// ── preflight ────────────────────────────────────────────────────────────────
if (!existsSync(file)) fail(`${file} not found. Create it with: cp .env.vercel.example .env.vercel.local`);
// `vercel link` writes project.json (classic) or repo.json (git-linked, newer CLI)
if (!existsSync(join(root, ".vercel/project.json")) && !existsSync(join(root, ".vercel/repo.json")))
  fail("Project is not linked. Run once: npx vercel login && npx vercel link");

const tracked = spawnSync("git", ["ls-files", "--error-unmatch", file], { cwd: root });
if (tracked.status === 0) fail(`${file} is tracked by git – remove it from the repository first (it contains secrets).`);

const vars = parse(readFileSync(file, "utf8"));
const known = new Set(parse(readFileSync(join(root, ".env.vercel.example"), "utf8")).keys());
for (const key of vars.keys()) if (!known.has(key) && !key.startsWith("SMTP_")) console.warn(`⚠ ${key} is not in .env.vercel.example (typo?)`);

const site = vars.get("NEXT_PUBLIC_SITE_URL");
if (site && !/^https:\/\/[^/]+$/.test(site)) fail("NEXT_PUBLIC_SITE_URL must look like https://snackora.de (no trailing slash)");
if (vars.get("CONTACT_EMAIL") && targets.includes("production"))
  console.warn("⚠ CONTACT_EMAIL is set: ALL forms will go to that address instead of kontakt@/standort@.");

// ── push ─────────────────────────────────────────────────────────────────────
let changed = 0;
let failed = 0;
for (const [key, value] of vars) {
  for (const target of targets) {
    const label = `${key} → ${target}`;
    if (!value) {
      if (!flag("--remove-empty")) {
        console.log(`· ${label}: empty, skipped`);
        continue;
      }
      if (dryRun) {
        console.log(`~ ${label}: would remove`);
        continue;
      }
      const res = vercel(["env", "rm", key, target, "-y"]);
      console.log(res.ok ? `− ${label}: removed` : `· ${label}: not present`);
      if (res.ok) changed++;
      continue;
    }
    const secret = SECRETS.has(key);
    const shown = secret ? "••••" : value;
    if (dryRun) {
      console.log(`~ ${label}: would set ${shown}${secret ? " (sensitive)" : ""}`);
      continue;
    }
    const res = vercel(["env", "add", key, target, "--force", secret ? "--sensitive" : "--no-sensitive"], value);
    if (res.ok) {
      changed++;
      console.log(`✓ ${label}: ${shown}${secret ? " (sensitive)" : ""}`);
    } else {
      failed++;
      // CLI output never contains the value (it was sent via stdin)
      console.error(`✖ ${label}: failed\n${res.out.trim().split("\n").slice(-3).join("\n")}`);
    }
  }
}

console.log(`\n${dryRun ? "Dry run – nothing changed." : `${changed} change(s), ${failed} error(s).`}`);
if (failed) process.exit(1);

// ── redeploy ─────────────────────────────────────────────────────────────────
if (flag("--redeploy") && !dryRun) {
  const list = vercel(["list", "--environment", "production", "--status", "READY", "--json", "--limit", "1"]);
  const match = list.out.match(/"url"\s*:\s*"([^"]+)"/);
  if (!list.ok || !match) fail("Could not find the current production deployment – redeploy it in the Vercel dashboard.");
  console.log(`\nRedeploying ${match[1]} …`);
  const res = vercel(["redeploy", match[1], "--target", "production"]);
  console.log(res.ok ? "✓ Redeploy finished." : `✖ Redeploy failed:\n${res.out.trim().split("\n").slice(-5).join("\n")}`);
  if (!res.ok) process.exit(1);
} else if (changed && !dryRun) {
  console.log("Environment changes apply after the next deployment: run with --redeploy or push a commit.");
}
