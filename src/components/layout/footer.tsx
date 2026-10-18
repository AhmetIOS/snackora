import Link from "next/link";
import { cacheLife } from "next/cache";
import { business, isEmailActive } from "@/config/business";
import { legalNav } from "@/config/site";
import { machines } from "@/content/machines";
import { BrandSymbol, Logo } from "@/components/brand/logo";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const columns = [
  {
    title: "Automaten",
    links: [{ label: "Übersicht", href: "/automaten" }, ...machines.map((m) => ({ label: m.name, href: `/automaten/${m.slug}` }))],
  },
  {
    title: "Zusammenarbeit",
    links: [
      { label: "Für Unternehmen", href: "/fuer-unternehmen" },
      { label: "Standort anbieten", href: "/standort-anbieten" },
      { label: "Anfrage stellen", href: "/anfrage" },
    ],
  },
  {
    title: "Snackora",
    links: [
      { label: "Über uns", href: "/ueber-uns" },
      { label: "Häufige Fragen", href: "/faq" },
      { label: "Kontakt", href: "/kontakt" },
    ],
  },
];

const linkClass = "text-cream/80 underline-offset-4 transition-colors hover:text-cream hover:underline";

export function Footer() {
  return (
    <footer className="surface-dark relative overflow-hidden bg-ink text-cream">
      <BrandSymbol
        tile={false}
        className="pointer-events-none absolute -right-24 -bottom-28 size-[26rem] text-forest/60 sm:size-[34rem]"
      />
      <div className="container-site relative pt-16 pb-10 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="-m-2 inline-block rounded-key p-2" aria-label="Snackora – zur Startseite">
              <Logo variant="reversed" className="h-9 w-auto" />
            </Link>
            <p className="mt-5 font-display text-2xl font-semibold tracking-tight text-lime">{business.slogan}</p>
            <p className="mt-3 text-cream/75">
              Moderne Snack-, Getränke- und Kaffeeautomaten für Unternehmen und geeignete Standorte in der {business.serviceRegion.label}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="slot-label text-muted-dark">{col.title}</p>
                <ul className="mt-4 space-y-2.5 text-[0.95rem]">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={linkClass}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div>
              <p className="slot-label text-muted-dark">Kontakt</p>
              <ul className="mt-4 space-y-2.5 text-[0.95rem] text-cream/80">
                {isEmailActive ? (
                  <li>
                    <a href={`mailto:${business.email.address}`} className={linkClass}>
                      {business.email.address}
                    </a>
                  </li>
                ) : (
                  <li>
                    <Link href="/kontakt" className={linkClass}>
                      Kontaktformular
                    </Link>
                  </li>
                )}
                {business.phone ? (
                  <li>
                    <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`} className={linkClass}>
                      {business.phone}
                    </a>
                  </li>
                ) : null}
                <li>{business.serviceRegion.label}</li>
                <li className="text-cream/60">{business.serviceRegion.cities.slice(0, 3).join(" · ")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line-dark pt-6 text-sm text-cream/65 md:flex-row md:items-center md:justify-between">
          <p>
            © <CopyrightYear /> {business.brand}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
