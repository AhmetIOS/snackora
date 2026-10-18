import { business } from "@/config/business";
import { RegionMap } from "@/components/illustrations/region-map";
import { SlotLabel } from "@/components/ui/slot-label";

export function RegionSection() {
  return (
    <section aria-labelledby="region-title" className="py-20 sm:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-5">
          <SlotLabel>Einsatzgebiet</SlotLabel>
          <h2 id="region-title" className="type-h2 mt-5">
            Regional gedacht.
            <br />
            Persönlich betreut.
          </h2>
          <p className="mt-6 max-w-md text-ink/75">
            Snackora ist in der {business.serviceRegion.label} zu Hause. Kurze Wege bedeuten für Sie: direkte Abstimmung, ein
            Ansprechpartner, der die Gegend kennt, und Termine vor Ort ohne lange Anfahrt.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 border-t border-line" aria-label="Schwerpunktorte">
            {business.serviceRegion.cities.map((c) => (
              <li key={c} className="flex items-center gap-3 border-b border-line py-3 font-medium">
                <span aria-hidden="true" className="size-2 rounded-[2px] bg-forest" />
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted">Und in den umliegenden Gemeinden – fragen Sie einfach an.</p>
        </div>
        <figure className="lg:col-span-7">
          <div className="overflow-hidden rounded-panel border border-line bg-paper p-3 sm:p-6">
            <RegionMap className="h-auto w-full" />
          </div>
        </figure>
      </div>
    </section>
  );
}
