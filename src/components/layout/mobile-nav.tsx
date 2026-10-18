"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useId, useLayoutEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import type { NavItem } from "@/config/site";
import { BrandSymbol } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { isActive } from "./nav-links";

interface Group {
  label: string;
  items: NavItem[];
}

/**
 * Mobile menu built on the native <dialog> element: focus is trapped and
 * restored, Escape closes it and the page behind becomes inert – without a
 * focus-trap library.
 */
export function MobileNav({ groups, cta }: { groups: Group[]; cta: NavItem }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const titleId = useId();

  const open = useCallback(() => dialogRef.current?.showModal(), []);
  const close = useCallback(() => dialogRef.current?.close(), []);

  // Close the menu when the route is hidden by <Activity> (cacheComponents
  // keeps previous routes mounted) so it never reappears open on "back".
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => dialog?.close();
  }, []);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label="Menü öffnen"
        className="-mr-2 grid size-12 place-items-center rounded-key text-ink transition-colors hover:bg-ink/5"
      >
        <Menu className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="mobile-nav surface-dark fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-forest p-0 text-cream backdrop:bg-ink/40"
        onClick={(e) => {
          // click on the backdrop area (dialog element itself) closes it
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="container-site flex min-h-full flex-col pb-8">
          <div className="flex h-[var(--header-h)] items-center justify-between">
            <p id={titleId} className="flex items-center gap-3 font-display text-lg font-semibold">
              <BrandSymbol variant="reversed" className="size-8" />
              Menü
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Menü schließen"
              className="-mr-2 grid size-12 place-items-center rounded-key hover:bg-cream/10"
            >
              <X className="size-7" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile Navigation" className="mt-6 grid gap-8">
            {groups.map((g) => (
              <div key={g.label}>
                <p className="slot-label mb-2 text-muted-dark">{g.label}</p>
                <ul className="border-t border-line-dark">
                  {g.items.map((item) => {
                    const active = isActive(pathname, item.href) && (item.href !== "/automaten" || pathname === "/automaten");
                    return (
                      <li key={item.href} className="border-b border-line-dark">
                        <Link
                          href={item.href}
                          onClick={close}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-14 items-center justify-between gap-4 py-3 font-display text-[1.45rem] leading-tight font-semibold tracking-tight",
                            active ? "text-lime" : "text-cream"
                          )}
                        >
                          {item.label}
                          {active ? <span aria-hidden="true" className="size-2.5 rounded-[2px] bg-lime" /> : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-10">
            <Link
              href={cta.href}
              onClick={close}
              className="flex min-h-14 items-center justify-center rounded-key bg-lime px-6 font-semibold text-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.14)]"
            >
              {cta.label}
            </Link>
            <p className="mt-4 text-center text-sm text-muted-dark">Unverbindlich · Persönlich · Region Stuttgart</p>
          </div>
        </div>
      </dialog>
    </div>
  );
}
