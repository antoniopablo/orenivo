import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filesDir = path.join(__dirname, "files ");
const outDir = path.join(__dirname, "files ");

const screenshots = [
  "screenshot-1-hero.html",
  "screenshot-2-platforms.html",
  "screenshot-3-folders.html",
  "screenshot-4-search.html",
  "screenshot-5-prompts.html",
];

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

for (const file of screenshots) {
  const htmlPath = path.join(filesDir, file);
  const pngPath = path.join(outDir, file.replace(".html", ".png"));
  const url = "file://" + htmlPath;

  await page.goto(url, { waitUntil: "networkidle0" });
  await page.screenshot({ path: pngPath, type: "png", clip: { x: 0, y: 0, width: 1280, height: 800 } });
  console.log("✓", file.replace(".html", ".png"));
}

await browser.close();
console.log("Done — 5 screenshots at 1280×800 (2x retina)");
