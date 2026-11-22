import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { announcement } from "@/content/home";

/**
 * Static site-wide offer line above the header. Deliberately not a ticker or
 * popup: moving text is hard to read (and needs a pause control under WCAG
 * 2.2.2), and mobile interstitials are penalised by Google. It scrolls away
 * with the page; the sticky header stays.
 */
export function AnnouncementBar() {
  return (
    <div className="bg-lime text-ink">
      <div className="container-site flex min-h-9 items-center justify-center gap-x-3 py-1.5 text-center text-[0.8rem] leading-snug sm:text-sm">
        <p className="font-medium">
          <span className="sm:hidden">{announcement.short}</span>
          <span className="hidden sm:inline">{announcement.text}</span>
        </p>
        <Link
          href={announcement.cta.href}
          className="inline-flex shrink-0 items-center gap-1 rounded-[4px] font-semibold underline underline-offset-4 hover:no-underline"
        >
          {announcement.cta.label}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
