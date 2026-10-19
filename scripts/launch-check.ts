// Pre-launch check: `npm run check:launch`
// Fails (exit 1) while launch-critical business/legal data is missing.
import { getLaunchIssues } from "../src/config/business.ts";

const issues = getLaunchIssues();
const envHints: string[] = [];
const hasProvider = Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD));
if (!hasProvider) envHints.push("RESEND_API_KEY oder SMTP_HOST/SMTP_USER/SMTP_PASSWORD");
for (const key of ["EMAIL_FROM", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]) {
  if (!process.env[key]) envHints.push(key);
}

if (issues.length === 0) {
  console.log("✔ Geschäfts- und Rechtsangaben vollständig.");
} else {
  console.log("✖ Vor dem Livegang offen:");
  for (const i of issues) console.log(`  • ${i}`);
}
if (envHints.length) {
  console.log(`\nℹ In dieser Umgebung nicht gesetzt (in Vercel prüfen): ${envHints.join(", ")}`);
}
process.exit(issues.length ? 1 : 0);
