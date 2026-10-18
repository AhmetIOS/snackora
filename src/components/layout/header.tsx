import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          {siteConfig.name}
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-neutral-600">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
