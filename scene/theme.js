const params = new URLSearchParams(location.search);
// ?capture: fixed 1600px frame and transparent page, for scripts/render.mjs.
export const capture = params.has("capture");
export const theme =
  params.get("theme") ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.documentElement.dataset.theme = theme;
document.documentElement.classList.toggle("capture", capture);
