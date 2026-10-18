import type { Metadata } from "next";
import { business } from "@/config/business";

export const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Snackora – Deine Pause. Jederzeit. Snack- und Getränkeautomaten in der Region Stuttgart.",
};

/** Per-page metadata with canonical URL and matching social previews. */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const ogTitle = `${title} | ${business.brand}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    // Overriding `openGraph` replaces the parent's object, so the shared
    // social image (src/app/opengraph-image.png) is referenced explicitly.
    openGraph: { title: ogTitle, description, url: path, type: "website", locale: "de_DE", siteName: business.brand, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: ogTitle, description, images: [OG_IMAGE.url] },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
