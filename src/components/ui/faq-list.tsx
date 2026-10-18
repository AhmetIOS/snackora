import { Plus } from "lucide-react";
import type { Faq } from "@/content/faqs";

/**
 * Accordion built on native <details>/<summary>: keyboard- and
 * screen-reader-accessible without JavaScript; height animates via CSS
 * where supported.
 */
export function FaqList({ items, headingLevel = "h3" }: { items: Faq[]; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <div className="border-t border-ink/15">
      {items.map((f) => (
        <details key={f.id} id={`frage-${f.id}`} data-accordion className="group border-b border-ink/15">
          <summary className="flex items-start justify-between gap-6 py-6 [&::marker]:content-none">
            <H className="font-display text-[1.2rem] leading-snug font-semibold tracking-[-0.01em] sm:text-[1.35rem]">{f.question}</H>
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[9px] border border-ink/15 transition-[transform,background-color,color] duration-300 ease-snap group-open:rotate-45 group-open:bg-forest group-open:text-lime"
            >
              <Plus className="size-4" strokeWidth={2.25} />
            </span>
          </summary>
          <div className="max-w-2xl space-y-3 pr-12 pb-7 text-ink/80">
            {f.answer.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
