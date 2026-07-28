import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import {
  access,
  readFile,
  readdir,
} from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { splitArticleSource } from "./blog/source.mjs";

const execFile = promisify(execFileCallback);
const projectRoot = resolve(import.meta.dirname, "..");
const defaultContentPostsDirectory = resolve(
  projectRoot,
  "content",
  "blog",
  "posts",
);
const generatedDirectory = resolve(projectRoot, ".generated", "blog");
const generatedAssetsDirectory = resolve(generatedDirectory, "assets");
const generatedPostsDirectory = resolve(generatedDirectory, "posts");
const outputDirectory = resolve(projectRoot, "dist");
const outputAssetsDirectory = resolve(outputDirectory, "assets");
const outputBlogAssetsDirectory = resolve(outputAssetsDirectory, "blog");
const serverEntry = resolve(projectRoot, "dist-ssr", "entry-server.js");
const vercelConfigPath = resolve(projectRoot, "vercel.json");
const canonicalOrigin = "https://www.patchtray.io";

const maximumArticleHtmlGzipBytes = 100 * 1024;
const maximumSharedEntryGzipBytes = 85 * 1024;
const maximumBlogRouteJsGzipBytes = 40 * 1024;

function invariant(condition, message) {
  if (!condition) throw new Error(`[blog:verify] ${message}`);
}

function option(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  invariant(value && !value.startsWith("--"), `${name} requires a value`);
  return value;
}

const supportedArguments = new Set(["--content-dir", "--origin"]);
for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  invariant(supportedArguments.has(argument), `unknown argument ${argument}`);
  index += 1;
}

const originOption = option("--origin");
const remoteOrigin = originOption?.replace(/\/+$/, "");
const contentPostsDirectory = resolve(
  projectRoot,
  option("--content-dir") ?? defaultContentPostsDirectory,
);
if (remoteOrigin) {
  const parsedOrigin = new URL(remoteOrigin);
  invariant(
    (parsedOrigin.protocol === "https:" || parsedOrigin.protocol === "http:") &&
      parsedOrigin.origin === remoteOrigin,
    "--origin must be an HTTP(S) origin without a path",
  );
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function lexicalCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function arraysEqual(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function asArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function decodeHtml(value) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function attribute(tag, name) {
  const match = new RegExp(`\\s${escapeRegex(name)}="([^"]*)"`).exec(tag);
  return match ? decodeHtml(match[1]) : undefined;
}

function tagsWithAttribute(html, tagName, attributeName, attributeValue) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, "g")) ?? [];
  return tags.filter(
    (tag) => attribute(tag, attributeName) === attributeValue,
  );
}

function metaValues(html, attributeName, attributeValue) {
  return tagsWithAttribute(html, "meta", attributeName, attributeValue)
    .map((tag) => attribute(tag, "content"))
    .filter((value) => value !== undefined);
}

function canonicalFrom(html) {
  const links = tagsWithAttribute(html, "link", "rel", "canonical");
  invariant(links.length <= 1, "document contains multiple canonical links");
  return links.length === 1 ? attribute(links[0], "href") : undefined;
}

function hasFeedAlternate(html, title, href) {
  return tagsWithAttribute(html, "link", "rel", "alternate").some(
    (tag) =>
      attribute(tag, "type") === "application/atom+xml" &&
      attribute(tag, "title") === title &&
      attribute(tag, "href") === href,
  );
}

function structuredDataFrom(html) {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json" data-patchtray-structured-data="true">([\s\S]*?)<\/script>/g,
    ),
  ].map((match) => JSON.parse(match[1]));
}

function outputPath(pathname) {
  if (pathname === "/") return resolve(outputDirectory, "index.html");
  return resolve(outputDirectory, `${pathname.slice(1)}.html`);
}

function fallbackSocialImage(image) {
  const variants = image.variants.filter(
    (variant) => variant.format === image.fallbackFormat,
  );
  invariant(variants.length > 0, `${image.source} has no fallback image variant`);
  return variants.reduce((largest, candidate) =>
    candidate.width > largest.width ? candidate : largest,
  );
}

