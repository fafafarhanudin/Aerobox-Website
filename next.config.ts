import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
  },
  // The Aerobox Assets library is a static Vite build in public/library (source in /library).
  async rewrites() {
    return [{ source: "/library", destination: "/library/index.html" }];
  },
};

export default nextConfig;
