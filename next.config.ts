import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  serverExternalPackages: [
    "@prisma/client",
    "better-auth",
    "kysely",
    "@better-auth/kysely-adapter",
    "@better-auth/core",
  ],
};

export default nextConfig;
