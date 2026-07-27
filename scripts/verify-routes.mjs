import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const serverEntry = resolve(projectRoot, "dist-ssr", "entry-server.js");
const { getStaticPages, render } = await import(
  `${pathToFileURL(serverEntry).href}?t=${Date.now()}`
);

function assert(condition, message) {
  if (!condition) throw new Error(`[verify:routes] ${message}`);
}

const pages = getStaticPages();
const paths = pages.map((page) => page.path);
assert(new Set(paths).size === paths.length, "static page paths are not unique");

for (const path of paths) {
  const html = render(path);
  assert(
    !html.includes('class="not-found content-width"'),
    `canonical route ${path} resolved to the not-found page`,
  );
}

const blogPaths = paths.filter((path) => path === "/blog" || path.startsWith("/blog/"));
const strictNotFoundPaths = [
  "/Download",
  "/download/",
  "/guides/run-vst3-without-daw/nested",
  "/Blog",
  "/blog/",
  "/blog/unknown-article",
  "/blog/unknown-article/nested",
];
if (blogPaths.length === 0) strictNotFoundPaths.push("/blog");

for (const path of strictNotFoundPaths) {
  const html = render(path);
  assert(
    html.includes('class="not-found content-width"'),
    `unknown or non-canonical path ${path} did not resolve to not found`,
  );
}

console.log(
  `[verify:routes] ${paths.length} canonical routes (${blogPaths.length} blog) and ${strictNotFoundPaths.length} strict not-found variants verified`,
);
