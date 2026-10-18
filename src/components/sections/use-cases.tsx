import { BedDouble, Building2, Dumbbell, Warehouse, type LucideIcon } from "lucide-react";
import { useCases } from "@/content/home";
import { SlotLabel } from "@/components/ui/slot-label";
import { cn } from "@/lib/utils";

const icons: Record<(typeof useCases)[number]["key"], LucideIcon> = {
  buero: Building2,
  produktion: Warehouse,
  fitness: Dumbbell,
  hotel: BedDouble,
};

// Deliberately uneven composition – each environment gets its own surface.
const layout = [
  "lg:col-span-7 bg-paper",
  "lg:col-span-5 bg-sand",
  "lg:col-span-5 bg-ink text-cream surface-dark",
  "lg:col-span-7 bg-lime",
];

export function UseCases({ heading = "Wo ein Automat den Alltag leichter macht." }: { heading?: string }) {
  return (
    <section aria-labelledby="usecases-title" className="py-20 sm:py-28">
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SlotLabel>Einsatzbereiche</SlotLabel>
            <h2 id="usecases-title" className="type-h2 mt-5">
              {heading}
            </h2>
          </div>
          <p className="text-ink/75 lg:col-span-5">
            Überall dort, wo Menschen arbeiten, trainieren oder übernachten, entsteht Bedarf an einer schnellen, unkomplizierten Pause.
            Vier typische Umgebungen:
          </p>
        </div>

        <ul className="mt-12 grid gap-4 lg:grid-cols-12">
          {useCases.map((u, i) => {
            const Icon = icons[u.key];
            const dark = i === 2;
            return (
              <li key={u.key} className={cn("reveal relative flex flex-col justify-between overflow-hidden rounded-panel p-6 sm:p-9", layout[i])}>
                <div className="flex items-start justify-between gap-6">
                  <h3 className="type-h3 max-w-xs">{u.title}</h3>
                  <span
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-key",
                      dark ? "bg-lime text-ink" : i === 3 ? "bg-ink text-lime" : "bg-forest text-lime"
                    )}
                  >
                    <Icon className="size-6" aria-hidden="true" strokeWidth={1.75} />
                  </span>
                </div>
                <p className={cn("mt-5 max-w-lg sm:mt-10", dark ? "text-cream/80" : "text-ink/80")}>{u.text}</p>
                <ul className="mt-6 hidden flex-wrap gap-2 sm:flex" aria-label="Typische Anforderungen">
                  {u.needs.map((n) => (
                    <li
                      key={n}
                      className={cn(
                        "slot-label rounded-[7px] border px-2.5 py-1.5",
                        dark ? "border-cream/20 text-cream/85" : "border-ink/15 text-ink/80"
                      )}
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
