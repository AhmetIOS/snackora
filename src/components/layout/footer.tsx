import { siteConfig } from "@/config/site";

const FOUNDED_YEAR = 2026;

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-500">
        © {FOUNDED_YEAR} {siteConfig.name} · {siteConfig.domain}
      </div>
    </footer>
  );
}
