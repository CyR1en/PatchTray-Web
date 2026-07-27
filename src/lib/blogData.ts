import type {
  BlogCatalog,
  BlogCatalogEntry,
  BlogPost,
} from "./blogTypes";
import type {
  ResolvedBlogArticlePage,
  ResolvedBlogHubPage,
} from "./types";

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`[blog:data] ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateCatalogEntry(value: unknown, index: number): asserts value is BlogCatalogEntry {
  invariant(isRecord(value), `catalog post ${index} must be an object`);
  invariant(typeof value.slug === "string", `catalog post ${index} has no slug`);
  invariant(value.path === `/blog/${value.slug}`, `catalog post ${value.slug} has an invalid path`);
  invariant(typeof value.title === "string", `catalog post ${value.slug} has no title`);
  invariant(typeof value.summary === "string", `catalog post ${value.slug} has no summary`);
  invariant(typeof value.publishedAt === "string", `catalog post ${value.slug} has no publication time`);
  invariant(
    value.preview === undefined || value.preview === true,
    `catalog post ${value.slug} has an invalid preview marker`,
  );
  invariant(isRecord(value.image), `catalog post ${value.slug} has no image`);
  invariant(Array.isArray(value.image.variants), `catalog post ${value.slug} has no image variants`);
}

export function parseBlogCatalog(value: unknown): BlogCatalog {
  invariant(isRecord(value), "catalog must be an object");
  invariant(value.schemaVersion === 1, "catalog schemaVersion must be 1");
  invariant(
    value.featuredSlug === null || typeof value.featuredSlug === "string",
    "catalog featuredSlug is invalid",
  );
  invariant(Array.isArray(value.posts), "catalog posts must be an array");
  value.posts.forEach(validateCatalogEntry);

  const slugs = value.posts.map((post) => post.slug);
  invariant(new Set(slugs).size === slugs.length, "catalog contains duplicate slugs");
  if (value.featuredSlug !== null) {
    invariant(slugs.includes(value.featuredSlug), "catalog featuredSlug does not identify a post");
  }
  return value as BlogCatalog;
}

export function parseBlogPost(value: unknown, expectedSlug: string): BlogPost {
  invariant(isRecord(value), `post ${expectedSlug} must be an object`);
  invariant(value.schemaVersion === 1, `post ${expectedSlug} schemaVersion must be 1`);
  invariant(value.slug === expectedSlug, `post artifact does not match slug ${expectedSlug}`);
  invariant(typeof value.html === "string" && value.html.length > 0, `post ${expectedSlug} has no HTML`);
  invariant(Array.isArray(value.headings), `post ${expectedSlug} has no headings`);
  invariant(Array.isArray(value.relatedSlugs), `post ${expectedSlug} has no related slugs`);
  invariant(Array.isArray(value.tableOfContents), `post ${expectedSlug} has no table of contents`);
  validateCatalogEntry(value, 0);
  return value as BlogPost;
}

export function blogSlugFromPath(pathname: string): string | undefined {
  return /^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(pathname)?.[1];
}

export function createBlogHubPage(catalog: BlogCatalog): ResolvedBlogHubPage | undefined {
  if (catalog.posts.length === 0) return undefined;
  return {
    kind: "blogHub",
    page: "blog",
    path: "/blog",
    catalog,
  };
}

export function createBlogArticlePage(
  catalog: BlogCatalog,
  post: BlogPost,
): ResolvedBlogArticlePage {
  const postsBySlug = new Map(catalog.posts.map((entry) => [entry.slug, entry]));
  return {
    kind: "blogArticle",
    page: "blogArticle",
    path: post.path,
    post,
    relatedPosts: post.relatedSlugs
      .map((slug) => postsBySlug.get(slug))
      .filter((entry): entry is BlogCatalogEntry => entry !== undefined)
      .slice(0, 3),
  };
}
