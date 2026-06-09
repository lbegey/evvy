"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signUp } from "@/lib/auth-client";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { T } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const schema = z
    .object({
      name: z.string().min(2, T.auth.validation.nameMin),
      email: z.string().email(T.auth.validation.emailInvalid),
      password: z.string().min(8, T.auth.validation.passwordMin),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: T.auth.validation.passwordsMatch,
      path: ["confirmPassword"],
    });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    if (error) {
      setServerError(
        error.code === "USER_ALREADY_EXISTS"
          ? T.auth.register.errorExists
          : error.code === "ACCOUNT_DELETED"
          ? T.auth.register.errorDeleted
          : T.auth.register.errorGeneral
      );
      return;
    }
    setRegisteredEmail(values.email);
    setVerificationSent(true);
  };

  if (verificationSent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{T.auth.verification.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {T.auth.verification.subtitle} <strong>{registeredEmail}</strong>.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{T.auth.verification.hint}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          {T.auth.verification.continue}
        </Link>
        <p className="mt-4 text-xs text-muted-foreground">{T.auth.verification.spam}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {T.auth.register.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {T.auth.register.subtitle}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{T.auth.register.name}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={T.auth.register.namePlaceholder}
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{T.auth.register.email}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={T.auth.register.emailPlaceholder}
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{T.auth.register.password}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={T.auth.register.passwordPlaceholder}
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{T.auth.register.confirmPassword}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {T.auth.register.submit}
          </Button>
        </form>
      </Form>

      <div className="mt-6 space-y-3">
        <div className="relative flex items-center">
          <div className="flex-1 border-t border-border/60" />
          <span className="mx-3 text-xs text-muted-foreground">{T.common.or}</span>
          <div className="flex-1 border-t border-border/60" />
        </div>
        <GoogleSignInButton />
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {T.auth.register.haveAccount}{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {T.auth.register.login}
        </Link>
      </p>
    </div>
  );
}
