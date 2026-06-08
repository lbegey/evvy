import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-16 sm:px-6">
        <article className="mx-auto max-w-2xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms of Service</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2025</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of terms</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              By accessing or using Evvy, you agree to be bound by these Terms of Service. If you do not
              agree to these terms, please do not use the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Description of service</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Evvy is a web application that allows users to create events and generate shareable
              add-to-calendar links. The service is provided free of charge and is intended for personal and
              professional use.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. User accounts</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activities that occur under your account. You must provide accurate and complete information when
              registering and keep this information up to date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Acceptable use</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You agree not to use Evvy to create events that are illegal, harmful, threatening, abusive,
              defamatory, or otherwise objectionable. You must not attempt to interfere with the service or
              its infrastructure, or use it to send unsolicited communications.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Content</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You retain ownership of the content you create on Evvy. By posting content, you grant us a
              limited license to store, display, and distribute that content solely for the purpose of
              operating the service. We do not claim any rights over your event content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Availability and modifications</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue the service at any time without prior
              notice. We are not liable for any interruption or discontinuation of the service. We may update
              these terms at any time; continued use of the service constitutes acceptance of updated terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Limitation of liability</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Evvy is provided "as is" without warranties of any kind. We are not liable for any indirect,
              incidental, or consequential damages arising from your use of the service, including loss of data
              or revenue.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">8. Contact</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              For any questions about these Terms, please use our{" "}
              <a href="/contact" className="text-primary underline underline-offset-4 hover:opacity-80">
                contact form
              </a>
              .
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
