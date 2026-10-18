import Link from "next/link";
import { mainNav, primaryCta } from "@/config/site";
import { machines } from "@/content/machines";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { NavLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";
import { ScrollState } from "./scroll-state";

export function Header() {
  const mobileGroups = [
    {
      label: "Automaten",
      items: [
        { label: "Alle Automatenlösungen", href: "/automaten" },
        ...machines.map((m) => ({ label: m.name, href: `/automaten/${m.slug}` })),
      ],
    },
    {
      label: "Zusammenarbeit",
      items: [
        { label: "Für Unternehmen", href: "/fuer-unternehmen" },
        { label: "Standort anbieten", href: "/standort-anbieten" },
      ],
    },
    {
      label: "Snackora",
      items: [
        { label: "Über uns", href: "/ueber-uns" },
        { label: "Häufige Fragen", href: "/faq" },
        { label: "Kontakt", href: "/kontakt" },
      ],
    },
  ];

  return (
    <header className="site-header sticky top-0 z-50 border-b border-transparent bg-cream/90 backdrop-blur-md transition-[border-color,background-color] duration-300 supports-[backdrop-filter]:bg-cream/80">
      <ScrollState />
      <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" className="-m-2 shrink-0 rounded-key p-2" aria-label="Snackora – zur Startseite">
          <Logo className="h-7 w-auto sm:h-8" title="Snackora" />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <NavLinks items={mainNav} />
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ButtonLink href={primaryCta.href} size="md">
              {primaryCta.label}
            </ButtonLink>
          </div>
          <MobileNav groups={mobileGroups} cta={primaryCta} />
        </div>
      </div>
    </header>
  );
}
