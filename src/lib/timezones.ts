export const TIMEZONES = [
  {
    group: "Europe",
    zones: [
      { label: "Paris (UTC+1/+2)", value: "Europe/Paris" },
      { label: "Londres (UTC+0/+1)", value: "Europe/London" },
      { label: "Berlin (UTC+1/+2)", value: "Europe/Berlin" },
      { label: "Rome (UTC+1/+2)", value: "Europe/Rome" },
      { label: "Madrid (UTC+1/+2)", value: "Europe/Madrid" },
      { label: "Lisbonne (UTC+0/+1)", value: "Europe/Lisbon" },
      { label: "Zurich (UTC+1/+2)", value: "Europe/Zurich" },
      { label: "Amsterdam (UTC+1/+2)", value: "Europe/Amsterdam" },
      { label: "Bruxelles (UTC+1/+2)", value: "Europe/Brussels" },
      { label: "Moscou (UTC+3)", value: "Europe/Moscow" },
      { label: "Istanbul (UTC+3)", value: "Europe/Istanbul" },
    ],
  },
  {
    group: "Amériques",
    zones: [
      { label: "New York (UTC-5/-4)", value: "America/New_York" },
      { label: "Chicago (UTC-6/-5)", value: "America/Chicago" },
      { label: "Denver (UTC-7/-6)", value: "America/Denver" },
      { label: "Los Angeles (UTC-8/-7)", value: "America/Los_Angeles" },
      { label: "Toronto (UTC-5/-4)", value: "America/Toronto" },
      { label: "Vancouver (UTC-8/-7)", value: "America/Vancouver" },
      { label: "Mexico City (UTC-6)", value: "America/Mexico_City" },
      { label: "São Paulo (UTC-3)", value: "America/Sao_Paulo" },
      { label: "Buenos Aires (UTC-3)", value: "America/Argentina/Buenos_Aires" },
      { label: "Bogotá (UTC-5)", value: "America/Bogota" },
    ],
  },
  {
    group: "Afrique",
    zones: [
      { label: "Le Caire (UTC+2)", value: "Africa/Cairo" },
      { label: "Lagos (UTC+1)", value: "Africa/Lagos" },
      { label: "Nairobi (UTC+3)", value: "Africa/Nairobi" },
      { label: "Johannesburg (UTC+2)", value: "Africa/Johannesburg" },
    ],
  },
  {
    group: "Asie",
    zones: [
      { label: "Dubai (UTC+4)", value: "Asia/Dubai" },
      { label: "Karachi (UTC+5)", value: "Asia/Karachi" },
      { label: "Mumbai (UTC+5:30)", value: "Asia/Kolkata" },
      { label: "Dhaka (UTC+6)", value: "Asia/Dhaka" },
      { label: "Bangkok (UTC+7)", value: "Asia/Bangkok" },
      { label: "Singapour (UTC+8)", value: "Asia/Singapore" },
      { label: "Shanghai (UTC+8)", value: "Asia/Shanghai" },
      { label: "Tokyo (UTC+9)", value: "Asia/Tokyo" },
      { label: "Séoul (UTC+9)", value: "Asia/Seoul" },
    ],
  },
  {
    group: "Océanie",
    zones: [
      { label: "Sydney (UTC+10/+11)", value: "Australia/Sydney" },
      { label: "Auckland (UTC+12/+13)", value: "Pacific/Auckland" },
    ],
  },
  {
    group: "Autre",
    zones: [{ label: "UTC", value: "UTC" }],
  },
] as const satisfies { group: string; zones: { label: string; value: string }[] }[];
