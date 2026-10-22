import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { Coffee, Cookie, CupSoda, Handshake, type LucideIcon } from "lucide-react";
import { hero, heroTags } from "@/content/home";
import { heroPhoto } from "@/content/media";
import { AngledMachine } from "@/components/illustrations/machine-angled";
import { SceneFloor, SceneWall } from "@/components/illustrations/hero-scene";
import { ButtonLink } from "@/components/ui/button";
import { SlotLabel } from "@/components/ui/slot-label";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = { snacks: Cookie, drinks: CupSoda, coffee: Coffee, care: Handshake };

/** Floating feature tag around the machine (desktop/tablet). */
function Tag({ icon, title, text, className }: { icon: string; title: string; text: string; className: string }) {
  const Icon = icons[icon] ?? Cookie;
  return (
    <div
      className={cn(
        "absolute z-20 hidden items-center gap-3 rounded-2xl bg-paper/95 py-2.5 pr-4 pl-2.5 shadow-[0_18px_40px_-18px_rgb(14_26_20/0.45)] ring-1 ring-ink/5 backdrop-blur sm:flex",
        className
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-forest text-lime">
        <Icon className="size-[1.1rem]" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="font-mono text-[0.68rem] leading-tight font-medium tracking-[0.08em] text-ink uppercase">
        {title}
        <span className="block text-muted">{text}</span>
      </span>
    </div>
  );
}

/** The slogan. Rendered twice (mobile/desktop layouts) but only once as the page's <h1>. */
function Headline({ className }: { className: string }) {
  return (
    <p aria-hidden="true" className={className}>
      <span className="block">{hero.headline[0]}</span>
      <span className="block text-forest">
        {hero.headline[1].replace(/\.$/, "")}
        <span aria-hidden="true" className="ml-[0.04em] inline-block size-[0.2em] rounded-[0.03em] bg-lime ring-[0.035em] ring-forest" />
        <span className="sr-only">.</span>
      </span>
    </p>
  );
}

/** Machine + floating tags. The room scene behind it is provided by the parent. */
function Machine() {
  return (
    <div className="relative h-full w-full">
      {heroPhoto ? (
        <div
          className="absolute bottom-0 left-1/2 h-full -translate-x-1/2"
          style={{ aspectRatio: `${heroPhoto.width} / ${heroPhoto.height}` }}
        >
          <HeroPhoto variant="desktop" className="object-contain" />
        </div>
      ) : (
        <AngledMachine animated className="absolute bottom-0 left-1/2 h-full w-auto -translate-x-1/2" />
      )}
      <Tag {...heroTags[0]!} className="top-[18%] -left-[6%] xl:-left-[14%]" />
      <Tag {...heroTags[1]!} className="top-[52%] -left-[2%] xl:-left-[10%]" />
      <Tag {...heroTags[2]!} className="top-[8%] -right-[4%] xl:-right-[12%]" />
      <Tag {...heroTags[3]!} className="top-[64%] -right-[2%] xl:-right-[8%]" />
    </div>
  );
}

/**
 * Desktop and mobile show the photo in different layouts. Each <picture> swaps
 * in a 1×1 placeholder for the other viewport, so a device downloads (and
 * preloads) only the variant it actually displays.
 */
const HERO_SIZES = { desktop: "(min-width: 1024px) 38vw, 80vw", mobile: "(min-width: 640px) 50vw, 61vw" } as const;
const MEDIA = { desktop: "(min-width: 1024px)", mobile: "(max-width: 1023.98px)" } as const;
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function HeroPhoto({ variant, className }: { variant: keyof typeof MEDIA; className: string }) {
  if (!heroPhoto) return null;
  const { props } = getImageProps({
    src: heroPhoto.src,
    alt: heroPhoto.alt,
    fill: true,
    loading: "eager",
    fetchPriority: "high",
    sizes: HERO_SIZES[variant],
    className,
  });
  preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: "high", media: MEDIA[variant] });
  const other = variant === "desktop" ? MEDIA.mobile : MEDIA.desktop;
  return (
    <picture>
      <source media={other} srcSet={BLANK} />
      <img {...props} alt={props.alt} />
    </picture>
  );
}

