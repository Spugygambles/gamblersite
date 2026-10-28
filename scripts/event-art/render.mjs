// Renders the Turkey Hunt's 3D pictures (three.js, in headless Chromium)
// into public/event: for now, the Thanksgiving cases. Each page here draws
// its own and hands them back as WebP. (The hunt's stickers aren't
// rendered: they're drawn in components/event/Stickers.tsx.)
//
//   cd scripts/event-art && npm install && npx playwright install chromium
//   node render.mjs           # every page
//   node render.mjs cases     # just some
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(HERE, "../..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".woff2": "font/woff2" };

const server = http.createServer((req, res) => {
  const file = path.join(HERE, decodeURIComponent(new URL(req.url, "http://localhost").pathname));
  if (!file.startsWith(HERE) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

await new Promise((resolve) => server.listen(0, resolve));
const base = `http://localhost:${server.address().port}`;
// WebGL without a GPU: ANGLE on SwiftShader.
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const which = process.argv.slice(2);
for (const name of which.length ? which : ["cases"]) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error(`${name}: ${e.message}`));
  await page.goto(`${base}/${name}.html`);
  await page.waitForFunction(() => typeof window.pictures === "function", null, { timeout: 60000 });
  for (const { file, data } of await page.evaluate(() => window.pictures())) {
    const out = path.join(SITE, "public", file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, Buffer.from(data.split(",")[1], "base64"));
    console.log("wrote", path.relative(SITE, out));
  }
  await page.close();
}
await browser.close();
server.close();
