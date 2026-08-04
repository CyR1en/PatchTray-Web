import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, extname, relative, resolve } from "node:path";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  BLOG_SCHEMA_VERSION,
  CANONICAL_ORIGIN,
  GENERATOR_SCHEMA_VERSION,
  MAX_MARKDOWN_BYTES,
  RESERVED_SLUGS,
} from "./config.mjs";
import { assertBlog, BlogValidationError } from "./errors.mjs";
import { processArticleMedia } from "./images.mjs";
import {
  analyzeMarkdown,
  compileMarkdown,
  validateArticleLinks,
} from "./markdown.mjs";
import { splitArticleSource } from "./source.mjs";

const PREVIEW_IMAGE = {
  alt: "Draft preview using the PatchTray canvas because no lead image has been assigned.",
  fallbackFormat: "png",
  height: 1073,
  source: "[draft preview fallback]",
  variants: [
    {
      format: "avif",
      height: 590,
      url: "/assets/patchtray-canvas-960.avif",
      width: 960,
    },
    {
      format: "avif",
      height: 1073,
      url: "/assets/patchtray-canvas-1745.avif",
      width: 1745,
    },
    {
      format: "webp",
      height: 591,
      url: "/assets/patchtray-canvas-960.webp",
      width: 960,
    },
    {
      format: "webp",
      height: 1073,
      url: "/assets/patchtray-canvas-1745.webp",
      width: 1745,
    },
    {
      format: "png",
      height: 1073,
      url: "/assets/patchtray-canvas.png",
      width: 1745,
    },
  ],
  width: 1745,
};

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function lexicalCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function validateSlug(slug) {
  assertBlog(
    slug.length >= 3 && slug.length <= 80,
    "slug must be between 3 and 80 characters",
    slug,
  );
  assertBlog(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
    "slug must contain lowercase ASCII letters, numbers, and single hyphens",
    slug,
  );
  assertBlog(!RESERVED_SLUGS.has(slug), "slug is reserved", slug);
}

async function readDirectory(path, sourceName) {
  try {
    return await readdir(path, { withFileTypes: true });
  } catch (error) {
    throw new BlogValidationError(
      `content directory could not be read (${error instanceof Error ? error.message : String(error)})`,
      sourceName,
    );
  }
}

async function loadArticleDirectories(postsDirectory, now) {
  const entries = await readDirectory(postsDirectory, "content/blog/posts");
  const articles = [];

  for (const entry of [...entries].sort((left, right) => lexicalCompare(left.name, right.name))) {
    if (entry.name.startsWith(".")) continue;
    assertBlog(!entry.isSymbolicLink(), "unexpected symlink in posts directory", entry.name);
    assertBlog(entry.isDirectory(), "posts directory may contain only article directories", entry.name);
    validateSlug(entry.name);

    const slug = entry.name;
    const articleDirectory = resolve(postsDirectory, slug);
    const sourceName = `content/blog/posts/${slug}/index.md`;
    const articleEntries = await readDirectory(articleDirectory, `content/blog/posts/${slug}`);
    const names = new Set();
    const mediaFiles = [];

    for (const articleEntry of articleEntries) {
      if (articleEntry.name.startsWith(".")) continue;
      assertBlog(!articleEntry.isSymbolicLink(), "article directories may not contain symlinks", `${slug}/${articleEntry.name}`);
      assertBlog(articleEntry.isFile(), "article directories may not contain nested directories", `${slug}/${articleEntry.name}`);
      assertBlog(!names.has(articleEntry.name), `duplicate article file "${articleEntry.name}"`, slug);
      names.add(articleEntry.name);

      if (articleEntry.name === "index.md") continue;
      const extension = extname(articleEntry.name).toLowerCase();
      assertBlog(
        ACCEPTED_IMAGE_EXTENSIONS.has(extension),
        `unexpected or unsupported article file "${articleEntry.name}"`,
        slug,
      );
      mediaFiles.push(articleEntry.name);
    }

    assertBlog(names.has("index.md"), "article directory must contain index.md", slug);
    const sourcePath = resolve(articleDirectory, "index.md");
    const sourceStat = await stat(sourcePath);
    assertBlog(sourceStat.size <= MAX_MARKDOWN_BYTES, "index.md exceeds the 100 KiB limit", sourceName);
    const sourceBuffer = await readFile(sourcePath);
    let sourceText;
    try {
      sourceText = new TextDecoder("utf-8", { fatal: true }).decode(sourceBuffer);
    } catch {
      throw new BlogValidationError("index.md must contain valid UTF-8", sourceName);
    }
    const { frontmatter, body } = splitArticleSource(sourceText, sourceName);
    const analysis = analyzeMarkdown(body, sourceName);

    if (frontmatter.status === "published") {
      assertBlog(
        Date.parse(frontmatter.publishedAt) <= now.getTime(),
        "publishedAt may not be in the future",
        sourceName,
      );
    }

    const referencedMedia = new Set(analysis.referencedMedia);
    if (frontmatter.image) referencedMedia.add(frontmatter.image.src);

    articles.push({
      analysis,
      articleDirectory,
      body,
      frontmatter,
      mediaFiles: mediaFiles.sort(lexicalCompare),
      referencedMedia,
      slug,
      sourceBuffer,
      sourceName,
    });
  }

  return articles;
}

