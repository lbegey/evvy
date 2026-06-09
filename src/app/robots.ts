import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://evvycal.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/e/", "/c/", "/privacy", "/terms", "/contact"],
      disallow: ["/dashboard", "/api/", "/login", "/register", "/forgot-password", "/reset-password"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
