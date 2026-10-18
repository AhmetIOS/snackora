/**
 * Frequently asked questions. Answers are written to be truthful for an
 * emerging business: arrangements that depend on negotiation are described
 * as possibilities, never as guarantees.
 *
 * `home: true` → shown in the homepage FAQ preview (keep it to five).
 * `business: true` → shown on /fuer-unternehmen.
 */

export interface Faq {
  id: string;
  question: string;
  /** Paragraphs. Plain text; rendered as <p> and used for FAQPage JSON-LD. */
  answer: string[];
  home?: boolean;
  business?: boolean;
}

export const faqs: Faq[] = [
  {
    id: "loesungen",
    question: "Welche Automatenlösungen bietet Snackora an?",
    answer: [
      "Wir planen vier Automatenkonzepte: Snackautomaten, Getränkeautomaten, Kaffeeautomaten für frisch zubereitete Heißgetränke sowie Kombiautomaten, die Snacks und gekühlte Getränke in einem Gerät vereinen. Welche Lösung passt, hängt von Ihrem Standort, dem verfügbaren Platz und der Zahl der Menschen vor Ort ab.",
      "Perspektivisch sind auch weitere Selbstbedienungslösungen denkbar, etwa kleine 24/7-Verkaufspunkte. Sprechen Sie uns gern an, wenn Sie etwas Bestimmtes suchen.",
    ],
    home: true,
  },
  {
    id: "standorte",
    question: "Für welche Standorte eignen sich Verkaufsautomaten?",
    answer: [
      "Grundsätzlich überall dort, wo regelmäßig Menschen arbeiten, trainieren oder verweilen: Büros und Verwaltungen, Produktions- und Logistikbetriebe, Werkstätten, Fitnessstudios, Sportanlagen, Hotels und Gewerbeimmobilien.",
      "Entscheidend sind die tatsächliche Nachfrage vor Ort, ein geeigneter Stellplatz und ein Stromanschluss. Ob ein Standort passt, prüfen wir immer im Einzelfall.",
    ],
    home: true,
    business: true,
  },
  {
    id: "standort-vorschlagen",
    question: "Kann ich einen Standort für einen Automaten vorschlagen?",
    answer: [
      "Ja, sehr gern. Wenn Sie eine Fläche besitzen, verwalten oder betreiben, die sich für einen Automaten eignen könnte, nutzen Sie unser Formular „Standort anbieten“. Für eine erste Einschätzung genügen Postleitzahl, Ort und ein paar Eckdaten.",
      "Wir sehen uns jeden Vorschlag an und melden uns, wenn der Standort für uns infrage kommt. Ein Anspruch auf Aufstellung entsteht durch den Vorschlag nicht.",
    ],
    home: true,
  },
  {
    id: "voraussetzungen",
    question: "Welche Voraussetzungen sollte ein Standort erfüllen?",
    answer: [
      "Wichtig sind vor allem: regelmäßiger Personen- oder Besucherverkehr, ein ebener und gut zugänglicher Stellplatz, ein Stromanschluss in der Nähe sowie Zugang für Befüllung und Service zu vereinbarten Zeiten.",
      "Für Getränke- und Kombiautomaten braucht die Kühlung außerdem etwas Abstand zur Wand. Außenstandorte sind nur mit geeignetem Wetterschutz und passendem Gerät denkbar.",
    ],
    business: true,
  },
  {
    id: "produkte",
    question: "Welche Produkte können angeboten werden?",
    answer: [
      "Typisch sind Schokoriegel, Kekse, Chips, Salzgebäck, Nüsse, Protein- und Müsliriegel, Wasser, Schorlen, Softdrinks und Eistee sowie bei Kaffeeautomaten Kaffee, Espresso, Cappuccino, Tee und Kakao.",
      "Was konkret angeboten wird, hängt vom Gerät, vom Standort und von den Bezugsmöglichkeiten ab. Frische oder gekühlte Speisen erfordern besondere Geräte und Abläufe und sind daher nur nach gesonderter Prüfung möglich.",
    ],
  },
  {
    id: "sortiment",
    question: "Sind individuelle Sortimente möglich?",
    answer: [
      "Ja, das ist uns sogar wichtig. Ein Produktionsbetrieb mit Frühschicht hat andere Wünsche als ein Fitnessstudio oder ein Bürogebäude. Wir stimmen die Auswahl gemeinsam mit Ihnen ab, zum Beispiel mit mehr herzhaften Snacks, zuckerfreien Getränken oder einer bewussteren Auswahl.",
      "Im laufenden Betrieb lässt sich das Sortiment anpassen, wenn sich zeigt, was gut ankommt und was nicht.",
    ],
    home: true,
    business: true,
  },
  {
    id: "zahlung",
    question: "Welche Zahlungsmethoden sind grundsätzlich möglich?",
    answer: [
      "Moderne Automaten können je nach Ausstattung Münzen, Karten und kontaktlose Zahlung per Smartphone oder Smartwatch annehmen. Welche Zahlungsarten an Ihrem Standort zur Verfügung stehen, hängt vom eingesetzten Gerät ab und wird bei der Planung festgelegt.",
    ],
  },
  {
    id: "kosten",
    question: "Ist eine Automatenaufstellung kostenlos?",
    answer: [
      "Das lässt sich nicht pauschal beantworten. Ob für Sie Kosten entstehen, hängt vor allem vom Standort, der zu erwartenden Nachfrage, dem Gerät und dem vereinbarten Betreibermodell ab.",
      "Je nach Standort und Vereinbarung sind unterschiedliche Modelle denkbar. Wir prüfen gemeinsam, welche Lösung wirtschaftlich und organisatorisch sinnvoll ist, und besprechen die Konditionen transparent, bevor etwas vereinbart wird.",
    ],
    home: true,
    business: true,
  },
  {
    id: "befuellung",
    question: "Wer übernimmt Befüllung und Wartung?",
    answer: [
      "Wer Befüllung, Reinigung und Wartung übernimmt, wird im jeweiligen Betreibermodell festgelegt. Unser Ziel ist eine Lösung, bei der Sie als Standortgeber möglichst wenig Aufwand haben.",
      "Wie Befüllung und Service konkret organisiert werden – etwa Rhythmus und Ansprechpartner bei Störungen –, klären wir vor der Aufstellung verbindlich miteinander.",
    ],
    business: true,
  },
  {
    id: "ablauf",
    question: "Wie läuft eine Anfrage ab?",
    answer: [
      "Sie senden uns über das Anfrageformular ein paar Eckdaten zu Ihrem Standort. Wir melden uns, um Bedarf, Platz und Rahmenbedingungen zu besprechen, und schauen uns den Standort bei Bedarf vor Ort an.",
      "Passt alles zusammen, erarbeiten wir ein Konzept mit Gerät, Sortiment und Betreibermodell. Erst wenn Sie damit einverstanden sind, planen wir die Umsetzung gemeinsam. Die Anfrage selbst ist unverbindlich.",
    ],
    business: true,
  },
  {
    id: "region",
    question: "In welchen Regionen ist Snackora tätig?",
    answer: [
      "Unser Schwerpunkt liegt in der Region Stuttgart, insbesondere in Esslingen am Neckar, Stuttgart, Waiblingen, Fellbach, Ostfildern und Wernau sowie in den umliegenden Gemeinden.",
      "Ihr Standort liegt etwas außerhalb? Fragen Sie trotzdem an – wir prüfen, ob eine Betreuung sinnvoll möglich ist.",
    ],
  },
  {
    id: "kleine-unternehmen",
    question: "Sind auch kleinere Unternehmen interessant?",
    answer: [
      "Ja. Auch für kleinere Teams kann ein Automat sinnvoll sein, etwa als kompakter Kombiautomat. Entscheidend ist weniger die Unternehmensgröße als die Zahl der Menschen, die regelmäßig vor Ort sind – zum Beispiel auch Kundschaft oder Besucher.",
      "Schreiben Sie uns einfach, wie viele Personen ungefähr vor Ort sind. Wir sagen Ihnen ehrlich, ob und in welcher Form ein Automat sinnvoll ist.",
    ],
    business: true,
  },
];

export const homeFaqs = faqs.filter((f) => f.home);
export const businessFaqs = faqs.filter((f) => f.business);
