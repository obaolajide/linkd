import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async headers() {
    return ["/sw.js", "/manifest.webmanifest"].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
    }));
  },
};

export default nextConfig;
