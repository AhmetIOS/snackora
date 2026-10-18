import type { Metadata } from "next";
import Link from "next/link";
import { business, isEmailActive } from "@/config/business";
import { LegalAddress, Pending } from "@/components/legal/legal";
import { PageHero } from "@/components/sections/page-hero";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Datenschutzerklärung",
  description: "Informationen zur Verarbeitung personenbezogener Daten auf snackora.de gemäß DSGVO.",
  path: "/datenschutz",
});

const toc = [
  ["verantwortlicher", "Verantwortlicher"],
  ["ueberblick", "Überblick"],
  ["hosting", "Hosting und Server-Logfiles"],
  ["formulare", "Anfrage- und Kontaktformulare"],
  ["email-versand", "E-Mail-Versand"],
  ["missbrauchsschutz", "Schutz vor Missbrauch"],
  ["kommunikation", "Kommunikation per E-Mail und Telefon"],
  ["cookies", "Cookies, Tracking und Schriftarten"],
  ["speicherdauer", "Speicherdauer"],
  ["rechte", "Ihre Rechte"],
  ["sonstiges", "Sonstiges"],
] as const;

export default function DatenschutzPage() {

  return (
    <>
      <PageHero
        crumbs={[{ name: "Datenschutz", href: "/datenschutz" }]}
        eyebrow="Rechtliches"
        title={"Datenschutz\u00ADerklärung"}
        lead="Wir verarbeiten nur die Daten, die für den Betrieb dieser Website und die Bearbeitung Ihrer Anfragen nötig sind. Diese Seite erklärt, welche das sind."
      />
      <div className="container-site grid grid-cols-1 gap-12 py-10 sm:py-14 lg:grid-cols-12">
        <nav aria-label="Inhalt der Datenschutzerklärung" className="min-w-0 lg:col-span-3">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <p className="slot-label text-muted">Inhalt</p>
            <ol className="mt-4 space-y-2 text-sm">
              {toc.map(([id, label], i) => (
                <li key={id}>
                  <a href={`#${id}`} className="flex gap-3 text-ink/75 hover:text-ink hover:underline">
                    <span className="font-mono text-muted">{String(i + 1).padStart(2, "0")}</span>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="prose-snackora lg:col-span-8 lg:col-start-5">
          <h2 id="verantwortlicher">1. Verantwortlicher</h2>
          <p>Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
          <LegalAddress />
          <p>
            E-Mail: <a href={`mailto:${business.email.address}`}>{business.email.address}</a>
            {business.phone ? (
              <>
                <br />
                Telefon: {business.phone}
              </>
            ) : null}
          </p>
          <p>Ein Datenschutzbeauftragter ist nicht bestellt, da hierfür keine gesetzliche Pflicht besteht.</p>

          <h2 id="ueberblick">2. Überblick</h2>
          <ul>
            <li>Diese Website setzt keine Cookies und verwendet keine Analyse-, Tracking- oder Werbedienste.</li>
            <li>Es werden keine externen Inhalte wie Karten, Videos oder Social-Media-Plugins eingebunden.</li>
            <li>Schriftarten werden von unserem eigenen Server geladen; eine Verbindung zu Google findet nicht statt.</li>
            <li>
              Personenbezogene Daten verarbeiten wir beim Aufruf der Website (technisch notwendige Server-Logfiles) und wenn Sie uns
              über ein Formular oder per E-Mail kontaktieren.
            </li>
          </ul>

          <h2 id="hosting">3. Hosting und Server-Logfiles</h2>
          <p>
            Diese Website wird bei der Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, gehostet. Beim Aufruf der Website
            verarbeitet Vercel automatisch Informationen, die Ihr Browser übermittelt, insbesondere IP-Adresse, Datum und Uhrzeit des
            Zugriffs, aufgerufene Seite, Referrer-URL sowie Browsertyp und Betriebssystem (Server-Logfiles).
          </p>
          <p>
            Die Verarbeitung ist erforderlich, um die Website auszuliefern sowie Stabilität und Sicherheit zu gewährleisten.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse liegt im sicheren und zuverlässigen Betrieb
            der Website. Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO).
          </p>
          <p>
            Die serverseitige Verarbeitung von Formularanfragen erfolgt in einem Rechenzentrum in Frankfurt am Main. Es kann jedoch
            nicht ausgeschlossen werden, dass Daten in die USA übermittelt werden. Vercel ist nach dem EU-US Data Privacy Framework
            zertifiziert; die Übermittlung stützt sich auf den Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO) sowie
            ergänzend auf Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO). Server-Logfiles werden von Vercel nur für einen
            begrenzten Zeitraum gespeichert und anschließend gelöscht.
          </p>

          <h2 id="formulare">4. Anfrage- und Kontaktformulare</h2>
          <p>
            Wenn Sie uns über das Anfrageformular, das Formular „Standort anbieten“ oder das Kontaktformular eine Nachricht senden,
            verarbeiten wir die von Ihnen eingegebenen Daten. Das sind je nach Formular:
          </p>
          <ul>
            <li>Name, E-Mail-Adresse sowie – freiwillig – Firma bzw. Organisation und Telefonnummer,</li>
            <li>Postleitzahl und Ort sowie – freiwillig – Straße bzw. Lage des Standorts,</li>
            <li>Angaben zum Standort und Bedarf (z. B. Art des Standorts, gewünschter Automatentyp, Personenzahl),</li>
            <li>Ihre Nachricht sowie Zeitpunkt und Art der Anfrage.</li>
          </ul>
          <p>
            Wir verwenden diese Daten ausschließlich, um Ihre Anfrage zu bearbeiten und mit Ihnen in Kontakt zu treten.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf den Abschluss oder die Durchführung eines Vertrags
            gerichtet ist, im Übrigen Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen).
          </p>
          <p>
            Die Angaben werden nicht in einer Datenbank auf dieser Website gespeichert, sondern unmittelbar als E-Mail an unser
            geschäftliches Postfach übermittelt. Das Postfach wird bereitgestellt von:{" "}
            {business.mailboxProvider ? business.mailboxProvider : <Pending>Anbieter des E-Mail-Postfachs</Pending>}.
          </p>
          <p>
            Sofern aktiviert, erhalten Sie nach dem Absenden eine automatische Eingangsbestätigung an die angegebene E-Mail-Adresse.
            Diese enthält Ihren Namen und eine Vorgangsnummer, nicht jedoch den Inhalt Ihrer Nachricht.
          </p>
          <p>
            Die Bereitstellung der als Pflichtfeld gekennzeichneten Angaben ist für die Bearbeitung Ihrer Anfrage erforderlich. Ohne
            diese Angaben können wir Ihre Anfrage nicht bearbeiten. Eine Pflicht zur Bereitstellung besteht nicht.
          </p>

          <h2 id="email-versand">5. E-Mail-Versand</h2>
          {business.emailDelivery === "resend" ? (
            <>
              <p>
                Für die Zustellung der Formularanfragen an unser Postfach und gegebenenfalls der Eingangsbestätigung nutzen wir den
                Dienst Resend der Resend, Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA. Resend verarbeitet dabei die
                Inhalte der jeweiligen E-Mail, also Ihre Formularangaben, sowie technische Versanddaten. Der Versand erfolgt über die
                Versandregion der EU (Irland).
              </p>
              <p>
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO; unser berechtigtes Interesse liegt in einer zuverlässigen
                Zustellung. Mit Resend besteht ein Vertrag zur Auftragsverarbeitung. Soweit Daten in die USA übermittelt werden,
                erfolgt dies auf Grundlage von Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO) bzw. – sofern eine Zertifizierung
                besteht – des EU-US Data Privacy Framework.
              </p>
            </>
          ) : (
            <p>
              Die Formularanfragen und gegebenenfalls die Eingangsbestätigung werden über den Postausgangsserver (SMTP) unseres
              E-Mail-Anbieters versendet, der auch unser Postfach bereitstellt (siehe Abschnitt 4). Es ist kein weiterer
              Versanddienstleister beteiligt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO.
            </p>
          )}

          <h2 id="missbrauchsschutz">6. Schutz vor Missbrauch</h2>
          <p>
            Um unsere Formulare vor automatisierten Massenanfragen zu schützen, begrenzen wir die Zahl der Anfragen pro Zeitraum.
            Dazu wird aus Ihrer IP-Adresse ein pseudonymisierter Prüfwert (Hash) gebildet und zusammen mit einem Zähler für höchstens
            24 Stunden gespeichert. Die IP-Adresse selbst wird dabei nicht gespeichert. Hierfür kann der Dienst Upstash (Upstash,
            Inc., USA) mit Datenverarbeitung in der Region Frankfurt am Main eingesetzt werden.
          </p>
          <p>
            Zusätzlich enthalten die Formulare ein für Menschen unsichtbares Feld und eine Zeitprüfung, um automatisierte Eingaben zu
            erkennen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse liegt in der Sicherheit und
            Funktionsfähigkeit der Formulare.
          </p>

          <h2 id="kommunikation">7. Kommunikation per E-Mail und Telefon</h2>
          <p>
            Wenn Sie uns per E-Mail{business.phone ? " oder telefonisch" : ""} kontaktieren, verarbeiten wir Ihre Angaben zur
            Bearbeitung Ihres Anliegens. Die Rechtsgrundlagen entsprechen denen in Abschnitt 4.
            {!isEmailActive ? " Unser E-Mail-Postfach befindet sich derzeit im Aufbau." : ""}
          </p>

          <h2 id="cookies">8. Cookies, Tracking und Schriftarten</h2>
          <p>
            Diese Website verwendet keine Cookies und speichert keine Informationen auf Ihrem Endgerät, die einer Einwilligung nach
            § 25 TDDDG bedürfen. Es findet keine Reichweitenmessung und kein Tracking statt. Ein Cookie-Banner ist daher nicht
            erforderlich.
          </p>
          <p>
            Die verwendeten Schriftarten (Bricolage Grotesque, DM Sans, DM Mono) werden beim Erstellen der Website heruntergeladen
            und anschließend von unserem eigenen Server ausgeliefert. Beim Besuch der Website wird keine Verbindung zu Servern von
            Google oder anderen Schriftanbietern hergestellt.
          </p>

          <h2 id="speicherdauer">9. Speicherdauer</h2>
          <p>
            Wir speichern Ihre Anfragen so lange, wie es für die Bearbeitung und eine mögliche anschließende Geschäftsbeziehung
            erforderlich ist. Kommt keine Geschäftsbeziehung zustande, löschen wir die Anfrage in der Regel spätestens zwölf Monate
            nach Abschluss der Kommunikation. Gesetzliche Aufbewahrungspflichten, insbesondere für Geschäftsbriefe nach § 147
            Abgabenordnung (bis zu sechs Jahre), bleiben unberührt.
          </p>

          <h2 id="rechte">10. Ihre Rechte</h2>
          <p>Sie haben jederzeit das Recht auf:</p>
          <ul>
            <li>Auskunft über die zu Ihrer Person gespeicherten Daten (Art. 15 DSGVO),</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
            <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO).</li>
          </ul>
          <p>
            <strong>Widerspruchsrecht:</strong> Soweit wir Daten auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO verarbeiten, können Sie
            der Verarbeitung aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen (Art. 21 DSGVO).
          </p>
          <p>
            Zur Ausübung Ihrer Rechte genügt eine Nachricht an die oben genannte E-Mail-Adresse oder über unser{" "}
            <Link href="/kontakt">Kontaktformular</Link>.
          </p>
          <p>
            Sie haben außerdem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO). Zuständig ist
            insbesondere der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg, Lautenschlagerstraße
            20, 70173 Stuttgart.
          </p>

          <h2 id="sonstiges">11. Sonstiges</h2>
          <p>
            Eine automatisierte Entscheidungsfindung einschließlich Profiling findet nicht statt. Diese Website nutzt aus
            Sicherheitsgründen eine SSL/TLS-Verschlüsselung, erkennbar an „https://“ in der Adresszeile.
          </p>
          <p>
            Wir passen diese Datenschutzerklärung an, wenn sich die Website oder die eingesetzten Dienste ändern. Es gilt die jeweils
            hier veröffentlichte Fassung.
          </p>
          <p className="text-sm text-muted">Stand: Oktober 2026</p>
        </div>
      </div>
    </>
  );
}
