// Renders the machine illustrations (React/SVG) to static files in public/illustrations/.
// Served as <img>, they keep ~300 KB of SVG markup out of every HTML response and the RSC payload.
//
//   npm run brand:illustrations     (re-run after changing src/components/illustrations/*)

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import { createServer } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = join(root, "public/illustrations");

// Page fonts are not available inside an <img>-SVG, so text is converted to outlines
// with the same brand fonts that next/font serves on the page.
const loadFont = (file) => {
  const buf = readFileSync(join(root, "scripts/brand/fonts", file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const FONTS = { "font-mono": loadFont("DMMono-Medium.ttf"), "font-display": loadFont("BricolageGrotesque-SemiBold-opsz24.ttf") };
const decode = (t) => t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");

function outlineText(svg) {
  return svg.replace(/<text ([^>]*)>([^<]*)<\/text>/g, (_, attrs, raw) => {
    const a = Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    const font = FONTS[a.class];
    if (!font) throw new Error(`text without known font class: ${attrs}`);
    const text = decode(raw);
    const size = Number(a["font-size"] ?? 16);
    const scale = size / font.unitsPerEm;
    const spacing = Number(a["letter-spacing"] ?? 0);
    // manual layout: opentype's shaping engine does not support all GSUB lookups of these fonts
    const glyphs = [...text].map((c) => font.charToGlyph(c));
    const advances = glyphs.map((g, i) => g.advanceWidth * scale + (glyphs[i + 1] ? font.getKerningValue(g, glyphs[i + 1]) * scale : 0) + spacing);
    const width = advances.reduce((s, v) => s + v, 0) - (glyphs.length ? spacing : 0);
    const anchor = a["text-anchor"] ?? "start";
    let x = Number(a.x ?? 0) - (anchor === "middle" ? width / 2 : anchor === "end" ? width : 0);
    const y = Number(a.y ?? 0);
    let d = "";
    glyphs.forEach((g, i) => {
      d += g.getPath(x, y, size).toPathData(1);
      x += advances[i];
    });
    const keep = ["fill", "opacity", "transform", "fill-opacity"].filter((k) => a[k]).map((k) => ` ${k}="${a[k]}"`).join("");
    return `<path d="${d}"${keep}/>`;
  });
}

const vite = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false, watch: null },
  resolve: { alias: { "@": join(root, "src") } },
  oxc: { jsx: { runtime: "automatic" } },
});

try {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { MachineIllustration } = await vite.ssrLoadModule("/src/components/illustrations/machines.tsx");
  mkdirSync(outDir, { recursive: true });
  for (const kind of ["snack", "drink", "combo", "coffee"]) {
    let svg = renderToStaticMarkup(createElement(MachineIllustration, { kind, decorative: true }));
    // standalone file: needs the SVG namespace, no page classes
    svg = outlineText(svg.replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" '));
    if (/class="|<text/.test(svg)) throw new Error(`machine-${kind}: page-dependent markup left`);
    writeFileSync(join(outDir, `machine-${kind}.svg`), svg + "\n");
    console.log(`✔ public/illustrations/machine-${kind}.svg  ${(svg.length / 1024).toFixed(1)} KB`);
  }
} finally {
  await vite.close();
}
