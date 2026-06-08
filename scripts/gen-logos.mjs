import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("./public/logos", { recursive: true });

const SIZE = 96;

const logos = {
  // Google G – multicolor using clipPath on the letter "G"
  "google-calendar": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="12" fill="white"/>
    <defs>
      <clipPath id="g">
        <text x="4" y="80" font-family="Arial,Helvetica,sans-serif" font-size="88" font-weight="900">G</text>
      </clipPath>
    </defs>
    <rect x="0"  y="0"  width="96" height="96" fill="#4285F4" clip-path="url(#g)"/>
    <rect x="52" y="0"  width="44" height="50" fill="#EA4335" clip-path="url(#g)"/>
    <rect x="52" y="50" width="44" height="46" fill="#34A853" clip-path="url(#g)"/>
    <rect x="52" y="38" width="44" height="22" fill="#FBBC05" clip-path="url(#g)"/>
  </svg>`,

  // Apple logo – gray silhouette with leaf and bite mark
  "apple-calendar": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="12" fill="white"/>
    <!-- Leaf / stem -->
    <path d="M49 22 Q56 11 65 15 Q61 25 52 23 Z" fill="#6B6B6B"/>
    <!-- Apple body -->
    <path d="M48 28
      C 35 27 21 37 20 52
      C 19 67 27 81 37 86
      C 41 88 45 86 48 85
      C 51 86 55 88 59 86
      C 69 81 77 67 76 52
      C 75 37 61 27 48 28 Z" fill="#6B6B6B"/>
    <!-- Bite mark – upper right -->
    <ellipse cx="66" cy="35" rx="13" ry="15" fill="white"/>
  </svg>`,

  // Outlook.com – two overlapping rounded cards, blue (Microsoft style)
  "outlook": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="12" fill="white"/>
    <!-- Back card (left, with O) -->
    <rect x="6" y="22" width="56" height="55" rx="8" fill="#0078D4"/>
    <!-- O ring -->
    <circle cx="34" cy="49" r="18" fill="white"/>
    <circle cx="34" cy="49" r="11" fill="#0078D4"/>
    <!-- Front card (email/document, overlapping) -->
    <rect x="34" y="16" width="56" height="48" rx="8" fill="#106EBE"/>
    <!-- Envelope fold lines -->
    <path d="M34 24 L62 40 L90 24" fill="none" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`,

  // Office 365 – same two-card layout but in amber/gold
  "office365": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="12" fill="white"/>
    <!-- Back card -->
    <rect x="6" y="22" width="56" height="55" rx="8" fill="#CC7A00"/>
    <!-- O ring -->
    <circle cx="34" cy="49" r="18" fill="white"/>
    <circle cx="34" cy="49" r="11" fill="#CC7A00"/>
    <!-- Front card -->
    <rect x="34" y="16" width="56" height="48" rx="8" fill="#E8970A"/>
    <!-- Envelope fold lines -->
    <path d="M34 24 L62 40 L90 24" fill="none" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`,

  // Yahoo – large purple Y on white (matches Yahoo's current branding)
  "yahoo-calendar": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="12" fill="white"/>
    <text x="48" y="74" text-anchor="middle"
      font-family="Arial Black,Impact,Arial,sans-serif"
      font-size="72" font-weight="900" fill="#6001D2">Y</text>
  </svg>`,
};

for (const [name, svg] of Object.entries(logos)) {
  const buf = Buffer.from(svg);
  await sharp(buf, { density: 144 })
    .resize(SIZE, SIZE)
    .png()
    .toFile(`./public/logos/${name}.png`);
  console.log(`✓ ${name}.png`);
}

console.log("Done.");