function publicationOrder(left, right) {
  return (
    Date.parse(right.publishedAt) - Date.parse(left.publishedAt) ||
    lexicalCompare(left.slug, right.slug)
  );
}

function maximumUpdatedAt(posts) {
  return posts.reduce(
    (latest, post) =>
      Date.parse(post.updatedAt) > Date.parse(latest) ? post.updatedAt : latest,
    posts[0].updatedAt,
  );
}

function textMarker(html) {
  const lines = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].flatMap((match) =>
    decodeHtml(match[1].replace(/<[^>]+>/g, " "))
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter((line) => line.length >= 32),
  );
  return lines[0];
}

async function sourceArticles() {
  const entries = await readdir(contentPostsDirectory, { withFileTypes: true });
  const articles = [];
  for (const entry of entries.sort((left, right) =>
    lexicalCompare(left.name, right.name),
  )) {
    if (!entry.isDirectory()) continue;
    const sourcePath = resolve(contentPostsDirectory, entry.name, "index.md");
    const source = await readFile(sourcePath, "utf8");
    const { frontmatter, body } = splitArticleSource(
      source,
      `content/blog/posts/${entry.name}/index.md`,
    );
    articles.push({ body, frontmatter, slug: entry.name });
  }
  return articles;
}

async function listFiles(directory) {
  if (!(await exists(directory))) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort(lexicalCompare);
}

async function textArtifacts(directory) {
  const output = [];
  if (!(await exists(directory))) return output;
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await textArtifacts(path)));
    } else if ([".html", ".js", ".xml"].includes(extname(entry.name))) {
      output.push(await readFile(path, "utf8"));
    }
  }
  return output;
}

async function fetchRoute(pathname, expectedStatus) {
  const response = await fetch(`${remoteOrigin}${pathname}`, {
    redirect: "manual",
    headers: { "user-agent": "PatchTray-Blog-Verification/1.0" },
    signal: AbortSignal.timeout(15_000),
  });
  invariant(
    response.status === expectedStatus,
    `${remoteOrigin}${pathname} returned HTTP ${response.status}, expected ${expectedStatus}`,
  );
  return response;
}

async function routeHtml(pathname) {
  if (remoteOrigin) {
    return (await fetchRoute(pathname, 200)).text();
  }
  return readFile(outputPath(pathname), "utf8");
}

async function routeXml(pathname) {
  if (remoteOrigin) {
    return (await fetchRoute(pathname, 200)).text();
  }
  return readFile(resolve(outputDirectory, pathname.slice(1)), "utf8");
}

function validateXml(xml, label) {
  const result = XMLValidator.validate(xml);
  invariant(
    result === true,
    `${label} is not valid XML (${JSON.stringify(result)})`,
  );
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: true,
});

function importDependencies(source) {
  const dependencies = new Set();
  const patterns = [
    /from\s*["']\.\/([^"']+\.js)["']/g,
    /import\s*["']\.\/([^"']+\.js)["']/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) dependencies.add(match[1]);
  }
  return [...dependencies];
}

async function chunkClosure(rootNames, chunksByName) {
  const pending = [...rootNames];
  const visited = new Set();
  while (pending.length > 0) {
    const name = pending.pop();
    if (visited.has(name)) continue;
    const source = chunksByName.get(name);
    invariant(source !== undefined, `missing client chunk ${name}`);
    visited.add(name);
    pending.push(...importDependencies(source));
  }
  return visited;
}

function findChunk(chunkNames, prefix, required = true) {
  const matches = chunkNames.filter(
    (name) => name.startsWith(`${prefix}-`) && name.endsWith(".js"),
  );
  invariant(
    !required || matches.length === 1,
    `expected one ${prefix} chunk, found ${matches.length}`,
  );
  invariant(matches.length <= 1, `found multiple ${prefix} chunks`);
  return matches[0];
}

function gzipBytes(value) {
  return gzipSync(value).byteLength;
}

