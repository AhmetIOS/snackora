import { gaDebugMode, gaMeasurementId } from "@/config/analytics";
import type { AnalyticsEvent } from "./events";

/**
 * Thin client-side wrapper around gtag.js. Every call is a no-op unless
 * analytics is configured AND gtag has been loaded after consent
 * (see components/analytics/google-analytics.tsx).
 */

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

/** Defines window.gtag and the consent defaults. Safe to call repeatedly. */
export function initGtag(id: string) {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // gtag.js expects the `arguments` object, not an array
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    // Consent Mode v2: advertising is always denied – this site runs no ads tags.
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });
    window.gtag("js", new Date());
    window.gtag("config", id, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ...(gaDebugMode ? { debug_mode: true } : {}),
    });
  } else {
    // consent given again after a withdrawal on the same page view
    window.gtag("consent", "update", { analytics_storage: "granted" });
  }
  window[`ga-disable-${id}`] = false;
}

/** Consent withdrawn: stop all hits immediately and remove the GA cookies. */
export function disableGtag(id: string) {
  window[`ga-disable-${id}`] = true;
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  deleteGaCookies();
}

export function deleteGaCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0]?.trim();
    if (!name || !(name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name.startsWith("_gat"))) continue;
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}; SameSite=Lax`;
    }
  }
}

export function trackEvents(events: AnalyticsEvent[]) {
  if (!gaMeasurementId || typeof window === "undefined" || !window.gtag) return;
  if (window[`ga-disable-${gaMeasurementId}`]) return;
  for (const e of events) window.gtag("event", e.name, e.params);
}
