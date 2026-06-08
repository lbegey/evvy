import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // No static fallback: better-auth resolves to `window.location.origin` when
  // unset, which is what lets sign-in work both on localhost and through the
  // cloudflared tunnel (whose hostname changes every restart).
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { useSession, signIn, signOut, signUp } = authClient;
