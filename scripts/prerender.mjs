import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { copyGeneratedBlogAssets } from "./blog/assets.mjs";
import { INDEXNOW_KEY } from "./indexnow.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const outputRoot = resolve(projectRoot, "dist");
const serverEntry = resolve(projectRoot, "dist-ssr", "entry-server.js");
const templatePath = resolve(outputRoot, "index.html");
const generatedBlogAssets = resolve(projectRoot, ".generated", "blog", "assets");
const outputBlogAssets = resolve(outputRoot, "assets", "blog");

const {
  getBlogFeed,
  getGuideFeed,
  getNotFoundPage,
  getSitemapEntries,
  getStaticPages,
  render,
} = await import(`${pathToFileURL(serverEntry).href}?t=${Date.now()}`);

const template = await readFile(templatePath, "utf8");
const pages = getStaticPages();
const notFoundPage = getNotFoundPage();

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pageMeta(page) {
  const { openGraph, twitter } = page;
  const tags = [
    `    <meta name="description" content="${escapeHtml(page.description)}" />`,
    page.noindex ? '    <meta name="robots" content="noindex, follow" />' : undefined,
    page.canonicalUrl ? `    <link rel="canonical" href="${escapeHtml(page.canonicalUrl)}" />` : undefined,
    `    <meta property="og:title" content="${escapeHtml(openGraph.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(openGraph.description)}" />`,
    `    <meta property="og:type" content="${escapeHtml(openGraph.type)}" />`,
    openGraph.article
      ? `    <meta property="article:published_time" content="${escapeHtml(openGraph.article.publishedTime)}" />`
      : undefined,
    openGraph.article
      ? `    <meta property="article:modified_time" content="${escapeHtml(openGraph.article.modifiedTime)}" />`
      : undefined,
    openGraph.article
      ? `    <meta property="article:author" content="${escapeHtml(openGraph.article.author)}" />`
      : undefined,
    ...(openGraph.article?.tags ?? []).map(
      (tag) => `    <meta property="article:tag" content="${escapeHtml(tag)}" />`,
    ),
    `    <meta property="og:url" content="${escapeHtml(openGraph.url)}" />`,
    `    <meta property="og:site_name" content="${escapeHtml(openGraph.siteName)}" />`,
    `    <meta property="og:locale" content="${escapeHtml(openGraph.locale)}" />`,
    `    <meta property="og:image" content="${escapeHtml(openGraph.image.url)}" />`,
    `    <meta property="og:image:alt" content="${escapeHtml(openGraph.image.alt)}" />`,
    `    <meta property="og:image:width" content="${openGraph.image.width}" />`,
    `    <meta property="og:image:height" content="${openGraph.image.height}" />`,
    `    <meta property="og:image:type" content="${escapeHtml(openGraph.image.type)}" />`,
    `    <meta name="twitter:card" content="${escapeHtml(twitter.card)}" />`,
    `    <meta name="twitter:title" content="${escapeHtml(twitter.title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(twitter.description)}" />`,
    `    <meta name="twitter:image" content="${escapeHtml(twitter.image)}" />`,
    `    <meta name="twitter:image:alt" content="${escapeHtml(twitter.imageAlt)}" />`,
    ...page.alternateFeeds.map(
      (feed) =>
        `    <link rel="alternate" type="${escapeHtml(feed.type)}" title="${escapeHtml(feed.title)}" href="${escapeHtml(feed.href)}" />`,
    ),
    ...page.structuredDataJson.map(
      (json) =>
        `    <script type="application/ld+json" data-patchtray-structured-data="true">${json}</script>`,
    ),
    `    <title>${escapeHtml(page.title)}</title>`,
  ];
  return `<!--page-meta-start-->\n${tags.filter(Boolean).join("\n")}\n    <!--page-meta-end-->`;
}

function renderDocument(page) {
  const html = render(page.path);
  return template
    .replace(/<!--page-meta-start-->[\s\S]*?<!--page-meta-end-->/, pageMeta(page))
    .replace("<!--ssr-outlet-->", () => html);
}

function outputPath(pathname) {
  if (pathname === "/") return resolve(outputRoot, "index.html");
  return resolve(outputRoot, `${pathname.slice(1)}.html`);
}

async function writePage(page, destination = outputPath(page.path)) {
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, renderDocument(page), "utf8");
  console.log(`[prerender] ${page.path} -> ${destination.slice(outputRoot.length + 1)}`);
}

for (const page of pages) {
  await writePage(page);
}
await writePage(notFoundPage, resolve(outputRoot, "404.html"));

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...getSitemapEntries().map(
    (entry) =>
      `  <url><loc>${escapeHtml(entry.url)}</loc>${entry.lastmod ? `<lastmod>${escapeHtml(entry.lastmod)}</lastmod>` : ""}</url>`,
  ),
  "</urlset>",
  "",
].join("\n");
await writeFile(resolve(outputRoot, "sitemap.xml"), sitemap, "utf8");
console.log("[prerender] sitemap.xml");

// IndexNow authenticates a submission by fetching this file, so it has to ship
// with the site rather than live beside the script that sends the key.
await writeFile(resolve(outputRoot, `${INDEXNOW_KEY}.txt`), `${INDEXNOW_KEY}\n`, "utf8");
console.log(`[prerender] ${INDEXNOW_KEY}.txt`);

await writeFile(resolve(outputRoot, "guides", "feed.xml"), getGuideFeed(), "utf8");
console.log("[prerender] guides/feed.xml");

const blogFeed = getBlogFeed();
if (blogFeed) {
  await mkdir(resolve(outputRoot, "blog"), { recursive: true });
  await writeFile(resolve(outputRoot, "blog", "feed.xml"), blogFeed, "utf8");
  console.log("[prerender] blog/feed.xml");
}

const copiedBlogAssets = await copyGeneratedBlogAssets(generatedBlogAssets, outputBlogAssets);
console.log(`[prerender] assets/blog (${copiedBlogAssets} generated asset${copiedBlogAssets === 1 ? "" : "s"})`);
