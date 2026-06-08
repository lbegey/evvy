"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { submitContact } from "@/app/contact/actions";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const { T } = useLanguage();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitContact(values);
      if (result.ok) {
        setDone(true);
      } else {
        setServerError(T.contact.error);
      }
    });
  };

  return (
    <main className="flex-1 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {T.contact.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{T.contact.subtitle}</p>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border/60 bg-muted/20 py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <div>
              <p className="font-semibold text-foreground">{T.contact.success}</p>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>lbegey@gmail.com</span>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 rounded-xl border border-border/60 bg-card p-6 shadow-sm"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">{T.contact.name}</Label>
                <Input
                  id="c-name"
                  placeholder={T.contact.namePlaceholder}
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {T.auth.validation.required}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-email">{T.contact.email}</Label>
                <Input
                  id="c-email"
                  type="email"
                  placeholder={T.contact.emailPlaceholder}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {T.auth.validation.emailInvalid}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-subject">{T.contact.subject}</Label>
              <Input
                id="c-subject"
                placeholder={T.contact.subjectPlaceholder}
                {...form.register("subject")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-message">{T.contact.message}</Label>
              <Textarea
                id="c-message"
                rows={5}
                placeholder={T.contact.messagePlaceholder}
                {...form.register("message")}
              />
              {form.formState.errors.message && (
                <p className="text-xs text-destructive">
                  {T.auth.validation.required}
                </p>
              )}
            </div>

            {serverError && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {T.contact.submitting}
                </>
              ) : (
                T.contact.submit
              )}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
