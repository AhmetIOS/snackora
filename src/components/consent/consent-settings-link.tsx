"use client";

import { analyticsEnabled } from "@/config/analytics";
import { openConsentSettings } from "@/lib/consent/consent";

/** "Cookie-Einstellungen" – reopens the consent banner. Hidden when analytics is off. */
export function ConsentSettingsLink({ className, children = "Cookie-Einstellungen" }: { className?: string; children?: React.ReactNode }) {
  if (!analyticsEnabled) return null;
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {children}
    </button>
  );
}
