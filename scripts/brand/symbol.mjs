// The Snackora symbol: "Fach-S".
// A squared S whose two counters read as vending compartments ("Fächer").
// The upper compartment holds one product block – the snack that is ready
// for the break. Without any wording it reads: S · Fach · Snack.

import { strokeOutline, rect } from "./geometry.mjs";

export const SYMBOL = {
  size: 140, // square artboard
  width: 84, // S body
  height: 116,
  stroke: 22,
  radius: 20,
  block: 18, // product block edge length
};

/** Returns { s, block } paths centred on a SYMBOL.size square. */
export function symbolPaths(p = SYMBOL) {
  const W = p.stroke;
  const h = W / 2;
  const ox = (p.size - p.width) / 2;
  const oy = (p.size - p.height) / 2;
  const x0 = ox + h;
  const x1 = ox + p.width - h;
  const yT = oy + h;
  const yB = oy + p.height - h;
  const yM = oy + p.height / 2;
  const r = p.radius;
  const s = strokeOutline(
    [
      [ox + p.width, yT],
      [x0, yT],
      [x0, yM],
      [x1, yM],
      [x1, yB],
      [ox, yB],
    ],
    [0, r, r, r, r, 0],
    W
  );
  // The block rests on the middle shelf, flush with the S's right edge.
  const block = rect(ox + p.width - p.block, yM - h - p.block, p.block, p.block);
  return { s, block };
}

/** Rounded square tile (the "Taste" – a vending keypad key). */
export function tilePath(size, r = size * 0.24) {
  const s = size;
  return `M${r} 0H${s - r}A${r} ${r} 0 0 1 ${s} ${r}V${s - r}A${r} ${r} 0 0 1 ${s - r} ${s}H${r}A${r} ${r} 0 0 1 0 ${s - r}V${r}A${r} ${r} 0 0 1 ${r} 0Z`;
}
