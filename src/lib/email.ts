function emailButton(url: string, label: string): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
      <tr>
        <td style="background-color:#111111;border-radius:8px;">
          <a href="${url}" style="display:inline-block;padding:13px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;line-height:1;">${label}</a>
        </td>
      </tr>
    </table>`;
}

function emailLayout(title: string, body: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:48px 16px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="https://evvycal.app" style="text-decoration:none;">
                <span style="font-size:30px;font-weight:800;letter-spacing:-0.5px;">
                  <span style="color:#111111;">E</span><span style="color:#3b82f6;">v</span><span style="color:#111111;">vy.</span>
                </span>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;border:1px solid #e4e4e7;padding:40px 40px 36px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">© ${year} Evvy · <a href="https://evvycal.app" style="color:#a1a1aa;text-decoration:underline;">evvycal.app</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildPasswordResetEmail(url: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Reset your password</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#52525b;line-height:1.6;">You requested a password reset for your Evvy account.</p>
    <p style="margin:0;font-size:15px;color:#52525b;line-height:1.6;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
    ${emailButton(url, "Reset my password")}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 24px;">
    <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">If you didn't request this, you can safely ignore this email — your password won't change.</p>`;
  return emailLayout("Reset your Evvy password", body);
}

export function buildEmailChangeEmail(newEmail: string, confirmUrl: string): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Confirm your email change</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#52525b;line-height:1.6;">You requested to change your Evvy email address to:</p>
    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#111111;">${newEmail}</p>
    <p style="margin:0;font-size:15px;color:#52525b;line-height:1.6;">Click the button below to confirm. This link expires in <strong>1 hour</strong>.</p>
    ${emailButton(confirmUrl, "Confirm email change")}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 24px;">
    <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">If you didn't request this, you can safely ignore this email — your address won't change.</p>`;
  return emailLayout("Confirm your Evvy email change", body);
}

export function buildVerificationEmail(url: string, name: string, lang: "fr" | "en" = "en"): string {
  const isFr = lang === "fr";
  const title = isFr ? "Vérifiez votre adresse email" : "Verify your email address";
  const body = isFr ? `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Bienvenue sur Evvy, ${name} !</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#52525b;line-height:1.6;">Votre compte a bien été créé. Il ne reste plus qu'une étape : vérifier votre adresse email.</p>
    <p style="margin:0;font-size:15px;color:#52525b;line-height:1.6;">Ce lien expire dans <strong>1 heure</strong>.</p>
    ${emailButton(url, "Vérifier mon email")}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 24px;">
    <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">Si vous n'avez pas créé de compte, ignorez cet email.</p>` : `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Welcome to Evvy, ${name}!</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#52525b;line-height:1.6;">Your account has been created. One last step: verify your email address.</p>
    <p style="margin:0;font-size:15px;color:#52525b;line-height:1.6;">This link expires in <strong>1 hour</strong>.</p>
    ${emailButton(url, "Verify my email")}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 24px;">
    <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">If you didn't create an account, you can safely ignore this email.</p>`;
  return emailLayout(title, body);
}

