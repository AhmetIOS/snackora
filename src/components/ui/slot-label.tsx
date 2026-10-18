import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small mono eyebrow label above headings, introduced by the product block
 * (the brand's smallest graphic unit).
 */
export function SlotLabel({
  children,
  tone = "light",
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  as?: "p" | "span" | "div";
}) {
  return (
    <Tag className={cn("slot-label flex items-center gap-2.5", tone === "dark" ? "text-muted-dark" : "text-muted", className)}>
      <span aria-hidden="true" className={cn("size-2 rounded-[2px]", tone === "dark" ? "bg-lime" : "bg-forest")} />
      <span>{children}</span>
    </Tag>
  );
}
