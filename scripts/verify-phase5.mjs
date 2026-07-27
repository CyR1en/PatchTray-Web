import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "dist");
const serverEntry = resolve(projectRoot, "dist-ssr", "entry-server.js");
const { getStaticPages } = await import(`${pathToFileURL(serverEntry).href}?t=${Date.now()}`);

const feedUrl = "https://www.patchtray.io/guides/feed.xml";
const articleUrls = [
  "https://www.patchtray.io/guides/voicemeeter-vst3-plugins",
  "https://www.patchtray.io/guides/run-vst3-without-daw",
];

function outputPath(pathname) {
  if (pathname === "/") return resolve(outputRoot, "index.html");
  return resolve(outputRoot, `${pathname.slice(1)}.html`);
}

const feed = await readFile(resolve(outputRoot, "guides", "feed.xml"), "utf8");
assert(feed.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "guide feed: missing XML declaration");
assert(feed.includes('<feed xmlns="http://www.w3.org/2005/Atom">'), "guide feed: missing Atom namespace");
assert(feed.includes(`<link href="${feedUrl}" rel="self" type="application/atom+xml" />`), "guide feed: bad self link");
assert.equal((feed.match(/<entry>/g) ?? []).length, articleUrls.length, "guide feed: article count drift");
assert.equal((feed.match(/<published>2026-07-27T00:00:00Z<\/published>/g) ?? []).length, articleUrls.length, "guide feed: publication dates drift");
assert.equal((feed.match(/<updated>2026-07-27T00:00:00Z<\/updated>/g) ?? []).length, articleUrls.length + 1, "guide feed: update dates drift");
for (const url of articleUrls) {
  assert(feed.includes(`<id>${url}</id>`), `guide feed: missing entry ${url}`);
}

const alternate = `<link rel="alternate" type="application/atom+xml" title="PatchTray guides" href="${feedUrl}"`;
for (const page of getStaticPages()) {
  const html = await readFile(outputPath(page.path), "utf8");
  assert(html.includes(alternate), `${page.path}: missing guide-feed autodiscovery`);
}

const guidesHtml = await readFile(outputPath("/guides"), "utf8");
for (const text of ["documentation standard", "original evidence", "primary references", "visible review date", "corrections"]) {
  assert(guidesHtml.includes(text), `guides: missing authority signal "${text}"`);
}
assert(guidesHtml.includes('href="/guides/feed.xml"'), "guides: missing visible feed link");
assert(guidesHtml.includes('href="/support"'), "guides: missing corrections route");

const playbook = await readFile(resolve(projectRoot, "docs", "AUTHORITY_DISTRIBUTION_PLAYBOOK.md"), "utf8");
for (const required of [
  "https://www.patchtray.io/",
  "https://github.com/PatchTray/PatchTray",
  "Release-note template",
  "Community-post template",
  "Campaign parameters",
  "Directory acceptance gate",
  "Never automate forum posts",
]) {
  assert(playbook.includes(required), `authority playbook: missing "${required}"`);
}

console.log(
  `[verify:phase5] Organization identity, Atom autodiscovery, ${articleUrls.length} feed entries, maintenance standard, distribution playbook`,
);
