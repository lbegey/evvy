// Shared helpers for the event "Add to calendar" integration snippets.
// Used by the event dashboard integration card (EventIntegrationCard).

export const CALENDAR_SERVICES = [
  { key: "google",    name: "Google Calendar", logo: "/logos/google-calendar.png" },
  { key: "apple",     name: "Apple Calendar",  logo: "/logos/apple-calendar.png" },
  { key: "outlook",   name: "Outlook.com",     logo: "/logos/outlook.png" },
  { key: "office365", name: "Office 365",      logo: "/logos/office365.png" },
  { key: "yahoo",     name: "Yahoo Calendar",  logo: "/logos/yahoo-calendar.png" },
] as const;

export type CalendarServiceKey = (typeof CALENDAR_SERVICES)[number]["key"];

export function buildEmailHTML(
  eventId: string,
  appUrl: string,
  addToCalendarText: string,
  centered: boolean
): string {
  const t = `${appUrl}/api/events/${eventId}/track`;
  const logos = CALENDAR_SERVICES.map(
    ({ key, name, logo }) =>
      `      <a href="${t}?service=${key}" style="display:inline-block;margin:0 4px;vertical-align:middle">
        <img src="${appUrl}${logo}" width="40" height="40" alt="${name}" border="0" style="display:block" />
      </a>`
  ).join("\n");
  const align = centered ? "center" : "left";
  const tableStyle = centered ? ' style="margin:0 auto"' : "";
  return `<style>
  @media (max-width: 480px) {
    .atc-email-cell { display: block !important; width: 100% !important; padding: 0 !important; text-align: ${align} !important; white-space: normal !important; }
    .atc-email-label { padding-bottom: 10px !important; }
  }
</style>
<table cellpadding="0" cellspacing="0" border="0" role="presentation" align="${align}"${tableStyle}>
  <tr>
    <td class="atc-email-cell atc-email-label" align="${align}" style="text-align:${align};vertical-align:middle;padding-right:16px;font-size:15px;color:#374151;font-family:Arial,Helvetica,sans-serif;white-space:nowrap">
      ${addToCalendarText}
    </td>
    <td class="atc-email-cell" align="${align}" style="text-align:${align};vertical-align:middle">
${logos}
    </td>
  </tr>
</table>`;
}

export function buildWebHTML(
  eventId: string,
  appUrl: string,
  addToCalendarText: string,
  centered: boolean
): string {
  const t = `${appUrl}/api/events/${eventId}/track`;
  const links = CALENDAR_SERVICES.map(
    ({ key, name, logo }) =>
      `    <a class="atc-link" href="${t}?service=${key}" target="_blank" rel="noopener noreferrer">
      <img class="atc-icon" src="${appUrl}${logo}" width="40" height="40" alt="${name}" />
    </a>`
  ).join("\n");
  return `<style>
  .atc { display: flex; align-items: center; gap: 12px; font-family: system-ui, -apple-system, sans-serif;${centered ? " width: 100%; justify-content: center;" : ""} }
  .atc-label { font-size: 15px; color: #374151; white-space: nowrap; }
  .atc-links { display: flex; gap: 8px; }
  .atc-link { display: inline-block; }
  .atc-icon { display: block; border-radius: 8px; }
</style>
<div class="atc">
  <span class="atc-label">${addToCalendarText}</span>
  <div class="atc-links">
${links}
  </div>
</div>`;
}

export function buildTailwindHTML(
  eventId: string,
  appUrl: string,
  addToCalendarText: string,
  centered: boolean
): string {
  const t = `${appUrl}/api/events/${eventId}/track`;
  const links = CALENDAR_SERVICES.map(
    ({ key, name, logo }) =>
      `    <a class="inline-block" href="${t}?service=${key}" target="_blank" rel="noopener noreferrer">
      <img class="block rounded-lg" src="${appUrl}${logo}" width="40" height="40" alt="${name}" />
    </a>`
  ).join("\n");
  return `<div class="flex items-center gap-3 font-sans${centered ? " w-full justify-center" : ""}">
  <span class="text-sm text-gray-700 whitespace-nowrap">${addToCalendarText}</span>
  <div class="flex gap-2">
${links}
  </div>
</div>`;
}
