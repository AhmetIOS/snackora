import Image from "next/image";
import type { Photo } from "@/content/media";
import { cn } from "@/lib/utils";

/** Renders a configured photo; shows a caption only when a credit is configured. */
export function PhotoFigure({
  photo,
  className,
  imageClassName,
  sizes,
  preload,
  tone = "light",
}: {
  photo: Photo;
  className?: string;
  imageClassName?: string;
  sizes: string;
  preload?: boolean;
  tone?: "light" | "dark";
}) {
  const caption = photo.credit;
  return (
    <figure className={className}>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        preload={preload}
        className={cn("h-auto w-full rounded-panel object-cover", imageClassName)}
      />
      {caption ? <figcaption className={cn("mt-2 text-xs", tone === "dark" ? "text-cream/60" : "text-muted")}>{caption}</figcaption> : null}
    </figure>
  );
}
