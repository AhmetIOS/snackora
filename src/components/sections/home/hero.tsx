import { hero, offerStrip } from "@/content/home";
import { heroPhoto } from "@/content/media";
import { PhotoFigure } from "@/components/ui/photo-figure";
import { SnackMachine } from "@/components/illustrations/machines";
import { ProductCluster } from "@/components/illustrations/products";
import { ButtonLink } from "@/components/ui/button";
import { SlotLabel } from "@/components/ui/slot-label";

function Annotation({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <div className={`absolute z-20 hidden items-center gap-2 sm:flex ${className}`} aria-hidden="true">
      <span className="slot-label flex items-center gap-2 rounded-[8px] border border-ink/10 bg-paper/95 px-2.5 py-1.5 text-ink shadow-[0_8px_24px_-12px_rgb(14_26_20/0.35)] backdrop-blur">
        <span className="size-2 rounded-[2px] bg-lime ring-1 ring-forest" />
        {children}
      </span>
    </div>
  );
}

export function HomeHero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="bg-rails pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="container-site relative grid gap-10 pt-8 sm:pt-12 lg:grid-cols-12 lg:items-center lg:gap-6 lg:pt-10">
        <div className="pb-4 lg:col-span-7 lg:pb-16">
          <SlotLabel className="anim-fade-up">
            {hero.eyebrow} · {hero.region[0]}
          </SlotLabel>
          <h1 id="hero-title" className="type-hero anim-fade-up anim-delay-1 mt-6 font-display font-semibold text-ink">
            <span className="block">{hero.headline[0]}</span>
            <span className="block text-forest">
              {hero.headline[1].replace(/\.$/, "")}
              <span aria-hidden="true" className="ml-[0.04em] inline-block size-[0.2em] rounded-[0.03em] bg-lime ring-[0.035em] ring-forest" />
              <span className="sr-only">.</span>
            </span>
          </h1>
          {!heroPhoto ? (
            <figure className="anim-fade-up anim-delay-1 mt-7 lg:hidden">
              <div className="relative h-52 overflow-hidden rounded-panel bg-lime xs:h-60 sm:h-72">
                <div className="bg-rails absolute inset-0 opacity-70" aria-hidden="true" />
                <SnackMachine decorative className="absolute top-5 left-[7%] h-auto w-[44%] max-w-[13rem] drop-shadow-[0_18px_24px_rgb(14_26_20/0.25)]" />
                <ProductCluster kind="combo" className="absolute right-[4%] bottom-3 h-auto w-[50%] max-w-[16rem]" />
              </div>
              <figcaption className="mt-2 text-xs text-muted">Illustration: Designkonzept eines Snackora-Automaten.</figcaption>
            </figure>
          ) : null}
          <p className="type-lead anim-fade-up anim-delay-2 mt-7 max-w-[36rem] text-ink/80">{hero.lead}</p>
          <div className="anim-fade-up anim-delay-3 mt-9 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <ButtonLink href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} size="lg" variant="outline">
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>
          <p className="slot-label anim-fade-up anim-delay-3 mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
            {hero.region.map((r, i) => (
              <span key={r} className="flex items-center gap-3">
                {i > 0 ? <span aria-hidden="true" className="size-1.5 rounded-[1px] bg-forest/50" /> : null}
                {r}
              </span>
            ))}
          </p>
        </div>

        {heroPhoto ? (
          <PhotoFigure photo={heroPhoto} preload sizes="(min-width: 1024px) 40vw, 100vw" className="lg:col-span-5 lg:pb-12" />
        ) : (
        <figure className="relative mx-auto hidden w-full max-w-[26rem] lg:col-span-5 lg:block lg:max-w-none">
          <div className="relative mx-auto aspect-[400/760] w-[min(58vw,14rem)] sm:w-[20rem] lg:w-[min(100%,23.5rem)] xl:w-[25rem]">
            {/* plinth */}
            <div className="absolute inset-x-[-18%] bottom-0 h-[58%] rounded-t-[1.75rem] bg-lime" aria-hidden="true">
              <div className="bg-rails h-full w-full rounded-t-[1.75rem] opacity-70" />
            </div>
            <SnackMachine animated className="relative z-10 h-full w-full drop-shadow-[0_30px_40px_rgb(14_26_20/0.25)]" />
            <Annotation className="top-[19%] -left-[30%] lg:-left-[34%]">
              Herzhaft &amp; süß
            </Annotation>
            <Annotation className="top-[45%] -left-[24%] lg:-left-[30%]">
              Proteinriegel
            </Annotation>
            <Annotation className="top-[33%] -right-[22%] lg:-right-[4%] xl:-right-[22%]">
              Kontaktlos*
            </Annotation>
          </div>
          <figcaption className="relative z-10 border-t border-ink/10 bg-cream py-3 text-xs text-muted">
            Illustration: Designkonzept eines Snackora-Automaten. *Bargeldlose Zahlung je nach Gerät.
          </figcaption>
        </figure>
        )}
      </div>

      <div className="border-y border-line bg-paper">
        <ul className="container-site flex flex-wrap items-center gap-x-6 gap-y-2 py-4 sm:justify-between" aria-label="Angebot">
          {offerStrip.map((item, i) => (
            <li key={item} className="slot-label flex items-center gap-2.5 text-ink">
              {i > 0 ? <span aria-hidden="true" className="hidden size-1.5 rounded-[1px] bg-forest/40 sm:inline-block" /> : null}
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
