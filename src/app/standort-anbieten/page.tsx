import type { Metadata } from "next";
import { Building2, Clock3, DoorOpen, Plug, Users, MapPin } from "lucide-react";
import { business, isEmailActive } from "@/config/business";
import { locationTypes } from "@/content/home";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { FormAside } from "@/components/sections/form-aside";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { SlotLabel } from "@/components/ui/slot-label";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Automatenstandort anbieten",
  description:
    "Sie haben eine Fläche mit Mitarbeitenden, Gästen oder Publikumsverkehr? Bieten Sie Snackora einen möglichen Automatenstandort in der Region Stuttgart an.",
  path: "/standort-anbieten",
});

const criteria = [
  {
    icon: Users,
    title: "Menschen vor Ort",
    text: "Regelmäßige Frequenz durch Mitarbeitende, Gäste, Mitglieder oder Besucher – idealerweise an mehreren Tagen der Woche.",
  },
  {
    icon: MapPin,
    title: "Ein geeigneter Platz",
    text: "Eine ebene, gut erreichbare Fläche, bevorzugt im Innenbereich oder gut geschützt. Für Getränkekühlung etwas Abstand zur Wand.",
  },
  {
    icon: Plug,
    title: "Stromanschluss",
    text: "Eine Steckdose in der Nähe des Aufstellorts. Ob der Anschluss geeignet ist, klären wir gemeinsam.",
  },
  {
    icon: DoorOpen,
    title: "Zugang für Service",
    text: "Befüllung, Reinigung und Wartung müssen zu vereinbarten Zeiten möglich sein.",
  },
  {
    icon: Clock3,
    title: "Passende Zugangszeiten",
    text: "Je länger der Automat für Nutzer erreichbar ist, desto größer der Nutzen – zum Beispiel auch abends oder am Wochenende.",
  },
  {
    icon: Building2,
    title: "Gewerbliche Eignung",
    text: "Die Nutzung muss zu Mietvertrag, Hausordnung und gegebenenfalls behördlichen Vorgaben passen. Das prüfen wir gemeinsam.",
  },
];

export default function StandortAnbietenPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Standort anbieten", href: "/standort-anbieten" }]}
        eyebrow="Für Eigentümer, Verwalter & Betreiber"
        title="Der richtige Platz für gute Snacks."
        lead="Sie besitzen, verwalten oder betreiben eine Fläche, auf der täglich Menschen arbeiten, trainieren oder warten? Dann schlagen Sie uns den Standort vor – wir prüfen, ob ein Snackora-Automat dort sinnvoll ist."
        aside={
          <div className="rounded-panel bg-lime p-7">
            <p className="slot-label text-ink/70">Gut geeignet zum Beispiel</p>
            <ul className="mt-4 space-y-2.5">
              {locationTypes.map((t) => (
                <li key={t} className="flex items-center gap-3 font-medium">
                  <span aria-hidden="true" className="size-2 rounded-[2px] bg-ink" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        }
      >
        <ButtonLink href="#formular" size="lg">
          Standort vorschlagen
        </ButtonLink>
      </PageHero>

      <section id="kriterien" aria-labelledby="kriterien-title" className="py-20 sm:py-28">
        <div className="container-site">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SlotLabel>Worauf es ankommt</SlotLabel>
              <h2 id="kriterien-title" className="type-h2 mt-5">
                Was einen Standort interessant macht.
              </h2>
            </div>
            <p className="text-ink/75 lg:col-span-5">
              Nicht jede Fläche eignet sich – und das ist auch gut so. Diese Punkte helfen uns bei der ersten Einschätzung. Es müssen
              nicht alle perfekt erfüllt sein; vieles lässt sich gemeinsam lösen.
            </p>
          </div>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {criteria.map((c) => (
              <li key={c.title} className="reveal bg-paper p-7 sm:p-8">
                <span className="grid size-11 place-items-center rounded-key bg-forest text-lime">
                  <c.icon className="size-5" aria-hidden="true" strokeWidth={1.9} />
                </span>
                <h3 className="type-h3 mt-6">{c.title}</h3>
                <p className="mt-3 text-ink/75">{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="partner-title" className="surface-dark bg-forest py-20 text-cream sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SlotLabel tone="dark">
              Partnerschaft
            </SlotLabel>
            <h2 id="partner-title" className="type-h2 mt-5">
              Fair geregelt, bevor es losgeht.
            </h2>
          </div>
          <div className="space-y-5 text-cream/80 lg:col-span-6 lg:col-start-7">
            <p>
              Wie eine Zusammenarbeit konkret aussieht, hängt vom Standort ab. Je nach Lage, Frequenz und Vereinbarung sind
              unterschiedliche Modelle denkbar – von der reinen Bereitstellung der Fläche bis zu individuellen Absprachen.
            </p>
            <p>
              Wichtig ist uns Transparenz: Bevor ein Automat aufgestellt wird, besprechen wir offen, wer welche Aufgaben übernimmt und
              welche Konditionen gelten. Ein Vorschlag über dieses Formular ist für beide Seiten unverbindlich und begründet keinen
              Anspruch auf eine Aufstellung.
            </p>
          </div>
        </div>
      </section>

      <section id="formular" aria-labelledby="formular-title" className="scroll-mt-24 py-20 sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 xl:col-span-8">
            <SlotLabel>Standort vorschlagen</SlotLabel>
            <h2 id="formular-title" className="type-h2 mt-5">
              Ihr Standortvorschlag
            </h2>
            <p className="mt-4 mb-10 max-w-xl text-ink/75">
              Für eine erste Einschätzung genügen Postleitzahl, Ort und einige Eckdaten. Die genaue Adresse können Sie uns gern später
              mitteilen.
            </p>
            <InquiryForm kind="standort" fallbackEmail={isEmailActive ? business.email.address : null} />
          </div>
          <div className="lg:col-span-5 lg:pt-28 xl:col-span-4">
            <FormAside
              steps={[
                { title: "Erste Einschätzung", text: "Wir prüfen anhand Ihrer Angaben, ob der Standort grundsätzlich infrage kommt." },
                { title: "Rückmeldung", text: "Kommt der Standort infrage, melden wir uns für ein Gespräch und gegebenenfalls einen Termin vor Ort." },
                { title: "Gemeinsame Entscheidung", text: "Erst wenn alle Rahmenbedingungen geklärt sind, wird etwas vereinbart." },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
