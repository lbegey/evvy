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
            <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Information we collect</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              When you create an account on Evvy, we collect your name, email address, and password (stored
              in hashed form). If you sign in with Google, we receive your name and email from Google.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We also collect information about the events and calendars you create (title, dates, location,
              description, colour), and statistics about interactions with your public pages (page views and
              calendar link clicks).
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              When guests respond to an RSVP, we collect the name, email address (optional), response status,
              and any message they choose to provide. This data is stored on your behalf and is visible to you
              as the event organiser.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you subscribe to the Premium plan, Stripe processes your payment information directly.
              We do not store your card details; we only retain a Stripe customer ID and subscription status.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. How we use your information</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We use the information we collect to provide, maintain, and improve Evvy. This includes
              creating and managing your events and calendars, generating shareable links, tracking statistics
              at your request, enabling RSVP functionality, and processing your subscription.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We may send you transactional emails related to your account: email address verification,
              password resets, payment confirmations, and subscription status changes. If you have enabled
              RSVPs on an event, guests who provided their email address may receive automated reminder emails
              (24 hours and 7 days before the event). We do not send marketing emails without your explicit
              consent.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We do not sell or share your personal data with third parties for advertising purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Third-party services</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Evvy uses the following third-party processors:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
              <li><strong>Stripe</strong> — payment processing for Premium subscriptions. Stripe&apos;s privacy policy applies to card data.</li>
              <li><strong>Resend</strong> — transactional email delivery (verification, payment confirmation, RSVP reminders).</li>
              <li><strong>Vercel</strong> — hosting and infrastructure.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Cookies</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Evvy uses essential cookies to keep you signed in and remember your preferences (such as
              language). We also use a cookie-based deduplication system to count unique calendar link clicks
              (30-day cookie per event and service). These cookies contain no personally identifiable
              information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Data retention</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your account data and events are stored as long as you maintain an active account. You can
              delete individual events at any time (Premium plan). You can permanently delete your account
              and all associated data directly from the{" "}
              <a href="/dashboard/profile" className="text-primary underline underline-offset-4 hover:opacity-80">
                Profile page
              </a>{" "}
              — this action is immediate and irreversible, and cancels any active subscription.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Your rights (GDPR)</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you are located in the European Economic Area, you have the right to access, correct, or
              delete your personal data, object to or restrict processing, and data portability. You can
              exercise most of these rights directly from your account settings. For any other request,
              please contact us via the Contact page.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Security</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We take reasonable measures to protect your personal information against unauthorised access,
              alteration, disclosure, or destruction. Passwords are hashed using bcrypt before storage.
              Authentication sessions use secure, httpOnly cookies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">8. Contact</h2>
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
