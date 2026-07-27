import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, readdir, rename, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import sharp from "sharp";
import { generateBlog } from "./generator.mjs";

const BUILD_TIME = new Date("2026-07-27T20:00:00.000Z");
const VALID_SUMMARY =
  "This article explains how PatchTray compiles reviewed Markdown into complete static pages without a runtime content service.";
const VALID_ALT =
  "PatchTray signal moving from an ASIO input through a VST3 processor to an output.";

function source({
  body = `
The article begins with a direct explanation of the result and the scope.

## Signal path

The route begins at an ASIO input and continues through a processor.

## Processing result

The browser receives complete HTML from the website build.
`,
  extraFrontmatter = "",
  featured = false,
  image = true,
  publishedAt = "2026-07-26T09:00:00-06:00",
  status = "published",
  summary = VALID_SUMMARY,
  title = "How the PatchTray blog build works",
} = {}) {
  return `---
schemaVersion: 1
title: "${title}"
summary: "${summary}"
${publishedAt ? `publishedAt: "${publishedAt}"\n` : ""}author:
  name: "PatchTray"
  type: "Organization"
  url: "https://www.patchtray.io/"
category: "engineering"
tags:
  - "static generation"
  - "website architecture"
${image ? `image:\n  src: "./hero.png"\n  alt: "${VALID_ALT}"\n` : ""}status: "${status}"
featured: ${featured}
${extraFrontmatter}---
${body.trim()}
`;
}

async function pngBuffer(width = 120, height = 80) {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 102, b: 0 },
    },
  })
    .png()
    .toBuffer();
}

async function workspace(t) {
  const root = await mkdtemp(resolve(tmpdir(), "patchtray-blog-test-"));
  const postsDirectory = resolve(root, "content", "blog", "posts");
  const outputDirectory = resolve(root, ".generated", "blog");
  await mkdir(postsDirectory, { recursive: true });
  t.after(() => rm(root, { recursive: true, force: true }));
  return { outputDirectory, postsDirectory, root };
}

async function writeArticle(postsDirectory, slug, markdown, files = {}) {
  const directory = resolve(postsDirectory, slug);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.md"), markdown, "utf8");
  for (const [filename, contents] of Object.entries(files)) {
    await writeFile(resolve(directory, filename), contents);
  }
  return directory;
}

async function runGenerator(paths, options = {}) {
  return generateBlog({
    ...paths,
    commitSha: options.commitSha,
    includeDrafts: options.includeDrafts,
    now: options.now ?? BUILD_TIME,
  });
}

async function expectFailure(t, { files = {}, markdown, slug = "valid-article" }, pattern) {
  const paths = await workspace(t);
  await writeArticle(paths.postsDirectory, slug, markdown, files);
  await assert.rejects(() => runGenerator(paths), pattern);
}

