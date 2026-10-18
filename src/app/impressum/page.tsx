import type { Metadata } from "next";
import Link from "next/link";
import { business, isEmailActive } from "@/config/business";
import { LegalAddress, Pending } from "@/components/legal/legal";
import { PageHero } from "@/components/sections/page-hero";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Impressum",
  description: "Impressum von Snackora – Anbieterkennzeichnung gemäß § 5 DDG.",
  path: "/impressum",
});

export default function ImpressumPage() {
  return (
    <>
      <PageHero crumbs={[{ name: "Impressum", href: "/impressum" }]} eyebrow="Rechtliches" title="Impressum" />
      <div className="container-site py-10 sm:py-14">
        <div className="prose-snackora">
          <h2>Angaben gemäß § 5 DDG</h2>
          <LegalAddress />
          <p>Rechtsform: {business.legalForm}</p>

          <h2>Kontakt</h2>
          <p>
            E-Mail: <a href={`mailto:${business.email.address}`}>{business.email.address}</a>
            {!isEmailActive ? (
              <>
                {" "}
                <Pending>Postfach wird eingerichtet</Pending>
              </>
            ) : null}
            {business.phone ? (
              <>
                <br />
                Telefon: <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`}>{business.phone}</a>
              </>
            ) : null}
            <br />
            Kontaktformular: <Link href="/kontakt">snackora.de/kontakt</Link>
          </p>

          {business.vatId ? (
            <>
              <h2>Umsatzsteuer-ID</h2>
              <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: {business.vatId}</p>
            </>
          ) : null}

          {business.register ? (
            <>
              <h2>Registereintrag</h2>
              <p>
                Registergericht: {business.register.court}
                <br />
                Registernummer: {business.register.number}
              </p>
            </>
          ) : null}

          <h2>Verantwortlich für den Inhalt</h2>
          <p>Verantwortlich für die Inhalte dieser Website ist {business.owner}, Anschrift wie oben.</p>

          <h2>Hinweis zu Illustrationen</h2>
          <p>
            Die auf dieser Website gezeigten Automaten sind Illustrationen und Designkonzepte. Sie stellen keine konkreten Geräte,
            Hersteller oder bestehenden Standorte dar.
          </p>

          <h2>Schriften und Gestaltung</h2>
          <p>
            Logo, Illustrationen und Gestaltung: {business.brand}. Verwendete Schriften: Bricolage Grotesque, DM Sans und DM Mono,
            jeweils lizenziert unter der SIL Open Font License 1.1 und lokal von diesem Server ausgeliefert.
          </p>
        </div>
      </div>
    </>
  );
}