async function publishedSlugsAtGitRef(ref) {
  invariant(
    /^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$/.test(ref),
    "BLOG_BASE_REF contains unsupported characters",
  );
  const { stdout: commit } = await execFile(
    "git",
    ["rev-parse", "--verify", `${ref}^{commit}`],
    { cwd: projectRoot },
  );
  const { stdout } = await execFile(
    "git",
    [
      "ls-tree",
      "-r",
      "--name-only",
      commit.trim(),
      "--",
      "content/blog/posts",
    ],
    { cwd: projectRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  const indexPaths = stdout
    .split("\n")
    .filter((path) => /^content\/blog\/posts\/[^/]+\/index\.md$/.test(path));
  const published = [];
  for (const path of indexPaths) {
    const { stdout: source } = await execFile(
      "git",
      ["show", `${commit.trim()}:${path}`],
      { cwd: projectRoot, maxBuffer: 1024 * 1024 },
    );
    const { frontmatter } = splitArticleSource(source, `${ref}:${path}`);
    if (frontmatter.status === "published") {
      published.push(path.split("/")[3]);
    }
  }
  return published.sort(lexicalCompare);
}

async function verifySlugHistory(currentPublishedSlugs) {
  const baseRef = process.env.BLOG_BASE_REF?.trim();
  if (!baseRef) return "not configured";

  const previousPublishedSlugs = await publishedSlugsAtGitRef(baseRef);
  const current = new Set(currentPublishedSlugs);
  const removed = previousPublishedSlugs.filter((slug) => !current.has(slug));
  if (removed.length === 0) return `${baseRef}: no published slugs removed`;

  const vercelConfig = await readJson(vercelConfigPath);
  const redirects = Array.isArray(vercelConfig.redirects)
    ? vercelConfig.redirects
    : [];
  const currentTargets = new Set([
    ...server.getSitemapEntries().map((entry) => new URL(entry.url).pathname),
    ...currentPublishedSlugs.map((slug) => `/blog/${slug}`),
  ]);
  for (const slug of removed) {
    const source = `/blog/${slug}`;
    const redirect = redirects.find(
      (candidate) =>
        candidate.source === source && candidate.permanent === true,
    );
    invariant(
      redirect,
      `published slug ${source} was removed since ${baseRef} without a permanent redirect`,
    );
    invariant(
      currentTargets.has(redirect.destination),
      `redirect for removed slug ${source} has an unknown destination`,
    );
  }
  return `${baseRef}: ${removed.length} removed published slug redirect(s) verified`;
}

const [catalog, manifest, sources, server] = await Promise.all([
  readJson(resolve(generatedDirectory, "catalog.json")),
  readJson(resolve(generatedDirectory, "manifest.json")),
  sourceArticles(),
  import(`${pathToFileURL(serverEntry).href}?verify=${Date.now()}`),
]);

invariant(catalog.schemaVersion === 1, "catalog schemaVersion must be 1");
invariant(Array.isArray(catalog.posts), "catalog posts must be an array");
invariant(
  manifest.publishedCount === catalog.posts.length,
  "manifest publishedCount differs from catalog",
);
invariant(
  manifest.draftCount ===
    sources.filter((article) => article.frontmatter.status === "draft").length,
  "manifest draftCount differs from source",
);
invariant(
  /^[0-9a-f]{64}$/.test(manifest.contentDigest ?? ""),
  "manifest contentDigest is invalid",
);
invariant(
  manifest.preview === false && manifest.previewCount === 0,
  "draft preview artifacts must never enter a production build",
);

const catalogSlugs = catalog.posts.map((post) => post.slug);
invariant(
  new Set(catalogSlugs).size === catalogSlugs.length,
  "catalog contains duplicate slugs",
);
invariant(
  arraysEqual(
    [...catalog.posts].sort(publicationOrder).map((post) => post.slug),
    catalogSlugs,
  ),
  "catalog is not in reverse publication order",
);
const sourcePublishedSlugs = sources
  .filter((article) => article.frontmatter.status === "published")
  .map((article) => article.slug)
  .sort(lexicalCompare);
invariant(
  arraysEqual([...catalogSlugs].sort(lexicalCompare), sourcePublishedSlugs),
  "published source slugs differ from the generated catalog",
);
const draftArticles = sources.filter(
  (article) => article.frontmatter.status === "draft",
);
for (const post of catalog.posts) {
  invariant(
    Date.parse(post.publishedAt) <= Date.parse(manifest.generatedAt),
    `${post.slug} has a future publication time`,
  );
}
if (catalog.posts.length > 0) {
  invariant(
    catalogSlugs.includes(catalog.featuredSlug),
    "featuredSlug does not identify a published post",
  );
} else {
  invariant(
    catalog.featuredSlug === null,
    "empty catalog must have a null featuredSlug",
  );
}

const generatedPostFiles = await listFiles(generatedPostsDirectory);
invariant(
  arraysEqual(
    generatedPostFiles,
    [...catalogSlugs].sort(lexicalCompare).map((slug) => `${slug}.json`),
  ),
  "generated post artifacts do not exactly match the catalog",
);
const posts = await Promise.all(
  catalogSlugs.map((slug) =>
    readJson(resolve(generatedPostsDirectory, `${slug}.json`)),
  ),
);

const staticPages = server.getStaticPages();
const staticPaths = staticPages.map((page) => page.path);
const expectedBlogPaths =
  catalog.posts.length === 0
    ? []
    : ["/blog", ...catalog.posts.map((post) => post.path)];
invariant(
  arraysEqual(
    staticPaths.filter((path) => path === "/blog" || path.startsWith("/blog/")),
    expectedBlogPaths,
  ),
  "server static blog routes differ from the catalog",
);

const sitemapXml = await routeXml("/sitemap.xml");
validateXml(sitemapXml, "sitemap.xml");
const sitemapDocument = xmlParser.parse(sitemapXml);
const sitemapEntries = asArray(sitemapDocument.urlset?.url);
const sitemapByUrl = new Map(
  sitemapEntries.map((entry) => [entry.loc, entry.lastmod]),
);
const actualBlogSitemapUrls = [...sitemapByUrl.keys()].filter(
  (url) =>
    url === `${canonicalOrigin}/blog` ||
    url.startsWith(`${canonicalOrigin}/blog/`),
);
const expectedBlogSitemapUrls =
  catalog.posts.length === 0
    ? []
    : [
        `${canonicalOrigin}/blog`,
        ...catalog.posts.map((post) => post.canonicalUrl),
      ];
invariant(
  arraysEqual(actualBlogSitemapUrls, expectedBlogSitemapUrls),
  "sitemap blog URLs differ from the catalog",
);

let maximumArticleHtmlBytes = 0;
let maximumRouteJsBytes = 0;
const allTextArtifacts = (await textArtifacts(outputDirectory)).join("\n");
invariant(
  !allTextArtifacts.includes(projectRoot) &&
    !allTextArtifacts.includes(tmpdir()),
  "production artifacts expose a local filesystem path",
);

for (const draft of draftArticles) {
  invariant(
    !catalogSlugs.includes(draft.slug),
    `draft ${draft.slug} appears in the catalog`,
  );
  invariant(
    !(await exists(resolve(generatedPostsDirectory, `${draft.slug}.json`))),
    `draft ${draft.slug} has a generated post artifact`,
  );
  invariant(
    !(await exists(outputPath(`/blog/${draft.slug}`))),
    `draft ${draft.slug} has a prerendered route`,
  );
  invariant(
    !sitemapByUrl.has(`${canonicalOrigin}/blog/${draft.slug}`),
    `draft ${draft.slug} appears in the sitemap`,
  );
  invariant(
    !allTextArtifacts.includes(draft.frontmatter.title),
    `draft ${draft.slug} title leaked into production artifacts`,
  );
}

const feedPath = resolve(outputDirectory, "blog", "feed.xml");
if (catalog.posts.length === 0) {
  invariant(
    !(await exists(outputPath("/blog"))),
    "empty catalog emitted a blog hub",
  );
  invariant(!(await exists(feedPath)), "empty catalog emitted a blog feed");
  invariant(
    !allTextArtifacts.includes('title="PatchTray blog"'),
    "empty catalog advertised the blog feed",
  );
  if (remoteOrigin) {
    await fetchRoute("/blog", 404);
    await fetchRoute("/blog/feed.xml", 404);
  }
} else {
  const hubHtml = await routeHtml("/blog");
  invariant(
    (hubHtml.match(/<h1(?:\s|>)/g) ?? []).length === 1,
    "blog hub does not contain exactly one H1",
  );
  invariant(
    canonicalFrom(hubHtml) === `${canonicalOrigin}/blog`,
    "blog hub canonical is not the production URL",
  );
  invariant(
    metaValues(hubHtml, "property", "og:type")[0] === "website",
    "blog hub og:type is not website",
  );
  invariant(
    hasFeedAlternate(
      hubHtml,
      "PatchTray blog",
      `${canonicalOrigin}/blog/feed.xml`,
    ),
    "blog hub does not advertise the Atom feed",
  );
  for (const post of catalog.posts) {
    invariant(
      hubHtml.includes(`href="${post.path}"`) &&
        hubHtml.includes(escapeHtml(post.title)) &&
        hubHtml.includes(escapeHtml(post.summary)),
      `blog hub does not expose ${post.slug}`,
    );
  }
  const collection = structuredDataFrom(hubHtml).find(
    (item) => item["@type"] === "CollectionPage",
  );
  invariant(collection, "blog hub has no CollectionPage JSON-LD");
  const collectionParts = asArray(collection.hasPart);
  invariant(
    collectionParts.length === catalog.posts.length,
    "CollectionPage hasPart count differs from the catalog",
  );
  for (const [index, post] of catalog.posts.entries()) {
    const part = collectionParts[index];
    invariant(
      part?.url === post.canonicalUrl &&
        part?.headline === post.title &&
        part?.datePublished === post.publishedAt &&
        part?.dateModified === post.updatedAt,
      `CollectionPage data differs for ${post.slug}`,
    );
  }
  const featured =
    catalog.posts.find((post) => post.slug === catalog.featuredSlug) ??
    catalog.posts[0];
  const hubSocialImage = fallbackSocialImage(featured.image);
  invariant(
    metaValues(hubHtml, "property", "og:image")[0] ===
      `${canonicalOrigin}${hubSocialImage.url}`,
    "blog hub social image differs from the featured post",
  );
  invariant(
    gzipBytes(hubHtml) <= maximumArticleHtmlGzipBytes,
    "blog hub exceeds the compressed HTML budget",
  );
  invariant(
    sitemapByUrl.get(`${canonicalOrigin}/blog`) ===
      maximumUpdatedAt(catalog.posts),
    "blog hub sitemap lastmod is inaccurate",
  );

  const feedXml = await routeXml("/blog/feed.xml");
  validateXml(feedXml, "blog/feed.xml");
  const feedDocument = xmlParser.parse(feedXml).feed;
  invariant(
    feedDocument?.["@_xmlns"] === "http://www.w3.org/2005/Atom",
    "blog feed has the wrong Atom namespace",
  );
  const feedPosts = catalog.posts.slice(0, 20);
  const feedEntries = asArray(feedDocument.entry);
  invariant(
    feedEntries.length === feedPosts.length,
    "blog feed does not contain the newest 20 posts",
  );
  invariant(
    feedDocument.updated === maximumUpdatedAt(feedPosts),
    "blog feed updated time is inaccurate",
  );
  for (const [index, post] of feedPosts.entries()) {
    const entry = feedEntries[index];
    const categories = asArray(entry.category).map(
      (category) => category["@_term"],
    );
    invariant(
      entry.id === post.canonicalUrl &&
        entry.title === post.title &&
        entry.summary?.["#text"] === post.summary &&
        entry.published === post.publishedAt &&
        entry.updated === post.updatedAt &&
        entry.author?.name === post.author.name &&
        entry.author?.uri === post.author.url &&
        arraysEqual(categories, post.tags),
      `Atom entry differs for ${post.slug}`,
    );
  }

  for (const post of posts) {
    const html = await routeHtml(post.path);
    const expectedTitle = `${post.title} — PatchTray`;
    invariant(
      (html.match(/<h1(?:\s|>)/g) ?? []).length === 1,
      `${post.slug} does not contain exactly one H1`,
    );
    invariant(
      html.includes(`<h1>${escapeHtml(post.title)}</h1>`),
      `${post.slug} visible H1 differs from generated content`,
    );
    invariant(
      html.includes(escapeHtml(post.summary)) &&
        html.includes(escapeHtml(post.author.name)) &&
        html.includes(post.html),
      `${post.slug} initial HTML is incomplete`,
    );
    invariant(
      canonicalFrom(html) === post.canonicalUrl,
      `${post.slug} canonical is inaccurate`,
    );
    invariant(
      metaValues(html, "name", "description")[0] === post.summary,
      `${post.slug} meta description differs from the summary`,
    );
    invariant(
      metaValues(html, "property", "og:type")[0] === "article" &&
        metaValues(html, "property", "og:title")[0] === expectedTitle &&
        metaValues(html, "property", "article:published_time")[0] ===
          post.publishedAt &&
        metaValues(html, "property", "article:modified_time")[0] ===
          post.updatedAt &&
        metaValues(html, "property", "article:author")[0] === post.author.url &&
        arraysEqual(
          metaValues(html, "property", "article:tag"),
          post.tags,
        ),
      `${post.slug} article Open Graph metadata differs from visible content`,
    );
    invariant(
      metaValues(html, "name", "robots").length === 0,
      `${post.slug} is unexpectedly noindex`,
    );
    invariant(
      hasFeedAlternate(
        html,
        "PatchTray blog",
        `${canonicalOrigin}/blog/feed.xml`,
      ),
      `${post.slug} does not advertise the Atom feed`,
    );

    const structuredData = structuredDataFrom(html);
    const posting = structuredData.find(
      (item) => item["@type"] === "BlogPosting",
    );
    const breadcrumb = structuredData.find(
      (item) => item["@type"] === "BreadcrumbList",
    );
    invariant(posting, `${post.slug} has no BlogPosting JSON-LD`);
    invariant(breadcrumb, `${post.slug} has no BreadcrumbList JSON-LD`);
    invariant(
      posting.headline === post.title &&
        posting.description === post.summary &&
        posting.author?.name === post.author.name &&
        posting.author?.url === post.author.url &&
        posting.datePublished === post.publishedAt &&
        posting.dateModified === post.updatedAt &&
        posting.mainEntityOfPage === post.canonicalUrl &&
        posting.articleSection === post.category &&
        arraysEqual(asArray(posting.about), post.tags) &&
        posting.keywords === post.tags.join(", "),
      `${post.slug} BlogPosting JSON-LD differs from generated content`,
    );
    const breadcrumbItems = asArray(breadcrumb.itemListElement);
    invariant(
      breadcrumbItems.length === 3 &&
        breadcrumbItems[0]?.item === `${canonicalOrigin}/` &&
        breadcrumbItems[1]?.item === `${canonicalOrigin}/blog` &&
        breadcrumbItems[2]?.item === post.canonicalUrl &&
        breadcrumbItems[2]?.name === post.title,
      `${post.slug} breadcrumb JSON-LD differs from the visible breadcrumb`,
    );

    const socialImage = fallbackSocialImage(post.image);
    invariant(
      metaValues(html, "property", "og:image")[0] ===
        `${canonicalOrigin}${socialImage.url}` &&
        Number(metaValues(html, "property", "og:image:width")[0]) ===
          socialImage.width &&
        Number(metaValues(html, "property", "og:image:height")[0]) ===
          socialImage.height &&
        posting.image?.url === `${canonicalOrigin}${socialImage.url}` &&
        posting.image?.width === socialImage.width &&
        posting.image?.height === socialImage.height,
      `${post.slug} social image metadata is inaccurate`,
    );

    const imageTags = html.match(/<img\b[^>]*>/g) ?? [];
    const leadImage = imageTags.find(
      (tag) => attribute(tag, "alt") === post.image.alt,
    );
    invariant(leadImage, `${post.slug} lead image is absent from initial HTML`);
    invariant(
      Number(attribute(leadImage, "width")) === post.image.width &&
        Number(attribute(leadImage, "height")) === post.image.height,
      `${post.slug} lead image has inaccurate dimensions`,
    );
    for (const media of post.media) {
      for (const variant of media.variants) {
        invariant(
          html.includes(variant.url),
          `${post.slug} HTML omits media variant ${variant.url}`,
        );
      }
    }

    invariant(
      sitemapByUrl.get(post.canonicalUrl) === post.updatedAt,
      `${post.slug} sitemap lastmod is inaccurate`,
    );
    const htmlGzipBytes = gzipBytes(html);
    maximumArticleHtmlBytes = Math.max(maximumArticleHtmlBytes, htmlGzipBytes);
    invariant(
      htmlGzipBytes <= maximumArticleHtmlGzipBytes,
      `${post.slug} compressed HTML is ${htmlGzipBytes} bytes, over ${maximumArticleHtmlGzipBytes}`,
    );
  }
}

const generatedAssets = await listFiles(generatedAssetsDirectory);
const outputBlogAssets = await listFiles(outputBlogAssetsDirectory);
invariant(
  arraysEqual(generatedAssets, outputBlogAssets),
  "deployed blog assets differ from generated assets",
);
const referencedAssetUrls = new Set(
  posts.flatMap((post) =>
    post.media.flatMap((media) =>
      media.variants.map((variant) => variant.url),
    ),
  ),
);
invariant(
  referencedAssetUrls.size === generatedAssets.length,
  "generated assets include an unreferenced or duplicate media file",
);
for (const filename of generatedAssets) {
  const filenameMatch =
    /-\d+-([0-9a-f]{16})\.(?:avif|webp|jpg|png)$/.exec(filename);
  invariant(
    filenameMatch,
    `blog asset ${filename} is not content hashed`,
  );
  invariant(
    referencedAssetUrls.has(`/assets/blog/${filename}`),
    `blog asset ${filename} is not referenced by a post`,
  );
  const [generatedAsset, outputAsset] = await Promise.all([
    readFile(resolve(generatedAssetsDirectory, filename)),
    readFile(resolve(outputBlogAssetsDirectory, filename)),
  ]);
  invariant(
    generatedAsset.equals(outputAsset),
    `deployed blog asset ${filename} differs from its generated source`,
  );
  invariant(
    createHash("sha256").update(generatedAsset).digest("hex").slice(0, 16) ===
      filenameMatch[1],
    `blog asset ${filename} has an inaccurate content hash`,
  );
}

const chunkNames = (await listFiles(outputAssetsDirectory)).filter((name) =>
  name.endsWith(".js"),
);
const chunksByName = new Map(
  await Promise.all(
    chunkNames.map(async (name) => [
      name,
      await readFile(resolve(outputAssetsDirectory, name), "utf8"),
    ]),
  ),
);
const indexHtml = await readFile(resolve(outputDirectory, "index.html"), "utf8");
const sharedEntryUrl =
  /<script type="module"[^>]+src="(\/assets\/index-[^"]+\.js)"/.exec(
    indexHtml,
  )?.[1];
