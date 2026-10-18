// Snackora custom letterforms ("Fach-Grotesk").
// One stroke weight, orthogonal skeleton, softened corners – derived from the
// rounded product compartments ("Fächer") of a vending machine.

import { strokeOutline, ring, rect, diagonal, diagonalToVertical, translatePath } from "./geometry.mjs";

export const METRICS = {
  stroke: 21,
  xHeight: 104,
  ascender: 146,
  radius: 20, // centerline corner radius
};

function build(m = METRICS) {
  const W = m.stroke;
  const h = W / 2;
  const H = m.xHeight;
  const R = m.radius;
  // Round letters get a softer corner; the s is limited by its tight counters.
  const RR = m.radius + 7;
  const yT = -H + h;
  const yB = -h;
  const yM = -H / 2;

  const glyphs = {
    s: (w = 82) => ({
      w,
      d: strokeOutline(
        [
          [w - 2, yT],
          [h, yT],
          [h, yM],
          [w - h, yM],
          [w - h, yB],
          [2, yB],
        ],
        [0, R, R, R, R, 0],
        W
      ),
    }),
    n: (w = 84) => ({
      w,
      d: strokeOutline(
        [
          [h, 0],
          [h, yT],
          [w - h, yT],
          [w - h, 0],
        ],
        [0, RR, RR, 0],
        W
      ),
    }),
    a: (w = 86) => ({
      w,
      d: ring(h, yT, w - h, yB, RR, W) + rect(w - W, -H, W, H),
    }),
    c: (w = 78) => ({
      w,
      d: strokeOutline(
        [
          [w, yT],
          [h, yT],
          [h, yB],
          [w, yB],
        ],
        [0, RR, RR, 0],
        W
      ),
    }),
    k: (w = 80) => {
      const stem = rect(0, -m.ascender, W, m.ascender);
      // Diagonals are drawn ~8% lighter to match the optical weight of the
      // orthogonal strokes.
      const dw = W * 0.92;
      const jy = -H * 0.3;
      const top = [w - 12, -H];
      // The arm ends with a vertical cut on the stem's centre line, so the
      // junction is clean (no spur, no notch).
      const join = [h, jy];
      const arm = diagonalToVertical(top, join, dw);
      // leg starts on the arm's centerline and runs to the baseline
      const t = 0.56;
      const legTop = [top[0] + (join[0] - top[0]) * t, top[1] + (join[1] - top[1]) * t];
      const leg = diagonal(legTop, [w - 11, 0], dw);
      return { w, d: stem + arm + leg };
    },
    o: (w = 88) => ({ w, d: ring(h, yT, w - h, yB, RR, W) }),
    r: (w = 58) => ({
      w,
      d: strokeOutline(
        [
          [h, 0],
          [h, yT],
          [w, yT],
        ],
        [0, RR, 0],
        W
      ),
    }),
  };
  return glyphs;
}

// Optical spacing (space *between* glyph boxes), tuned by eye in the preview.
const PAIRS = {
  sn: 13,
  na: 13,
  ac: 12,
  ck: 14,
  ko: 9,
  or: 13,
  ra: 6,
};

/** Builds the "snackora" wordmark. Baseline at y=0, returns path + bbox. */
export function wordmark(m = METRICS) {
  const g = build(m);
  const word = "snackora";
  let x = 0;
  let d = "";
  const boxes = [];
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const glyph = g[ch]();
    d += translatePath(glyph.d, x, 0);
    boxes.push({ ch, x, w: glyph.w });
    x += glyph.w;
    if (i < word.length - 1) x += PAIRS[ch + word[i + 1]] ?? 12;
  }
  return { d, width: x, top: -m.ascender, xHeight: m.xHeight, boxes };
}

export function glyph(ch, m = METRICS) {
  return build(m)[ch]();
}
