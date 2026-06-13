import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Evvy — Share your events, beautifully",
    short_name: "Evvy",
    description:
      "Create shareable event and calendar pages in seconds. Let guests add events to Google Calendar, Apple, Outlook, and more — with one click.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4fe",
    theme_color: "#5b4be6",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
