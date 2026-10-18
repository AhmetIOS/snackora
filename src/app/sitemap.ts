import type { MetadataRoute } from "next";
import { indexableRoutes, siteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return indexableRoutes.map((r) => ({
    url: `${siteUrl}${r.path === "/" ? "" : r.path}`,
    changeFrequency: r.priority >= 0.8 ? "monthly" : "yearly",
    priority: r.priority,
  }));
}
