import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { homeFaqs } from "@/content/faqs";
import { HomeHero } from "@/components/sections/home/hero";
import { ValueProps } from "@/components/sections/value-props";
import { MachineLineup } from "@/components/sections/machine-lineup";
import { UseCases } from "@/components/sections/use-cases";
import { ProcessSteps } from "@/components/sections/process-steps";
import { LocationTeaser } from "@/components/sections/location-teaser";
import { RegionSection } from "@/components/sections/region";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqList } from "@/components/ui/faq-list";
import { SlotLabel } from "@/components/ui/slot-label";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <ValueProps />
      <MachineLineup />
      <UseCases />
      <ProcessSteps />
      <LocationTeaser />
      <RegionSection />

      <section aria-labelledby="faq-preview-title" className="border-t border-line bg-paper py-20 sm:py-28">
        <div className="container-site grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SlotLabel>Häufige Fragen</SlotLabel>
            <h2 id="faq-preview-title" className="type-h2 mt-5">
              Gute Fragen. Ehrliche Antworten.
            </h2>
            <Link
              href="/faq"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-forest underline-offset-4 hover:underline"
            >
              Alle Fragen ansehen
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={homeFaqs} />
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
