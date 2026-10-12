import type { Metadata } from "next";

/** Per-page metadata: canonical URL plus matching Open Graph / X titles. A page that sets its own openGraph
 *  no longer inherits app/opengraph-image.jpg, so the shared preview image is named here explicitly. */
const image = { url: "/opengraph-image.jpg?v=3", width: 1200, height: 630, alt: "Aerobox — websites, dashboards, mobile apps and branding" };
export function pageMeta(title: string, description: string, path: string): Metadata {
  const full = `${title} · Aerobox`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: full, description, url: path, siteName: "Aerobox", type: "website", images: [image] },
    twitter: { card: "summary_large_image", creator: "@UI_Farhan", title: full, description, images: [image.url] },
  };
}
