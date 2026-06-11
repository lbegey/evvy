import { Button } from "@/components/ui/button";

const ICONS = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M18.9 2H22l-7.19 8.21L23.5 22H17l-5.1-6.67L5.99 22H2.87l7.69-8.78L1 2h6.66l4.6 6.1L18.9 2Zm-1.14 18h1.7L7.32 3.9H5.5L17.76 20Z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  ),
};

export function SocialShareLinks({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { key: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, label: "Facebook" },
    { key: "twitter", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, label: "X / Twitter" },
    { key: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, label: "LinkedIn" },
  ] as const;

  return (
    <div className="flex items-center gap-1.5">
      {links.map((link) => (
        <Button
          key={link.key}
          variant="outline"
          size="icon-sm"
          aria-label={link.label}
          title={link.label}
          nativeButton={false}
          render={<a href={link.href} target="_blank" rel="noopener noreferrer" />}
        >
          {ICONS[link.key]}
        </Button>
      ))}
    </div>
  );
}
