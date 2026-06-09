"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsPage() {
  const { lang } = useLanguage();
  const isFr = lang === "fr";

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-16 sm:px-6">
        <article className="mx-auto max-w-2xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isFr ? "Conditions d'utilisation" : "Terms of Service"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isFr ? "Dernière mise à jour : Juin 2026" : "Last updated: June 2026"}
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {isFr ? "1. Acceptation des conditions" : "1. Acceptance of terms"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isFr
                ? "En accédant à Evvy ou en l'utilisant, vous acceptez d'être lié par ces Conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service."
                : "By accessing or using Evvy, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service."}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {isFr ? "2. Description du service" : "2. Description of service"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isFr
                ? "Evvy est une application web permettant de créer des événements, de gérer les RSVPs et de générer des liens partageables pour ajouter des événements à un calendrier. Evvy est disponible en deux formules : un plan gratuit avec des fonctionnalités limitées, et un abonnement Premium offrant des fonctionnalités avancées incluant des événements illimités, un branding personnalisé, des statistiques et des calendriers personnalisés."
                : "Evvy is a web application that allows users to create events, manage RSVPs, and generate shareable add-to-calendar links. Evvy is available in two tiers: a free plan with limited features, and a Premium subscription with advanced features including unlimited events, custom branding, analytics, and custom calendars."}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {isFr ? "3. Comptes utilisateurs" : "3. User accounts"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isFr
                ? "Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités effectuées sous votre compte. Vous devez fournir des informations exactes et complètes lors de votre inscription et les maintenir à jour. Vous devez vérifier votre adresse email pour accéder à toutes les fonctionnalités du service."
                : "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when registering and keep this information up to date. You must verify your email address to access all features of the service."}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {isFr ? "4. Abonnements et facturation" : "4. Subscriptions and billing"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isFr
                ? "Le plan Premium est facturé mensuellement via Stripe. En vous abonnant, vous nous autorisez à débiter automatiquement votre moyen de paiement à chaque renouvellement. Vous pouvez annuler votre abonnement à tout moment depuis la page Facturation ; l'accès Premium reste actif jusqu'à la fin de la période de facturation en cours. Nous nous réservons le droit de modifier les tarifs avec un préavis raisonnable."
                : "The Premium plan is billed on a monthly basis via Stripe. By subscribing, you authorise us to charge your payment method automatically at each renewal. You may cancel your subscription at any time from the Billing page; Premium access remains active until the end of the current billing period. We reserve the right to change pricing with reasonable advance notice."}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {isFr ? "5. Utilisation acceptable" : "5. Acceptable use"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isFr
                ? "Vous acceptez de ne pas utiliser Evvy pour créer des événements illégaux, nuisibles, menaçants, abusifs, diffamatoires ou autrement répréhensibles. Vous ne devez pas tenter d'interférer avec le service ou son infrastructure, ni l'utiliser pour envoyer des communications non sollicitées."
                : "You agree not to use Evvy to create events that are illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable. You must not attempt to interfere with the service or its infrastructure, or use it to send unsolicited communications."}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {isFr ? "6. Contenu" : "6. Content"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isFr
                ? "Vous conservez la propriété du contenu que vous créez sur Evvy. En publiant du contenu, vous nous accordez une licence limitée pour le stocker, l'afficher et le distribuer uniquement dans le but d'exploiter le service. Nous ne revendiquons aucun droit sur le contenu de vos événements."
                : "You retain ownership of the content you create on Evvy. By posting content, you grant us a limited licence to store, display, and distribute that content solely for the purpose of operating the service. We do not claim any rights over your event content."}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {isFr ? "7. Disponibilité et modifications" : "7. Availability and modifications"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isFr
                ? "Nous nous réservons le droit de modifier, suspendre ou interrompre le service à tout moment sans préavis. Nous ne sommes pas responsables des interruptions ou discontinuités du service. Nous pouvons mettre à jour ces conditions à tout moment ; la poursuite de l'utilisation du service vaut acceptation des conditions mises à jour."
                : "We reserve the right to modify, suspend, or discontinue the service at any time without prior notice. We are not liable for any interruption or discontinuation of the service. We may update these terms at any time; continued use of the service constitutes acceptance of updated terms."}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {isFr ? "8. Limitation de responsabilité" : "8. Limitation of liability"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isFr
                ? "Evvy est fourni « en l'état », sans garantie d'aucune sorte. Nous ne sommes pas responsables des dommages indirects, accessoires ou consécutifs découlant de votre utilisation du service, notamment la perte de données ou de revenus."
                : "Evvy is provided \"as is\" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service, including loss of data or revenue."}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {isFr ? "9. Contact" : "9. Contact"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isFr ? (
                <>Pour toute question concernant ces Conditions, veuillez utiliser notre{" "}
                  <a href="/contact" className="text-primary underline underline-offset-4 hover:opacity-80">formulaire de contact</a>.</>
              ) : (
                <>For any questions about these Terms, please use our{" "}
                  <a href="/contact" className="text-primary underline underline-offset-4 hover:opacity-80">contact form</a>.</>
              )}
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
