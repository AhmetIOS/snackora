import type { Metadata } from "next";
import Link from "next/link";
import { BrandSymbol } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { SlotLabel } from "@/components/ui/slot-label";

// Next.js adds <meta name="robots" content="noindex"> to not-found responses.
export const metadata: Metadata = {
  title: "Seite nicht gefunden",
};

const links = [
  { label: "Automatenlösungen", href: "/automaten" },
  { label: "Für Unternehmen", href: "/fuer-unternehmen" },
  { label: "Standort anbieten", href: "/standort-anbieten" },
  { label: "Häufige Fragen", href: "/faq" },
];

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-site grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <SlotLabel>Fach leer</SlotLabel>
          <h1 className="type-h1 mt-6">Dieses Fach ist leider leer.</h1>
          <p className="type-lead mt-6 max-w-xl text-ink/75">
            Die gesuchte Seite gibt es nicht oder nicht mehr. Vielleicht finden Sie hier, wonach Sie suchen:
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center rounded-[10px] border border-ink/20 px-4 font-medium hover:border-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href="/" size="lg" className="mt-10">
            Zur Startseite
          </ButtonLink>
        </div>
        <div className="hidden lg:col-span-5 lg:block" aria-hidden="true">
          <div className="relative mx-auto grid aspect-square max-w-sm grid-cols-3 gap-3 rounded-panel bg-forest p-6">
            {Array.from({ length: 9 }, (_, i) =>
              i === 4 ? (
                <div key={i} className="grid place-items-center rounded-key border-2 border-dashed border-lime/60">
                  <span className="font-mono text-sm text-lime">B2</span>
                </div>
              ) : (
                <div key={i} className="grid place-items-center rounded-key bg-forest-deep">
                  <BrandSymbol tile={false} className="size-8 text-moss" />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
