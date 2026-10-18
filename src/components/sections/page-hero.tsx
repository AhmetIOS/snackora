import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { SlotLabel } from "@/components/ui/slot-label";
import { cn } from "@/lib/utils";

/** Standard hero for inner pages: breadcrumbs, slot label, H1, lead, optional aside. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  children,
  aside,
  tone = "light",
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <section className={cn("relative overflow-hidden", dark ? "surface-dark bg-forest text-cream" : "border-b border-line")}>
      <div className={cn("pointer-events-none absolute inset-0 opacity-70", dark ? "bg-rails-dark" : "bg-rails [mask-image:linear-gradient(to_bottom,black,transparent)]")} />
      <div className="container-site relative pt-8 pb-16 sm:pt-10 sm:pb-20">
        <Breadcrumbs items={crumbs} tone={tone} />
        <div className={cn("mt-10 grid gap-10 sm:mt-14", aside ? "lg:grid-cols-12 lg:items-end" : "")}>
          <div className={aside ? "lg:col-span-7" : "max-w-4xl"}>
            <SlotLabel tone={tone}>
              {eyebrow}
            </SlotLabel>
            <h1 className="type-h1 anim-fade-up mt-5">{title}</h1>
            {lead ? <div className={cn("type-lead anim-fade-up anim-delay-1 mt-6 max-w-2xl", dark ? "text-cream/80" : "text-ink/75")}>{lead}</div> : null}
            {children ? <div className="anim-fade-up anim-delay-2 mt-9">{children}</div> : null}
          </div>
          {aside ? <div className="lg:col-span-5">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
