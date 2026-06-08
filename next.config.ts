import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  serverExternalPackages: [
    "@prisma/client",
    "better-auth",
    "kysely",
    "@better-auth/kysely-adapter",
    "@better-auth/core",
  ],
};

export default nextConfig;
