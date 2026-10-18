import type { Metadata } from "next";
import Link from "next/link";
import { machines } from "@/content/machines";
import { MachineLineup } from "@/components/sections/machine-lineup";
import { PageHero } from "@/components/sections/page-hero";
import { ProcessSteps } from "@/components/sections/process-steps";
import { CtaBand } from "@/components/sections/cta-band";
import { ButtonLink } from "@/components/ui/button";
import { SlotLabel } from "@/components/ui/slot-label";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Automatenlösungen: Snack-, Getränke- & Kombiautomaten",
  description:
    "Snackautomaten, Getränkeautomaten und Kombiautomaten für Unternehmen und Standorte in Esslingen, Stuttgart und Umgebung – welcher Automat passt zu Ihnen?",
  path: "/automaten",
});

const comparison: { label: string; values: Record<string, string> }[] = [
  {
    label: "Angebot",
    values: {
      snackautomaten: "Riegel, Chips, Nüsse, Gebäck",
      getraenkeautomaten: "Wasser, Schorlen, Softdrinks, Eistee",
      kombiautomaten: "Snacks und gekühlte Getränke",
    },
  },
  {
    label: "Kühlung",
    values: { snackautomaten: "Nicht erforderlich", getraenkeautomaten: "Ja", kombiautomaten: "Ja, im Getränkefach" },
  },
  {
    label: "Aufstellung",
    values: {
      snackautomaten: "Kompakt, oft direkt an der Wand",
      getraenkeautomaten: "Etwas Abstand für die Belüftung",
      kombiautomaten: "Ein Gerät für beides, Belüftung beachten",
    },
  },
  {
    label: "Typisch für",
    values: {
      snackautomaten: "Büros, Werkstätten, Wartebereiche",
      getraenkeautomaten: "Hallen, Sportanlagen, große Teams",
      kombiautomaten: "Kleinere Standorte mit begrenztem Platz",
    },
  },
  {
    label: "Gut gewählt, wenn …",
    values: {
      snackautomaten: "… Getränke bereits anders abgedeckt sind",
      getraenkeautomaten: "… vor allem Erfrischung gefragt ist",
      kombiautomaten: "… nur Platz für ein Gerät ist",
    },
  },
];

export default function AutomatenPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Automaten", href: "/automaten" }]}
        eyebrow="Automatenlösungen"
        title="Der passende Automat für Ihren Standort."
        lead="Snacks, gekühlte Getränke oder beides aus einem Gerät: Welche Lösung sinnvoll ist, hängt von Ihren Räumen, Ihren Arbeitszeiten und den Menschen vor Ort ab. Hier finden Sie einen ersten Überblick."
      >
        <div className="flex flex-col gap-3 xs:flex-row">
          <ButtonLink href="/anfrage" size="lg">
            Beratung anfragen
          </ButtonLink>
          <ButtonLink href="#vergleich" size="lg" variant="outline">
            Automaten vergleichen
          </ButtonLink>
        </div>
      </PageHero>

      <MachineLineup heading="Drei Kategorien, ein Ziel: die gute Pause." showOverviewLink={false} />

      <section id="vergleich" aria-labelledby="vergleich-title" className="scroll-mt-24 py-20 sm:py-28">
        <div className="container-site">
          <SlotLabel>Im Vergleich</SlotLabel>
          <h2 id="vergleich-title" className="type-h2 mt-5 max-w-3xl">
            Welcher Automat passt wozu?
          </h2>
          <p className="mt-5 max-w-2xl text-ink/75">
            Eine Orientierung, keine technische Spezifikation: Konkrete Geräte, Maße und Ausstattung stimmen wir nach einer
            Standortprüfung mit Ihnen ab.
          </p>

          {/* Desktop table */}
          <div className="mt-12 hidden overflow-hidden rounded-panel border border-line md:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Vergleich der Automatenkategorien</caption>
              <thead className="bg-forest text-cream">
                <tr>
                  <th scope="col" className="w-[20%] p-5 font-mono text-xs font-medium tracking-wider uppercase">
                    Merkmal
                  </th>
                  {machines.map((m) => (
                    <th key={m.slug} scope="col" className="p-5 font-display text-lg font-semibold">
                      <Link href={`/automaten/${m.slug}`} className="underline-offset-4 hover:underline">
                        {m.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.label} className={i % 2 ? "bg-paper" : "bg-cream"}>
                    <th scope="row" className="border-t border-line p-5 align-top font-semibold">
                      {row.label}
                    </th>
                    {machines.map((m) => (
                      <td key={m.slug} className="border-t border-line p-5 align-top text-ink/80">
                        {row.values[m.slug]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-10 grid gap-4 md:hidden">
            {machines.map((m) => (
              <section key={m.slug} aria-label={m.name} className="rounded-panel border border-line bg-paper p-6">
                <h3 className="type-h3">
                  <Link href={`/automaten/${m.slug}`} className="underline-offset-4 hover:underline">
                    {m.name}
                  </Link>
                </h3>
                <dl className="mt-4 divide-y divide-line">
                  {comparison.map((row) => (
                    <div key={row.label} className="grid gap-1 py-3">
                      <dt className="slot-label text-muted">{row.label}</dt>
                      <dd className="text-ink/85">{row.values[m.slug]}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>

          <div className="mt-12 grid gap-6 rounded-panel bg-sand p-7 sm:p-9 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <h3 className="type-h3">Noch unsicher, welcher Automat passt?</h3>
              <p className="mt-2 text-ink/75">
                Kein Problem – das ist eher die Regel als die Ausnahme. Wählen Sie im Formular einfach „Noch offen“, und wir finden es
                gemeinsam heraus.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <ButtonLink href="/anfrage?automat=offen">Gemeinsam herausfinden</ButtonLink>
            </div>
          </div>

          <div className="mt-6 rounded-panel border border-dashed border-ink/25 p-7 sm:p-9">
            <SlotLabel>Ausblick</SlotLabel>
            <p className="mt-3 max-w-3xl text-ink/80">
              Perspektivisch denken wir über weitere Selbstbedienungslösungen nach, etwa Kaffeeautomaten oder kleine
              Verkaufspunkte mit 24/7-Zugang. Wenn Sie dafür einen passenden Standort haben, sprechen Sie uns gern schon heute an.
            </p>
          </div>
        </div>
      </section>

      <ProcessSteps />
      <CtaBand />
    </>
  );
}
