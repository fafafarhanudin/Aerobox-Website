import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
  },
  // The Aerobox Assets library is a static Vite build in public/library (source in /library).
  // brand logo files are fetched by the Figma plugin, which runs in a null-origin iframe
  async headers() {
    return [{ source: "/library/world/:file*", headers: [{ key: "Access-Control-Allow-Origin", value: "*" }] }];
  },
  async rewrites() {
    return [{ source: "/library", destination: "/library/index.html" }];
  },
};

export default nextConfig;
