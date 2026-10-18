/**
 * Homepage & shared marketing content. Kept separate from components so the
 * copy can be edited without touching layout code.
 */

export const hero = {
  eyebrow: "Snack-, Getränke- & Kaffeeautomaten",
  // Official slogan – do not replace.
  headline: ["Deine Pause.", "Jederzeit."],
  lead: "Moderne Snack-, Getränke- und Kaffeeautomaten für Unternehmen, Mitarbeitende und attraktive Standorte in der Region Stuttgart – individuell geplant und persönlich abgestimmt.",
  /** Shorter version for the compact mobile hero. */
  leadShort: "Snack-, Getränke- und Kaffeeautomaten für Unternehmen und Standorte in der Region Stuttgart – individuell geplant.",
  primaryCta: { label: "Automatenlösung anfragen", href: "/anfrage" },
  /** Short label for narrow layouts (mobile hero). */
  primaryCtaShort: "Jetzt anfragen",
  secondaryCta: { label: "Standort anbieten", href: "/standort-anbieten" },
  region: ["Region Stuttgart", "Esslingen", "Waiblingen"],
};

/** Floating tags around the hero machine (icon keys: snacks, drinks, coffee, care). */
export const heroTags = [
  { icon: "snacks", title: "Snacks & Riegel", text: "süß, herzhaft, bewusst" },
  { icon: "drinks", title: "Kalte Getränke", text: "gut gekühlt vor Ort" },
  { icon: "coffee", title: "Kaffee & Tee", text: "frisch auf Knopfdruck" },
  { icon: "care", title: "Persönlich betreut", text: "aus der Region" },
];


export const valueProps = [
  {
    code: "01",
    title: "Individuell geplant",
    text: "Gerät, Sortiment und Aufstellort richten sich nach Ihrem Standort – nicht umgekehrt. Wir hören zu, bevor wir etwas vorschlagen.",
  },
  {
    code: "02",
    title: "Snacks und Getränke direkt vor Ort",
    text: "Kurze Wege für Mitarbeitende, Gäste und Besucher. Kein Einkauf, keine Vorratshaltung, keine leeren Kühlschränke in der Teeküche.",
  },
  {
    code: "03",
    title: "Modern und unkompliziert",
    text: "Übersichtliche Automaten mit klarer Bedienung. Bargeldlose Zahlung ist – je nach Gerät – ebenso möglich wie die klassische Münze.",
  },
  {
    code: "04",
    title: "Persönlich in der Region",
    text: "Snackora ist inhabergeführt und in der Region Esslingen und Stuttgart zu Hause. Sie sprechen direkt mit dem Menschen, der entscheidet.",
  },
];

export const useCases = [
  {
    key: "buero",
    title: "Büros & Unternehmen",
    text: "Für die kurze Pause zwischen zwei Terminen: Kaffee, Snacks und Getränke im Haus, ohne dass jemand den Einkauf organisieren muss.",
    needs: ["Kurze Pausen", "Besprechungen", "Besucher"],
  },
  {
    key: "produktion",
    title: "Produktion & Logistik",
    text: "Versorgung auch in der Früh- oder Spätschicht – gerade dann, wenn Kantine und Bäcker geschlossen sind.",
    needs: ["Schichtbetrieb", "Warme Hallen", "Große Teams"],
  },
  {
    key: "fitness",
    title: "Fitness & Freizeit",
    text: "Wasser, isotonische Getränke und Proteinriegel – für die Zeit vor und nach dem Training.",
    needs: ["Lange Öffnungszeiten", "Sport-Sortiment", "Spieltage"],
  },
  {
    key: "hotel",
    title: "Hotels & Gewerbestandorte",
    text: "Ein Angebot für Gäste, Kundschaft und Mieter – auch spätabends und am Wochenende.",
    needs: ["Späte Anreise", "Wartebereiche", "Mieterservice"],
  },
] as const;

export const processSteps = [
  {
    code: "01",
    title: "Anfrage senden",
    text: "Sie schildern uns in wenigen Zeilen Ihren Standort und Ihren Bedarf. Unverbindlich und ohne Verpflichtung.",
  },
  {
    code: "02",
    title: "Standort und Bedarf besprechen",
    text: "Wir melden uns, klären offene Fragen und sehen uns den Platz bei Bedarf vor Ort an.",
  },
  {
    code: "03",
    title: "Passendes Konzept entwickeln",
    text: "Gerät, Sortiment und Betreibermodell werden auf Ihren Standort abgestimmt – mit offenen Karten bei den Konditionen.",
  },
  {
    code: "04",
    title: "Umsetzung gemeinsam planen",
    text: "Passt alles zusammen, planen wir Aufstellung und Start gemeinsam. Vorher wird nichts ohne Ihre Zustimmung festgelegt.",
  },
];

export const locationTypes = [
  "Gewerbe- und Bürogebäude",
  "Industrie- und Gewerbegebiete",
  "Freizeit- und Sportanlagen",
  "Hotels und Unterkünfte",
  "Stark frequentierte Gewerbeflächen",
];

export const locationCriteria = [
  { title: "Regelmäßige Frequenz", text: "Mitarbeitende, Gäste oder Besucher, die täglich vor Ort sind." },
  { title: "Geeigneter Stellplatz", text: "Ebene, gut zugängliche Fläche – bevorzugt im Innenbereich." },
  { title: "Stromanschluss", text: "Eine Steckdose in der Nähe des Aufstellorts." },
  { title: "Zugang für Service", text: "Erreichbarkeit zu vereinbarten Zeiten für Befüllung und Wartung." },
];

export const finalCta = {
  headline: "Ein guter Standort verdient eine gute Lösung.",
  text: "Erzählen Sie uns von Ihrem Standort. Wir prüfen ehrlich, ob und wie ein Automat bei Ihnen sinnvoll ist.",
  cta: { label: "Jetzt unverbindlich anfragen", href: "/anfrage" },
};
