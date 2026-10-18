/**
 * Machine categories. Adding a category here adds a page under
 * /automaten/[slug], a card on the overview and an entry in the sitemap
 * (remember to add it to `indexableRoutes` in src/config/site.ts).
 *
 * Content rule: no invented models, dimensions, capacities, energy ratings
 * or manufacturer claims. Availability always depends on device, site,
 * supplier and operating concept.
 */

export type MachineSlug = "snackautomaten" | "getraenkeautomaten" | "kombiautomaten";
export type MachineIllustration = "snack" | "drink" | "combo";
export type MachineFormValue = "snackautomat" | "getraenkeautomat" | "kombiautomat";

export interface MachineCategory {
  slug: MachineSlug;
  name: string;
  singular: string;
  formValue: MachineFormValue;
  illustration: MachineIllustration;
  tagline: string;
  teaser: string;
  differentiator: string;
  seo: { title: string; description: string };
  intro: string[];
  applications: { title: string; text: string }[];
  assortment: { group: string; items: string[] }[];
  suitableFor: string[];
  benefits: { title: string; text: string }[];
  considerations: { title: string; text: string }[];
  customization: string[];
}

export const machines: MachineCategory[] = [
  {
    slug: "snackautomaten",
    name: "Snackautomaten",
    singular: "Snackautomat",
    formValue: "snackautomat",
    illustration: "snack",
    tagline: "Süß, herzhaft oder bewusst – der Klassiker für die kleine Pause.",
    teaser:
      "Riegel, Chips, Nüsse und Gebäck in einem übersichtlichen Automaten. Ideal dort, wo zwischendurch der kleine Hunger kommt.",
    differentiator: "Breites Snack-Sortiment auf kleiner Stellfläche",
    seo: {
      title: "Snackautomaten für Unternehmen in Esslingen & Stuttgart",
      description:
        "Snackautomaten für Büros, Betriebe und Freizeitstandorte in der Region Stuttgart. Sortiment und Aufstellung individuell abgestimmt – jetzt unverbindlich anfragen.",
    },
    intro: [
      "Ein Snackautomat bringt die kleine Auszeit direkt dorthin, wo gearbeitet, trainiert oder gewartet wird. Mitarbeitende und Gäste müssen das Gebäude nicht verlassen, und Sie müssen sich nicht um Einkauf oder Vorratshaltung kümmern.",
      "Welche Snacks sinnvoll sind, hängt von Ihrem Standort ab: In der Frühschicht einer Produktion wird anders gegessen als im Fitnessstudio oder im Bürogebäude. Deshalb planen wir das Sortiment gemeinsam mit Ihnen – und passen es an, wenn sich zeigt, was gut ankommt.",
    ],
    applications: [
      {
        title: "Zwischenmahlzeit im Arbeitsalltag",
        text: "Für Büros und Verwaltungen, in denen die nächste Bäckerei nicht um die Ecke liegt oder die Mittagspause kurz ist.",
      },
      {
        title: "Versorgung im Schichtbetrieb",
        text: "In Produktion und Logistik, wenn Kantine oder Kiosk nicht zu allen Schichtzeiten geöffnet sind.",
      },
      {
        title: "Vor und nach dem Training",
        text: "In Fitnessstudios und Sportanlagen – mit Proteinriegeln, Nüssen und Energie für unterwegs.",
      },
      {
        title: "Wartebereiche und Empfang",
        text: "Für Gäste, Kundinnen und Kunden, die kurz verweilen – etwa in Werkstätten, Autohäusern oder Hotels.",
      },
    ],
    assortment: [
      { group: "Süßes", items: ["Schokoriegel", "Kekse und Gebäck", "Fruchtgummi"] },
      { group: "Herzhaftes", items: ["Chips und Cracker", "Brezel-Snacks", "Salzgebäck"] },
      { group: "Bewusste Auswahl", items: ["Nüsse und Nussmischungen", "Proteinriegel", "Müsli- und Fruchtriegel"] },
    ],
    suitableFor: [
      "Büros und Verwaltungen",
      "Produktions- und Logistikbetriebe",
      "Werkstätten und Handwerksbetriebe",
      "Fitnessstudios und Sportanlagen",
      "Hotels und Gewerbeimmobilien",
    ],
    benefits: [
      {
        title: "Kleine Stellfläche, große Auswahl",
        text: "Ein Snackautomat bietet auf wenig Raum eine überraschend breite Auswahl – oft genügt eine freie Wandfläche mit Steckdose.",
      },
      {
        title: "Kein Einkaufs- und Lageraufwand",
        text: "Sie stellen den Platz zur Verfügung; um Auswahl und Bestückung kümmern sich die vereinbarten Zuständigen.",
      },
      {
        title: "Sortiment, das zum Standort passt",
        text: "Wir stimmen die Produkte auf Ihre Zielgruppe ab und entwickeln die Auswahl im laufenden Betrieb weiter.",
      },
    ],
    considerations: [
      {
        title: "Stellplatz",
        text: "Ein ebener, gut zugänglicher Platz in einem trockenen Innenbereich. Die konkreten Maße hängen vom Gerät ab und werden vor Ort geprüft.",
      },
      {
        title: "Stromanschluss",
        text: "In der Nähe sollte eine Steckdose vorhanden sein. Ob der vorhandene Anschluss geeignet ist, klären wir gemeinsam.",
      },
      {
        title: "Zugang",
        text: "Für Befüllung und Service muss der Automat zu vereinbarten Zeiten erreichbar sein.",
      },
      {
        title: "Nachfrage",
        text: "Ob sich ein Snackautomat lohnt, hängt vor allem davon ab, wie viele Menschen regelmäßig vor Ort sind.",
      },
    ],
    customization: [
      "Sortiment nach Zielgruppe – z. B. mehr herzhafte Snacks im Schichtbetrieb",
      "Bewusstere Auswahl mit Nüssen und Proteinriegeln",
      "Gerätegröße passend zur verfügbaren Fläche",
      "Bargeldlose Zahlung, sofern vom Gerät unterstützt",
    ],
  },
  {
    slug: "getraenkeautomaten",
    name: "Getränkeautomaten",
    singular: "Getränkeautomat",
    formValue: "getraenkeautomat",
    illustration: "drink",
    tagline: "Gekühlte Getränke, genau dann, wenn sie gebraucht werden.",
    teaser:
      "Wasser, Schorlen, Softdrinks oder Eistee – gut gekühlt und jederzeit griffbereit. Besonders gefragt in warmen Hallen und nach dem Sport.",
    differentiator: "Gekühlte Erfrischung – auch nach Feierabend",
    seo: {
      title: "Getränkeautomaten in Stuttgart, Esslingen & Region",
      description:
        "Gekühlte Getränke direkt vor Ort: Getränkeautomaten für Unternehmen, Hallen und Sportanlagen in der Region Stuttgart. Individuell geplant, unverbindlich anfragen.",
    },
    intro: [
      "Wer körperlich arbeitet, trainiert oder lange Wege im Gebäude hat, braucht vor allem eines: etwas Kaltes zu trinken. Ein Getränkeautomat macht gekühlte Getränke am Standort verfügbar – auch dann, wenn sonst niemand mehr da ist.",
      "Die Auswahl reicht vom stillen Wasser bis zum Eistee. Welche Sorten und Gebindegrößen angeboten werden, legen wir gemeinsam fest – passend zu Ihrem Standort und zu dem, was tatsächlich nachgefragt wird.",
    ],
    applications: [
      {
        title: "Produktion und Lager",
        text: "In Hallen, in denen es im Sommer warm wird und kurze Wege zur Erfrischung wichtig sind.",
      },
      {
        title: "Sport und Freizeit",
        text: "Nach dem Training oder Spiel – wenn das mitgebrachte Wasser längst leer ist.",
      },
      {
        title: "Büro und Verwaltung",
        text: "Als Ergänzung zu Kaffee und Leitungswasser, etwa für Besprechungen und Besucher.",
      },
      {
        title: "Gewerbeflächen mit Publikumsverkehr",
        text: "An Standorten, an denen viele Menschen kurz verweilen und eine Erfrischung suchen.",
      },
    ],
    assortment: [
      { group: "Wasser & Schorlen", items: ["Mineralwasser still und mit Kohlensäure", "Fruchtschorlen"] },
      { group: "Erfrischung", items: ["Softdrinks", "Eistee", "Limonaden"] },
      { group: "Für Sport & Energie", items: ["Isotonische Getränke", "Energydrinks (je nach Standort)"] },
    ],
    suitableFor: [
      "Produktions- und Lagerhallen",
      "Fitnessstudios, Vereine und Sportanlagen",
      "Bürogebäude mit vielen Mitarbeitenden",
      "Gewerbeimmobilien und Parkflächen",
      "Hotels und Freizeiteinrichtungen",
    ],
    benefits: [
      {
        title: "Immer gekühlt",
        text: "Getränke sind trinkfertig temperiert – ohne Kühlschrank, der leer geräumt wird oder ständig nachgefüllt werden muss.",
      },
      {
        title: "Rund um die Uhr verfügbar",
        text: "Wo der Standort es zulässt, sind Getränke auch außerhalb üblicher Öffnungszeiten erhältlich.",
      },
      {
        title: "Weniger Organisationsaufwand",
        text: "Keine Getränkekisten, kein Pfand-Chaos in der Teeküche – Auswahl und Befüllung werden zentral organisiert.",
      },
    ],
    considerations: [
      {
        title: "Kühlung braucht Luft",
        text: "Getränkeautomaten benötigen etwas Abstand zur Wand und sollten nicht in praller Sonne stehen.",
      },
      {
        title: "Stromanschluss",
        text: "Eine geeignete Steckdose in der Nähe ist Voraussetzung, da das Gerät dauerhaft kühlt.",
      },
      {
        title: "Innen oder geschützt außen",
        text: "Ob ein Außenstandort infrage kommt, hängt vom Gerät und vom Wetterschutz ab und wird im Einzelfall geprüft.",
      },
      {
        title: "Leergut",
        text: "Je nach Gebinde und Pfand sollte geklärt werden, wie mit Leergut umgegangen wird.",
      },
    ],
    customization: [
      "Auswahl zwischen Wasser, Schorlen und Erfrischungsgetränken",
      "Gebindegrößen passend zum Standort",
      "Schwerpunkt auf zuckerfreie oder zuckerreduzierte Getränke möglich",
      "Bargeldlose Zahlung, sofern vom Gerät unterstützt",
    ],
  },
  {
    slug: "kombiautomaten",
    name: "Kombiautomaten",
    singular: "Kombiautomat",
    formValue: "kombiautomat",
    illustration: "combo",
    tagline: "Snacks und Getränke aus einem Gerät – die kompakte Komplettlösung.",
    teaser:
      "Ein Automat, zwei Bedürfnisse: Snacks und gekühlte Getränke auf einer Stellfläche. Die naheliegende Wahl für kleinere Standorte.",
    differentiator: "Snacks und Getränke auf einer Stellfläche",
    seo: {
      title: "Kombiautomaten für Snacks & Getränke – Region Stuttgart",
      description:
        "Snacks und gekühlte Getränke aus einem Gerät: Kombiautomaten für kleinere Unternehmen, Werkstätten und Sportanlagen in Esslingen, Stuttgart und Umgebung.",
    },
    intro: [
      "Nicht jeder Standort braucht zwei Geräte. Ein Kombiautomat vereint Snacks und gekühlte Getränke in einem Automaten und spart damit Platz und Abstimmungsaufwand.",
      "Gerade für kleinere Unternehmen, Werkstätten, Praxen oder Vereinsheime ist das oft die passendste Lösung. Die Aufteilung zwischen Snacks und Getränken richtet sich danach, was an Ihrem Standort gebraucht wird.",
    ],
    applications: [
      {
        title: "Kleinere Unternehmen",
        text: "Wenn der Platz für zwei Automaten fehlt, die Mitarbeitenden aber beides schätzen.",
      },
      {
        title: "Werkstätten und Handwerk",
        text: "Für Teams, die zwischen Terminen kurz durchatmen – und für Kundschaft im Wartebereich.",
      },
      {
        title: "Vereine und Sportanlagen",
        text: "Für Trainingsbetrieb und Spieltage, ohne dass jemand Kiosk-Dienst übernehmen muss.",
      },
      {
        title: "Hotels und Unterkünfte",
        text: "Als Angebot für Gäste, die spät anreisen oder nachts noch etwas brauchen.",
      },
    ],
    assortment: [
      { group: "Snack-Fächer", items: ["Riegel und Süßwaren", "Chips und Salzgebäck", "Nüsse und Proteinriegel"] },
      { group: "Gekühltes Fach", items: ["Wasser und Schorlen", "Softdrinks und Eistee"] },
    ],
    suitableFor: [
      "Kleinere und mittlere Unternehmen",
      "Werkstätten, Autohäuser und Praxen",
      "Vereinsheime und Sportanlagen",
      "Hotels, Pensionen und Apartmenthäuser",
      "Gewerbeflächen mit begrenztem Platz",
    ],
    benefits: [
      {
        title: "Eine Stellfläche für beides",
        text: "Snacks und Getränke aus einem Gerät – ideal, wenn der verfügbare Platz begrenzt ist.",
      },
      {
        title: "Ein Ansprechpartner, ein Gerät",
        text: "Weniger Abstimmung, weniger Technik im Raum, ein klarer Ablauf für Befüllung und Service.",
      },
      {
        title: "Flexible Aufteilung",
        text: "Wie viel Platz Snacks und Getränke bekommen, richtet sich nach der Nachfrage an Ihrem Standort.",
      },
    ],
    considerations: [
      {
        title: "Platz und Belüftung",
        text: "Wie Getränkeautomaten brauchen auch Kombigeräte etwas Abstand zur Wand für die Kühlung.",
      },
      {
        title: "Stromanschluss",
        text: "Eine Steckdose in der Nähe ist notwendig. Wir prüfen gemeinsam, ob der Anschluss passt.",
      },
      {
        title: "Sortimentsbreite",
        text: "Ein Kombigerät bietet von beidem etwas weniger Auswahl als zwei spezialisierte Automaten.",
      },
      {
        title: "Zugang",
        text: "Befüllung und Service müssen zu vereinbarten Zeiten möglich sein.",
      },
    ],
    customization: [
      "Verhältnis von Snack- zu Getränkefächern",
      "Sortiment nach Zielgruppe und Tageszeit",
      "Bewusstere Auswahl auf Wunsch",
      "Bargeldlose Zahlung, sofern vom Gerät unterstützt",
    ],
  },
];

export function getMachine(slug: string): MachineCategory | undefined {
  return machines.find((m) => m.slug === slug);
}
