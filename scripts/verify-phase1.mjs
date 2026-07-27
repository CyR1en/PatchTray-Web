import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "dist");
const serverEntry = resolve(projectRoot, "dist-ssr", "entry-server.js");

const { getNotFoundPage, getSitemapUrls, getStaticPages } = await import(
  `${pathToFileURL(serverEntry).href}?t=${Date.now()}`
);

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

async function verifyPage(page, path = outputPath(page.path)) {
  const html = await readFile(path, "utf8");
  assert(!html.includes("<!--ssr-outlet-->"), `${page.path}: SSR outlet was not replaced`);
  assert(/<div id="root">.+<\/div>/s.test(html), `${page.path}: root has no rendered markup`);
  assert(/<h1(?:\s[^>]*)?>/i.test(html), `${page.path}: missing h1`);
  assert(html.includes(`<title>${escapeHtml(page.title)}</title>`), `${page.path}: title does not match page metadata`);

  if (page.noindex) {
    assert(html.includes('name="robots" content="noindex, follow"'), `${page.path}: missing noindex meta`);
    assert(!html.includes('rel="canonical"'), `${page.path}: noindex route must not emit a canonical`);
  } else {
    assert(page.canonicalUrl, `${page.path}: indexable route has no canonical URL`);
    assert(
      html.includes(`rel="canonical" href="${page.canonicalUrl}"`),
      `${page.path}: canonical does not match ${page.canonicalUrl}`,
    );
  }
}

const pages = getStaticPages();
for (const page of pages) await verifyPage(page);
await verifyPage(getNotFoundPage(), resolve(outputRoot, "404.html"));

const expectedSitemapUrls = getSitemapUrls();
const sitemap = await readFile(resolve(outputRoot, "sitemap.xml"), "utf8");
const actualSitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.deepEqual(actualSitemapUrls, expectedSitemapUrls, "sitemap URLs do not match the public route table");

const robots = await readFile(resolve(outputRoot, "robots.txt"), "utf8");
assert(
  robots.includes("Sitemap: https://www.patchtray.io/sitemap.xml"),
  "robots.txt does not advertise the production sitemap",
);

const vercel = JSON.parse(await readFile(resolve(projectRoot, "vercel.json"), "utf8"));
assert.equal(vercel.cleanUrls, true, "vercel.json must enable cleanUrls");
assert.equal(vercel.trailingSlash, false, "vercel.json must remove trailing slashes");
assert(!("rewrites" in vercel), "the SPA catch-all rewrite must stay removed");

console.log(
  `[verify:phase1] ${pages.length} routes, 1 static 404, ${expectedSitemapUrls.length} sitemap URLs, deployment config`,
);
