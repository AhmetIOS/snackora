import type { Metadata } from "next";
import { faqs } from "@/content/faqs";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { FaqList } from "@/components/ui/faq-list";
import { SlotLabel } from "@/components/ui/slot-label";
import { JsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Häufige Fragen zu Snack-, Getränke- und Kaffeeautomaten",
  description:
    "Antworten zu Automatenaufstellung, Standortvoraussetzungen, Sortiment, Zahlung, Kosten und Ablauf – ehrlich beantwortet von Snackora aus der Region Stuttgart.",
  path: "/faq",
});

const groups = [
  { code: "Q1", title: "Angebot & Sortiment", ids: ["loesungen", "produkte", "sortiment", "zahlung"] },
  { code: "Q2", title: "Standort & Voraussetzungen", ids: ["standorte", "standort-vorschlagen", "voraussetzungen", "region", "kleine-unternehmen"] },
  { code: "Q3", title: "Kosten & Ablauf", ids: ["kosten", "befuellung", "ablauf"] },
];

export default function FaqPage() {
  const byId = new Map(faqs.map((f) => [f.id, f]));
  return (
    <>
      <PageHero
        crumbs={[{ name: "Häufige Fragen", href: "/faq" }]}
        eyebrow="Häufige Fragen"
        title="Gute Fragen. Ehrliche Antworten."
        lead="Hier finden Sie Antworten auf die Fragen, die uns Unternehmen und Standortgeber am häufigsten stellen. Ihre Frage ist nicht dabei? Schreiben Sie uns einfach."
      >
        <nav aria-label="Themen" className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.code} href={`#${g.code.toLowerCase()}`} className="rounded-[9px] border border-ink/20 px-3.5 py-2 text-sm font-medium hover:border-ink">
              {g.title}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="py-16 sm:py-24">
        <div className="container-site space-y-20">
          {groups.map((g) => (
            <section key={g.code} id={g.code.toLowerCase()} aria-labelledby={`${g.code}-title`} className="grid scroll-mt-28 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SlotLabel>Thema</SlotLabel>
                <h2 id={`${g.code}-title`} className="type-h3 mt-4 text-[1.75rem]">
                  {g.title}
                </h2>
              </div>
              <div className="lg:col-span-8">
                <FaqList items={g.ids.map((id) => byId.get(id)!).filter(Boolean)} />
              </div>
            </section>
          ))}
        </div>
      </div>

      <CtaBand headline="Ihre Frage war nicht dabei?" text="Schreiben Sie uns – wir antworten persönlich und so konkret wie möglich." cta={{ label: "Frage stellen", href: "/kontakt" }} secondary={{ label: "Anfrage stellen", href: "/anfrage" }} />
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
