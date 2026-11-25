// Fetch profile data, render the 1-bit scene/ pages in headless Chrome for light
// and dark themes, and write README images to assets/:
//   hero-*.webp   the looping hero (frames → lossless img2webp)
//   focus-*.png, work-*.png, work-N-*.png   static sections
// Each page paints its own canvases at final size, so images are read straight
// from the canvas rather than screenshotted.
// Env: GH_TOKEN (required), GH_LOGIN, CHROME_PATH, FRAMES, ONLY (comma list of outputs).
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { cleanDescription, summarize } from "./summarize.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sceneDir = path.join(root, "scene");
const assets = path.join(root, "assets");
const LOGIN = process.env.GH_LOGIN || "BukeLy";
const LOOP_MS = 8000;
const FRAMES = Number(process.env.FRAMES || 96);
const ONLY = process.env.ONLY?.split(",");
const THEMES = ["light", "dark"];
const REPOS = [
  ["VectifyAI", "PageIndex"],
  ["HKUDS", "LightRAG"],
  ["BukeLy", "rag-api"],
  ["BukeLy", "Stateless-FileSystem-Agent"],
];

const token = process.env.GH_TOKEN;
if (!token) throw new Error("GH_TOKEN is required");
const repoFields = "nameWithOwner name owner { login } url description stargazerCount primaryLanguage { name }";
const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    query: `query($login: String!) {
      user(login: $login) { contributionsCollection { contributionCalendar {
        weeks { contributionDays { date contributionCount weekday } } } } }
      ${REPOS.map(([o, n], i) => `r${i}: repository(owner: ${JSON.stringify(o)}, name: ${JSON.stringify(n)}) { ${repoFields} }`).join("\n")}
    }`,
    variables: { login: LOGIN },
  }),
});
const json = await res.json();
if (!res.ok || json.errors || !json.data?.user) {
  throw new Error(`GitHub GraphQL failed: HTTP ${res.status} ${JSON.stringify(json.errors ?? json)}`);
}
const data = {
  ...summarize(json.data.user.contributionsCollection.contributionCalendar.weeks, new Date()),
  repos: REPOS.map((_, i) => {
    const r = json.data[`r${i}`];
    return {
      owner: r.owner.login,
      name: r.name,
      url: r.url,
      description: cleanDescription(r.description, r.name),
      stars: r.stargazerCount,
      language: r.primaryLanguage?.name ?? "—",
      role: r.owner.login.toLowerCase() === LOGIN.toLowerCase() ? "Author" : "Contributor",
    };
  }),
};
await writeFile(path.join(sceneDir, "data.json"), JSON.stringify(data));
await mkdir(assets, { recursive: true });
console.log(`data: ${data.total} contributions, ${data.repos.length} repos`);

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const server = createServer(async (req, res) => {
  const file = path.join(sceneDir, path.normalize(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(sceneDir + path.sep)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;
const want = (name) => !ONLY || ONLY.includes(name);

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

/** Open a scene page and wait until it reports ready. */
const open = async (file, theme) => {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("requestfailed", (r) => errors.push(`request failed: ${r.url()}`));
  await page.goto(`http://localhost:${port}/${file}?theme=${theme}`, { waitUntil: "networkidle0" });
  await page.waitForFunction("window.__ready === true", { timeout: 60_000 }).catch((e) => {
    throw new Error(`${file} (${theme}) never became ready: ${errors.join("; ") || e.message}`);
  });
  return { page, errors };
};

/** Write the PNG currently on canvas `#id`. */
const savePng = async (page, id, file) => {
  const url = await page.$eval(`#${id}`, (c) => c.toDataURL("image/png"));
  await writeFile(file, Buffer.from(url.slice(url.indexOf(",") + 1), "base64"));
};

try {
  for (const theme of THEMES) {
    if (want("sections")) {
      const { page, errors } = await open("sections.html", theme);
      const names = ["focus", "work", ...data.repos.map((_, i) => `work-${i}`)];
      for (const name of names) await savePng(page, name, path.join(assets, `${name}-${theme}.png`));
      if (errors.length) throw new Error(`sections (${theme}): ${errors.join("; ")}`);
      console.log(`sections (${theme}): ${names.length} images`);
      await page.close();
    }

    if (want("hero")) {
      const { page, errors } = await open("hero.html", theme);
      const dir = path.join(root, ".frames", `hero-${theme}`);
      await rm(dir, { recursive: true, force: true });
      await mkdir(dir, { recursive: true });
      const files = [];
      for (let i = 0; i < FRAMES; i++) {
        await page.evaluate((t) => window.__frame(t), i / FRAMES);
        const file = path.join(dir, `${String(i).padStart(4, "0")}.png`);
        await savePng(page, "out", file);
        files.push(file);
      }
      if (errors.length) throw new Error(`hero (${theme}): ${errors.join("; ")}`);
      const out = path.join(assets, `hero-${theme}.webp`);
      // Lossless: two-colour frames pack tightly, and lossy would smear the dither.
      execFileSync("img2webp", ["-loop", "0", "-lossless", "-m", "6", "-d", String(Math.round(LOOP_MS / FRAMES)), ...files, "-o", out], { stdio: "ignore" });
      console.log(`hero (${theme}): ${FRAMES} frames -> ${path.relative(root, out)}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
