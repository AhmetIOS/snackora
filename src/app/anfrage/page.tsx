import type { Metadata } from "next";
import { business, isEmailActive } from "@/config/business";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { FormAside } from "@/components/sections/form-aside";
import { PageHero } from "@/components/sections/page-hero";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Automatenlösung anfragen",
  description:
    "Fragen Sie unverbindlich einen Snack-, Getränke- oder Kombiautomaten für Ihr Unternehmen oder Ihren Standort in der Region Stuttgart an.",
  path: "/anfrage",
});

export default function AnfragePage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Anfrage", href: "/anfrage" }]}
        eyebrow="Unverbindliche Anfrage"
        title="Erzählen Sie uns von Ihrem Standort."
        lead="Ein paar Eckdaten genügen für den Anfang. Wir melden uns, um Ihren Bedarf zu besprechen – persönlich, unverbindlich und ohne Verkaufsdruck."
      />
      <section className="py-16 sm:py-20" aria-label="Anfrageformular">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 xl:col-span-8">
            <InquiryForm kind="anfrage" fallbackEmail={isEmailActive ? business.email.address : null} />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <FormAside
              steps={[
                { title: "Wir sichten Ihre Anfrage", text: "Wir lesen Ihre Angaben persönlich – kein Callcenter, keine automatische Weiterleitung." },
                { title: "Wir melden uns bei Ihnen", text: "Per E-Mail oder telefonisch, ganz wie Sie es bevorzugen." },
                { title: "Gemeinsame Einschätzung", text: "Wir besprechen Standort, Bedarf und mögliche Modelle – erst dann wird es konkret." },
              ]}
              links={[
                { label: "Standort anbieten", href: "/standort-anbieten", text: "Sie haben eine Fläche und möchten sie vorschlagen?" },
                { label: "Häufige Fragen", href: "/faq", text: "Antworten zu Kosten, Sortiment und Ablauf." },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