test("generates only published catalog and post artifacts with responsive media", async (t) => {
  const paths = await workspace(t);
  const hero = await pngBuffer();
  await writeArticle(
    paths.postsDirectory,
    "published-article",
    source({
      featured: true,
      body: `
The article begins with a direct explanation of the result and the scope.

## Signal path

![${VALID_ALT}](./hero.png)

The route begins at an ASIO input and continues through a processor.

## Processing result

The browser receives complete HTML from the website build. Read the
[PatchTray guide](/guide) for the maintained setup workflow.

## Build boundary

\`\`\`js
const runtimeContentRequest = false;
\`\`\`
`,
    }),
    { "hero.png": hero },
  );
  await writeArticle(
    paths.postsDirectory,
    "draft-article",
    source({
      status: "draft",
      publishedAt: "",
      image: false,
      title: "How a draft stays out of generated routes",
    }),
  );

  const result = await runGenerator(paths, { commitSha: "0123456789abcdef" });
  assert.equal(result.publishedCount, 1);
  assert.equal(result.draftCount, 1);
  assert.equal(result.featuredSlug, "published-article");
  assert.deepEqual(result.publishedSlugs, ["published-article"]);

  const catalog = JSON.parse(await readFile(resolve(paths.outputDirectory, "catalog.json"), "utf8"));
  const manifest = JSON.parse(await readFile(resolve(paths.outputDirectory, "manifest.json"), "utf8"));
  const post = JSON.parse(
    await readFile(resolve(paths.outputDirectory, "posts", "published-article.json"), "utf8"),
  );

  assert.equal(catalog.posts.length, 1);
  assert.equal(catalog.posts[0].slug, "published-article");
  assert.equal(manifest.commitSha, "0123456789abcdef");
  assert.equal(manifest.publishedCount, 1);
  assert.equal(manifest.draftCount, 1);
  assert.equal(manifest.preview, false);
  assert.equal(manifest.previewCount, 0);
  assert.match(manifest.contentDigest, /^[0-9a-f]{64}$/);
  assert.match(post.html, /<h2 id="section-signal-path">Signal path<\/h2>/);
  assert.match(post.html, /<picture>/);
  assert.match(post.html, /href="\/guide"/);
  assert.match(post.html, /class="hljs language-js"/);
  assert.equal(post.tableOfContents.length, 3);
  assert.equal(post.media.length, 1);
  assert.equal(post.image.width, 120);
  assert.equal(post.image.height, 80);

  const assets = await readdir(resolve(paths.outputDirectory, "assets"));
  assert.equal(assets.length, 3);
  assert(assets.some((filename) => filename.endsWith(".avif")));
  assert(assets.some((filename) => filename.endsWith(".webp")));
  assert(assets.some((filename) => filename.endsWith(".jpg")));
  await assert.rejects(
    () => access(resolve(paths.outputDirectory, "posts", "draft-article.json")),
    /ENOENT/,
  );
});

test("emits incomplete drafts only for an explicit local preview", async (t) => {
  const paths = await workspace(t);
  await writeArticle(
    paths.postsDirectory,
    "draft-preview",
    source({
      featured: true,
      image: false,
      publishedAt: "",
      status: "draft",
      title: "How local draft previews stay out of production",
    }),
  );

  const previewResult = await runGenerator(paths, { includeDrafts: true });
  const previewCatalog = JSON.parse(
    await readFile(resolve(paths.outputDirectory, "catalog.json"), "utf8"),
  );
  const previewManifest = JSON.parse(
    await readFile(resolve(paths.outputDirectory, "manifest.json"), "utf8"),
  );
  const previewPost = JSON.parse(
    await readFile(
      resolve(paths.outputDirectory, "posts", "draft-preview.json"),
      "utf8",
    ),
  );

  assert.equal(previewResult.publishedCount, 0);
  assert.equal(previewResult.previewCount, 1);
  assert.equal(previewCatalog.featuredSlug, "draft-preview");
  assert.equal(previewCatalog.posts.length, 1);
  assert.equal(previewCatalog.posts[0].preview, true);
  assert.equal(
    previewCatalog.posts[0].publishedAt,
    BUILD_TIME.toISOString(),
  );
  assert.equal(
    previewCatalog.posts[0].image.source,
    "[draft preview fallback]",
  );
  assert.equal(previewPost.preview, true);
  assert.match(previewPost.html, /section-signal-path/);
  assert.equal(previewManifest.preview, true);
  assert.equal(previewManifest.previewCount, 1);
  assert.deepEqual(await readdir(resolve(paths.outputDirectory, "assets")), []);

  const productionResult = await runGenerator(paths);
  const productionCatalog = JSON.parse(
    await readFile(resolve(paths.outputDirectory, "catalog.json"), "utf8"),
  );
  const productionManifest = JSON.parse(
    await readFile(resolve(paths.outputDirectory, "manifest.json"), "utf8"),
  );
  assert.equal(productionResult.previewCount, 0);
  assert.equal(productionCatalog.posts.length, 0);
  assert.equal(productionManifest.preview, false);
  await assert.rejects(
    () =>
      access(
        resolve(paths.outputDirectory, "posts", "draft-preview.json"),
      ),
    /ENOENT/,
  );
});

