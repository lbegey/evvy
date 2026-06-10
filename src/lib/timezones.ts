const REGION_LABELS: Record<string, { fr: string; en: string }> = {
  Africa: { fr: "Afrique", en: "Africa" },
  America: { fr: "Amériques", en: "Americas" },
  Antarctica: { fr: "Antarctique", en: "Antarctica" },
  Arctic: { fr: "Arctique", en: "Arctic" },
  Asia: { fr: "Asie", en: "Asia" },
  Atlantic: { fr: "Atlantique", en: "Atlantic" },
  Australia: { fr: "Australie", en: "Australia" },
  Europe: { fr: "Europe", en: "Europe" },
  Indian: { fr: "Océan Indien", en: "Indian Ocean" },
  Pacific: { fr: "Pacifique", en: "Pacific" },
  Other: { fr: "Autre", en: "Other" },
};

const REGION_ORDER = ["Europe", "Africa", "America", "Asia", "Indian", "Australia", "Pacific", "Atlantic", "Antarctica", "Arctic", "Other"];

function offsetLabel(zone: string, now: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" }).formatToParts(now);
  const offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "UTC";
  return offset.replace("GMT", "UTC");
}

function cityLabel(zone: string): string {
  const segments = zone.split("/");
  return segments[segments.length - 1].replace(/_/g, " ");
}

export interface TimezoneGroup {
  group: string;
  zones: { label: string; value: string }[];
}

/** Builds the full list of IANA timezones grouped by region, with live UTC offsets. */
export function getTimezones(lang: "fr" | "en" = "en"): TimezoneGroup[] {
  const now = new Date();
  const groups = new Map<string, { label: string; value: string }[]>();

  for (const zone of Intl.supportedValuesOf("timeZone")) {
    if (zone === "UTC") continue;
    const [region] = zone.split("/");
    const key = REGION_LABELS[region] ? region : "Other";
    const entry = { label: `${cityLabel(zone)} (${offsetLabel(zone, now)})`, value: zone };
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }

  groups.set("Other", [...(groups.get("Other") ?? []), { label: "UTC", value: "UTC" }]);

  return REGION_ORDER.filter((region) => groups.has(region)).map((region) => ({
    group: REGION_LABELS[region][lang],
    zones: groups.get(region)!.sort((a, b) => a.label.localeCompare(b.label)),
  }));
}
