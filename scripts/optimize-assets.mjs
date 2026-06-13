// Build-time asset compression for /public.
// - SVGs are minified with svgo
// - raster logos (png) are re-encoded with sharp (kept only when smaller)
// Idempotent and non-fatal: a failure here never breaks the build.
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const PUBLIC_DIR = new URL("../public/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "uploads") continue; // user-generated, already compressed on upload
      out.push(...(await walk(full)));
    } else {
      out.push(full);
    }
  }
  return out;
}

async function optimizeSvgs(files) {
  let optimize;
  try {
    ({ optimize } = await import("svgo"));
  } catch {
    console.warn("[assets] svgo not available — skipping SVG optimization");
    return 0;
  }
  let n = 0;
  for (const f of files.filter((f) => extname(f).toLowerCase() === ".svg")) {
    try {
      const src = await readFile(f, "utf8");
      const { data } = optimize(src, { path: f, multipass: true });
      if (data && data.length < src.length) {
        await writeFile(f, data);
        n++;
      }
    } catch (e) {
      console.warn(`[assets] svg skip ${f}:`, e.message);
    }
  }
  return n;
}

async function optimizePngs(files) {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("[assets] sharp not available — skipping PNG optimization");
    return 0;
  }
  let n = 0;
  for (const f of files.filter((f) => extname(f).toLowerCase() === ".png")) {
    try {
      const before = (await stat(f)).size;
      const out = await sharp(f).png({ compressionLevel: 9, palette: true }).toBuffer();
      if (out.length < before) {
        await writeFile(f, out);
        n++;
      }
    } catch (e) {
      console.warn(`[assets] png skip ${f}:`, e.message);
    }
  }
  return n;
}

const files = await walk(PUBLIC_DIR);
const [svgs, pngs] = await Promise.all([optimizeSvgs(files), optimizePngs(files)]);
console.log(`[assets] optimized ${svgs} svg, ${pngs} png`);
