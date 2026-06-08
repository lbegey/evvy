"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: "/reset-password",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.code === "RESET_PASSWORD_DISABLED") {
          setError("La réinitialisation du mot de passe n'est pas activée.");
        } else {
          setError("Une erreur est survenue. Veuillez réessayer.");
        }
      } else {
        setDone(true);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
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
          Email envoyé
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Si un compte existe avec l&apos;adresse <strong>{email}</strong>,
          vous recevrez un lien de réinitialisation dans quelques instants.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          (En développement, le lien est affiché dans la console du serveur.)
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mot de passe oublié
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Envoyer le lien
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
