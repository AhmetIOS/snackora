import type { MetadataRoute } from "next";
import { business } from "@/config/business";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${business.brand} – ${business.slogan}`,
    short_name: business.brand,
    description: "Snack- und Getränkeautomaten für Unternehmen und Standorte in der Region Stuttgart.",
    start_url: "/",
    display: "browser",
    background_color: "#F5F1E6",
    theme_color: "#12382A",
    lang: "de-DE",
    icons: [
      { src: "/brand/snackora-symbol-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/snackora-symbol-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