invariant(sharedEntryUrl, "could not identify the shared client entry");
const sharedEntryName = basename(sharedEntryUrl);
const sharedEntry = chunksByName.get(sharedEntryName);
invariant(sharedEntry, "shared client entry is missing");
const sharedClosure = await chunkClosure([sharedEntryName], chunksByName);
const sharedEntryGzipBytes = [...sharedClosure].reduce(
  (total, name) => total + gzipBytes(chunksByName.get(name)),
  0,
);
invariant(
  sharedEntryGzipBytes <= maximumSharedEntryGzipBytes,
  `shared client entry is ${sharedEntryGzipBytes} compressed bytes, over ${maximumSharedEntryGzipBytes}`,
);

const forbiddenClientMarkers = [
  "ZodError",
  "YAMLParseError",
  "rehype-sanitize",
  "remark-parse",
  "node_modules/sharp",
];
const allClientJavaScript = [...chunksByName.values()].join("\n");
for (const marker of forbiddenClientMarkers) {
  invariant(
    !allClientJavaScript.includes(marker),
    `build-only dependency marker "${marker}" appears in client JavaScript`,
  );
}
for (const post of posts) {
  const marker = textMarker(post.html);
  invariant(marker, `${post.slug} has no body marker for chunk verification`);
  invariant(
    !sharedEntry.includes(marker),
    `${post.slug} body appears in the shared client entry`,
  );
}

