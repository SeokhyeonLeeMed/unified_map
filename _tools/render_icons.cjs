// Renders icon.svg to the PNG sizes browsers and iOS home screens need.
// usage: node _tools/render_icons.cjs
const path = require("path");
const fs = require("fs");
const { chromium } = require("C:/Users/hahah/Claude-assisted Projects/fretaid/node_modules/playwright");

const root = path.resolve(__dirname, "..");
const svg = fs.readFileSync(path.join(root, "icon.svg"), "utf8");
const out = [
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
];

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage();
  for (const [name, size] of out) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`);
    await page.screenshot({ path: path.join(root, name), omitBackground: false });
    console.log("wrote", name);
  }
  await browser.close();
})();
