import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "dist");
const serverEntry = resolve(projectRoot, "dist-ssr", "entry-server.js");

const { getNotFoundPage, getStaticPages } = await import(`${pathToFileURL(serverEntry).href}?t=${Date.now()}`);

function outputPath(pathname) {
  if (pathname === "/") return resolve(outputRoot, "index.html");
  return resolve(outputRoot, `${pathname.slice(1)}.html`);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function expectedMeta(attribute, key, value) {
  return `<meta ${attribute}="${key}" content="${escapeHtml(value)}"`;
}

async function verifySocialMeta(page, path = outputPath(page.path)) {
  const html = await readFile(path, "utf8");
  const { openGraph, twitter } = page;

  const expected = [
    expectedMeta("property", "og:title", openGraph.title),
    expectedMeta("property", "og:description", openGraph.description),
    expectedMeta("property", "og:type", openGraph.type),
    expectedMeta("property", "og:url", openGraph.url),
    expectedMeta("property", "og:site_name", openGraph.siteName),
    expectedMeta("property", "og:locale", openGraph.locale),
    expectedMeta("property", "og:image", openGraph.image.url),
    expectedMeta("property", "og:image:alt", openGraph.image.alt),
    expectedMeta("property", "og:image:width", String(openGraph.image.width)),
    expectedMeta("property", "og:image:height", String(openGraph.image.height)),
    expectedMeta("property", "og:image:type", openGraph.image.type),
    expectedMeta("name", "twitter:card", twitter.card),
    expectedMeta("name", "twitter:title", twitter.title),
    expectedMeta("name", "twitter:description", twitter.description),
    expectedMeta("name", "twitter:image", twitter.image),
    expectedMeta("name", "twitter:image:alt", twitter.imageAlt),
  ];

  for (const tag of expected) {
    assert(html.includes(tag), `${page.path}: missing or stale social tag ${tag}`);
  }
  assert(openGraph.url.startsWith("https://"), `${page.path}: og:url must be absolute`);
  assert(openGraph.image.url.startsWith("https://"), `${page.path}: og:image must be absolute`);
  assert(twitter.image.startsWith("https://"), `${page.path}: twitter:image must be absolute`);

  const embedded = [...html.matchAll(
    /<script type="application\/ld\+json" data-patchtray-structured-data="true">([\s\S]*?)<\/script>/g,
  )].map((match) => match[1]);
  assert.deepEqual(embedded, page.structuredDataJson, `${page.path}: JSON-LD does not match the resolved SEO model`);
  return embedded.map((json) => JSON.parse(json));
}

const pages = getStaticPages();
const structuredByPage = new Map();
for (const page of pages) structuredByPage.set(page.page, await verifySocialMeta(page));
await verifySocialMeta(getNotFoundPage(), resolve(outputRoot, "404.html"));

const homeData = structuredByPage.get("home");
assert.equal(homeData.length, 2, "home: expected WebSite and Organization structured data");
assert.equal(homeData[0]["@type"], "WebSite", "home: expected WebSite structured data");
assert.equal(homeData[0].name, "PatchTray", "home: WebSite name must be PatchTray");
assert.equal(homeData[1]["@type"], "Organization", "home: expected Organization structured data");
assert.equal(homeData[1]["@id"], "https://www.patchtray.io/#organization", "home: stable organization id drift");
assert.equal(homeData[1].url, "https://www.patchtray.io/", "home: Organization URL must be canonical");
assert.deepEqual(
  homeData[1].sameAs,
  ["https://github.com/PatchTray", "https://github.com/PatchTray/PatchTray"],
  "home: public identity links drifted",
);

const downloadData = structuredByPage.get("download");
assert.equal(downloadData.length, 1, "download: expected one structured-data object");
const software = downloadData[0];
assert.equal(software["@type"], "SoftwareApplication", "download: expected SoftwareApplication");
assert.equal(software.name, "PatchTray", "download: application name must be PatchTray");
assert.equal(software.operatingSystem, "Windows", "download: operating system must be Windows");
assert.equal(
  software.applicationCategory,
  "MultimediaApplication",
  "download: application category must be supported by Google",
);
assert.equal(software.review, undefined, "download: must not invent a review");
assert.equal(software.aggregateRating, undefined, "download: must not invent an aggregate rating");
assert.equal(software.offers.length, 3, "download: expected Free, monthly, and lifetime offers");
assert.equal(software.offers[0].price, "0", "download: Free offer price must be zero");
for (const offer of software.offers) {
  assert(/^[A-Z]{3}$/.test(offer.priceCurrency), `download: invalid offer currency ${offer.priceCurrency}`);
  assert(offer.url.startsWith("https://"), `download: offer URL must be absolute (${offer.name})`);
}

console.log(
  `[verify:phase2] ${pages.length + 1} social documents, WebSite + Organization schema, SoftwareApplication schema, ${software.offers.length} offers`,
);