test("keeps the previous generated output when a later generation fails", async (t) => {
  const paths = await workspace(t);
  const articleDirectory = await writeArticle(
    paths.postsDirectory,
    "stable-article",
    source(),
    { "hero.png": await pngBuffer() },
  );

  await runGenerator(paths);
  const previousManifest = await readFile(resolve(paths.outputDirectory, "manifest.json"), "utf8");
  await writeFile(
    resolve(articleDirectory, "index.md"),
    source({ extraFrontmatter: "unknownField: true\n" }),
    "utf8",
  );

  await assert.rejects(() => runGenerator(paths), /unrecognized key|unknownField/i);
  assert.equal(
    await readFile(resolve(paths.outputDirectory, "manifest.json"), "utf8"),
    previousManifest,
  );
});

test("replaces updated, renamed, and deleted publication artifacts without stale routes", async (t) => {
  const paths = await workspace(t);
  const articleDirectory = await writeArticle(
    paths.postsDirectory,
    "original-article",
    source(),
    { "hero.png": await pngBuffer() },
  );

  const initial = await runGenerator(paths);
  const updatedAt = "2026-07-27T08:00:00-06:00";
  await writeFile(
    resolve(articleDirectory, "index.md"),
    source({
      extraFrontmatter: `updatedAt: "${updatedAt}"\n`,
      body: `
The materially updated article states its changed result before the detail.

## Signal path

The updated route begins at an ASIO input and continues through a processor.

## Processing result

The rebuilt page contains the current reviewed article body.
`,
    }),
    "utf8",
  );
  const updated = await runGenerator(paths);
  const updatedPost = JSON.parse(
    await readFile(
      resolve(paths.outputDirectory, "posts", "original-article.json"),
      "utf8",
    ),
  );
  assert.notEqual(updated.contentDigest, initial.contentDigest);
  assert.equal(updatedPost.updatedAt, updatedAt);
  assert.match(updatedPost.html, /materially updated article/);

  const renamedDirectory = resolve(paths.postsDirectory, "renamed-article");
  await rename(articleDirectory, renamedDirectory);
  const renamed = await runGenerator(paths);
  assert.deepEqual(renamed.publishedSlugs, ["renamed-article"]);
  await access(
    resolve(paths.outputDirectory, "posts", "renamed-article.json"),
  );
  await assert.rejects(
    () =>
      access(resolve(paths.outputDirectory, "posts", "original-article.json")),
    /ENOENT/,
  );

  await rm(renamedDirectory, { recursive: true });
  const deleted = await runGenerator(paths);
  assert.equal(deleted.publishedCount, 0);
  assert.deepEqual(deleted.publishedSlugs, []);
  assert.deepEqual(
    await readdir(resolve(paths.outputDirectory, "posts")),
    [],
  );
});

test("rejects unknown frontmatter keys", async (t) => {
  await expectFailure(
    t,
    {
      markdown: source({ extraFrontmatter: "titel: \"misspelled\"\n" }),
      files: { "hero.png": await pngBuffer() },
    },
    /unrecognized key|titel/i,
  );
});

test("rejects YAML anchors and aliases", async (t) => {
  await expectFailure(
    t,
    {
      markdown: source().replace(
        'title: "How the PatchTray blog build works"',
        'title: &articleTitle "How the PatchTray blog build works"',
      ),
      files: { "hero.png": await pngBuffer() },
    },
    /anchors and aliases are not allowed/i,
  );
});

test("rejects raw HTML and body H1 headings", async (t) => {
  await expectFailure(
    t,
    {
      markdown: source({
        body: `
The introduction is visible.

<iframe src="https://example.com"></iframe>

# An invalid heading

## A valid section

Text.
`,
      }),
      files: { "hero.png": await pngBuffer() },
    },
    /unsupported Markdown node "html"|H2 through H4/i,
  );
});

