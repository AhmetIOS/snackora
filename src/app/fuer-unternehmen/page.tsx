import type { Metadata } from "next";
import { Check, CircleDashed, Handshake } from "lucide-react";
import { businessFaqs } from "@/content/faqs";
import { CtaBand } from "@/components/sections/cta-band";
import { MachineLineup } from "@/components/sections/machine-lineup";
import { PageHero } from "@/components/sections/page-hero";
import { ProcessSteps } from "@/components/sections/process-steps";
import { UseCases } from "@/components/sections/use-cases";
import { ButtonLink } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import { SlotLabel } from "@/components/ui/slot-label";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Snackautomaten für Unternehmen in der Region Stuttgart",
  description:
    "Automaten für Büros, Produktion, Logistik und Gewerbe in Esslingen, Waiblingen und der Region Stuttgart – individuell geplant. Jetzt anfragen.",
  path: "/fuer-unternehmen",
});

const audiences = ["Office- & Facility-Management", "Personal & HR", "Geschäftsführung", "Betriebs- & Standortleitung", "Haus- & Objektverwaltung"];

const benefits = [
  {
    title: "Weniger Wege, mehr echte Pause",
    text: "Wer für einen Snack nicht das Gelände verlassen muss, hat mehr von seiner Pause – besonders bei kurzen Pausenzeiten.",
  },
  {
    title: "Versorgung auch in Randzeiten",
    text: "Früh-, Spät- oder Wochenendschicht: Ein Automat ist da, wenn Kantine und Bäcker längst geschlossen haben.",
  },
  {
    title: "Kein Einkauf, keine Vorratskammer",
    text: "Niemand im Team muss Getränkekisten schleppen, Vorräte prüfen oder Kleingeld verwalten.",
  },
  {
    title: "Ein Zeichen der Wertschätzung",
    text: "Ein gut gepflegtes Angebot vor Ort kann zu einem angenehmen Arbeitsumfeld beitragen – für Mitarbeitende wie für Gäste.",
  },
];

const assortmentProfiles = [
  {
    name: "Klassisch",
    text: "Der bewährte Mix aus Süßem und Herzhaftem, ergänzt um Wasser und Erfrischungsgetränke.",
    items: ["Schokoriegel & Kekse", "Chips & Salzgebäck", "Wasser & Softdrinks"],
  },
  {
    name: "Bewusst",
    text: "Für Teams, die Wert auf eine ausgewogenere Auswahl legen.",
    items: ["Nüsse & Proteinriegel", "Müsli- & Fruchtriegel", "Zuckerfreie Getränke"],
  },
  {
    name: "Kaffeepause",
    text: "Für Teams, bei denen die Pause mit einem Kaffee beginnt – mit einem Kaffeeautomaten als Ergänzung oder Hauptlösung.",
    items: ["Kaffee & Cappuccino", "Tee & Kakao", "Kekse & Riegel dazu"],
  },
  {
    name: "Schicht & Halle",
    text: "Für körperliche Arbeit und lange Schichten – sättigend und erfrischend.",
    items: ["Herzhafte Snacks", "Größere Getränkegebinde", "Isotonische Getränke"],
  },
];

const requirements = [
  { title: "Stellfläche", text: "Ebener, gut erreichbarer Platz – z. B. im Pausenraum, Flur oder Eingangsbereich. Die Maße hängen vom Gerät ab." },
  { title: "Strom", text: "Eine Steckdose in der Nähe. Ob der Anschluss passt, prüfen wir bei der Standortbesichtigung." },
  { title: "Belüftung", text: "Gekühlte Automaten brauchen etwas Abstand zur Wand und sollten nicht direkt neben Heizungen stehen." },
  { title: "Wasser", text: "Kaffeeautomaten benötigen je nach Gerät einen Festwasseranschluss oder arbeiten mit einem Tank, der regelmäßig befüllt wird." },
  { title: "Zugang", text: "Für Befüllung und Service muss der Automat zu vereinbarten Zeiten erreichbar sein." },
  { title: "Hausrecht", text: "Bei gemieteten Flächen sollte die Aufstellung mit Vermieter bzw. Hausverwaltung abgestimmt sein." },
];

