import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    // Serve modern formats; Next negotiates AVIF → WebP → original per client.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  serverExternalPackages: [
    "sharp",
    "@prisma/client",
    "better-auth",
    "kysely",
    "@better-auth/kysely-adapter",
    "@better-auth/core",
  ],
};

export default withBundleAnalyzer(nextConfig);
