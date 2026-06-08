import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-16 sm:px-6">
        <article className="mx-auto max-w-2xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2025</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Information we collect</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              When you create an account on Evvy, we collect your name, email address, and password (stored
              in hashed form). If you sign in with Google, we receive your name and email from Google. We also
              collect information about the events you create (title, dates, location, description) and
              statistics about interactions with your public event pages (page views and calendar link clicks).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. How we use your information</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We use the information we collect to provide, maintain, and improve Evvy. This includes
              creating and managing your events, generating shareable links, tracking statistics at your
              request, and enabling RSVP functionality. We do not sell or share your personal data with third
              parties for advertising purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Cookies</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Evvy uses essential cookies to keep you signed in and remember your preferences (such as
              language). We also use a cookie-based deduplication system to count unique calendar link clicks
              (30-day cookie per event and service). These cookies contain no personally identifiable
              information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Data retention</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your account data and events are stored as long as you maintain an active account. You can
              delete individual events at any time. To request deletion of your entire account and associated
              data, please contact us using the form on our Contact page.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Your rights (GDPR)</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you are located in the European Economic Area, you have the right to access, correct, or
              delete your personal data, object to or restrict processing, and data portability. To exercise
              any of these rights, please contact us via the Contact page.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Security</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We take reasonable measures to protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. Passwords are hashed using bcrypt before storage.
              Authentication sessions use secure, httpOnly cookies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you have questions about this Privacy Policy or wish to exercise your rights, please use the{" "}
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
