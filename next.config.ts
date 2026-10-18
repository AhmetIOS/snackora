import path from "node:path";
import type { NextConfig } from "next";
import { getLaunchIssues } from "./src/config/business";

const isProd = process.env.NODE_ENV === "production";

// Never publish silently with incomplete legal data: warn on every build.
if (process.argv.includes("build")) {
  const issues = getLaunchIssues();
  if (issues.length) {
    console.warn(`\n⚠ Snackora launch check – ${issues.length} offene Punkte (siehe LAUNCH_CHECKLIST.md):`);
    for (const i of issues) console.warn(`  • ${i}`);
    console.warn("");
  }
}

/**
 * Content-Security-Policy. Next.js injects inline scripts for streaming, so
 * script-src needs 'unsafe-inline' unless nonces are used (which would force
 * dynamic rendering of every page). Everything else is locked to 'self':
 * no third-party scripts, fonts, frames or connections exist on this site.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProd
    ? [
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ]
    : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    // Pin the root: a stray lockfile in a parent directory must not change module resolution.
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      {
        source: "/brand/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
  async redirects() {
    // Canonical host is the apex domain. On Vercel, also configure the
    // www → apex redirect in the project's Domains settings (see DEPLOYMENT.md);
    // this rule keeps the behaviour portable to other hosts.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.snackora.de" }],
        destination: "https://snackora.de/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