const blogClientChunk = findChunk(
  chunkNames,
  "blogClient",
  catalog.posts.length > 0,
);
const catalogChunk = findChunk(
  chunkNames,
  "catalog",
  catalog.posts.length > 0,
);
if (catalog.posts.length === 0) {
  invariant(
    !blogClientChunk && !catalogChunk,
    "empty catalog emitted blog data chunks",
  );
} else {
  const blogPageChunk = findChunk(chunkNames, "BlogPage");
  const blogArticlePageChunk = findChunk(chunkNames, "BlogArticlePage");
  const hubClosure = await chunkClosure(
    [blogClientChunk, catalogChunk, blogPageChunk],
    chunksByName,
  );
  const hubJsBytes = [...hubClosure]
    .filter((name) => !sharedClosure.has(name))
    .reduce(
      (total, name) => total + gzipBytes(chunksByName.get(name)),
      0,
    );
  maximumRouteJsBytes = Math.max(maximumRouteJsBytes, hubJsBytes);
  invariant(
    hubJsBytes <= maximumBlogRouteJsGzipBytes,
    `blog hub JavaScript is ${hubJsBytes} compressed bytes, over ${maximumBlogRouteJsGzipBytes}`,
  );

  for (const post of posts) {
    const postChunk = findChunk(chunkNames, post.slug);
    const postChunkSource = chunksByName.get(postChunk);
    const marker = textMarker(post.html);
    invariant(
      postChunkSource.includes(marker),
      `${post.slug} body is absent from its data chunk`,
    );
    const articleClosure = await chunkClosure(
      [blogClientChunk, catalogChunk, blogArticlePageChunk, postChunk],
      chunksByName,
    );
    const articleJsBytes = [...articleClosure]
      .filter((name) => !sharedClosure.has(name))
      .reduce(
      (total, name) => total + gzipBytes(chunksByName.get(name)),
      0,
    );
    maximumRouteJsBytes = Math.max(maximumRouteJsBytes, articleJsBytes);
    invariant(
      articleJsBytes <= maximumBlogRouteJsGzipBytes,
      `${post.slug} JavaScript is ${articleJsBytes} compressed bytes, over ${maximumBlogRouteJsGzipBytes}`,
    );
  }
}

