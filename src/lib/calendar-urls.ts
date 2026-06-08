export type CalEventData = {
  title: string;
  description: string | null;
  location: string | null;
  startAt: string; // ISO
  endAt: string;   // ISO
};

function toICSDate(iso: string): string {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildGoogleUrl(event: CalEventData): string {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toICSDate(event.startAt)}/${toICSDate(event.endAt)}`,
    ...(event.description ? { details: event.description } : {}),
    ...(event.location ? { location: event.location } : {}),
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function buildOutlookUrl(event: CalEventData): string {
  const p = new URLSearchParams({
    rru: "addevent",
    startdt: event.startAt,
    enddt: event.endAt,
    subject: event.title,
    ...(event.description ? { body: event.description } : {}),
    ...(event.location ? { location: event.location } : {}),
  });
  return `https://outlook.live.com/calendar/0/action/compose?${p}`;
}

export function buildOffice365Url(event: CalEventData): string {
  const p = new URLSearchParams({
    rru: "addevent",
    startdt: event.startAt,
    enddt: event.endAt,
    subject: event.title,
    ...(event.description ? { body: event.description } : {}),
    ...(event.location ? { location: event.location } : {}),
  });
  return `https://outlook.office.com/calendar/action/compose?${p}`;
}

export function buildGoogleSubscribeUrl(icsUrl: string): string {
  // Google only triggers its "subscribe to this calendar" flow when the cid
  // uses the webcal:// scheme — passing an http(s):// URL makes it try to
  // open/download the feed directly instead of offering to add the calendar.
  const webcalUrl = icsUrl.replace(/^https?:\/\//, "webcal://");
  const p = new URLSearchParams({ cid: webcalUrl });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function buildOutlookSubscribeUrl(icsUrl: string, name: string): string {
  const p = new URLSearchParams({ url: icsUrl, name });
  return `https://outlook.live.com/calendar/0/addcalendar?${p}`;
}

export function buildOffice365SubscribeUrl(icsUrl: string, name: string): string {
  const p = new URLSearchParams({ url: icsUrl, name });
  return `https://outlook.office.com/calendar/0/addcalendar?${p}`;
}

export function buildYahooUrl(event: CalEventData): string {
  const p = new URLSearchParams({
    v: "60",
    title: event.title,
    st: toICSDate(event.startAt),
    et: toICSDate(event.endAt),
    ...(event.description ? { desc: event.description } : {}),
    ...(event.location ? { in_loc: event.location } : {}),
  });
  return `https://calendar.yahoo.com/?${p}`;
}
