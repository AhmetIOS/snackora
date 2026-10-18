import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Buttons are styled as vending-machine keys: firm corners, a subtle
 * "pressed" bottom edge and a product-block arrow on primary actions.
 */

export type ButtonVariant = "primary" | "accent" | "outline" | "outline-dark" | "ghost";
type Size = "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-3 rounded-key font-sans font-semibold tracking-[-0.005em] whitespace-nowrap transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-snap select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-forest text-cream shadow-[inset_0_-3px_0_rgb(0_0_0/0.25)] hover:bg-ink active:shadow-[inset_0_-1px_0_rgb(0_0_0/0.25)]",
  accent: "bg-lime text-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.14)] hover:bg-[#d8f88f] active:shadow-[inset_0_-1px_0_rgb(0_0_0/0.14)]",
  outline: "border border-ink/20 bg-transparent text-ink hover:border-ink hover:bg-ink/[0.03]",
  "outline-dark": "border border-cream/25 bg-transparent text-cream hover:border-cream hover:bg-cream/[0.05]",
  ghost: "text-ink underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 text-[0.95rem]",
  lg: "min-h-14 px-6 text-base",
};

function Arrow({ variant }: { variant: ButtonVariant }) {
  if (variant !== "primary" && variant !== "accent") return null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "-mr-2 grid size-7 place-items-center rounded-[7px] transition-transform duration-200 ease-snap group-hover/btn:translate-x-0.5",
        variant === "primary" ? "bg-lime text-ink" : "bg-ink text-lime"
      )}
    >
      <ArrowRight className="size-4" strokeWidth={2.25} />
    </span>
  );
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: Size;
  children: ReactNode;
  className?: string;
  /** Hide the trailing arrow on primary/accent buttons. */
  plain?: boolean;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  plain,
  ...props
}: CommonProps & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props}>
      <span>{children}</span>
      {plain ? null : <Arrow variant={variant} />}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  plain,
  type = "button",
  ...props
}: CommonProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
      {plain ? null : <Arrow variant={variant} />}
    </button>
  );
}
