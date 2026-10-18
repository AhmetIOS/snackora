import { valueProps } from "@/content/home";
import { ButtonLink } from "@/components/ui/button";
import { SlotLabel } from "@/components/ui/slot-label";

export function ValueProps() {
  return (
    <section aria-labelledby="value-title" className="py-20 sm:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
            <SlotLabel>Warum Snackora</SlotLabel>
            <h2 id="value-title" className="type-h2 mt-5">
              Pausen&shy;versorgung, die zu Ihrem Standort passt.
            </h2>
            <p className="mt-6 max-w-md text-ink/75">
              Kein Automat von der Stange, sondern eine Lösung, die zu Ihren Räumen, Arbeitszeiten und Menschen passt. Wir planen lieber
              einmal gründlich als zweimal halbherzig.
            </p>
            <ButtonLink href="/fuer-unternehmen" variant="outline" className="mt-8">
              Lösungen für Unternehmen
            </ButtonLink>
          </div>
        </div>
        <ol className="lg:col-span-7">
          {valueProps.map((v) => (
            <li key={v.code} className="reveal grid grid-cols-[auto_1fr] gap-5 border-t border-line py-8 first:border-t-0 first:pt-0 sm:gap-8 lg:first:border-t lg:first:pt-8">
              <span className="grid size-14 place-items-center rounded-key border border-ink/15 bg-paper font-mono text-lg font-medium text-forest shadow-[inset_0_-3px_0_rgb(14_26_20/0.06)]">
                {v.code}
              </span>
              <div>
                <h3 className="type-h3">{v.title}</h3>
                <p className="mt-3 max-w-xl text-ink/75">{v.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
