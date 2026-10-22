import { business, isEmailActive } from "@/config/business";
import { indexableRoutes, siteConfig, siteUrl } from "@/config/site";
import { faqs } from "@/content/faqs";
import { machines } from "@/content/machines";

/**
 * /llms.txt – a plain-text summary for AI assistants (llmstxt.org), built from
 * the same verified content as the website. No claims beyond what the pages say.
 */
export function GET() {
  const url = (path: string) => `${siteUrl}${path === "/" ? "" : path}`;
  const pageNames: Record<string, string> = {
    "/fuer-unternehmen": "Für Unternehmen – Ablauf und Nutzen für Firmen",
    "/standort-anbieten": "Standort anbieten – Fläche für einen Automaten vorschlagen",
    "/anfrage": "Anfrage – unverbindliche Anfrage für eine Automatenlösung",
    "/ueber-uns": "Über uns",
    "/faq": "Häufige Fragen",
    "/kontakt": "Kontakt",
  };
  const faqLines = faqs.map((f) => `- ${f.question} ${f.answer[0]}`);

  const body = [
    `# ${business.brand}`,
    "",
    `> ${siteConfig.description}`,
    "",
    `${business.brand} („${business.slogan}“) ist ein inhabergeführtes ${business.legalForm} aus der ${business.serviceRegion.label}. ` +
      "Snackora plant, stellt auf und betreut Verkaufsautomaten (Snackautomaten, Getränkeautomaten, Kaffeeautomaten und Kombiautomaten) " +
      "für Unternehmen und geeignete Standorte. Zielgruppe sind Unternehmen, Arbeitgeber, Haus- und Objektverwaltungen sowie Betreiber von Flächen mit Mitarbeitenden, Gästen oder Publikumsverkehr.",
    "",
    `Einsatzgebiet: ${business.serviceRegion.cities.join(", ")} und Umgebung.`,
    "Preise und Konditionen hängen von Standort, Nachfrage, Gerät und Betreibermodell ab und werden individuell besprochen; es gibt keine pauschalen Preisangaben.",
    "",
    "## Automaten",
    ...machines.map((m) => `- [${m.name}](${url(`/automaten/${m.slug}`)}): ${m.teaser}`),
    `- [Alle Automaten im Vergleich](${url("/automaten")})`,
    "",
    "## Seiten",
    ...indexableRoutes.filter((r) => pageNames[r.path]).map((r) => `- [${pageNames[r.path]}](${url(r.path)})`),
    "",
    "## Häufige Fragen (Kurzfassung)",
    ...faqLines,
    "",
    "## Kontakt",
    `- Anfrageformular: ${url("/anfrage")}`,
    ...(isEmailActive ? [`- E-Mail: ${business.email.address}`] : []),
    `- Impressum: ${url("/impressum")}`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
