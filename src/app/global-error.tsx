"use client";

/**
 * Last-resort boundary for errors in the root layout. Renders its own
 * document, so styles are inline and minimal.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="de-DE">
      <body style={{ margin: 0, background: "#F5F1E6", color: "#0E1A14", fontFamily: "system-ui, sans-serif" }}>
        <title>Fehler | Snackora</title>
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "96px 24px" }}>
          <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#55615A" }}>
            Snackora · Störung
          </p>
          <h1 style={{ fontSize: 40, lineHeight: 1.05, margin: "16px 0" }}>Die Website ist gerade nicht erreichbar.</h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: "#3c4741" }}>
            Bitte laden Sie die Seite in einem Moment erneut. Wir arbeiten daran, das Problem zu beheben.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 24,
              minHeight: 52,
              padding: "0 24px",
              borderRadius: 14,
              border: 0,
              background: "#12382A",
              color: "#F5F1E6",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Erneut versuchen
          </button>
        </main>
      </body>
    </html>
  );
}
