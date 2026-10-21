import { business } from "./business";

/**
 * Canonical site URL. Set NEXT_PUBLIC_SITE_URL per environment; the
 * production canonical host is the apex domain https://snackora.de
 * (www redirects to it, see next.config.ts).
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || business.website).replace(/\/+$/, "");

export const siteConfig = {
  name: business.brand,
  slogan: business.slogan,
  url: siteUrl,
  locale: "de_DE",
  description:
    "Snack-, Getränke- und Kaffeeautomaten für Unternehmen in Esslingen, Waiblingen und der Region Stuttgart – individuell geplant. Jetzt unverbindlich anfragen.",
} as const;

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const mainNav: NavItem[] = [
  { label: "Automaten", href: "/automaten" },
  { label: "Für Unternehmen", href: "/fuer-unternehmen" },
  { label: "Standort anbieten", href: "/standort-anbieten" },
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Kontakt", href: "/kontakt" },
];

export const primaryCta: NavItem = { label: "Jetzt anfragen", href: "/anfrage" };

export const legalNav: NavItem[] = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
];

/** Routes listed in the sitemap (all indexable pages). */
export const indexableRoutes = [
  { path: "/", priority: 1 },
  { path: "/automaten", priority: 0.9 },
  { path: "/automaten/snackautomaten", priority: 0.8 },
  { path: "/automaten/getraenkeautomaten", priority: 0.8 },
  { path: "/automaten/kaffeeautomaten", priority: 0.8 },
  { path: "/automaten/kombiautomaten", priority: 0.8 },
  { path: "/fuer-unternehmen", priority: 0.9 },
  { path: "/standort-anbieten", priority: 0.9 },
  { path: "/anfrage", priority: 0.7 },
  { path: "/ueber-uns", priority: 0.6 },
  { path: "/faq", priority: 0.6 },
  { path: "/kontakt", priority: 0.6 },
  { path: "/impressum", priority: 0.2 },
  { path: "/datenschutz", priority: 0.2 },
] as const;
