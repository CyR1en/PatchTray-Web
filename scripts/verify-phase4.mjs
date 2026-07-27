import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "dist");
const serverEntry = resolve(projectRoot, "dist-ssr", "entry-server.js");
const { getStaticPages } = await import(`${pathToFileURL(serverEntry).href}?t=${Date.now()}`);

const guides = [
  {
    page: "voicemeeterVst3Guide",
    path: "/guides/voicemeeter-vst3-plugins",
    h1: "How to use VST3 plugins with Voicemeeter",
    source: "https://vb-audio.com/Voicemeeter/VoicemeeterBanana_UserManual.pdf",
    requiredText: ["PATCH INSERT", "single-client ASIO device", "Start quiet."],
  },
  {
    page: "vst3WithoutDawGuide",
    path: "/guides/run-vst3-without-daw",
    h1: "How to run VST3 effects without opening a DAW on Windows",
    source:
      "https://steinbergmedia.github.io/vst3_dev_portal/pages/What%2Bis%2BVST/Index.html",
    requiredText: ["A VST3 effect cannot process live audio by itself.", "There is no universal best value", "Do not optimize while going live."],
  },
];

function outputPath(pathname) {
  return resolve(outputRoot, `${pathname.slice(1)}.html`);
}

function visibleWordCount(html) {
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? "";
  return main
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
}

function jsonLd(html) {
  return [...html.matchAll(
    /<script type="application\/ld\+json" data-patchtray-structured-data="true">([\s\S]*?)<\/script>/g,
  )].map((match) => JSON.parse(match[1]));
}

const pages = getStaticPages();
const sitemap = await readFile(resolve(outputRoot, "sitemap.xml"), "utf8");
const hubHtml = await readFile(outputPath("/guides"), "utf8");
const hubPage = pages.find((page) => page.page === "guides");

assert(hubPage, "guides: missing from the static page model");
assert(hubHtml.includes("<h1>guides for live VST3 audio on Windows.</h1>"), "guides: missing focused h1");
assert.equal((hubHtml.match(/<h1>/g) ?? []).length, 1, "guides: expected exactly one h1");
assert(hubHtml.includes('rel="canonical" href="https://www.patchtray.io/guides"'), "guides: missing canonical");
assert(!hubHtml.includes('name="robots" content="noindex'), "guides: must remain indexable");
assert(hubHtml.includes("<picture>"), "guides: missing responsive product capture");
assert.equal(jsonLd(hubHtml)[0]?.["@type"], "CollectionPage", "guides: expected CollectionPage schema");

for (const guide of guides) {
  const html = await readFile(outputPath(guide.path), "utf8");
  const page = pages.find((candidate) => candidate.page === guide.page);
  assert(page, `${guide.path}: missing from the static page model`);
  assert(html.includes(`<h1>${guide.h1}</h1>`), `${guide.path}: missing focused h1`);
  assert.equal((html.match(/<h1>/g) ?? []).length, 1, `${guide.path}: expected exactly one h1`);
  assert(
    html.includes(`rel="canonical" href="https://www.patchtray.io${guide.path}"`),
    `${guide.path}: missing canonical`,
  );
  assert(!html.includes('name="robots" content="noindex'), `${guide.path}: must remain indexable`);
  assert(html.includes('href="/guides"'), `${guide.path}: missing guides-hub link`);
  assert(html.includes('href="/support"') || html.includes('href="/guide"'), `${guide.path}: missing product support link`);
  assert(html.includes("<picture>"), `${guide.path}: missing responsive product capture`);
  assert(html.includes(guide.source), `${guide.path}: missing official source`);
  for (const text of guide.requiredText) {
    assert(html.includes(text), `${guide.path}: missing safety or workflow copy "${text}"`);
  }
  assert(visibleWordCount(html) >= 700, `${guide.path}: guide is thinner than 700 visible words`);
  assert(sitemap.includes(`<loc>https://www.patchtray.io${guide.path}</loc>`), `${guide.path}: missing from sitemap`);

  const data = jsonLd(html);
  assert.equal(data.length, 2, `${guide.path}: expected TechArticle and BreadcrumbList schema`);
  assert.equal(data[0]["@type"], "TechArticle", `${guide.path}: expected TechArticle schema`);
  assert.equal(data[0].headline, guide.h1, `${guide.path}: schema headline drift`);
  assert.equal(data[0].datePublished, "2026-07-27", `${guide.path}: publication date drift`);
  assert.equal(data[0].dateModified, "2026-07-27", `${guide.path}: review date drift`);
  assert.equal(data[1]["@type"], "BreadcrumbList", `${guide.path}: expected BreadcrumbList schema`);
}

assert(sitemap.includes("<loc>https://www.patchtray.io/guides</loc>"), "guides: missing from sitemap");

const assets = await readdir(resolve(outputRoot, "assets"));
for (const chunk of ["GuidesPage-", "VoicemeeterVst3GuidePage-", "Vst3WithoutDawGuidePage-"]) {
  assert(assets.some((asset) => asset.startsWith(chunk) && asset.endsWith(".js")), `missing route chunk ${chunk}`);
}

console.log(
  `[verify:phase4] guides hub, ${guides.length} evergreen articles, TechArticle schema, official sources, sitemap, route chunks`,
);
