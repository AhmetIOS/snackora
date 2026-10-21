/**
 * Google Analytics 4 configuration.
 *
 * ▸ Analytics is OFF unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set. Set it in
 *   Vercel for the **Production** environment only, so preview and local
 *   builds never send data to the production property.
 * ▸ Without an ID the site behaves exactly as before: no consent banner,
 *   no third-party requests, privacy policy without an analytics section.
 * ▸ With an ID, gtag.js is only loaded after the visitor has opted in
 *   (consent banner, § 25 TDDDG / Art. 6 Abs. 1 lit. a DSGVO).
 */

const raw = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();

/** GA4 measurement ID (e.g. "G-ABC123XYZ9"), or null if analytics is disabled. */
export const gaMeasurementId: string | null = /^G-[A-Z0-9]{4,20}$/.test(raw) ? raw : null;

export const analyticsEnabled = gaMeasurementId !== null;

/** Sends events with debug_mode so they show up in GA4 DebugView. */
export const gaDebugMode = process.env.NEXT_PUBLIC_GA_DEBUG === "true";

/** Origins gtag.js needs – used by the Content-Security-Policy in next.config.ts. */
export const gaCspSources = {
  script: ["https://www.googletagmanager.com"],
  connect: ["https://*.google-analytics.com", "https://*.analytics.google.com", "https://*.googletagmanager.com"],
  img: ["https://*.google-analytics.com", "https://*.googletagmanager.com"],
} as const;
