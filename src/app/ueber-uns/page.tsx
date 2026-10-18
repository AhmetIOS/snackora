import type { Metadata } from "next";
import { business } from "@/config/business";
import { BrandSymbol } from "@/components/brand/logo";
import { MachineWrapConcept } from "@/components/illustrations/machine-wrap";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { SlotLabel } from "@/components/ui/slot-label";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Über Snackora",
  description:
    "Snackora ist ein inhabergeführtes Unternehmen aus der Region Stuttgart, das moderne Snack-, Getränke- und Kaffeeversorgung einfacher und zugänglicher machen möchte.",
  path: "/ueber-uns",
});

const principles = [
  {
    title: "Ehrlich statt übertrieben",
    text: "Wir sagen Ihnen offen, wenn sich ein Automat an Ihrem Standort nicht lohnt. Lieber ein ehrliches Nein als ein Gerät, das keiner nutzt.",
  },
  {
    title: "Persönlich und direkt",
    text: "Bei Snackora sprechen Sie mit dem Inhaber selbst. Entscheidungen fallen ohne lange Abstimmungsschleifen.",
  },
  {
    title: "Regional verwurzelt",
    text: "Wir konzentrieren uns bewusst auf die Region Stuttgart – nah genug, um Standorte persönlich zu kennen und zu betreuen.",
  },
  {
    title: "Modern gedacht",
    text: "Übersichtliche Geräte, zeitgemäße Zahlungsmöglichkeiten je nach Ausstattung und ein Sortiment, das sich an den Menschen vor Ort orientiert.",
  },
];

export default function UeberUnsPage() {
  const initials = business.owner
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <>
      <PageHero
        crumbs={[{ name: "Über uns", href: "/ueber-uns" }]}
        eyebrow="Über Snackora"
        title="Die gute Pause soll einfach sein."
        lead="Snackora steht für die Idee, moderne Snack-, Getränke- und Kaffeeversorgung einfacher, zugänglicher und zeitgemäßer zu gestalten – für Unternehmen, ihre Mitarbeitenden und alle, die zwischendurch eine kleine Stärkung brauchen."
      />

      <section aria-labelledby="idee-title" className="py-20 sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SlotLabel>Die Idee</SlotLabel>
            <h2 id="idee-title" className="type-h2 mt-5">
              Warum Snackora?
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/80">
              <p>
                Viele Arbeitsplätze haben ein ganz einfaches Problem: Die Pause ist kurz, der nächste Bäcker weit weg und die Kantine
                hat längst geschlossen. Ein gut geplanter Automat löst genau das – vorausgesetzt, Gerät, Sortiment und Standort
                passen zusammen.
              </p>
              <p>
                Genau darauf konzentriert sich Snackora. Statt Automaten nach Schema F aufzustellen, schauen wir uns jeden Standort
                einzeln an und entwickeln eine Lösung, die zu den Menschen vor Ort passt.
              </p>
              <p>
                Snackora ist ein junges, inhabergeführtes Unternehmen mit Sitz in der Region Stuttgart. Wir bauen unser Angebot
                Schritt für Schritt auf – mit dem Anspruch, von Anfang an verlässlich und professionell zu arbeiten.
              </p>
            </div>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="surface-dark relative overflow-hidden rounded-panel bg-forest p-8 text-cream">
              <BrandSymbol tile={false} className="pointer-events-none absolute -right-10 -bottom-10 size-48 text-forest-deep" />
              <div className="relative">
                <span className="grid size-16 place-items-center rounded-key bg-lime font-display text-2xl font-semibold text-ink" aria-hidden="true">
                  {initials}
                </span>
                <p className="slot-label mt-8 text-muted-dark">Inhaber</p>
                <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{business.owner}</p>
                <p className="mt-4 text-cream/75">
                  Als Inhaber ist {business.owner} Ihr direkter Ansprechpartner – von der ersten Anfrage über die Standortprüfung bis
                  zur Umsetzung.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section aria-labelledby="werte-title" className="border-y border-line bg-paper py-20 sm:py-28">
        <div className="container-site">
          <SlotLabel>Wofür wir stehen</SlotLabel>
          <h2 id="werte-title" className="type-h2 mt-5 max-w-3xl">
            Vier Grundsätze, an denen Sie uns messen können.
          </h2>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-2">
            {principles.map((p, i) => (
              <li key={p.title} className="reveal bg-cream p-7 sm:p-9">
                <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="type-h3 mt-3">{p.title}</h3>
                <p className="mt-3 text-ink/75">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="marke-title" className="py-20 sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <SlotLabel>Marke</SlotLabel>
            <h2 id="marke-title" className="type-h2 mt-5">
              {business.slogan}
            </h2>
            <div className="mt-6 space-y-4 text-ink/80">
              <p>
                Unser Zeichen ist das <strong>Fach-S</strong>: ein S aus zwei Automatenfächern, in dessen oberem Fach ein Produkt
                bereitliegt. Es steht für das, worum es uns geht – die kleine Pause, die da ist, wenn man sie braucht.
              </p>
              <p>
                So soll ein Snackora-Automat erkennbar sein: klar, aufgeräumt und freundlich. Die Gestaltung rechts zeigt, wie die
                Marke auf einem Gerät aussehen kann.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <MachineWrapConcept />
          </div>
        </div>
      </section>

      <section aria-labelledby="ziel-title" className="surface-dark bg-forest py-20 text-cream sm:py-28">
        <div className="container-site grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SlotLabel tone="dark">
              Ausblick
            </SlotLabel>
            <h2 id="ziel-title" className="type-h2 mt-5">
              Wohin wir wollen.
            </h2>
          </div>
          <div className="space-y-5 text-lg text-cream/80 lg:col-span-6 lg:col-start-7">
            <p>
              Unser Ziel ist ein Netz moderner, gepflegter Automaten in der Region Stuttgart – an Orten, an denen sie wirklich
              gebraucht werden.
            </p>
            <p>
              Langfristig möchten wir auch eigene Selbstbedienungsstandorte mit Zugang rund um die Uhr entwickeln. Dabei wachsen wir
              bewusst mit Augenmaß: Standort für Standort, mit Partnern, die zu uns passen.
            </p>
          </div>
        </div>
      </section>

      <CtaBand headline="Werden Sie Teil der ersten Snackora-Standorte." />
    </>
  );
}
