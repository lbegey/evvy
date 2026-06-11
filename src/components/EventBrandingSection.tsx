"use client";

import { BrandingSectionForm } from "@/components/BrandingSectionForm";
import { updateEventBranding } from "@/app/actions/events";
import { applyBrandingPresetToEvent, type BrandingPreset } from "@/app/actions/brandingPresets";

interface EventBrandingSectionProps {
  eventId: string;
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

export function EventBrandingSection({ eventId, ...props }: EventBrandingSectionProps) {
  return (
    <BrandingSectionForm
      targetId={eventId}
      idPrefix="evb"
      updateBranding={updateEventBranding}
      applyPreset={applyBrandingPresetToEvent}
      {...props}
    />
  );
}
