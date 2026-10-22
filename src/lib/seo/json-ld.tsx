import { business, isEmailActive } from "@/config/business";
import { siteConfig, siteUrl } from "@/config/site";
import type { Faq } from "@/content/faqs";
import { machines, type MachineCategory } from "@/content/machines";

/**
 * schema.org structured data. Only truthful, verifiable facts:
 * Snackora is modelled as an Organization with a service area – NOT as a
 * LocalBusiness with a public shop address or opening hours.
 */

type Json = Record<string, unknown>;

const ORG_ID = `${siteUrl}/#organization`;

export function JsonLd({ data }: { data: Json | Json[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Escape "<" to prevent breaking out of the script element.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}

export function organizationJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: business.brand,
    slogan: business.slogan,
    url: siteUrl,
    logo: `${siteUrl}/brand/snackora-symbol-512.png`,
    founder: { "@type": "Person", name: business.owner },
    ...(isEmailActive ? { email: business.email.address } : {}),
    ...(business.phone ? { telephone: business.phone } : {}),
    areaServed: business.serviceRegion.cities.map((name) => ({ "@type": "City", name })),
    knowsAbout: ["Snackautomaten", "Getränkeautomaten", "Kombiautomaten", "Kaffeeautomaten", "Automatenaufstellung"],
    description: siteConfig.description,
    ...(isEmailActive
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            email: business.email.address,
            url: `${siteUrl}/kontakt`,
            availableLanguage: "de",
            areaServed: "DE",
          },
        }
      : {}),
    // The services as offered on the site – no prices, models or capacities are claimed.
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Automatenlösungen",
      itemListElement: machines.map((m) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: m.name, description: m.teaser, url: `${siteUrl}/automaten/${m.slug}` },
      })),
    },
  };
}

export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: business.brand,
    inLanguage: "de-DE",
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.href === "/" ? "" : item.href}`,
    })),
  };
}

export function faqJsonLd(items: Faq[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer.join(" ") },
    })),
  };
}

export function serviceJsonLd(m: MachineCategory): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: m.name,
    serviceType: m.name,
    description: m.seo.description,
    provider: { "@id": ORG_ID },
    areaServed: business.serviceRegion.cities.map((name) => ({ "@type": "City", name })),
    url: `${siteUrl}/automaten/${m.slug}`,
  };
}
