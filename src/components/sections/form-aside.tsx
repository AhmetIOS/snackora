import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { business, isEmailActive } from "@/config/business";

/** Side panel next to forms: what happens next + alternative channels. */
export function FormAside({
  steps,
  links = [],
}: {
  steps: { title: string; text: string }[];
  links?: { label: string; href: string; text: string }[];
}) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
      <div className="surface-dark rounded-panel bg-forest p-7 text-cream">
        <p className="slot-label text-muted-dark">So geht es weiter</p>
        <ol className="mt-5 space-y-5">
          {steps.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[auto_1fr] gap-4">
              <span className="grid size-9 place-items-center rounded-[9px] bg-lime font-mono text-sm font-medium text-ink">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-cream/75">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {(isEmailActive || business.phone) && (
        <div className="rounded-panel border border-line bg-paper p-7">
          <p className="slot-label text-muted">Lieber direkt?</p>
          <ul className="mt-4 space-y-3">
            {isEmailActive ? (
              <li>
                <a href={`mailto:${business.email.address}`} className="inline-flex items-center gap-3 font-semibold text-forest hover:underline">
                  <Mail className="size-5" aria-hidden="true" />
                  {business.email.address}
                </a>
              </li>
            ) : null}
            {business.phone ? (
              <li>
                <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-3 font-semibold text-forest hover:underline">
                  <Phone className="size-5" aria-hidden="true" />
                  {business.phone}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      )}

      {links.length > 0 && (
        <ul className="divide-y divide-line rounded-panel border border-line bg-paper">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group block p-6 transition-colors hover:bg-sand/50">
                <span className="flex items-center justify-between font-semibold">
                  {l.label}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
                <span className="mt-1 block text-sm text-muted">{l.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
