import { headers } from "next/headers";

const FALLBACK_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Derives the app's public origin from the incoming request's headers
 * (`x-forwarded-host`/`host`) instead of a static env var, so generated links,
 * QR codes, .ics files, calendar redirects, etc. point at whatever origin the
 * visitor is actually using — localhost, a cloudflared tunnel (random hostname
 * per session), or a production domain — without needing manual config.
 */
export async function getAppUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return FALLBACK_URL;
  const isLoopback = /^(localhost|127\.|\[::1\])/i.test(host);
  const proto = h.get("x-forwarded-proto") ?? (isLoopback ? "http" : "https");
  return `${proto}://${host}`;
}
