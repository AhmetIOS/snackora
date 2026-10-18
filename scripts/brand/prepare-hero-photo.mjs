// Prepares the hero machine photo:
//  1. removes the plain studio background (flood fill from the borders,
//     colour-to-alpha so the floor shadow stays as a soft, semi-transparent shadow)
//  2. bakes a soft focus into the product window, so third-party brand
//     logos on the packs are not legible on our website
//
//   node scripts/brand/prepare-hero-photo.mjs [source.png]
//
// Output: public/images/snackora-automat-hero.webp (soft focus, used on the site)
//         scripts/brand/source/snackora-automat-sharp-preview.webp (comparison only,
//         never published – third-party logos are legible in it)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const source = process.argv[2] ?? join(root, "scripts/brand/source/snackora-automat-source.png");
const outDir = join(root, "public/images");
mkdirSync(outDir, { recursive: true });

// Product window in % of the image (measured on the source).
const SOFT = { left: 25.5, top: 15, width: 30.2, height: 56 };
const BLUR_PX = 5;

const dataUrl = "data:image/png;base64," + readFileSync(source).toString("base64");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<img id="i" src="${dataUrl}">`);

const results = await page.evaluate(
  async ({ SOFT, BLUR_PX }) => {
    const img = document.getElementById("i");
    await img.decode();
    const W = img.naturalWidth;
    const H = img.naturalHeight;

    function render(soft) {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const x = c.getContext("2d");
      x.drawImage(img, 0, 0);
      if (soft) {
        const r = { x: (SOFT.left / 100) * W, y: (SOFT.top / 100) * H, w: (SOFT.width / 100) * W, h: (SOFT.height / 100) * H };
        x.save();
        x.beginPath();
        x.rect(r.x, r.y, r.w, r.h);
        x.clip();
        x.filter = `blur(${BLUR_PX}px)`;
        x.drawImage(img, 0, 0);
        x.restore();
      }

      // Background colour = median of the four corners
      const d = x.getImageData(0, 0, W, H);
      const px = d.data;
      const at = (i, j) => (j * W + i) * 4;
      const corners = [at(4, 4), at(W - 5, 4), at(4, H - 5), at(W - 5, H - 5)].map((k) => [px[k], px[k + 1], px[k + 2]]);
      const bg = [0, 1, 2].map((ch) => corners.map((c2) => c2[ch]).sort((a, b) => a - b)[1]);
      const bgLum = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2];

      // Flood fill from the borders over "background-like" pixels
      const TOL = 150;
      const dist = (k) => Math.hypot(px[k] - bg[0], px[k + 1] - bg[1], px[k + 2] - bg[2]);
      const outside = new Uint8Array(W * H);
      const stack = [];
      for (let i = 0; i < W; i++) stack.push(i, (H - 1) * W + i);
      for (let j = 0; j < H; j++) stack.push(j * W, j * W + W - 1);
      while (stack.length) {
        const p = stack.pop();
        if (outside[p]) continue;
        if (dist(p * 4) > TOL) continue;
        outside[p] = 1;
        const i = p % W;
        const j = (p - i) / W;
        if (i > 0) stack.push(p - 1);
        if (i < W - 1) stack.push(p + 1);
        if (j > 0) stack.push(p - W);
        if (j < H - 1) stack.push(p + W);
      }

      // Floor patches enclosed by the machine and its shadow (between the feet)
      // are not reached by the flood fill: treat neutral, light pixels in the
      // bottom band as background too. Lime and black body pixels are kept.
      for (let j = Math.floor(H * 0.85); j < H; j++)
        for (let i = 0; i < W; i++) {
          const p = j * W + i;
          if (outside[p]) continue;
          const k = p * 4;
          const mx = Math.max(px[k], px[k + 1], px[k + 2]);
          const mn = Math.min(px[k], px[k + 1], px[k + 2]);
          const lum = 0.2126 * px[k] + 0.7152 * px[k + 1] + 0.0722 * px[k + 2];
          if (mx - mn < 28 && lum > 70) outside[p] = 1;
        }

      // Reference brightness per row, taken from the image's left/right edges
      // (pure background) – the studio floor is darker than its wall, and a
      // single global reference would turn the whole floor into a grey veil.
      const rowLum = new Float32Array(H);
      for (let j = 0; j < H; j++) {
        let sum = 0;
        let n = 0;
        for (const i of [2, 4, 6, 8, 10, W - 11, W - 9, W - 7, W - 5, W - 3]) {
          const k = (j * W + i) * 4;
          sum += 0.2126 * px[k] + 0.7152 * px[k + 1] + 0.0722 * px[k + 2];
          n++;
        }
        rowLum[j] = Math.max(sum / n, 1);
      }

      // Colour-to-alpha for the outside region: lighter → transparent, darker → shadow
      for (let p = 0; p < W * H; p++) {
        if (!outside[p]) continue;
        const k = p * 4;
        const lum = 0.2126 * px[k] + 0.7152 * px[k + 1] + 0.0722 * px[k + 2];
        const ref = Math.min(bgLum, rowLum[Math.floor(p / W)]);
        let a = Math.max(0, Math.min(1, 1 - lum / ref));
        if (a < 0.05) a = 0; // ignore paper-white noise, keep only real shadow
        px[k] = 34;
        px[k + 1] = 30;
        px[k + 2] = 24;
        px[k + 3] = Math.round(a * 255 * 1.15 > 255 ? 255 : a * 255 * 1.15);
      }
      // 1px feather on the silhouette edge
      for (let j = 1; j < H - 1; j++)
        for (let i = 1; i < W - 1; i++) {
          const p = j * W + i;
          if (outside[p]) continue;
          if (outside[p - 1] || outside[p + 1] || outside[p - W] || outside[p + W]) px[p * 4 + 3] = 200;
        }
      x.putImageData(d, 0, 0);
      return c.toDataURL("image/webp", 0.9);
    }
    return { soft: render(true), sharp: render(false), W, H };
  },
  { SOFT, BLUR_PX }
);
await browser.close();

const save = (name, url) => writeFileSync(join(outDir, name), Buffer.from(url.split(",")[1], "base64"));
save("snackora-automat-hero.webp", results.soft);
writeFileSync(join(root, "scripts/brand/source/snackora-automat-sharp-preview.webp"), Buffer.from(results.sharp.split(",")[1], "base64"));
console.log(`Hero photo prepared (${results.W}×${results.H}): public/images/snackora-automat-hero.webp`);
