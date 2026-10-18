// Builds the complete Snackora logo system from source geometry.
//
//   node scripts/brand/build-assets.mjs
//
// Outputs
//   public/brand/*.svg + *.png        logo lockups, colourways, avatar
//   src/app/icon.svg, apple-icon.png, favicon.ico
//   src/components/brand/logo-data.ts  path data for the React <Logo/>
//
// PNG/ICO rasterisation uses the Playwright Chromium installed for e2e tests.

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import { chromium } from "@playwright/test";
import { wordmark } from "./glyphs.mjs";
import { SYMBOL, symbolPaths, tilePath } from "./symbol.mjs";
import { translatePath, scalePath } from "./geometry.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const out = join(root, "public", "brand");
const appDir = join(root, "src", "app");
mkdirSync(out, { recursive: true });

export const COLORS = {
  ink: "#0E1A14",
  forest: "#12382A",
  lime: "#C9F26B",
  cream: "#F5F1E6",
  black: "#000000",
  white: "#FFFFFF",
};

export const TAGLINE = "Deine Pause. Jederzeit.";

const COLORWAYS = {
  // for light backgrounds
  primary: { tile: COLORS.forest, s: COLORS.cream, block: COLORS.lime, word: COLORS.forest, tag: COLORS.forest },
  // for dark backgrounds
  reversed: { tile: COLORS.lime, s: COLORS.ink, block: COLORS.ink, word: COLORS.cream, tag: COLORS.lime },
  "mono-black": { mono: COLORS.black },
  "mono-white": { mono: COLORS.white },
};

const f2 = (n) => Number(n.toFixed(2));

// ---------------------------------------------------------------- geometry
const wm = wordmark();
const sym = symbolPaths();
const font = opentype.parse(readFileSync(join(root, "scripts/brand/fonts/BricolageGrotesque-SemiBold-opsz24.ttf")).buffer);

// Manual layout (glyph advance + kerning) – avoids opentype.js' partial
// GSUB support, which the font's contextual substitutions would trip.
function textPath(text, x, y, size) {
  const scale = size / font.unitsPerEm;
  const path = new opentype.Path();
  let cx = x;
  let prev = null;
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    if (prev) {
      const kern = font.getKerningValue(prev, g);
      if (Number.isFinite(kern)) cx += kern * scale;
    }
    // round: opentype.js mis-formats near-integer floats (e.g. 98.9999999 → "NaN")
    path.extend(g.getPath(Math.round(cx * 100) / 100, y, size));
    cx += g.advanceWidth * scale;
    prev = g;
  }
  return { d: path.toPathData(2), bb: path.getBoundingBox() };
}

/** Symbol tile scaled to `size`, positioned at (x, y). Returns SVG markup. */
function symbolMarkup(c, size, x = 0, y = 0, { tile = true, inner = 1 } = {}) {
  const k = size / SYMBOL.size;
  const tr = (d) => {
    // optional inner scaling around the centre (used for circular avatars)
    const off = (SYMBOL.size * (1 - inner)) / 2;
    return translatePath(scalePath(translatePath(scalePath(d, inner), off, off), k), x, y);
  };
  const tileD = translatePath(scalePath(tilePath(SYMBOL.size), k), x, y);
  if (c.mono) {
    // single colour: tile with S + block knocked out
    return `<path fill="${c.mono}" fill-rule="evenodd" d="${tileD}${tr(sym.s)}${tr(sym.block)}"/>`;
  }
  return `${tile ? `<path fill="${c.tile}" d="${tileD}"/>` : ""}<path fill="${c.s}" d="${tr(sym.s)}"/><path fill="${c.block}" d="${tr(sym.block)}"/>`;
}

function wordMarkup(c, x, y, scale = 1) {
  return `<path fill="${c.mono ?? c.word}" d="${translatePath(scalePath(wm.d, scale), x, y)}"/>`;
}

function svgDoc(w, h, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f2(w)} ${f2(h)}" width="${f2(w)}" height="${f2(h)}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;
}

// Layout constants (wordmark units). Clear space = height of the product block.
const ASC = -wm.top; // 146
const PAD = 0;

function horizontal(c) {
  const tile = ASC;
  const gap = 38;
  const w = tile + gap + wm.width;
  const body = symbolMarkup(c, tile, PAD, PAD) + wordMarkup(c, PAD + tile + gap, PAD + ASC);
  return svgDoc(w + PAD * 2, ASC + PAD * 2, body, "Snackora");
}

function withTagline(c) {
  const gap = 40;
  const tagSize = 46;
  const tagBaseline = ASC + 40 + tagSize * 0.72;
  const tile = tagBaseline + 4; // tile spans wordmark + tagline block
  const x = tile + gap;
  const t = textPath(TAGLINE, x, tagBaseline, tagSize);
  const w = Math.max(x + wm.width, t.bb.x2);
  const body =
    symbolMarkup(c, tile, 0, 0) +
    wordMarkup(c, x, ASC) +
    `<path fill="${c.mono ?? c.tag}" d="${t.d}"/>`;
  return svgDoc(w, tile, body, `Snackora – ${TAGLINE}`);
}