test("rejects duplicate heading anchors", async (t) => {
  await expectFailure(
    t,
    {
      markdown: source({
        body: `
The introduction is visible.

## Signal path

First.

## Signal path!

Second.
`,
      }),
      files: { "hero.png": await pngBuffer() },
    },
    /duplicate anchor/i,
  );
});

test("rejects remote images and unsafe links", async (t) => {
  await expectFailure(
    t,
    {
      markdown: source({
        body: `
The introduction is visible.

## Signal path

![A remote image that must not be accepted.](https://example.com/image.png)

[Unsafe destination](javascript:alert(1))
`,
      }),
      files: { "hero.png": await pngBuffer() },
    },
    /local filename|must use HTTPS/i,
  );
});

test("rejects published timestamps in the future", async (t) => {
  await expectFailure(
    t,
    {
      markdown: source({ publishedAt: "2026-07-28T09:00:00-06:00" }),
      files: { "hero.png": await pngBuffer() },
    },
    /may not be in the future/i,
  );
});

test("rejects multiple featured published articles", async (t) => {
  const paths = await workspace(t);
  const hero = await pngBuffer();
  await writeArticle(paths.postsDirectory, "first-article", source({ featured: true }), {
    "hero.png": hero,
  });
  await writeArticle(
    paths.postsDirectory,
    "second-article",
    source({ featured: true, title: "How a second featured article is rejected" }),
    { "hero.png": hero },
  );

  await assert.rejects(() => runGenerator(paths), /only one published article may be featured/i);
});

test("rejects missing, traversing, and mismatched image files", async (t) => {
  await expectFailure(
    t,
    { markdown: source(), files: {} },
    /referenced image "\.\/hero\.png" does not exist/i,
  );

  await expectFailure(
    t,
    {
      markdown: source().replace('./hero.png', "../hero.png"),
      files: { "hero.png": await pngBuffer() },
    },
    /filename in the article directory/i,
  );

  await expectFailure(
    t,
    {
      markdown: source().replaceAll("hero.png", "hero.jpg"),
      files: { "hero.jpg": await pngBuffer() },
    },
    /decoded png data does not match \.jpg/i,
  );
});

test("rejects symlinked article files", async (t) => {
  const paths = await workspace(t);
  const articleDirectory = await writeArticle(
    paths.postsDirectory,
    "symlink-article",
    source({ status: "draft", publishedAt: "", image: false }),
  );
  await writeFile(resolve(paths.root, "outside.png"), await pngBuffer());
  await symlink(resolve(paths.root, "outside.png"), resolve(articleDirectory, "hero.png"));

  await assert.rejects(() => runGenerator(paths), /may not contain symlinks/i);
});

test("accepts each documented static source image format", async (t) => {
  const paths = await workspace(t);
  const image = sharp({
    create: {
      width: 80,
      height: 50,
      channels: 3,
      background: { r: 15, g: 14, b: 18 },
    },
  });
  const files = {
    "source.avif": await image.clone().avif().toBuffer(),
    "source.jpg": await image.clone().jpeg().toBuffer(),
    "source.png": await image.clone().png().toBuffer(),
    "source.webp": await image.clone().webp().toBuffer(),
  };
  await writeArticle(
    paths.postsDirectory,
    "source-format-draft",
    source({
      status: "draft",
      publishedAt: "",
      image: false,
      body: `
The draft verifies every documented static source format before publication.

## Supported source images

![A dark sample image encoded as AVIF for format validation.](./source.avif)
![A dark sample image encoded as JPEG for format validation.](./source.jpg)
![A dark sample image encoded as PNG for format validation.](./source.png)
![A dark sample image encoded as WebP for format validation.](./source.webp)
`,
    }),
    files,
  );

  const result = await runGenerator(paths);
  assert.equal(result.publishedCount, 0);
  assert.equal(result.draftCount, 1);
});
