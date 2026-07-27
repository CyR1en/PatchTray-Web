import {
  blogSlugFromPath,
  createBlogArticlePage,
  createBlogHubPage,
  parseBlogCatalog,
  parseBlogPost,
} from "./blogData";
import type { BlogCatalog } from "./blogTypes";
import type {
  ResolvedBlogArticlePage,
  ResolvedBlogHubPage,
} from "./types";

const postLoaders = import.meta.glob("../../.generated/blog/posts/*.json", {
  import: "default",
}) as Record<string, () => Promise<unknown>>;

let catalogPromise: Promise<BlogCatalog> | undefined;

function loadCatalog(): Promise<BlogCatalog> {
  catalogPromise ??= import("../../.generated/blog/catalog.json").then(({ default: artifact }) =>
    parseBlogCatalog(artifact),
  );
  return catalogPromise;
}

async function loadPost(slug: string) {
  const loader = Object.entries(postLoaders).find(([path]) =>
    path.endsWith(`/posts/${slug}.json`),
  )?.[1];
  return loader ? parseBlogPost(await loader(), slug) : undefined;
}

export async function resolveClientBlogPage(
  pathname: string,
): Promise<ResolvedBlogHubPage | ResolvedBlogArticlePage | undefined> {
  const catalog = await loadCatalog();
  if (pathname === "/blog") return createBlogHubPage(catalog);

  const slug = blogSlugFromPath(pathname);
  if (!slug || !catalog.posts.some((entry) => entry.slug === slug)) return undefined;
  const post = await loadPost(slug);
  return post ? createBlogArticlePage(catalog, post) : undefined;
}
