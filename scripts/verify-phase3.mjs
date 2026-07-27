import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "dist");
const assetRoot = resolve(outputRoot, "assets");

const [homeHtml, downloadHtml, guideHtml, cssSource, outputAssets] = await Promise.all([
  readFile(resolve(outputRoot, "index.html"), "utf8"),
  readFile(resolve(outputRoot, "download.html"), "utf8"),
  readFile(resolve(outputRoot, "guide.html"), "utf8"),
  readFile(resolve(projectRoot, "src/styles.css"), "utf8"),
  readdir(assetRoot),
]);

assert(!cssSource.includes("fonts.googleapis.com"), "fonts must not depend on Google Fonts CSS");
assert(cssSource.includes('/fonts/geist-latin.woff2'), "missing self-hosted Geist font face");
assert(cssSource.includes('/fonts/geist-mono-latin.woff2'), "missing self-hosted Geist Mono font face");
assert(cssSource.includes("@keyframes hero-unclip"), "missing the clipped hero headline reveal");
assert(cssSource.includes("transform: translateY(110%)"), "hero headline must begin below its clipping mask");
assert(!cssSource.includes(".hero-line::after"), "orange hero scan shapes must stay removed");
assert(!cssSource.includes("hero-scan-line"), "orange hero scan animation must stay removed");
assert(
  cssSource.includes("animation: hero-unclip 780ms cubic-bezier(.22, 1, .36, 1) .85s both"),
  "hero headline reveal timing or easing regressed",
);
assert(
  cssSource.includes("animation: hero-rise-in 620ms cubic-bezier(.22, 1, .36, 1) 1.45s both"),
  "hero sequence must settle within the 2.5 second target",
);

for (const font of ["geist-latin.woff2", "geist-mono-latin.woff2"]) {
  assert(homeHtml.includes(`rel="preload" href="/fonts/${font}"`), `missing ${font} preload`);
  await stat(resolve(outputRoot, "fonts", font));
}
await stat(resolve(outputRoot, "fonts", "LICENSE.txt"));

const responsiveDocuments = [
  ["/", homeHtml, "patchtray-canvas", 'width="1745"', 'height="1073"'],
  ["/download", downloadHtml, "patchtray-settings", 'width="1280"', 'height="720"'],
  ["/guide", guideHtml, "patchtray-ports", 'width="1280"', 'height="720"'],
];
for (const [path, html, baseName, width, height] of responsiveDocuments) {
  assert(html.includes(`<picture>`), `${path}: screenshot must use picture sources`);
  assert(html.includes(`${baseName}-`) && html.includes(".avif") && html.includes(".webp"), `${path}: missing modern image sources`);
  assert(html.includes(width) && html.includes(height), `${path}: screenshot lacks intrinsic dimensions`);
}

const initialEntry = outputAssets.find((name) => /^index-[\w-]+\.js$/.test(name));
assert(initialEntry, "missing initial JavaScript entry");
const initialEntryBytes = (await stat(resolve(assetRoot, initialEntry))).size;
assert(initialEntryBytes < 230_000, `initial JavaScript entry regressed to ${initialEntryBytes} bytes`);

for (const routeChunk of ["HomePage-", "DownloadPage-", "GuidePage-"]) {
  assert(outputAssets.some((name) => name.startsWith(routeChunk) && name.endsWith(".js")), `missing ${routeChunk} route chunk`);
}

const originalCanvasBytes = (await stat(resolve(outputRoot, "assets", "patchtray-canvas.png"))).size;
const optimizedCanvasBytes = (await stat(resolve(outputRoot, "assets", "patchtray-canvas-1745.avif"))).size;
assert(
  originalCanvasBytes - optimizedCanvasBytes >= 150 * 1024,
  `canvas image saves only ${originalCanvasBytes - optimizedCanvasBytes} bytes`,
);

console.log(
  `[verify:phase3] ${initialEntryBytes} byte entry, route chunks, self-hosted fonts, responsive captures, ${originalCanvasBytes - optimizedCanvasBytes} canvas bytes saved`,
);
