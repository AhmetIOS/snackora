"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import { gaMeasurementId } from "@/config/analytics";
import { getConsent, subscribeConsent, type ConsentSnapshot } from "@/lib/consent/consent";
import { contactClickEvent } from "@/lib/analytics/events";
import { disableGtag, initGtag, trackEvents } from "@/lib/analytics/gtag";

const serverSnapshot = (): ConsentSnapshot => "unknown";

export function useConsent(): ConsentSnapshot {
  return useSyncExternalStore(subscribeConsent, getConsent, serverSnapshot);
}

/**
 * Loads gtag.js only after the visitor opted in to statistics. Page views
 * (including client-side navigations) are recorded by GA4's enhanced
 * measurement ("page changes based on browser history events"), so no
 * manual page_view is sent here – that would double-count.
 */
export function GoogleAnalytics() {
  const consent = useConsent();
  const granted = consent !== "unknown" && consent?.analytics === true;

  useEffect(() => {
    if (!gaMeasurementId) return;
    if (granted) initGtag(gaMeasurementId);
    else if (consent !== "unknown" && window.gtag) disableGtag(gaMeasurementId);
  }, [granted, consent]);

  // click_email / click_phone – one delegated listener for all mailto:/tel: links
  useEffect(() => {
    if (!granted) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a) return;
      const event = contactClickEvent(a.getAttribute("href") ?? "", window.location.pathname);
      if (event) trackEvents([event]);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [granted]);

  if (!gaMeasurementId || !granted) return null;
  return <Script id="gtag-js" src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />;
}
