"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z.string().min(8, "Au moins 8 caractères"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; server?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = schema.safeParse({ password, confirm });
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field as keyof typeof errors] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password, token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({
          server:
            data?.code === "INVALID_TOKEN"
              ? "Ce lien est invalide ou expiré. Demandez-en un nouveau."
              : "Une erreur est survenue. Veuillez réessayer.",
        });
      } else {
        setDone(true);
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch {
      setErrors({ server: "Une erreur est survenue. Veuillez réessayer." });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mot de passe mis à jour
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Redirection vers la connexion…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Nouveau mot de passe
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choisissez un mot de passe sécurisé.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="8 caractères minimum"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmer</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {errors.confirm && (
            <p className="text-xs text-destructive">{errors.confirm}</p>
          )}
        </div>

        {errors.server && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {errors.server}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Réinitialiser
        </Button>
      </form>
    </div>
  );
}
