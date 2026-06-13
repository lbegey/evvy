import { NextResponse, type NextRequest } from "next/server";

/** Detect the visitor's locale from the cookie, then Accept-Language, default en. */
function detectLocale(req: NextRequest): "en" | "fr" {
  const cookie = req.cookies.get("minical_lang")?.value;
  if (cookie === "fr" || cookie === "en") return cookie;
  const accept = req.headers.get("accept-language")?.toLowerCase() ?? "";
  return accept.startsWith("fr") ? "fr" : "en";
}

/**
 * Marketing pages live under /[lang]. Redirect the bare paths (/, /contact,
 * /privacy, /terms) to the visitor's locale so every indexable URL is
 * language-prefixed (enables proper canonical + hreflang).
 */
export function proxy(req: NextRequest) {
  const lang = detectLocale(req);
  const { pathname, search } = req.nextUrl;
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/contact", "/privacy", "/terms"],
};
