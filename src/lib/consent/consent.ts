/**
 * Consent store (client side).
 *
 * The visitor's decision is kept in localStorage under one key. Storing the
 * decision itself is strictly necessary (§ 25 Abs. 2 Nr. 2 TDDDG) – no other
 * data is written to the device before consent.
 *
 * Bump CONSENT_VERSION whenever the categories or services change: stored
 * decisions of an older version are ignored and the banner is shown again.
 */

export const CONSENT_STORAGE_KEY = "snackora-consent";
export const CONSENT_VERSION = 1;
/** Re-ask after 12 months – a common recommendation of the German supervisory authorities. */
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export interface ConsentState {
  version: number;
  /** Google Analytics 4 (statistics). Strictly necessary storage needs no consent. */
  analytics: boolean;
  /** Unix ms of the decision. */
  decidedAt: number;
}

/** "unknown" = not yet hydrated (server render), null = no decision yet. */
export type ConsentSnapshot = ConsentState | null | "unknown";

export function parseConsent(raw: string | null, now: number = Date.now()): ConsentState | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<ConsentState>;
    if (v.version !== CONSENT_VERSION || typeof v.analytics !== "boolean" || typeof v.decidedAt !== "number") return null;
    if (v.decidedAt > now || now - v.decidedAt > CONSENT_MAX_AGE_MS) return null;
    return { version: v.version, analytics: v.analytics, decidedAt: v.decidedAt };
  } catch {
    return null;
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: { raw: string | null; value: ConsentState | null } | undefined;
/** Fallback when localStorage is blocked (private mode): the decision holds for this page view. */
let memoryRaw: string | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? memoryRaw;
  } catch {
    return memoryRaw;
  }
}

export function getConsent(): ConsentState | null {
  const raw = readRaw();
  // Stable reference for useSyncExternalStore as long as storage is unchanged.
  if (!cache || cache.raw !== raw) cache = { raw, value: parseConsent(raw) };
  return cache.value;
}

export function setConsent(analytics: boolean): ConsentState {
  const state: ConsentState = { version: CONSENT_VERSION, analytics, decidedAt: Date.now() };
  memoryRaw = JSON.stringify(state);
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, memoryRaw);
  } catch {
    // blocked storage – memoryRaw keeps the decision for this page view
  }
  emit();
  return state;
}

export function subscribeConsent(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function emit() {
  for (const l of listeners) l();
}

/* ── "Cookie-Einstellungen" link: reopens the banner from anywhere ── */

const OPEN_EVENT = "snackora:open-consent";

export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenConsentSettings(handler: () => void): () => void {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
