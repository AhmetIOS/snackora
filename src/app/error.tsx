"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Only the error type/digest – never user data.
    const digest = typeof error === "object" && error && "digest" in error ? String((error as { digest?: string }).digest) : undefined;
    console.error(JSON.stringify({ level: "error", event: "ui.render_error", digest }));
  }, [error]);

  return (
    <section className="container-site py-24 sm:py-32">
      <p className="slot-label flex items-center gap-2.5 text-muted">
        <span aria-hidden="true" className="size-2 rounded-[2px] bg-error" />
        Störung
      </p>
      <h1 className="type-h1 mt-6 max-w-3xl">Hier hat etwas nicht geklappt.</h1>
      <p className="type-lead mt-6 max-w-xl text-ink/75">
        Beim Laden dieser Seite ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut – meist hilft das bereits.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-14 items-center gap-2 rounded-key bg-forest px-6 font-semibold text-cream hover:bg-ink"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Erneut versuchen
        </button>
        <Link href="/" className="inline-flex min-h-14 items-center rounded-key border border-ink/20 px-6 font-semibold hover:border-ink">
          Zur Startseite
        </Link>
      </div>
    </section>
  );
}
