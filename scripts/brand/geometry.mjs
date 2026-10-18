// Geometry helpers for the Snackora logo system.
// All letterforms are built from one constant stroke on an orthogonal grid
// with rounded corners, then emitted as filled outlines (no SVG strokes), so
// the files print and cut cleanly (signage, foil, vehicle/automat wraps).

const f = (n) => Number(n.toFixed(2));

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}
function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}
function mul(a, s) {
  return [a[0] * s, a[1] * s];
}
function norm(a) {
  const l = Math.hypot(a[0], a[1]);
  return [a[0] / l, a[1] / l];
}
// Normal rotated +90° (screen coordinates, y down).
function normal(d) {
  return [-d[1], d[0]];
}

/**
 * Emits a path along points with per-vertex corner radii.
 * Assumes 90° turns between axis-aligned segments.
 */
function emitRounded(points, radii, moveTo = true) {
  let d = moveTo ? `M${f(points[0][0])} ${f(points[0][1])}` : `L${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const din = norm(sub(p, points[i - 1]));
    const dout = norm(sub(points[i + 1], p));
    const r = radii[i];
    if (!r || r <= 0) {
      d += `L${f(p[0])} ${f(p[1])}`;
      continue;
    }
    const a = sub(p, mul(din, r));
    const b = add(p, mul(dout, r));
    const cross = din[0] * dout[1] - din[1] * dout[0];
    d += `L${f(a[0])} ${f(a[1])}A${f(r)} ${f(r)} 0 0 ${cross > 0 ? 1 : 0} ${f(b[0])} ${f(b[1])}`;
  }
  const last = points[points.length - 1];
  d += `L${f(last[0])} ${f(last[1])}`;
  return d;
}

/**
 * Outline of an open, constant-width stroke following an orthogonal
 * centerline with rounded corners (radius measured on the centerline).
 * Ends are butt (flat) caps.
 */
export function strokeOutline(center, radii, width) {
  const h = width / 2;
  const n = center.length;
  const left = [];
  const right = [];
  const rl = [];
  const rr = [];
  for (let i = 0; i < n; i++) {
    const p = center[i];
    if (i === 0 || i === n - 1) {
      const d = i === 0 ? norm(sub(center[1], p)) : norm(sub(p, center[n - 2]));
      const nn = normal(d);
      left.push(add(p, mul(nn, h)));
      right.push(sub(p, mul(nn, h)));
      rl.push(0);
      rr.push(0);
      continue;
    }
    const din = norm(sub(p, center[i - 1]));
    const dout = norm(sub(center[i + 1], p));
    const nin = normal(din);
    const nout = normal(dout);
    const r = radii[i] ?? 0;
    // sharp offset corners
    left.push(add(p, mul(add(nin, nout), h)));
    right.push(sub(p, mul(add(nin, nout), h)));
    const k = ((nin[0] + nout[0]) * (din[0] - dout[0]) + (nin[1] + nout[1]) * (din[1] - dout[1])) / 2;
    rl.push(Math.max(0, r + h * k));
    rr.push(Math.max(0, r - h * k));
  }
  let d = emitRounded(left, rl, true);
  d += emitRounded([...right].reverse(), [...rr].reverse(), false);
  return d + "Z";
}

export function rect(x, y, w, h) {
  return `M${f(x)} ${f(y)}H${f(x + w)}V${f(y + h)}H${f(x)}Z`;
}

/** Rounded rectangle, clockwise (cw=true) or counter-clockwise. */
export function roundRect(x, y, w, h, r, cw = true) {
  const pts = [
    [x + w / 2, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
    [x, y],
    [x + w / 2, y],
  ];
  const radii = [0, r, r, r, r, 0];
  const ordered = cw ? pts : [...pts].reverse();
  const ordRadii = cw ? radii : [...radii].reverse();
  return emitRounded(ordered, ordRadii, true) + "Z";
}

/** Closed ring (rounded rectangle stroke) as outer cw + inner ccw outline. */
export function ring(x0, y0, x1, y1, r, width) {
  const h = width / 2;
  return (
    roundRect(x0 - h, y0 - h, x1 - x0 + width, y1 - y0 + width, r + h, true) +
    roundRect(x0 + h, y0 + h, x1 - x0 - width, y1 - y0 - width, Math.max(0, r - h), false)
  );
}

/** Diagonal stroke as a parallelogram with horizontal cuts at both ends. */
export function diagonal(top, bottom, width) {
  const u = norm(sub(bottom, top));
  const a = width / 2 / Math.abs(u[1]);
  return `M${f(top[0] - a)} ${f(top[1])}H${f(top[0] + a)}L${f(bottom[0] + a)} ${f(bottom[1])}H${f(bottom[0] - a)}Z`;
}

/** Diagonal stroke: horizontal cut at `top`, vertical cut at `end.x`. */
export function diagonalToVertical(top, end, width) {
  const u = norm(sub(end, top));
  const a = width / 2 / Math.abs(u[1]);
  const e1 = [top[0] - a, top[1]];
  const e2 = [top[0] + a, top[1]];
  const at = (e) => [end[0], e[1] + ((end[0] - e[0]) / u[0]) * u[1]];
  const p1 = at(e1);
  const p2 = at(e2);
  return `M${f(e1[0])} ${f(e1[1])}H${f(e2[0])}L${f(p2[0])} ${f(p2[1])}L${f(p1[0])} ${f(p1[1])}Z`;
}

export function translatePath(d, dx, dy) {
  // Only absolute commands are emitted by this module: M L H V A Z
  return d.replace(/([MLHVA])([^MLHVAZ]*)/g, (_, cmd, args) => {
    const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (cmd === "H") return `H${f(nums[0] + dx)}`;
    if (cmd === "V") return `V${f(nums[0] + dy)}`;
    if (cmd === "A") {
      const [rx, ry, rot, la, sw, x, y] = nums;
      return `A${f(rx)} ${f(ry)} ${rot} ${la} ${sw} ${f(x + dx)} ${f(y + dy)}`;
    }
    const out = [];
    for (let i = 0; i < nums.length; i += 2) out.push(`${f(nums[i] + dx)} ${f(nums[i + 1] + dy)}`);
    return cmd + out.join(" ");
  });
}

export function scalePath(d, s) {
  return d.replace(/([MLHVA])([^MLHVAZ]*)/g, (_, cmd, args) => {
    const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (cmd === "A") {
      const [rx, ry, rot, la, sw, x, y] = nums;
      return `A${f(rx * s)} ${f(ry * s)} ${rot} ${la} ${sw} ${f(x * s)} ${f(y * s)}`;
    }
    return cmd + nums.map((n) => f(n * s)).join(" ");
  });
}