async function contentDigest(articles, postsDirectory) {
  const files = [];
  for (const article of articles) {
    files.push({
      path: relative(postsDirectory, resolve(article.articleDirectory, "index.md")).replaceAll("\\", "/"),
      buffer: article.sourceBuffer,
    });
    for (const filename of article.mediaFiles) {
      files.push({
        path: relative(postsDirectory, resolve(article.articleDirectory, filename)).replaceAll("\\", "/"),
        buffer: await readFile(resolve(article.articleDirectory, filename)),
      });
    }
  }
  files.sort((left, right) => lexicalCompare(left.path, right.path));

  const hash = createHash("sha256");
  hash.update(`blog-generator-schema:${GENERATOR_SCHEMA_VERSION}\0`);
  for (const file of files) {
    hash.update(file.path);
    hash.update("\0");
    hash.update(String(file.buffer.byteLength));
    hash.update("\0");
    hash.update(file.buffer);
    hash.update("\0");
  }
  return hash.digest("hex");
}

function resolvedImage(image, mediaBySource) {
  if (!image) return undefined;
  const media = mediaBySource.get(image.src);
  assertBlog(media, `lead image "${image.src}" was not processed`);
  return { ...media, alt: image.alt };
}

function publicArticle(article, previewDate) {
  const preview = article.frontmatter.status === "draft";
  const publishedAt = article.frontmatter.publishedAt ?? previewDate;
  return {
    author: article.frontmatter.author,
    canonicalUrl: `${CANONICAL_ORIGIN}/blog/${article.slug}`,
    category: article.frontmatter.category,
    featured: article.frontmatter.featured,
    image: article.image ?? PREVIEW_IMAGE,
    path: `/blog/${article.slug}`,
    publishedAt,
    ...(preview ? { preview: true } : {}),
    readingTime: `${article.analysis.readingTimeMinutes} min read`,
    readingTimeMinutes: article.analysis.readingTimeMinutes,
    slug: article.slug,
    summary: article.frontmatter.summary,
    tags: article.frontmatter.tags,
    title: article.frontmatter.title,
    updatedAt: article.frontmatter.updatedAt ?? publishedAt,
  };
}

function publicationOrder(left, right) {
  const leftTime = Date.parse(
    left.frontmatter.updatedAt ?? left.frontmatter.publishedAt ?? "",
  );
  const rightTime = Date.parse(
    right.frontmatter.updatedAt ?? right.frontmatter.publishedAt ?? "",
  );
  const dateOrder =
    (Number.isFinite(rightTime) ? rightTime : 0) -
    (Number.isFinite(leftTime) ? leftTime : 0);
  return dateOrder || lexicalCompare(left.slug, right.slug);
}

function relatedSlugs(article, published) {
  const articleTags = new Set(article.frontmatter.tags.map((tag) => tag.toLocaleLowerCase("en-US")));
  return published
    .filter((candidate) => candidate.slug !== article.slug)
    .map((candidate) => ({
      article: candidate,
      sharedTags: candidate.frontmatter.tags.reduce(
        (count, tag) => count + Number(articleTags.has(tag.toLocaleLowerCase("en-US"))),
        0,
      ),
    }))
    .filter((candidate) => candidate.sharedTags > 0)
    .sort(
      (left, right) =>
        right.sharedTags - left.sharedTags ||
        publicationOrder(left.article, right.article),
    )
    .slice(0, 3)
    .map((candidate) => candidate.article.slug);
}

function postArtifact(article, visibleArticles, previewDate) {
  const h2Headings = article.analysis.headings.filter((heading) => heading.depth === 2);
  return {
    schemaVersion: BLOG_SCHEMA_VERSION,
    ...publicArticle(article, previewDate),
    headings: article.analysis.headings.map(({ baseSlug: _baseSlug, ...heading }) => heading),
    html: article.html,
    media: [...article.mediaBySource.values()],
    relatedSlugs: relatedSlugs(article, visibleArticles),
    tableOfContents:
      h2Headings.length >= 3
        ? h2Headings.map(({ baseSlug: _baseSlug, depth: _depth, ...heading }) => heading)
        : [],
  };
}

function safeCommitSha(value) {
  return typeof value === "string" && /^[0-9a-f]{7,64}$/i.test(value) ? value : null;
}

