import Link from "next/link";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

export interface Crumb {
  name: string;
  href: string;
}

/** Visible breadcrumb trail + BreadcrumbList structured data. */
export function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const all = [{ name: "Start", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Brotkrümelnavigation" className="slot-label">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className={tone === "dark" ? "text-cream" : "text-ink"}>
                    {c.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={c.href}
                      className={
                        tone === "dark"
                          ? "text-muted-dark underline-offset-4 hover:text-cream hover:underline"
                          : "text-muted underline-offset-4 hover:text-ink hover:underline"
                      }
                    >
                      {c.name}
                    </Link>
                    <span aria-hidden="true" className={tone === "dark" ? "text-muted-dark/60" : "text-muted/60"}>
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </>
  );
}
