"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
import { signIn } from "@/lib/auth-client";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useLanguage } from "@/contexts/LanguageContext";

const baseSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof baseSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { T } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setServerError(T.auth.login.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {T.auth.login.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {T.auth.login.subtitle}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{T.auth.login.email}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={T.auth.login.emailPlaceholder}
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
                <FormLabel>{T.auth.login.password}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
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

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              {T.auth.login.forgotPassword}
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {T.auth.login.submit}
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
        {T.auth.login.noAccount}{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {T.auth.login.register}
        </Link>
      </p>
    </div>
  );
}
