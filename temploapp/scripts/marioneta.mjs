import { mkdir } from "node:fs/promises";
import { access } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);

function valueFor(flag, fallback) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function hasFlag(flag) {
  return args.includes(flag);
}

async function findChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next known local browser path.
    }
  }

  throw new Error("No se encontró Chrome. Define PUPPETEER_EXECUTABLE_PATH con la ruta al navegador.");
}

const url = valueFor("--url", "http://localhost:3000");
const screenshot = valueFor("--screenshot", "artifacts/marioneta.png");
const width = Number(valueFor("--width", "390"));
const height = Number(valueFor("--height", "844"));
const wait = Number(valueFor("--wait", "500"));
const fullPage = hasFlag("--full-page");
const headed = hasFlag("--headed");

if (!Number.isFinite(width) || !Number.isFinite(height) || width < 320 || height < 240) {
  throw new Error("--width y --height deben ser números válidos (mínimo 320x240).");
}

const browser = await puppeteer.launch({
  executablePath: await findChrome(),
  headless: headed ? false : "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  defaultViewport: { width, height, deviceScaleFactor: 1 },
});

try {
  const page = await browser.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") console.error(`[marioneta:browser] ${message.text()}`);
  });
  await page.goto(url, { waitUntil: "networkidle2" });
  await new Promise((resolve) => setTimeout(resolve, wait));
  await mkdir(new URL(`file://${process.cwd()}/${screenshot}`).pathname.replace(/\/[^/]+$/, ""), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage });
  console.log(`[marioneta] Screenshot guardado en ${screenshot}`);
  console.log(`[marioneta] URL ${page.url()} · viewport ${width}x${height}`);
} finally {
  await browser.close();
}