function stacked(c) {
  const tile = 176;
  const gap = 44;
  const w = Math.max(tile, wm.width);
  const body = symbolMarkup(c, tile, (w - tile) / 2, 0) + wordMarkup(c, (w - wm.width) / 2, tile + gap + ASC);
  return svgDoc(w, tile + gap + ASC, body, "Snackora");
}

function wordOnly(c) {
  return svgDoc(wm.width, ASC, wordMarkup(c, 0, ASC), "Snackora");
}

function symbolOnly(c) {
  return svgDoc(SYMBOL.size, SYMBOL.size, symbolMarkup(c, SYMBOL.size), "Snackora Symbol");
}

/** Full-bleed square (apple-icon, avatars): no tile radius, platform masks it. */
function squareIcon(size, { inner = 1 } = {}) {
  const c = COLORWAYS.primary;
  return svgDoc(
    size,
    size,
    `<rect width="${size}" height="${size}" fill="${c.tile}"/>` + symbolMarkup(c, size, 0, 0, { tile: false, inner }),
    "Snackora"
  );
}

// ---------------------------------------------------------------- write SVGs
const files = {};
for (const [name, c] of Object.entries(COLORWAYS)) {
  const suffix = name === "primary" ? "" : `-${name}`;
  files[`snackora-logo${suffix}.svg`] = horizontal(c);
  files[`snackora-logo-tagline${suffix}.svg`] = withTagline(c);
  files[`snackora-logo-stacked${suffix}.svg`] = stacked(c);
  files[`snackora-wordmark${suffix}.svg`] = wordOnly(c);
  files[`snackora-symbol${suffix}.svg`] = symbolOnly(c);
}
files["snackora-avatar.svg"] = squareIcon(800, { inner: 0.74 });

for (const [name, svg] of Object.entries(files)) writeFileSync(join(out, name), svg);
writeFileSync(join(appDir, "icon.svg"), files["snackora-symbol.svg"]);

// ---------------------------------------------------------------- React data
const tagForData = textPath(TAGLINE, 0, 0, 100);
writeFileSync(
  join(root, "src/components/brand/logo-data.ts"),
  `// AUTO-GENERATED by scripts/brand/build-assets.mjs – do not edit by hand.
// Geometry source: scripts/brand/glyphs.mjs and scripts/brand/symbol.mjs.

export const WORDMARK = {
  width: ${f2(wm.width)},
  height: ${ASC},
  d: "${translatePath(wm.d, 0, ASC)}",
} as const;

export const SYMBOL = {
  size: ${SYMBOL.size},
  tile: "${tilePath(SYMBOL.size)}",
  s: "${sym.s}",
  block: "${sym.block}",
} as const;

export const TAGLINE_TEXT = "${TAGLINE}";
// Tagline outline at 100 units font size, baseline y=0 (for print-exact use).
export const TAGLINE_OUTLINE = {
  x1: ${f2(tagForData.bb.x1)},
  y1: ${f2(tagForData.bb.y1)},
  x2: ${f2(tagForData.bb.x2)},
  y2: ${f2(tagForData.bb.y2)},
  d: "${tagForData.d}",
} as const;
`
);

// ---------------------------------------------------------------- rasterise
const browser = await chromium.launch();
async function png(svg, size, file, { transparent = true } = {}) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const sized = svg.replace(/width="[^"]+" height="[^"]+"/, `width="${size}" height="${size}"`);
  await page.setContent(`<html><body style="margin:0;background:transparent">${sized}</body></html>`);
  const buf = await page.locator("svg").screenshot({ omitBackground: transparent });
  await page.close();
  if (file) writeFileSync(file, buf);
  return buf;
}

await png(squareIcon(180), 180, join(appDir, "apple-icon.png"));
await png(squareIcon(800, { inner: 0.74 }), 800, join(out, "snackora-avatar.png"));
await png(files["snackora-symbol.svg"], 512, join(out, "snackora-symbol-512.png"));
await png(files["snackora-symbol.svg"], 192, join(out, "snackora-symbol-192.png"));

// favicon.ico with 16/32/48 PNG frames
const frames = [];
for (const s of [16, 32, 48]) frames.push({ s, buf: await png(files["snackora-symbol.svg"], s) });
await browser.close();

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(frames.length, 4);
const dir = Buffer.alloc(16 * frames.length);
let offset = 6 + dir.length;
frames.forEach(({ s, buf }, i) => {
  const o = i * 16;
  dir.writeUInt8(s, o);
  dir.writeUInt8(s, o + 1);
  dir.writeUInt8(0, o + 2);
  dir.writeUInt8(0, o + 3);
  dir.writeUInt16LE(1, o + 4);
  dir.writeUInt16LE(32, o + 6);
  dir.writeUInt32LE(buf.length, o + 8);
  dir.writeUInt32LE(offset, o + 12);
  offset += buf.length;
});
writeFileSync(join(appDir, "favicon.ico"), Buffer.concat([header, dir, ...frames.map((x) => x.buf)]));

console.log(`Brand assets written: ${Object.keys(files).length} SVGs, PNGs, favicon.ico, icon.svg, apple-icon.png`);
