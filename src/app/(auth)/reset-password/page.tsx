import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (error === "INVALID_TOKEN" || !token) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Lien invalide
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ce lien de réinitialisation est invalide ou a expiré.
          <br />
          Veuillez en demander un nouveau.
        </p>
        <a
          href="/forgot-password"
          className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Demander un nouveau lien
        </a>
      </div>
    );
  }

  return (
    <Suspense>
      <ResetPasswordForm token={token} />
    </Suspense>
  );
}