const firstSlug = catalogSlugs[0] ?? "unknown-article";
const notFoundPaths = new Set([
  "/Blog",
  "/blog/",
  "/blog/unknown-article",
  "/blog/unknown-article/nested",
  `/blog/${firstSlug.toUpperCase()}`,
  `/blog/${firstSlug}/nested`,
  "/blog/feed",
  "/blog/page",
  "/blog/tags",
  "/blog/authors",
  "/blog/api",
  "/blog/index",
  "/blog/assets",
  ...draftArticles.map((article) => `/blog/${article.slug}`),
]);
if (catalog.posts.length === 0) notFoundPaths.add("/blog");
for (const pathname of notFoundPaths) {
  invariant(
    server.render(pathname).includes('class="not-found content-width"'),
    `${pathname} does not resolve to the branded not-found page`,
  );
  if (pathname === pathname.toLowerCase()) {
    invariant(
      !(await exists(outputPath(pathname))),
      `${pathname} has an unexpected static document`,
    );
  }
  if (remoteOrigin) await fetchRoute(pathname, 404);
}

if (remoteOrigin && catalog.posts.length > 0) {
  const assetUrl = catalog.posts[0].image.variants[0].url;
  const assetResponse = await fetchRoute(assetUrl, 200);
  invariant(
    /public/i.test(assetResponse.headers.get("cache-control") ?? "") &&
      /immutable/i.test(assetResponse.headers.get("cache-control") ?? ""),
    `${assetUrl} does not have immutable public caching`,
  );
}

const slugHistory = await verifySlugHistory(catalogSlugs);
console.log(
  `[blog:verify] ${remoteOrigin ?? "dist"}: ${catalog.posts.length} published, ${draftArticles.length} draft; ` +
    `HTML max ${maximumArticleHtmlBytes} B gzip; shared JS ${sharedEntryGzipBytes} B gzip; ` +
    `blog route JS max ${maximumRouteJsBytes} B gzip; slug history ${slugHistory}`,
);