export function HomeHero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden [--floor-h:4rem]">
      <h1 id="hero-title" className="sr-only">
        {hero.seoHeadline}: {hero.headline.join(" ")}
      </h1>
      {/* ── desktop: one full-bleed room. The floor line IS the layout line above the feature row. ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <SceneWall className="absolute inset-x-0 top-0 bottom-[var(--floor-h)] h-auto w-full" />
        <SceneFloor className="absolute inset-x-0 bottom-0 h-[var(--floor-h)]" />
        {/* cream fade so the text stays legible; the scene fully shows on the right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #F5F1E6 0%, #F5F1E6 30%, rgb(245 241 230 / 0.85) 44%, rgb(245 241 230 / 0.2) 58%, rgb(245 241 230 / 0) 68%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-28" style={{ background: "linear-gradient(to bottom, rgb(245 241 230 / 0) 0%, rgb(245 241 230 / 0.7) 45%, #F5F1E6 100%)" }} />
      </div>

      {/* ── mobile/tablet: text left, machine right on a soft podium ── */}
      <div className="relative lg:hidden">
        {/* clean backdrop: soft lime light behind the machine, no scenery */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 46% at 80% 36%, rgb(201 242 107 / 0.55), rgb(201 242 107 / 0) 72%), radial-gradient(40% 30% at 70% 70%, rgb(18 56 42 / 0.06), rgb(18 56 42 / 0) 70%)",
          }}
        />

        <div className="container-site relative">
          <SlotLabel className="anim-fade-up pt-8 sm:pt-12">{hero.eyebrow}</SlotLabel>
          <div className="grid grid-cols-[minmax(0,1fr)_50%] items-end gap-1 pt-3 xs:grid-cols-[minmax(0,1fr)_52%] sm:grid-cols-2 sm:gap-6 sm:pt-5">
            {/* text column – top-aligned beside the machine */}
            <div className="relative z-10 self-center py-2 sm:self-end sm:pb-8">
              <Headline className="anim-fade-up anim-delay-1 font-display text-[clamp(1.5rem,7vw,3.2rem)] leading-[0.95] font-semibold tracking-[-0.03em] text-ink" />
              <p className="anim-fade-up anim-delay-2 mt-3 text-[0.88rem] leading-snug text-ink/75 sm:text-base">{hero.leadShort}</p>
              <div className="anim-fade-up anim-delay-3 mt-5 hidden flex-col gap-2 sm:flex">
                <ButtonLink href={hero.primaryCta.href} size="md" className="w-fit">
                  {hero.primaryCta.label}
                </ButtonLink>
                <ButtonLink href={hero.secondaryCta.href} size="md" variant="outline" className="w-fit">
                  {hero.secondaryCta.label}
                </ButtonLink>
              </div>
            </div>

            {/* machine column: podium + machine, bleeding slightly past the right edge */}
            <div className="relative w-full self-end">
              {/* podium */}
              <div
                aria-hidden="true"
                className="absolute bottom-[-4%] left-[-2%] h-[20%] w-[118%] rounded-[50%] sm:left-0 sm:w-[106%]"
                style={{ background: "radial-gradient(50% 50% at 50% 50%, #C9F26B 0%, #D9F58F 45%, rgb(230 248 184 / 0.6) 75%, rgb(245 241 230 / 0) 100%)" }}
              />
              <div
                aria-hidden="true"
                className="absolute bottom-[3%] left-[14%] h-[6%] w-[80%] rounded-[50%] bg-ink/25 blur-md"
              />
              {heroPhoto ? (
                <div className="relative ml-auto w-[122%] -mr-[16%] sm:mr-0 sm:w-[104%]" style={{ aspectRatio: `${heroPhoto.width} / ${heroPhoto.height}` }}>
                  <HeroPhoto variant="mobile" className="object-contain object-bottom drop-shadow-[0_18px_24px_rgb(14_26_20/0.22)]" />
                </div>
              ) : (
                <AngledMachine animated className="relative ml-auto h-auto w-[122%] -mr-[16%] sm:mr-0 sm:w-full" />
              )}
            </div>
          </div>

          {/* feature cards */}
          <ul className="relative mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4" aria-label="Unser Angebot">
            {heroTags.map((t) => {
              const Icon = icons[t.icon] ?? Cookie;
              return (
                <li key={t.title} className="flex items-center gap-3 rounded-[14px] border border-ink/[0.06] bg-white px-3 py-3 shadow-[0_10px_28px_-18px_rgb(14_26_20/0.45)]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-lime text-ink">
                    <Icon className="size-[1.05rem]" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[0.62rem] leading-tight font-medium tracking-[0.06em] text-ink uppercase">
                    {t.title}
                    <span className="block font-sans text-[0.72rem] font-normal tracking-normal text-muted normal-case">{t.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>

          {/* phones: two compact buttons side by side, below the cards */}
          <div className="anim-fade-up anim-delay-3 mt-5 grid grid-cols-2 gap-2.5 pb-10 sm:hidden">
            <ButtonLink href={hero.primaryCta.href} size="md" plain className="min-h-11 rounded-full! px-3 text-[0.88rem] shadow-[0_14px_30px_-14px_rgb(18_56_42/0.55)]">
              {hero.primaryCtaShort}
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="outline" size="md" plain className="min-h-11 rounded-full! px-3 text-[0.88rem]">
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>
          <div className="hidden pb-10 sm:block" />
        </div>
      </div>

      <div className="container-site relative hidden lg:grid lg:min-h-[min(39rem,78vh)] lg:grid-cols-12 lg:grid-rows-[1fr_var(--floor-h)] lg:gap-x-6 lg:pb-0">
        {/* text (above the floor line) */}
        <div className="lg:col-span-6 lg:row-start-1 lg:self-center lg:py-14">
          <SlotLabel className="anim-fade-up">
            {hero.eyebrow} · {hero.region[0]}
          </SlotLabel>
          <Headline className="type-hero anim-fade-up anim-delay-1 mt-6 font-display font-semibold text-ink" />
          <p className="type-lead anim-fade-up anim-delay-2 mt-7 max-w-[36rem] text-ink/80">{hero.lead}</p>
          <div className="anim-fade-up anim-delay-3 mt-9 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <ButtonLink href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} size="lg" variant="outline">
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>

        {/* desktop machine: feet on the floor line, shadow falls onto the floor */}
        <div className="anim-fade-up anim-delay-1 hidden lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:block lg:self-end">
          <div className="relative mx-auto h-[min(38rem,70vh)] min-h-[29rem] w-full max-w-[34rem] translate-y-[6%]">
            <Machine />
          </div>
        </div>
      </div>

    </section>
  );
}
