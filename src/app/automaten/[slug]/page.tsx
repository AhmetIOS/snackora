import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { machinePhotos } from "@/content/media";
import { getMachine, machines } from "@/content/machines";
import { PhotoFigure } from "@/components/ui/photo-figure";
import { MachineIllustration } from "@/components/illustrations/machines";
import { CtaBand } from "@/components/sections/cta-band";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { SlotLabel } from "@/components/ui/slot-label";
import { JsonLd, serviceJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return machines.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = getMachine(slug);
  if (!m) return {};
  return pageMetadata({ title: m.seo.title, description: m.seo.description, path: `/automaten/${m.slug}` });
}

// Params are read inside <Suspense> so client navigations can render the
// App Shell (with this fallback) instantly; known slugs are fully prerendered.
export default function MachinePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<MachinePageFallback />}>
      <MachinePageContent params={params} />
    </Suspense>
  );
}

function MachinePageFallback() {
  return (
    <section className="surface-dark bg-forest text-cream" aria-busy="true">
      <div className="container-site pt-10 pb-24">
        <div className="h-3 w-56 rounded bg-cream/10" />
        <div className="mt-24 h-3 w-40 rounded bg-cream/10" />
        <div className="mt-6 h-16 w-full max-w-xl rounded-key bg-cream/10" />
        <div className="mt-6 h-6 w-full max-w-lg rounded bg-lime/20" />
        <div className="mt-8 h-24 w-full max-w-2xl rounded bg-cream/5" />
      </div>
    </section>
  );
}

