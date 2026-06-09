import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  return (
    <Suspense>
      <ResetPasswordForm token={token} invalidToken={error === "INVALID_TOKEN" || !token} />
    </Suspense>
  );
}
