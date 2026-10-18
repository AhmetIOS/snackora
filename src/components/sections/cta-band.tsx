import { finalCta } from "@/content/home";
import { BrandSymbol } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export function CtaBand({
  headline = finalCta.headline,
  text = finalCta.text,
  cta = finalCta.cta,
  secondary = { label: "Standort anbieten", href: "/standort-anbieten" },
}: {
  headline?: string;
  text?: string;
  cta?: { label: string; href: string };
  secondary?: { label: string; href: string } | null;
}) {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-lime text-ink">
      <BrandSymbol
        tile={false}
        className="pointer-events-none absolute top-1/2 -right-16 hidden size-[30rem] -translate-y-1/2 text-[#B9E25A] md:block lg:right-8"
      />
      <div className="container-site relative py-20 sm:py-28">
        <p className="slot-label flex items-center gap-2.5 text-ink/70">
          <span aria-hidden="true" className="size-2 rounded-[2px] bg-forest" />
          Unverbindlich anfragen
        </p>
        <h2 id="cta-title" className="type-h1 mt-6 max-w-4xl">
          {headline}
        </h2>
        <p className="type-lead mt-6 max-w-2xl text-ink/80">{text}</p>
        <div className="mt-10 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
          <ButtonLink href={cta.href} size="lg">
            {cta.label}
          </ButtonLink>
          {secondary ? (
            <ButtonLink href={secondary.href} variant="outline" size="lg">
              {secondary.label}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
