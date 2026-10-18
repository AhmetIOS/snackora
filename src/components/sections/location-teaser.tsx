import { Check } from "lucide-react";
import { locationCriteria, locationTypes } from "@/content/home";
import { ButtonLink } from "@/components/ui/button";
import { SlotLabel } from "@/components/ui/slot-label";

export function LocationTeaser() {
  return (
    <section aria-labelledby="location-title" className="relative overflow-hidden bg-lime py-20 sm:py-28">
      <div className="bg-rails pointer-events-none absolute inset-0 opacity-80" />
      <div className="container-site relative grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <SlotLabel className="text-ink/70">
            Für Eigentümer &amp; Betreiber
          </SlotLabel>
          <h2 id="location-title" className="type-h2 mt-5">
            Sie haben den Standort.
            <br />
            Wir haben die Idee.
          </h2>
          <p className="mt-6 max-w-lg text-ink/80">
            Sie besitzen, verwalten oder betreiben eine Fläche, auf der täglich Menschen unterwegs sind? Dann sehen wir uns gern an,
            ob ein Snackora-Automat dort sinnvoll ist – für Ihre Mieter, Mitarbeitenden oder Gäste.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Mögliche Standorte">
            {locationTypes.map((t) => (
              <li key={t} className="rounded-[9px] border border-ink/20 bg-cream/40 px-3 py-2 text-sm font-medium">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-3 xs:flex-row">
            <ButtonLink href="/standort-anbieten#formular" size="lg">
              Standort vorschlagen
            </ButtonLink>
            <ButtonLink href="/standort-anbieten" size="lg" variant="outline">
              Mehr erfahren
            </ButtonLink>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <div className="surface-dark rounded-panel bg-ink p-7 text-cream shadow-[0_30px_60px_-30px_rgb(14_26_20/0.6)] sm:p-9">
            <p className="slot-label text-muted-dark">Checkliste</p>
            <h3 className="type-h3 mt-3">Was einen Standort interessant macht</h3>
            <ul className="mt-7 divide-y divide-line-dark border-y border-line-dark">
              {locationCriteria.map((c) => (
                <li key={c.title} className="flex gap-4 py-4">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-[6px] bg-lime text-ink">
                    <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="mt-1 text-sm text-cream/70">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-cream/60">
              Jeder Standort wird individuell geprüft. Ein Vorschlag begründet keinen Anspruch auf eine Aufstellung.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
