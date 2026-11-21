import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Playwright and the screenshot script talk to the dev server as 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // The floating dev badge gets in the way of the phone layout and screenshots.
  devIndicators: false,
  experimental: {
    // Job photos and worker NID scans are uploaded through server actions.
    serverActions: { bodySizeLimit: "12mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
