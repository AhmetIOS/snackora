/**
 * Optional photography. Every slot falls back to the brand illustration
 * when `null`. Put optimised files (WebP/JPEG, ≥ 1600 px on the long side)
 * into public/images/ and reference them here.
 *
 * Rules (see BRAND_GUIDELINES.md → Bildsprache):
 *  - Real photos of actual Snackora machines/locations: symbolic = false.
 *  - Licensed stock or AI-generated images: symbolic = true → captioned
 *    flagged `symbolic` (not shown on the page). Never show other brands' logos or invented locations.
 */

import type { MachineSlug } from "./machines";

export interface Photo {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** true = stock / AI / illustrative photo (documentation only, no visible label). */
  symbolic: boolean;
  /** Source / licence note, e.g. "Foto: Name, Unsplash-Lizenz". */
  credit?: string;
}

// AI-generated design visual (no real installation). No visible caption by
// owner's decision; the alt text states that it is a design concept.
// Background removed and product window softened (third-party brands not
// legible) by scripts/brand/prepare-hero-photo.mjs. Must be a transparent cut-out.
export const heroPhoto: Photo | null = {
  src: "/images/snackora-automat-hero.webp",
  alt: "Designkonzept: Snackora-Automat in Schwarz mit limettengrüner Seitenfolierung und Snackora-Logo",
  width: 1122,
  height: 1402,
  symbolic: true,
};

export const machinePhotos: Record<MachineSlug, Photo | null> = {
  snackautomaten: null,
  getraenkeautomaten: null,
  kombiautomaten: null,
  kaffeeautomaten: null,
};