export function buildWelcomePremiumEmail(name: string, periodEnd: Date, lang: "fr" | "en" = "en"): string {
  const isFr = lang === "fr";
  const dateStr = periodEnd.toLocaleDateString(isFr ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" });
  const title = isFr ? "Bienvenue dans Evvy Premium !" : "Welcome to Evvy Premium!";
  const body = isFr ? `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Vous êtes Premium, ${name} !</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">Merci pour votre abonnement. Tout est débloqué.</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;">
      <tr><td style="padding:6px 0;font-size:14px;color:#111111;">✓ &nbsp;Événements illimités</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#111111;">✓ &nbsp;RSVPs illimités</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#111111;">✓ &nbsp;Branding personnalisé (logo, couleurs, fond)</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#111111;">✓ &nbsp;Calendriers personnalisés avec pages publiques</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#111111;">✓ &nbsp;Analytics complets</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#111111;">✓ &nbsp;Rappels automatiques aux participants</td></tr>
    </table>
    <p style="margin:0 0 4px;font-size:13px;color:#71717a;">Prochain renouvellement : <strong>${dateStr}</strong></p>
    ${emailButton("https://evvycal.app/dashboard", "Accéder au dashboard")}` : `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">You're Premium, ${name}!</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">Thank you for subscribing. Everything is now unlocked.</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;">
      <tr><td style="padding:6px 0;font-size:14px;color:#111111;">✓ &nbsp;Unlimited events</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#111111;">✓ &nbsp;Unlimited RSVPs</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#111111;">✓ &nbsp;Custom branding (logo, colors, background)</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#111111;">✓ &nbsp;Custom calendars with public pages</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#111111;">✓ &nbsp;Full analytics</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#111111;">✓ &nbsp;Automated RSVP reminders to participants</td></tr>
    </table>
    <p style="margin:0 0 4px;font-size:13px;color:#71717a;">Next renewal: <strong>${dateStr}</strong></p>
    ${emailButton("https://evvycal.app/dashboard", "Go to my dashboard")}`;
  return emailLayout(title, body);
}

export function buildSubscriptionEndedEmail(name: string, lang: "fr" | "en" = "en"): string {
  const isFr = lang === "fr";
  const title = isFr ? "Votre abonnement Evvy a pris fin" : "Your Evvy subscription has ended";
  const body = isFr ? `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Abonnement terminé</h1>
    <p style="margin:0 0 12px;font-size:15px;color:#52525b;line-height:1.6;">Votre abonnement Premium Evvy a pris fin, ${name}. Vous êtes passé au plan gratuit.</p>
    <p style="margin:0 0 12px;font-size:15px;color:#52525b;line-height:1.6;">Vos événements et calendriers sont conservés. Vous pouvez vous réabonner à tout moment pour retrouver toutes les fonctionnalités.</p>
    ${emailButton("https://evvycal.app/dashboard/billing", "Me réabonner")}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 24px;">
    <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">Besoin d'aide ? Contactez-nous sur <a href="https://evvycal.app" style="color:#a1a1aa;">evvycal.app</a>.</p>` : `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Subscription ended</h1>
    <p style="margin:0 0 12px;font-size:15px;color:#52525b;line-height:1.6;">Your Evvy Premium subscription has ended, ${name}. You're now on the free plan.</p>
    <p style="margin:0 0 12px;font-size:15px;color:#52525b;line-height:1.6;">Your events and calendars are kept safe. You can resubscribe at any time to get everything back.</p>
    ${emailButton("https://evvycal.app/dashboard/billing", "Resubscribe")}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 24px;">
    <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">Need help? Reach us at <a href="https://evvycal.app" style="color:#a1a1aa;">evvycal.app</a>.</p>`;
  return emailLayout(title, body);
}

export function buildRsvpReminderEmail(params: {
  rsvpName: string;
  eventTitle: string;
  eventUrl: string;
  dateLabel: string;
  location: string | null;
  isOnline: boolean;
  hoursUntil: number;
  lang: "fr" | "en";
}): string {
  const { rsvpName, eventTitle, eventUrl, dateLabel, location, isOnline, hoursUntil, lang } = params;
  const isFr = lang === "fr";
  const isToday = hoursUntil <= 26;
  const timeLabel = isToday
    ? (isFr ? "demain" : "tomorrow")
    : (isFr ? "dans 7 jours" : "in 7 days");
  const title = isFr ? `Rappel : ${eventTitle}` : `Reminder: ${eventTitle}`;
  const locationLine = location
    ? `<p style="margin:4px 0 0;font-size:13px;color:#71717a;">${isOnline ? "🔗" : "📍"} ${location}</p>`
    : "";
  const body = isFr ? `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Rappel d'événement</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">Bonjour ${rsvpName}, vous avez un événement <strong>${timeLabel}</strong> !</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;background:#f8f8f9;border-radius:10px;padding:16px;" width="100%">
      <tr><td>
        <p style="margin:0;font-size:16px;font-weight:700;color:#111111;">${eventTitle}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#71717a;">📅 ${dateLabel}</p>
        ${locationLine}
      </td></tr>
    </table>
    ${emailButton(eventUrl, "Voir l'événement")}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 24px;">
    <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">Vous recevez cet email car vous avez répondu à cet événement.</p>` : `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Event reminder</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">Hi ${rsvpName}, you have an event <strong>${timeLabel}</strong>!</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;background:#f8f8f9;border-radius:10px;padding:16px;" width="100%">
      <tr><td>
        <p style="margin:0;font-size:16px;font-weight:700;color:#111111;">${eventTitle}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#71717a;">📅 ${dateLabel}</p>
        ${locationLine}
      </td></tr>
    </table>
    ${emailButton(eventUrl, "View event")}
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0 24px;">
    <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">You're receiving this because you responded to this event.</p>`;
  return emailLayout(title, body);
}
