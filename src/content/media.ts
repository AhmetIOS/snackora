/**
 * Optional photography. Every slot falls back to the brand illustration
 * when `null`. Put optimised files (WebP/JPEG, ≥ 1600 px on the long side)
 * into public/images/ and reference them here.
 *
 * Rules (see BRAND_GUIDELINES.md → Bildsprache):
 *  - Real photos of actual Snackora machines/locations: symbolic = false.
 *  - Licensed stock or AI-generated images: symbolic = true → captioned
 *    "Symbolbild". Never show other brands' logos or invented locations.
 */

export interface Photo {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** true → captioned as "Symbolbild" (stock / AI / illustrative photo). */
  symbolic: boolean;
  /** Source / licence note, e.g. "Foto: Name, Unsplash-Lizenz". */
  credit?: string;
}

export const heroPhoto: Photo | null = null;

export const machinePhotos: Record<"snackautomaten" | "getraenkeautomaten" | "kombiautomaten", Photo | null> = {
  snackautomaten: null,
  getraenkeautomaten: null,
  kombiautomaten: null,
};