async function MachinePageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getMachine(slug);
  if (!m) notFound();
  const others = machines.filter((o) => o.slug !== m.slug);
  const requestHref = `/anfrage?automat=${m.formValue}`;

  return (
    <>
      <section className="surface-dark relative overflow-hidden bg-forest text-cream">
        <div className="bg-rails-dark pointer-events-none absolute inset-0" />
        <div className="container-site relative pt-8 sm:pt-10">
          <Breadcrumbs
            tone="dark"
            items={[
              { name: "Automaten", href: "/automaten" },
              { name: m.name, href: `/automaten/${m.slug}` },
            ]}
          />
          <div className="grid gap-10 pt-10 lg:grid-cols-12 lg:items-end lg:pt-14">
            <div className="pb-6 lg:col-span-7 lg:pb-24">
              <SlotLabel tone="dark">
                Automatenlösung
              </SlotLabel>
              <h1 className="type-h1 anim-fade-up mt-5">{m.name}</h1>
              <p className="anim-fade-up anim-delay-1 mt-4 font-display text-[clamp(1.25rem,1rem+1vw,1.75rem)] leading-snug font-medium text-lime">
                {m.tagline}
              </p>
              <p className="type-lead anim-fade-up anim-delay-2 mt-6 max-w-2xl text-cream/80">{m.intro[0]}</p>
              <div className="anim-fade-up anim-delay-3 mt-9 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
                <ButtonLink href={requestHref} variant="accent" size="lg">
                  {m.singular} anfragen
                </ButtonLink>
                <ButtonLink href="/standort-anbieten" variant="outline-dark" size="lg">
                  Standort anbieten
                </ButtonLink>
              </div>
            </div>
            {machinePhotos[m.slug] ? (
              <PhotoFigure photo={machinePhotos[m.slug]!} preload tone="dark" sizes="(min-width: 1024px) 40vw, 100vw" className="pb-10 lg:col-span-5" />
            ) : (
            <figure className="relative mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
              <div className="relative mx-auto aspect-[400/760] w-[min(64vw,16rem)] sm:w-[18rem] lg:w-[20rem]">
                <div className="absolute inset-x-[-12%] bottom-0 h-[48%] rounded-t-[1.5rem] bg-lime/90" aria-hidden="true" />
                <MachineIllustration kind={m.illustration} className="relative z-10 h-auto w-full drop-shadow-[0_24px_30px_rgb(0_0_0/0.35)]" />
              </div>
              <figcaption className="py-3 text-xs text-cream/60">Illustration: Designkonzept. Gerät und Ausstattung werden individuell abgestimmt.</figcaption>
            </figure>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="einsatz-title" className="py-20 sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SlotLabel>Einsatzbereiche</SlotLabel>
            <h2 id="einsatz-title" className="type-h2 mt-5">
              Wo ein {m.singular} seine Stärken ausspielt.
            </h2>
            <p className="mt-6 text-ink/75">{m.intro[1]}</p>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2 lg:col-span-7">
            {m.applications.map((a, i) => (
              <li key={a.title} className="reveal bg-paper p-7">
                <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="type-h3 mt-3">{a.title}</h3>
                <p className="mt-3 text-ink/75">{a.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="sortiment-title" className="border-y border-line bg-paper py-20 sm:py-28">
        <div className="container-site">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SlotLabel>Mögliches Sortiment</SlotLabel>
              <h2 id="sortiment-title" className="type-h2 mt-5">
                Was in die Fächer kommt, entscheiden wir gemeinsam.
              </h2>
            </div>
            <p className="text-ink/75 lg:col-span-5">
              Die Auswahl hängt vom Gerät, vom Standort und von den Bezugsmöglichkeiten ab. Die folgende Übersicht zeigt typische
              Produktgruppen – keine feste Liste.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {m.assortment.map((g, i) => (
              <div key={g.group} className={`reveal rounded-panel p-7 ${i === 0 ? "bg-forest text-cream" : i === 1 ? "bg-lime" : "bg-sand"}`}>
                <h3 className="type-h3">{g.group}</h3>
                <ul className="mt-5 space-y-3">
                  {g.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-2 size-2 shrink-0 rounded-[2px] ${i === 0 ? "bg-lime" : "bg-ink"}`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="vorteile-title" className="py-20 sm:py-28">
        <div className="container-site grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SlotLabel>Ihre Vorteile</SlotLabel>
            <h2 id="vorteile-title" className="type-h2 mt-5">
              Warum sich ein {m.singular} lohnen kann.
            </h2>
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {m.benefits.map((b) => (
                <li key={b.title} className="py-6">
                  <h3 className="type-h3">{b.title}</h3>
                  <p className="mt-2 text-ink/75">{b.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6 lg:col-span-5 lg:col-start-8">
            <div className="rounded-panel border border-line bg-paper p-7">
              <h3 className="slot-label text-muted">Geeignet für</h3>
              <ul className="mt-5 space-y-3">
                {m.suitableFor.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-[5px] bg-forest text-lime">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface-dark rounded-panel bg-ink p-7 text-cream">
              <h3 className="slot-label text-muted-dark">Individuell anpassbar</h3>
              <ul className="mt-5 space-y-3">
                {m.customization.map((c) => (
                  <li key={c} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-[2px] bg-lime" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="hinweise-title" className="border-t border-line bg-sand/60 py-20 sm:py-24">
        <div className="container-site">
          <SlotLabel>Gut zu wissen</SlotLabel>
          <h2 id="hinweise-title" className="type-h2 mt-5 max-w-3xl">
            Was Sie vorab bedenken sollten.
          </h2>
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {m.considerations.map((c, i) => (
              <li key={c.title} className="border-t-2 border-forest pt-5">
                <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 text-ink/75">{c.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-14 flex flex-col gap-4 rounded-panel bg-paper p-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl font-medium">Sie möchten wissen, ob ein {m.singular} an Ihrem Standort passt? Wir prüfen das gern mit Ihnen.</p>
            <ButtonLink href={requestHref}>{m.singular} anfragen</ButtonLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="weitere-title" className="py-20">
        <div className="container-site">
          <h2 id="weitere-title" className="slot-label text-muted">
            Weitere Automatenlösungen
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/automaten/${o.slug}`}
                  className="group flex items-center justify-between gap-6 rounded-panel border border-line bg-paper p-6 transition-colors hover:border-forest"
                >
                  <span className="min-w-0">
                    <span className="font-display text-xl font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-2xl">{o.name}</span>
                    <span className="mt-1 block text-ink/70">{o.tagline}</span>
                  </span>
                  <ArrowUpRight className="size-6 shrink-0 text-forest transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand cta={{ label: `${m.singular} unverbindlich anfragen`, href: requestHref }} />
      <JsonLd data={serviceJsonLd(m)} />
    </>
  );
}
