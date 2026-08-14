import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "c.saavncdn.com" },
      { protocol: "https", hostname: "www.jiosaavn.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/api/lyrics",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Netlify-CDN-Cache-Control", value: "no-store" },
          { key: "Netlify-Vary", value: "query" },
        ],
      },
    ];
  },
};

export default nextConfig;
