"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Cookie } from "lucide-react";
import { analyticsEnabled } from "@/config/analytics";
import { onOpenConsentSettings, setConsent } from "@/lib/consent/consent";
import { useConsent } from "@/components/analytics/google-analytics";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Consent banner (TDDDG § 25 / DSGVO Art. 6 Abs. 1 lit. a).
 *
 *   ▸ Non-blocking: the site stays fully usable, nothing is preselected.
 *   ▸ "Ablehnen" and "Akzeptieren" are equally prominent, one click each.
 *   ▸ Reopened at any time via "Cookie-Einstellungen" in the footer –
 *     withdrawing is as easy as giving consent.
 *   ▸ Only rendered when analytics is configured (see config/analytics.ts).
 */
export function ConsentBanner() {
  if (!analyticsEnabled) return null;
  return <Banner />;
}

function Banner() {
  const consent = useConsent();
  const [forcedOpen, setForcedOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [statistics, setStatistics] = useState(false);
  const titleId = useId();
  const descId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(
    () =>
      onOpenConsentSettings(() => {
        const current = consent !== "unknown" ? consent : null;
        setStatistics(current?.analytics ?? false);
        setDetails(true);
        setForcedOpen(true);
        requestAnimationFrame(() => titleRef.current?.focus());
      }),
    [consent]
  );

  const open = consent !== "unknown" && (consent === null || forcedOpen);
  if (!open) return null;

  const decide = (analytics: boolean) => {
    setConsent(analytics);
    setForcedOpen(false);
    setDetails(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={descId}
      data-testid="consent-banner"
      className="anim-fade-up fixed inset-x-3 bottom-3 z-[90] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[27rem]"
    >
      <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain rounded-panel border border-line bg-paper p-5 text-ink shadow-[0_24px_60px_-20px_rgb(14_26_20/0.45)] sm:p-6">
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-lime text-ink">
            <Cookie className="size-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h2 id={titleId} ref={titleRef} tabIndex={-1} className="text-xl outline-none">
              Datenschutz-Einstellungen
            </h2>
            <p id={descId} className="mt-2 text-[0.92rem] leading-relaxed text-ink/80">
              Mit Ihrer Einwilligung messen wir mit Google Analytics, wie unsere Website genutzt wird – so verbessern wir Inhalte
              und Angebot. Ohne Einwilligung bleibt alles voll nutzbar. Sie können Ihre Wahl jederzeit unter
              „Cookie-Einstellungen“ ändern.{" "}
              <Link href="/datenschutz#cookies" className="font-semibold text-forest underline">
                Mehr erfahren
              </Link>
            </p>
          </div>
        </div>

        {details ? (
          <ul className="mt-5 divide-y divide-line rounded-key border border-line bg-cream/60 text-[0.92rem]">
            <li className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-semibold">Notwendig</p>
                <p className="mt-0.5 text-ink/70">Speichert nur Ihre Auswahl auf diesem Gerät. Immer aktiv.</p>
              </div>
              <Toggle checked disabled label="Notwendig" />
            </li>
            <li className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-semibold">Statistik</p>
                <p className="mt-0.5 text-ink/70">Google Analytics 4 – Besuche, Seitenaufrufe und Anfragen zählen. Keine Werbung.</p>
              </div>
              <Toggle checked={statistics} onChange={setStatistics} label="Statistik (Google Analytics)" />
            </li>
          </ul>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button plain variant="primary" className="w-full px-3" onClick={() => decide(false)}>
            Ablehnen
          </Button>
          <Button plain variant="primary" className="w-full px-3" onClick={() => decide(true)}>
            Akzeptieren
          </Button>
        </div>
        <div className="mt-3 text-center">
          {details ? (
            <button type="button" onClick={() => decide(statistics)} className="text-sm font-semibold text-forest underline-offset-4 hover:underline">
              Auswahl speichern
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDetails(true)}
              aria-expanded={details}
              className="text-sm font-semibold text-forest underline-offset-4 hover:underline"
            >
              Einstellungen anpassen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ease-snap disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-forest" : "bg-ink/25"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-5 rounded-full bg-cream shadow transition-transform duration-200 ease-snap",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
