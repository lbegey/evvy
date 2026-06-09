"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function PrivacyContent() {
  const { lang } = useLanguage();
  const isFr = lang === "fr";

  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {isFr ? "Politique de confidentialité" : "Privacy Policy"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isFr ? "Dernière mise à jour : Juin 2026" : "Last updated: June 2026"}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {isFr ? "1. Informations que nous collectons" : "1. Information we collect"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr
            ? "Lorsque vous créez un compte sur Evvy, nous collectons votre nom, votre adresse email et votre mot de passe (stocké sous forme hachée). Si vous vous connectez avec Google, nous recevons votre nom et votre email depuis Google."
            : "When you create an account on Evvy, we collect your name, email address, and password (stored in hashed form). If you sign in with Google, we receive your name and email from Google."}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr
            ? "Nous collectons également des informations sur les événements et calendriers que vous créez (titre, dates, lieu, description, couleur), ainsi que des statistiques sur les interactions avec vos pages publiques (vues et clics sur les liens de calendrier)."
            : "We also collect information about the events and calendars you create (title, dates, location, description, colour), and statistics about interactions with your public pages (page views and calendar link clicks)."}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr
            ? "Lorsque des invités répondent à un RSVP, nous collectons leur nom, leur adresse email (optionnelle), leur réponse et tout message qu'ils choisissent de fournir. Ces données sont stockées en votre nom et vous sont accessibles en tant qu'organisateur."
            : "When guests respond to an RSVP, we collect the name, email address (optional), response status, and any message they choose to provide. This data is stored on your behalf and is visible to you as the event organiser."}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr
            ? "Si vous souscrivez au plan Premium, Stripe traite vos informations de paiement directement. Nous ne stockons pas vos coordonnées bancaires ; nous conservons uniquement un identifiant client Stripe et le statut de votre abonnement."
            : "If you subscribe to the Premium plan, Stripe processes your payment information directly. We do not store your card details; we only retain a Stripe customer ID and subscription status."}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {isFr ? "2. Comment nous utilisons vos informations" : "2. How we use your information"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr
            ? "Nous utilisons les informations collectées pour fournir, maintenir et améliorer Evvy. Cela comprend la création et la gestion de vos événements et calendriers, la génération de liens partageables, le suivi de statistiques à votre demande, la gestion des RSVPs et le traitement de votre abonnement."
            : "We use the information we collect to provide, maintain, and improve Evvy. This includes creating and managing your events and calendars, generating shareable links, tracking statistics at your request, enabling RSVP functionality, and processing your subscription."}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr
            ? "Nous pouvons vous envoyer des emails transactionnels liés à votre compte : vérification d'adresse email, réinitialisation de mot de passe, confirmations de paiement et changements de statut d'abonnement. Si vous avez activé les RSVPs sur un événement, les invités ayant fourni leur adresse email peuvent recevoir des emails de rappel automatiques (24 heures et 7 jours avant l'événement). Nous n'envoyons pas d'emails marketing sans votre consentement explicite."
            : "We may send you transactional emails related to your account: email address verification, password resets, payment confirmations, and subscription status changes. If you have enabled RSVPs on an event, guests who provided their email address may receive automated reminder emails (24 hours and 7 days before the event). We do not send marketing emails without your explicit consent."}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr
            ? "Nous ne vendons ni ne partageons vos données personnelles avec des tiers à des fins publicitaires."
            : "We do not sell or share your personal data with third parties for advertising purposes."}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {isFr ? "3. Services tiers" : "3. Third-party services"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr ? "Evvy utilise les prestataires tiers suivants :" : "Evvy uses the following third-party processors:"}
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong>Stripe</strong> —{" "}
            {isFr
              ? "traitement des paiements pour les abonnements Premium. La politique de confidentialité de Stripe s'applique aux données bancaires."
              : "payment processing for Premium subscriptions. Stripe's privacy policy applies to card data."}
          </li>
          <li>
            <strong>Resend</strong> —{" "}
            {isFr
              ? "envoi des emails transactionnels (vérification, confirmation de paiement, rappels RSVP)."
              : "transactional email delivery (verification, payment confirmation, RSVP reminders)."}
          </li>
          <li>
            <strong>Vercel</strong> —{" "}
            {isFr ? "hébergement et infrastructure." : "hosting and infrastructure."}
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {isFr ? "4. Cookies" : "4. Cookies"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr
            ? "Evvy utilise des cookies essentiels pour maintenir votre session et mémoriser vos préférences (comme la langue). Nous utilisons également un système de déduplication par cookie pour comptabiliser les clics uniques sur les liens de calendrier (cookie de 30 jours par événement et service). Ces cookies ne contiennent aucune information personnelle identifiable."
            : "Evvy uses essential cookies to keep you signed in and remember your preferences (such as language). We also use a cookie-based deduplication system to count unique calendar link clicks (30-day cookie per event and service). These cookies contain no personally identifiable information."}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {isFr ? "5. Conservation des données" : "5. Data retention"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr ? (
            <>Vos données et événements sont conservés tant que vous maintenez un compte actif. Vous pouvez supprimer des événements individuels à tout moment (plan Premium). Vous pouvez supprimer définitivement votre compte et toutes les données associées directement depuis la{" "}
              <a href="/dashboard/profile" className="text-primary underline underline-offset-4 hover:opacity-80">page Profil</a>{" "}
              — cette action est immédiate et irréversible, et annule tout abonnement actif.</>
          ) : (
            <>Your account data and events are stored as long as you maintain an active account. You can delete individual events at any time (Premium plan). You can permanently delete your account and all associated data directly from the{" "}
              <a href="/dashboard/profile" className="text-primary underline underline-offset-4 hover:opacity-80">Profile page</a>{" "}
              — this action is immediate and irreversible, and cancels any active subscription.</>
          )}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {isFr ? "6. Vos droits (RGPD)" : "6. Your rights (GDPR)"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr
            ? "Si vous résidez dans l'Espace économique européen, vous disposez du droit d'accéder, de corriger ou de supprimer vos données personnelles, de vous opposer ou de limiter leur traitement, ainsi que de la portabilité des données. Vous pouvez exercer la plupart de ces droits directement depuis les paramètres de votre compte. Pour toute autre demande, contactez-nous via la page Contact."
            : "If you are located in the European Economic Area, you have the right to access, correct, or delete your personal data, object to or restrict processing, and data portability. You can exercise most of these rights directly from your account settings. For any other request, please contact us via the Contact page."}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {isFr ? "7. Sécurité" : "7. Security"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr
            ? "Nous prenons des mesures raisonnables pour protéger vos informations personnelles contre tout accès non autorisé, altération, divulgation ou destruction. Les mots de passe sont hachés avec bcrypt avant stockage. Les sessions d'authentification utilisent des cookies sécurisés et httpOnly."
            : "We take reasonable measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. Passwords are hashed using bcrypt before storage. Authentication sessions use secure, httpOnly cookies."}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {isFr ? "8. Contact" : "8. Contact"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isFr ? (
            <>Pour toute question relative à cette Politique de confidentialité ou pour exercer vos droits, veuillez utiliser le{" "}
              <a href="/contact" className="text-primary underline underline-offset-4 hover:opacity-80">formulaire de contact</a>.</>
          ) : (
            <>If you have questions about this Privacy Policy or wish to exercise your rights, please use the{" "}
              <a href="/contact" className="text-primary underline underline-offset-4 hover:opacity-80">contact form</a>.</>
          )}
        </p>
      </section>
    </article>
  );
}
