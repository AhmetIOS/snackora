import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { business, hasLegalAddress } from "@/config/business";

/** Visibly marks a legally required value that has not been configured yet. */
export function Pending({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[5px] border border-dashed border-error/60 bg-error-soft px-1.5 py-0.5 text-[0.95em] text-error">
      [Angabe folgt: {children}]
    </span>
  );
}

/** Pre-launch review notice (disappears when legalReviewCompleted = true). */
export function ReviewNotice({ items }: { items: string[] }) {
  if (business.legalReviewCompleted && hasLegalAddress()) return null;
  return (
    <aside className="my-10 flex gap-3 rounded-panel border border-mustard/60 bg-[#fdf4dc] p-5 text-ink sm:gap-4 sm:p-6" aria-label="Hinweis zur Prüfung">
      <AlertTriangle className="mt-0.5 size-6 shrink-0 text-[#8a5a00]" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-semibold">Vor Veröffentlichung zu prüfen</p>
        <p className="mt-1 text-sm text-ink/80">
          Diese Seite wurde sorgfältig vorbereitet, ersetzt aber keine Rechtsberatung. Folgende Punkte müssen vom Inhaber vor dem
          Livegang ergänzt bzw. bestätigt werden:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink/85">
          {items.map((i) => (
            <li key={i} className="before:hidden">
              {i}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/** Legal address block – the only place the owner's address is rendered. */
export function LegalAddress() {
  const a = business.address;
  return (
    <address>
      {business.brand}
      <br />
      Inhaber: {business.owner}
      <br />
      {a.street && a.houseNumber ? `${a.street} ${a.houseNumber}` : <Pending>Straße und Hausnummer</Pending>}
      <br />
      {a.postalCode && a.city ? `${a.postalCode} ${a.city}` : <Pending>Postleitzahl und Ort</Pending>}
      <br />
      {a.country}
    </address>
  );
}
