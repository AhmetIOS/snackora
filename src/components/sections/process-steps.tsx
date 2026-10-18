import { processSteps } from "@/content/home";
import { SlotLabel } from "@/components/ui/slot-label";

export function ProcessSteps({
  heading = "Von der Idee zum passenden Automaten.",
  intro = "Vier Schritte, klar und ohne Kleingedrucktes. Sie entscheiden in jeder Phase, ob es weitergeht.",
}: {
  heading?: string;
  intro?: string;
}) {
  return (
    <section aria-labelledby="process-title" className="border-y border-line bg-paper py-20 sm:py-28">
      <div className="container-site">
        <div className="max-w-3xl">
          <SlotLabel>So läuft es ab</SlotLabel>
          <h2 id="process-title" className="type-h2 mt-5">
            {heading}
          </h2>
          <p className="mt-5 text-ink/75">{intro}</p>
        </div>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {/* rail */}
          <span aria-hidden="true" className="absolute top-7 left-0 hidden h-px w-full bg-ink/15 lg:block" />
          <span aria-hidden="true" className="absolute top-0 bottom-0 left-7 w-px bg-ink/15 md:hidden" />
          {processSteps.map((s, i) => (
            <li key={s.code} className="reveal relative grid grid-cols-[auto_1fr] gap-5 md:block">
              <span
                className={`relative z-10 grid size-14 place-items-center rounded-key border font-mono text-lg font-medium shadow-[inset_0_-3px_0_rgb(14_26_20/0.08)] ${
                  i === 0 ? "border-forest bg-forest text-lime" : "border-ink/20 bg-cream text-forest"
                }`}
              >
                {s.code}
              </span>
              <div className="md:mt-6">
                <h3 className="type-h3">{s.title}</h3>
                <p className="mt-3 text-ink/75">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-12 flex items-start gap-3 border-t border-line pt-6 text-sm text-muted">
          <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-[2px] bg-forest" />
          Ihre Anfrage ist unverbindlich. Ob und in welcher Form ein Automat aufgestellt wird, entscheiden wir gemeinsam nach Prüfung
          des Standorts.
        </p>
      </div>
    </section>
  );
}
