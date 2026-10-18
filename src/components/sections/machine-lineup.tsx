import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { machinePhotos } from "@/content/media";
import { machines } from "@/content/machines";
import Image from "next/image";
import { MachineIllustration } from "@/components/illustrations/machines";
import { ProductCluster } from "@/components/illustrations/products";
import { SlotLabel } from "@/components/ui/slot-label";

/**
 * Product line-up of the three machine categories. Each card is a single
 * link target (stretched link) with a descriptive accessible name.
 */
// Each category gets its own light "stage" so the machines stand out and differ at a glance.
const STAGE = {
  snack: "bg-lime",
  drink: "bg-[#D6EAF4]",
  combo: "bg-sand",
  coffee: "bg-[#E6CFB4]",
} as const;

export function MachineLineup({
  heading = "Vier Konzepte. Eine Frage: Was passt zu Ihnen?",
  intro = "Snacks, gekühlte Getränke, frischer Kaffee oder Snacks und Getränke aus einem Gerät – welcher Automat sinnvoll ist, hängt von Ihrem Standort ab. Ein erster Überblick:",
  showOverviewLink = true,
  headingLevel = "h2",
}: {
  heading?: string;
  intro?: string;
  showOverviewLink?: boolean;
  headingLevel?: "h1" | "h2";
}) {
  const H = headingLevel;
  return (
    <section aria-labelledby="lineup-title" className="surface-dark relative overflow-hidden bg-forest py-20 text-cream sm:py-28">
      <div className="container-site relative">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SlotLabel tone="dark">
              Automatenlösungen
            </SlotLabel>
            <H id="lineup-title" className={`${H === "h1" ? "type-h1" : "type-h2"} mt-5`}>
              {heading}
            </H>
          </div>
          <div className="lg:col-span-5">
            <p className="text-cream/80">{intro}</p>
            {showOverviewLink ? (
              <Link
                href="/automaten"
                className="mt-4 inline-flex items-center gap-2 font-semibold text-lime underline-offset-4 hover:underline"
              >
                Alle Automaten im Überblick
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>

        <ul className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
          {machines.map((m) => (
            <li key={m.slug} className="reveal">
              <article className="group relative grid h-full grid-cols-[6.5rem_1fr] overflow-hidden rounded-panel border border-line-dark bg-forest-deep transition-colors duration-300 hover:border-lime/60 sm:grid-cols-[9rem_1fr] md:flex md:flex-col [&>div:first-child]:min-h-32">
                <div className={`relative overflow-hidden md:h-80 ${STAGE[m.illustration]}`}>
                  {machinePhotos[m.slug] ? (
                    <Image src={machinePhotos[m.slug]!.src} alt="" fill sizes="(min-width: 768px) 33vw, 9rem" className="object-cover" />
                  ) : (
                    <>
                      {/* desktop: machine + product still-life; mobile: products only */}
                      <MachineIllustration
                        kind={m.illustration}
                        decorative
                        className="absolute bottom-0 left-[10%] hidden h-[90%] w-auto transition-transform duration-500 ease-snap group-hover:-translate-y-1.5 md:block"
                      />
                      <ProductCluster
                        kind={m.illustration}
                        className="absolute inset-x-2 top-1/2 h-auto w-[calc(100%-1rem)] -translate-y-1/2 md:inset-x-auto md:top-auto md:right-[4%] md:bottom-0 md:w-[52%] md:translate-y-0"
                      />
                    </>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6 md:p-7">
                  <h3 className="type-h3 hyphens-auto xl:text-[1.4rem]">
                    <Link
                      href={`/automaten/${m.slug}`}
                      prefetch
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                      {m.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-[0.95rem] text-cream/75 md:mt-3 md:text-base">{m.teaser}</p>
                  <p className="mt-5 hidden items-start gap-2.5 border-t border-line-dark pt-5 text-sm font-medium text-cream md:flex">
                    <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-[2px] bg-lime" />
                    {m.differentiator}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lime md:mt-6" aria-hidden="true">
                    Mehr erfahren
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
                {/* visible focus ring for the stretched link */}
                <span className="pointer-events-none absolute inset-0 rounded-panel ring-lime ring-offset-0 group-has-[a:focus-visible]:ring-2" aria-hidden="true" />
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
