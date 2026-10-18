import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { business, isEmailActive } from "@/config/business";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { PageHero } from "@/components/sections/page-hero";
import { SlotLabel } from "@/components/ui/slot-label";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Kontakt",
  description: "Kontakt zu Snackora – Snack-, Getränke- und Kaffeeautomaten in Esslingen, Stuttgart und Umgebung. Schreiben Sie uns, wir melden uns persönlich.",
  path: "/kontakt",
});

export default function KontaktPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Kontakt", href: "/kontakt" }]}
        eyebrow="Kontakt"
        title="Schreiben Sie uns."
        lead="Sie haben eine Frage, eine Idee oder möchten einfach wissen, ob ein Automat für Sie infrage kommt? Wir freuen uns auf Ihre Nachricht und melden uns persönlich."
      />

      <section className="py-16 sm:py-20" aria-label="Kontaktformular und Kontaktdaten">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 xl:col-span-8">
            <InquiryForm kind="kontakt" fallbackEmail={isEmailActive ? business.email.address : null} />
          </div>

          <aside className="space-y-6 lg:col-span-5 xl:col-span-4">
            <div className="rounded-panel border border-line bg-paper p-7">
              <SlotLabel>Direkter Kontakt</SlotLabel>
              <ul className="mt-5 space-y-4">
                {isEmailActive ? (
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 size-5 text-forest" aria-hidden="true" />
                    <a href={`mailto:${business.email.address}`} className="font-semibold text-forest hover:underline">
                      {business.email.address}
                    </a>
                  </li>
                ) : (
                  <li className="flex items-start gap-3 text-ink/80">
                    <Mail className="mt-0.5 size-5 text-forest" aria-hidden="true" />
                    Am schnellsten erreichen Sie uns über das Formular.
                  </li>
                )}
                {business.phone ? (
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 size-5 text-forest" aria-hidden="true" />
                    <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-forest hover:underline">
                      {business.phone}
                    </a>
                  </li>
                ) : null}
                <li className="flex items-start gap-3 text-ink/80">
                  <MapPin className="mt-0.5 size-5 text-forest" aria-hidden="true" />
                  <span>
                    Tätig in der {business.serviceRegion.label}:
                    <br />
                    {business.serviceRegion.cities.join(", ")} und Umgebung
                  </span>
                </li>
              </ul>
            </div>

            <div className="surface-dark rounded-panel bg-forest p-7 text-cream">
              <SlotLabel tone="dark">Gezielt anfragen</SlotLabel>
              <ul className="mt-5 space-y-4">
                <li>
                  <Link href="/anfrage" className="group flex items-center justify-between gap-4 font-semibold">
                    Automatenlösung anfragen
                    <span aria-hidden="true" className="text-lime transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                  <p className="mt-1 text-sm text-cream/70">Für Unternehmen, die einen Automaten suchen.</p>
                </li>
                <li className="border-t border-line-dark pt-4">
                  <Link href="/standort-anbieten" className="group flex items-center justify-between gap-4 font-semibold">
                    Standort anbieten
                    <span aria-hidden="true" className="text-lime transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                  <p className="mt-1 text-sm text-cream/70">Für Eigentümer und Betreiber geeigneter Flächen.</p>
                </li>
              </ul>
            </div>

            <div className="rounded-panel border border-line p-7 text-sm text-ink/80">
              <SlotLabel>Anbieter</SlotLabel>
              <p className="mt-4">
                <strong className="text-ink">{business.brand}</strong>
                <br />
                Inhaber: {business.owner}
                <br />
                {business.legalForm}
              </p>
              <p className="mt-3">
                Vollständige Anbieterangaben finden Sie im{" "}
                <Link href="/impressum" className="font-semibold text-forest underline">
                  Impressum
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
