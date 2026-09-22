// Builds the landing hero photos from a lossless master:
//   node scripts/hero-images.mjs <master.png>
// Desktop: the full lake scene at 1400/2200/3000 px wide. Phones: a jug-centred crop (x 34%–84% of the
// scene) at 1000/1400/1800 px, so a 3× phone screen gets real pixels instead of a stretched desktop photo.
// Sizes above the master's own width are Lanczos3 upscales with a mild unsharp mask: sharper than the
// browser's own scaling, although no resize can add detail the master does not have.
// Each size is written as AVIF and WebP, plus one JPEG fallback. Bump VERSION when the photo changes:
// the files are served with an immutable cache header (next.config.ts).
import sharp from "sharp";
import { statSync } from "node:fs";

const VERSION = "v2";
const src = process.argv[2];
if (!src) { console.error("usage: node scripts/hero-images.mjs <master.png>"); process.exit(1); }

const meta = await sharp(src).metadata();
const W = meta.width, H = meta.height;
const phoneCrop = { left: Math.round(W * 0.34), top: 0, width: Math.round(W * 0.5), height: H };

function pipeline(region, width) {
  let img = sharp(src).extract(region);
  const upscale = width > region.width;
  img = img.resize({ width, kernel: "lanczos3" });
  return upscale ? img.sharpen({ sigma: 1.1, m1: 0.6, m2: 1.6 }) : img.sharpen({ sigma: 0.6 });
}

async function write(name, region, width) {
  const base = `public/hero-${VERSION}-${name}-${width}`;
  await pipeline(region, width).avif({ quality: 60, effort: 7, chromaSubsampling: "4:4:4" }).toFile(`${base}.avif`);
  await pipeline(region, width).webp({ quality: 84, effort: 6, smartSubsample: true }).toFile(`${base}.webp`);
  console.log(base, `${kb(`${base}.avif`)} KB avif, ${kb(`${base}.webp`)} KB webp`);
}
const kb = (f) => Math.round(statSync(f).size / 1024);

const full = { left: 0, top: 0, width: W, height: H };
for (const w of [1400, 2200, 3000]) await write("wide", full, w);
for (const w of [1000, 1400, 1800]) await write("phone", phoneCrop, w);
await pipeline(full, 2200).jpeg({ quality: 84, progressive: true, mozjpeg: true }).toFile(`public/hero-${VERSION}-wide-2200.jpg`);
console.log(`public/hero-${VERSION}-wide-2200.jpg`, kb(`public/hero-${VERSION}-wide-2200.jpg`), "KB");
