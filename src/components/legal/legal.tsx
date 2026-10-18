import type { ReactNode } from "react";
import { business } from "@/config/business";

/** Visibly marks a legally required value that has not been configured yet. */
export function Pending({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[5px] border border-dashed border-error/60 bg-error-soft px-1.5 py-0.5 text-[0.95em] text-error">
      [Angabe folgt: {children}]
    </span>
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
