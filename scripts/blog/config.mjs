export const BLOG_SCHEMA_VERSION = 1;
export const GENERATOR_SCHEMA_VERSION = 1;

export const RESERVED_SLUGS = new Set([
  "api",
  "assets",
  "authors",
  "feed",
  "index",
  "page",
  "tags",
]);

export const CATEGORY_VALUES = [
  "product",
  "workflow",
  "engineering",
  "release",
  "company",
];

export const ACCEPTED_IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
]);

export const MAX_MARKDOWN_BYTES = 100 * 1024;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_ARTICLE_MEDIA_BYTES = 24 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 8_192;
export const MAX_AST_DEPTH = 64;
export const MAX_AST_NODES = 10_000;
export const RESPONSIVE_WIDTHS = [640, 960, 1_600];
export const READING_WORDS_PER_MINUTE = 200;

/**
 * Mirrors the canonical route table in src/lib/routes.ts so article generation
 * fails broken internal links before the browser or deployment sees them.
 */
export const FIXED_SITE_PATHS = new Set([
  "/",
  "/blog",
  "/blog/feed.xml",
  "/checkout/success",
  "/concepts",
  "/download",
  "/faq",
  "/guide",
  "/guides",
  "/guides/feed.xml",
  "/guides/run-vst3-without-daw",
  "/guides/voicemeeter-vst3-plugins",
  "/privacy",
  "/refunds",
  "/support",
  "/terms",
]);

export const CANONICAL_ORIGIN = "https://www.patchtray.io";
