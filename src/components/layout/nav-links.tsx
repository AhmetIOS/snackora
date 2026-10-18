"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/site";
import { cn } from "@/lib/utils";

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1 xl:gap-2">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex h-10 items-center rounded-[10px] px-3 text-[0.95rem] font-medium transition-colors",
                active ? "text-ink" : "text-ink/75 hover:text-ink"
              )}
            >
              {item.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-3 -bottom-0.5 h-[3px] origin-left rounded-full bg-lime transition-transform duration-300 ease-snap",
                  active ? "scale-x-100" : "scale-x-0"
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
