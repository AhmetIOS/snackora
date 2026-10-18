// Renders an internal concept-evaluation sheet (not shipped).
// Usage: node scripts/brand/preview-concepts.mjs <outDir>
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { wordmark } from "./glyphs.mjs";
import { strokeOutline, ring, rect, roundRect } from "./geometry.mjs";
import { tilePath } from "./symbol.mjs";

const out = process.argv[2];
mkdirSync(out, { recursive: true });
const C = { ink: "#0E1A14", forest: "#12382A", lime: "#C9F26B", cream: "#F5F1E6" };

// Concept A – "Fach-S": squared S, product block on the shelf (parametric)
function conceptA({ bw = 80, bh = 112, W = 20, r = 18, bs = 16, size = 140 }) {
  const h = W / 2;
  const ox = (size - bw) / 2;
  const oy = (size - bh) / 2;
  const x0 = ox + h, x1 = ox + bw - h, yT = oy + h, yB = oy + bh - h, yM = oy + bh / 2;
  const s = strokeOutline([[ox + bw, yT], [x0, yT], [x0, yM], [x1, yM], [x1, yB], [ox, yB]], [0, r, r, r, r, 0], W);
  const block = rect(ox + bw - bs, yM - h - bs, bs, bs);
  return { s, block, size };
}

// Concept B – "Ausgabe": machine front with dispensing slot and dropping product
function conceptB(size = 140) {
  const body = ring(38, 18, 102, 122, 16, 18);
  const slot = rect(48, 92, 44, 12);
  const dot = roundRect(61, 52, 18, 18, 9);
  return { s: body + slot, block: dot, size };
}

// Concept C – "Spirale": three coil loops carrying one product
function conceptC(size = 140) {
  let d = "";
  for (let i = 0; i < 3; i++) d += ring(22 + i * 34, 72, 50 + i * 34, 108, 14, 14);
  const block = rect(62, 34, 28, 28);
  return { s: d, block, size };
}

function svgSymbol({ s, block, size }, { bg, fg, accent, tile = true }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${tile ? `<path d="${tilePath(size, size * 0.24)}" fill="${bg}"/>` : ""}<path d="${s}" fill="${fg}" fill-rule="nonzero"/><path d="${block}" fill="${accent}"/></svg>`;
}

const wm = wordmark();
const pad = 6;
const wmSvg = (fg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${wm.top - pad} ${wm.width + pad * 2} ${-wm.top + pad * 2}"><path d="${wm.d}" fill="${fg}"/></svg>`;

const variantsA = [
  conceptA({}),
  conceptA({ bw: 84, bh: 116, W: 22, r: 20, bs: 18 }),
  conceptA({ bw: 88, bh: 112, W: 24, r: 20, bs: 18 }),
];
const concepts = [variantsA[1], conceptB(), conceptC()];

const cell = (svg, w, label, dark) =>
  `<figure style="margin:0;display:flex;flex-direction:column;gap:8px;align-items:flex-start"><div style="width:${w}px;background:${dark ? C.forest : "#fff"};padding:12px;border-radius:8px">${svg}</div><figcaption style="font:12px monospace">${label}</figcaption></figure>`;

let html = `<html><body style="margin:0;padding:32px;background:${C.cream};font-family:sans-serif;display:flex;flex-direction:column;gap:32px;width:1400px">`;
html += `<h2 style="margin:0">Concepts</h2><div style="display:flex;gap:24px;flex-wrap:wrap">`;
concepts.forEach((c, i) => {
  html += cell(svgSymbol(c, { bg: C.forest, fg: C.cream, accent: C.lime }), 160, ["A Fach-S", "B Ausgabe", "C Spirale"][i]);
  html += cell(svgSymbol(c, { bg: C.forest, fg: C.cream, accent: C.lime }), 32, "32px");
  html += cell(svgSymbol(c, { bg: C.forest, fg: C.cream, accent: C.lime }), 16, "16px");
});
html += `</div><h2 style="margin:0">Variants A</h2><div style="display:flex;gap:24px">`;
variantsA.forEach((c, i) => {
  html += cell(svgSymbol(c, { bg: C.forest, fg: C.cream, accent: C.lime }), 160, `A${i}`);
  html += cell(svgSymbol(c, { bg: C.lime, fg: C.ink, accent: C.ink }), 160, `A${i} lime`);
  html += cell(svgSymbol(c, { bg: C.forest, fg: C.cream, accent: C.lime }), 24, `24`);
});
html += `</div><h2 style="margin:0">Wordmark</h2>`;
html += cell(wmSvg(C.forest), 900, "wordmark 900");
html += cell(wmSvg(C.cream), 420, "wordmark dark 420", true);
html += cell(wmSvg(C.forest), 140, "wordmark 140");
html += `</body></html>`;

const file = join(out, "concepts.html");
writeFileSync(file, html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1464, height: 800 }, deviceScaleFactor: 1 });
await page.goto("file://" + file);
await page.screenshot({ path: join(out, "concepts.png"), fullPage: true });
await browser.close();
console.log("ok", join(out, "concepts.png"));