async function replaceGeneratedDirectory(temporaryDirectory, outputDirectory) {
  const backupDirectory = `${outputDirectory}.previous-${process.pid}`;
  let movedPrevious = false;
  await rm(backupDirectory, { recursive: true, force: true });

  try {
    try {
      await rename(outputDirectory, backupDirectory);
      movedPrevious = true;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    await rename(temporaryDirectory, outputDirectory);
    if (movedPrevious) await rm(backupDirectory, { recursive: true, force: true });
  } catch (error) {
    if (movedPrevious) {
      try {
        await rename(backupDirectory, outputDirectory);
      } catch {
        // Preserve the original failure; the backup remains beside the target.
      }
    }
    throw error;
  }
}

export async function generateBlog({
  commitSha = process.env.VERCEL_GIT_COMMIT_SHA,
  includeDrafts = false,
  now = new Date(),
  outputDirectory,
  postsDirectory,
} = {}) {
  assertBlog(postsDirectory, "postsDirectory is required");
  assertBlog(outputDirectory, "outputDirectory is required");
  assertBlog(typeof includeDrafts === "boolean", "includeDrafts must be a boolean");
  assertBlog(now instanceof Date && Number.isFinite(now.getTime()), "now must be a valid Date");

  const resolvedPostsDirectory = resolve(postsDirectory);
  const resolvedOutputDirectory = resolve(outputDirectory);
  assertBlog(
    resolvedOutputDirectory !== "/" && basename(resolvedOutputDirectory).length > 0,
    "refusing to use an unsafe generated output directory",
  );

  const articles = await loadArticleDirectories(resolvedPostsDirectory, now);
  const articlesBySlug = new Map();
  for (const article of articles) {
    assertBlog(!articlesBySlug.has(article.slug), `duplicate slug "${article.slug}"`);
    articlesBySlug.set(article.slug, article);
  }

  const featured = articles.filter(
    (article) => article.frontmatter.status === "published" && article.frontmatter.featured,
  );
  assertBlog(featured.length <= 1, "only one published article may be featured");
  const previewFeatured = includeDrafts
    ? articles.filter(
        (article) =>
          article.frontmatter.status === "draft" &&
          article.frontmatter.featured,
      )
    : [];
  assertBlog(
    previewFeatured.length <= 1,
    "only one draft article may be featured in preview mode",
  );

  for (const article of articles) validateArticleLinks(article, articlesBySlug);

  const digest = await contentDigest(articles, resolvedPostsDirectory);
  const temporaryDirectory = resolve(
    dirname(resolvedOutputDirectory),
    `.${basename(resolvedOutputDirectory)}.tmp-${process.pid}-${Date.now()}`,
  );
  const assetsDirectory = resolve(temporaryDirectory, "assets");
  const postsOutputDirectory = resolve(temporaryDirectory, "posts");
  await rm(temporaryDirectory, { recursive: true, force: true });
  await mkdir(assetsDirectory, { recursive: true });
  await mkdir(postsOutputDirectory, { recursive: true });

  try {
    for (const article of articles) {
      const isPublished = article.frontmatter.status === "published";
      article.mediaBySource = await processArticleMedia({
        articleDirectory: article.articleDirectory,
        articleSlug: article.slug,
        emit: isPublished || includeDrafts,
        mediaFiles: article.mediaFiles,
        outputAssetsDirectory: assetsDirectory,
        referencedMedia: article.referencedMedia,
        sourceName: article.sourceName,
      });
      article.image = resolvedImage(article.frontmatter.image, article.mediaBySource);
      article.html = await compileMarkdown(article.analysis, article.mediaBySource, article.sourceName);
    }

    const published = articles
      .filter((article) => article.frontmatter.status === "published")
      .sort(publicationOrder);
    const drafts = articles
      .filter((article) => article.frontmatter.status === "draft")
      .sort(publicationOrder);
    const visibleArticles = includeDrafts
      ? [...drafts, ...published]
      : published;
    const previewDate = now.toISOString();
    const featuredSlug =
      previewFeatured[0]?.slug ??
      featured[0]?.slug ??
      visibleArticles[0]?.slug ??
      null;

    for (const article of visibleArticles) {
      await writeFile(
        resolve(postsOutputDirectory, `${article.slug}.json`),
        json(postArtifact(article, visibleArticles, previewDate)),
        "utf8",
      );
    }

    const catalog = {
      schemaVersion: BLOG_SCHEMA_VERSION,
      featuredSlug,
      posts: visibleArticles.map((article) =>
        publicArticle(article, previewDate),
      ),
    };
    const manifest = {
      schemaVersion: GENERATOR_SCHEMA_VERSION,
      generatedAt: now.toISOString(),
      commitSha: safeCommitSha(commitSha),
      contentDigest: digest,
      publishedCount: published.length,
      draftCount: articles.length - published.length,
      preview: includeDrafts,
      previewCount: includeDrafts ? drafts.length : 0,
    };

    await writeFile(resolve(temporaryDirectory, "catalog.json"), json(catalog), "utf8");
    await writeFile(resolve(temporaryDirectory, "manifest.json"), json(manifest), "utf8");
    await replaceGeneratedDirectory(temporaryDirectory, resolvedOutputDirectory);

    return {
      contentDigest: digest,
      draftCount: manifest.draftCount,
      featuredSlug,
      outputDirectory: resolvedOutputDirectory,
      publishedCount: manifest.publishedCount,
      publishedSlugs: published.map((article) => article.slug),
      previewCount: manifest.previewCount,
    };
  } catch (error) {
    await rm(temporaryDirectory, { recursive: true, force: true });
    throw error;
  }
}
