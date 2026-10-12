import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/work", "/library", "/support", "/privacy"].map((path) => ({ url: `${site.url}${path}`, changeFrequency: "weekly" }));
}
