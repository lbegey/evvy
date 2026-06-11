"use client";

import { BrandingSectionForm } from "@/components/BrandingSectionForm";
import { updateCalendarBranding } from "@/app/actions/calendars";
import { applyBrandingPresetToCalendar, type BrandingPreset } from "@/app/actions/brandingPresets";

interface CalendarBrandingSectionProps {
  calendarId: string;
  plan: string;
  brandingEnabled: boolean;
  brandLogoUrl: string | null;
  brandLogoSize: number | null;
  brandLogoTransparentBg: boolean;
  brandLogoRounded: boolean;
  brandColor: string | null;
  brandTextColor: string | null;
  brandCardColor: string | null;
  brandIconBackgroundColor: string | null;
  brandBackgroundColor: string | null;
  brandBackgroundImageUrl: string | null;
  initialPresets?: BrandingPreset[];
}

export function CalendarBrandingSection({ calendarId, ...props }: CalendarBrandingSectionProps) {
  return (
    <BrandingSectionForm
      targetId={calendarId}
      idPrefix="cvb"
      updateBranding={updateCalendarBranding}
      applyPreset={applyBrandingPresetToCalendar}
      {...props}
    />
  );
}