const model = [
  {
    icon: Check,
    title: "Darauf können Sie sich verlassen",
    tone: "bg-forest text-cream surface-dark",
    iconTone: "bg-lime text-ink",
    items: [
      "Persönliche Abstimmung mit einem festen Ansprechpartner",
      "Ehrliche Einschätzung, ob sich ein Automat bei Ihnen lohnt",
      "Transparente Konditionen, bevor etwas vereinbart wird",
      "Kurze Wege in der Region Stuttgart",
    ],
  },
  {
    icon: Handshake,
    title: "Das bringen wir ein",
    tone: "bg-paper border border-line",
    iconTone: "bg-forest text-lime",
    items: [
      "Prüfung Ihres Standorts und Ihres Bedarfs",
      "Konzept mit passender Gerätekategorie",
      "Sortimentsvorschlag für Ihre Zielgruppe",
      "Planung von Aufstellung, Befüllung und Service",
    ],
  },
  {
    icon: CircleDashed,
    title: "Das wird individuell vereinbart",
    tone: "bg-sand",
    iconTone: "bg-ink text-lime",
    items: [
      "Betreibermodell und Kostenverteilung",
      "Befüllrhythmus und Ablauf bei Störungen",
      "Laufzeit der Vereinbarung",
      "Etwaige Beteiligungs- oder Mietmodelle",
    ],
  },
];

