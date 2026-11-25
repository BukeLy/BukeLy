// A small 1-bit drawing kit in the style of an old desktop. Everything is drawn
// on a 2D canvas at logical resolution, collapsed to ink/paper bits, and written
// out at SCALE× with crisp pixels. Paper is transparent so the images sit on
// GitHub's light or dark page.
//
// GitHub's profile README column is 846 CSS px wide on desktop, so images are
// W = 846 logical px, written at 2× (1692 px) and shown with width="846": one
// logical pixel is one CSS pixel, so nothing is resampled at 1x or 2x.
// `?w=320` lays out the phone version (column ~308 px), written at 3×. Phone
// images are opaque black on white: GitHub's <themed-picture> rewrites any
// media query that mentions the colour scheme, so width and theme can't combine.

const params = new URLSearchParams(location.search);
export const theme = params.get("theme") === "dark" ? "dark" : "light";
export const W = Number(params.get("w")) || 846;
export const MOBILE = W < 600;
export const SCALE = MOBILE ? 3 : 2;
export const INK = theme === "dark" && !MOBILE ? "#f0f6fc" : "#000000";
// Departure Mono (SIL OFL, scene/fonts) is pixel-exact at multiples of 11 px.
const FAMILY = '"Departure Mono"';

export async function loadFonts() {
  const face = new FontFace("Departure Mono", `url(${new URL("fonts/DepartureMono-Regular.woff2", import.meta.url)})`);
  document.fonts.add(await face.load());
}

/** A logical-resolution drawing surface. Draw in black; alpha decides ink. */
export function layer(w, h) {
  const c = new OffscreenCanvas(w, h);
  const g = c.getContext("2d", { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  g.fillStyle = "#000";
  return { c, g, w, h };
}

/** Text at a whole-pixel position. `bold` overprints 1px right, as old system fonts did. */
export function text(g, str, x, y, size = 11, { align = "left", erase = false, bold = false } = {}) {
  g.save();
  g.font = `${size}px ${FAMILY}`;
  g.textBaseline = "alphabetic";
  if (erase) g.globalCompositeOperation = "destination-out";
  const width = Math.ceil(g.measureText(str).width) + (bold ? 1 : 0);
  const left = Math.round(align === "center" ? x - width / 2 : align === "right" ? x - width : x);
  g.fillText(str, left, Math.round(y));
  if (bold) g.fillText(str, left + 1, Math.round(y));
  g.restore();
  return width;
}

/** Greedy word wrap to a pixel width. Words too wide for a line may also break after "/". */
export function wrap(g, str, size, width) {
  g.font = `${size}px ${FAMILY}`;
  const lines = [""];
  for (const word of str.split(" ")) {
    const parts = g.measureText(word).width > width ? word.split(/(?<=\/)/) : [word];
    parts.forEach((part, k) => {
      const next = lines.at(-1) ? `${lines.at(-1)}${k ? "" : " "}${part}` : part;
      if (g.measureText(next).width > width && lines.at(-1)) lines.push(part);
      else lines[lines.length - 1] = next;
    });
  }
  return lines;
}

export const rect = (g, x, y, w, h) => g.fillRect(x, y, w, h);
export const paper = (g, x, y, w, h) => g.clearRect(x, y, w, h);
export const frame = (g, x, y, w, h) => {
  rect(g, x, y, w, 1); rect(g, x, y + h - 1, w, 1); rect(g, x, y, 1, h); rect(g, x + w - 1, y, 1, h);
};
/** 1px dotted rule: every other pixel. */
export const dotted = (g, x, y, w) => {
  for (let i = 0; i < w; i += 2) g.fillRect(x + i, y, 1, 1);
};
/** The desktop: a light 1-in-4 pattern, anchored to the canvas so it tiles evenly. */
export function desk(g, x, y, w, h) {
  for (let j = y; j < y + h; j += 2)
    for (let i = x; i < x + w; i++) if (i % 4 === (j % 4 === 0 ? 0 : 2)) g.fillRect(i, j, 1, 1);
}

export const TITLE_H = 19;
/**
 * A window: 1px frame with a drop shadow, a title bar (striped when active) and
 * a close box. Clears what is underneath. Returns the content rect.
 */
export function win(g, x, y, w, h, title, { active = true } = {}) {
  paper(g, x, y, w + 1, h + 1);
  rect(g, x + 1, y + h, w, 1);
  rect(g, x + w, y + 1, 1, h);
  frame(g, x, y, w, h);
  rect(g, x, y + TITLE_H - 1, w, 1);
  if (active) {
    for (let i = 0; i < 6; i++) rect(g, x + 2, y + 4 + i * 2, w - 4, 1);
    paper(g, x + 7, y + 3, 15, 13);
    frame(g, x + 9, y + 4, 11, 11);
  }
  g.font = `11px ${FAMILY}`;
  const tw = Math.ceil(g.measureText(title).width) + 1;
  const tx = Math.round(x + (w - tw) / 2);
  paper(g, tx - 7, y + 1, tw + 14, TITLE_H - 2);
  text(g, title, tx, y + 13, 11, { bold: active });
  return { x: x + 1, y: y + TITLE_H, w: w - 2, h: h - TITLE_H - 1 };
}

/** Bresenham line in whole pixels. */
export function line(g, x0, y0, x1, y1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) return;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

/** Pixel sprite from rows of "#" and ".". */
export const sprite = (g, rows, x, y) =>
  rows.forEach((r, j) => [...r].forEach((c, i) => c === "#" && g.fillRect(x + i, y + j, 1, 1)));

/** Ordered-dither threshold for pixel (x, y), 4×4 Bayer. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
export const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

/** Collapse a layer to bits (1 = ink) where alpha is over half. */
export function bits({ g, w, h }) {
  const d = g.getImageData(0, 0, w, h).data;
  const out = new Uint8Array(w * h);
  for (let i = 0; i < out.length; i++) out[i] = d[i * 4 + 3] > 127 ? 1 : 0;
  return out;
}

/** Show bits on a visible canvas at SCALE× in the theme's ink. */
export function paint(canvas, b, w, h) {
  canvas.width = w * SCALE;
  canvas.height = h * SCALE;
  const g = canvas.getContext("2d");
  g.clearRect(0, 0, canvas.width, canvas.height);
  if (MOBILE) {
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);
  }
  g.fillStyle = INK;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) if (b[y * w + x]) g.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
}
