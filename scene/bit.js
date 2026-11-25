// A small 1-bit drawing kit. Everything is drawn at logical resolution on a 2D
// canvas, collapsed to ink/paper bits, and written out at SCALE× with crisp pixels.
// Paper is transparent so the images sit on GitHub's light or dark page.
//
// GitHub's profile README column is 846 CSS px wide, so images are W = 423
// logical px, written at 4× (1692 px) and shown with width="846": every logical
// pixel lands on exactly 2×2 screen pixels at 1x and 4×4 at 2x, never blurred.

const params = new URLSearchParams(location.search);
export const theme = params.get("theme") === "dark" ? "dark" : "light";
export const W = 423;
export const SCALE = 4;
export const INK = theme === "dark" ? "#f0f6fc" : "#000000";
export const FONT = {
  name: '"Jacquard 24"',
  num: '"Jersey 10"',
  label: '"Silkscreen"',
  body: '"Pixelify Sans"',
};

export async function loadFonts() {
  await Promise.all(
    ['72px "Jacquard 24"', '40px "Jersey 10"', '8px "Silkscreen"', '16px "Pixelify Sans"'].map((f) =>
      document.fonts.load(f),
    ),
  );
}

/** A logical-resolution drawing surface. Draw in black; alpha decides ink. */
export function layer(w, h) {
  const c = new OffscreenCanvas(w, h);
  const g = c.getContext("2d", { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  g.fillStyle = g.strokeStyle = "#000";
  return { c, g, w, h };
}

export function text(g, str, x, y, size, font, { align = "left", erase = false } = {}) {
  g.save();
  g.font = `${size}px ${font}`;
  g.textBaseline = "alphabetic";
  if (erase) g.globalCompositeOperation = "destination-out";
  // Align by hand so the glyphs always start on a whole pixel; half pixels blur pixel fonts.
  const width = Math.ceil(g.measureText(str).width);
  const left = align === "center" ? x - width / 2 : align === "right" ? x - width : x;
  g.fillText(str, Math.round(left), Math.round(y));
  g.restore();
  return width;
}

export const rect = (g, x, y, w, h) => g.fillRect(x, y, w, h);
/** 1px dotted rule: every other pixel. */
export const dotted = (g, x, y, w) => {
  for (let i = 0; i < w; i += 2) g.fillRect(x + i, y, 1, 1);
};
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
  g.fillStyle = INK;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) if (b[y * w + x]) g.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
}
