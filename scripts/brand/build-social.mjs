// Builds the social sharing image and exports the vending-machine wrap
// concept as standalone files – rendered from the real site components.
//
//   npm run dev            (in another terminal)
//   node scripts/brand/build-social.mjs [baseUrl=http://localhost:3000]
//
// Outputs
//   src/app/opengraph-image.png (+ .alt.txt), src/app/twitter-image.png (+ .alt.txt)
//   public/brand/snackora-automat-konzept.png
//   public/brand/snackora-automat-front.svg, public/brand/snackora-automat-seite.svg

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const base = process.argv[2] ?? "http://localhost:3000";
const font = (f) => readFileSync(join(root, "scripts/brand/fonts", f)).toString("base64");
const read = (p) => readFileSync(join(root, p), "utf8");

const browser = await chromium.launch();

// 1) Grab live SVG markup
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
await page.goto(`${base}/ueber-uns`, { waitUntil: "networkidle" });
const figure = page.locator("#automat-konzept");
await figure.scrollIntoViewIfNeeded();
await figure.screenshot({ path: join(root, "public/brand/snackora-automat-konzept.png") });
const [frontSvg, sideSvg] = await figure.locator("svg").evaluateAll((els) =>
  els.map((el) => {
    const clone = el.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.removeAttribute("class");
    // inline the mono font family for standalone use
    clone.querySelectorAll(".font-mono").forEach((n) => {
      n.removeAttribute("class");
      n.setAttribute("font-family", "DM Mono, ui-monospace, monospace");
    });
    return clone.outerHTML;
  })
);
writeFileSync(join(root, "public/brand/snackora-automat-front.svg"), `${frontSvg}\n`);
writeFileSync(join(root, "public/brand/snackora-automat-seite.svg"), `${sideSvg}\n`);

// 2) Social image 1200×630
const symbol = read("public/brand/snackora-symbol-reversed.svg");
const wordmark = read("public/brand/snackora-wordmark-reversed.svg");
const html = `<!doctype html><html><head><style>
@font-face{font-family:Bricolage;src:url(data:font/ttf;base64,${font("BricolageGrotesque-SemiBold-opsz24.ttf")})}
@font-face{font-family:DMMono;src:url(data:font/ttf;base64,${font("DMMono-Medium.ttf")})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#12382A;color:#F5F1E6;font-family:Bricolage;overflow:hidden;position:relative}
.rails{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(245,241,230,.07) 1px,transparent 1px);background-size:200px 100%}
.brand{position:absolute;left:72px;top:64px;display:flex;align-items:center;gap:18px}
.brand svg{height:56px;width:auto}
h1{position:absolute;left:68px;top:196px;font-size:118px;line-height:.95;letter-spacing:-4px;font-weight:600}
h1 span{color:#C9F26B}
.dot{display:inline-block;width:24px;height:24px;background:#C9F26B;border-radius:4px;margin-left:6px}
.meta{position:absolute;left:72px;bottom:62px;font-family:DMMono;font-size:20px;letter-spacing:2px;text-transform:uppercase;color:#A9BBB1}
.stage{position:absolute;right:56px;top:70px;width:340px;height:620px}
.plinth{position:absolute;left:-40px;right:-40px;bottom:0;height:300px;background:#C9F26B;border-radius:28px 28px 0 0}
.stage svg{position:relative;width:340px;height:auto}
</style></head><body><div class="rails"></div>
<div class="brand">${symbol.replace(/width="[^"]+" height="[^"]+"/, 'width="56" height="56"')}${wordmark.replace(/width="[^"]+" height="[^"]+"/, 'height="46"')}</div>
<h1>Deine Pause.<br><span>Jederzeit</span><i class="dot"></i></h1>
<p class="meta">Snack- &amp; Getränkeautomaten · Region Stuttgart</p>
<div class="stage"><div class="plinth"></div>${frontSvg}</div>
</body></html>`;

const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.setContent(html, { waitUntil: "load" });
await og.evaluate(() => document.fonts.ready);
for (const name of ["opengraph-image", "twitter-image"]) {
  await og.screenshot({ path: join(root, `src/app/${name}.png`) });
  writeFileSync(
    join(root, `src/app/${name}.alt.txt`),
    "Snackora – Deine Pause. Jederzeit. Snack- und Getränkeautomaten in der Region Stuttgart."
  );
}
await browser.close();
console.log("Social image and machine wrap concept exported.");