export default function FuerUnternehmenPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Für Unternehmen", href: "/fuer-unternehmen" }]}
        eyebrow="Für Unternehmen"
        title={"Pausen\u00ADversorgung für Ihr Team – ohne Organisations\u00ADaufwand."}
        lead="Snacks und gekühlte Getränke direkt im Betrieb: Wir planen mit Ihnen eine Automatenlösung, die zu Ihren Räumen, Arbeitszeiten und Mitarbeitenden passt – und vereinbaren alles Weitere transparent."
        aside={
          <div className="rounded-panel border border-line bg-paper p-7">
            <p className="slot-label text-muted">Diese Seite richtet sich an</p>
            <ul className="mt-4 space-y-2.5">
              {audiences.map((a) => (
                <li key={a} className="flex items-center gap-3 font-medium">
                  <span aria-hidden="true" className="size-2 rounded-[2px] bg-forest" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        }
      >
        <div className="flex flex-col gap-3 xs:flex-row xs:flex-wrap">
          <ButtonLink href="/anfrage?anliegen=unternehmen" size="lg">
            Unverbindlich anfragen
          </ButtonLink>
          <ButtonLink href="#modell" size="lg" variant="outline">
            So arbeiten wir
          </ButtonLink>
        </div>
      </PageHero>

      <section aria-labelledby="nutzen-title" className="py-20 sm:py-28">
        <div className="container-site">
          <div className="max-w-3xl">
            <SlotLabel>Ihr Nutzen</SlotLabel>
            <h2 id="nutzen-title" className="type-h2 mt-5">
              Was ein Automat im Arbeitsalltag verändert.
            </h2>
          </div>
          <ul className="mt-12 grid gap-x-10 gap-y-2 md:grid-cols-2">
            {benefits.map((b, i) => (
              <li key={b.title} className="reveal grid grid-cols-[auto_1fr] gap-5 border-t border-line py-7">
                <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="type-h3">{b.title}</h3>
                  <p className="mt-2 text-ink/75">{b.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <UseCases heading="Für Unternehmen jeder Art – mit unterschiedlichem Bedarf." />

      <MachineLineup heading="Die passenden Automatenkonzepte." />

      <section aria-labelledby="sortiment-title" className="py-20 sm:py-28">
        <div className="container-site">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SlotLabel>Sortiment</SlotLabel>
              <h2 id="sortiment-title" className="type-h2 mt-5">
                Ein Sortiment, das zu Ihrem Team passt.
              </h2>
            </div>
            <p className="text-ink/75 lg:col-span-5">
              Vier Beispielprofile als Ausgangspunkt. In der Praxis mischen wir sie nach Ihren Wünschen und passen das Angebot an,
              wenn sich zeigt, was gut ankommt.
            </p>
          </div>
          <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {assortmentProfiles.map((p, i) => (
              <li key={p.name} className="reveal rounded-panel border border-line bg-paper p-7">
                <span className="slot-label rounded-[5px] bg-forest px-2 py-1 text-cream">Profil {String.fromCharCode(65 + i)}</span>
                <h3 className="type-h3 mt-5">{p.name}</h3>
                <p className="mt-2 text-ink/75">{p.text}</p>
                <ul className="mt-5 space-y-2 border-t border-line pt-5">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-center gap-3">
                      <span aria-hidden="true" className="size-2 rounded-[2px] bg-lime ring-1 ring-forest" />
                      {it}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="voraussetzungen-title" className="border-y border-line bg-paper py-20 sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SlotLabel>Voraussetzungen</SlotLabel>
            <h2 id="voraussetzungen-title" className="type-h2 mt-5">
              Platz, Strom, Zugang – bei Kaffee auch Wasser.
            </h2>
            <p className="mt-5 text-ink/75">
              Die technischen Anforderungen sind überschaubar. Was im Einzelfall nötig ist, klären wir bei einer
              Standortbesichtigung.
            </p>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2 lg:col-span-8">
            {requirements.map((r, i) => (
              <div key={r.title} className={`bg-cream p-6 sm:p-7 ${requirements.length % 2 === 1 && i === requirements.length - 1 ? "sm:col-span-2" : ""}`}>
                <dt className="font-display text-xl font-semibold tracking-tight">{r.title}</dt>
                <dd className="mt-2 text-ink/75">{r.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="modell" aria-labelledby="modell-title" className="scroll-mt-24 py-20 sm:py-28">
        <div className="container-site">
          <div className="max-w-3xl">
            <SlotLabel>Zusammenarbeit</SlotLabel>
            <h2 id="modell-title" className="type-h2 mt-5">
              Klare Verhältnisse von Anfang an.
            </h2>
            <p className="mt-5 text-ink/75">
              Je nach Standort und Vereinbarung sind unterschiedliche Betreibermodelle denkbar. Wir prüfen gemeinsam, welche Lösung
              wirtschaftlich und organisatorisch sinnvoll ist – und trennen dabei sauber zwischen dem, was feststeht, und dem, was
              wir miteinander vereinbaren.
            </p>
          </div>
          <ul className="mt-12 grid gap-4 lg:grid-cols-3">
            {model.map((col) => (
              <li key={col.title} className={`reveal rounded-panel p-7 sm:p-8 ${col.tone}`}>
                <span className={`grid size-11 place-items-center rounded-key ${col.iconTone}`}>
                  <col.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="type-h3 mt-6">{col.title}</h3>
                <ul className="mt-5 space-y-3">
                  {col.items.map((it) => (
                    <li key={it} className="flex items-start gap-3">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-[1px] bg-current opacity-70" />
                      {it}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            Eine kostenlose Aufstellung oder eine Umsatzbeteiligung lässt sich nicht pauschal zusagen – beides hängt vom Standort und
            von der Vereinbarung ab.
          </p>
        </div>
      </section>

      <ProcessSteps heading="So kommen wir zusammen." />

      <section aria-labelledby="faq-business-title" className="py-20 sm:py-28">
        <div className="container-site grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SlotLabel>Fragen von Unternehmen</SlotLabel>
            <h2 id="faq-business-title" className="type-h2 mt-5">
              Was Unternehmen uns häufig fragen.
            </h2>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={businessFaqs} />
          </div>
        </div>
      </section>

      <CtaBand
        headline="Lassen Sie uns über Ihren Standort sprechen."
        text="Ein kurzer Austausch genügt, um einzuschätzen, ob und welcher Automat zu Ihrem Unternehmen passt."
        cta={{ label: "Jetzt unverbindlich anfragen", href: "/anfrage?anliegen=unternehmen" }}
        secondary={null}
      />
    </>
  );
}
