import catalogArtifact from "../../.generated/blog/catalog.json";
import {
  blogSlugFromPath,
  createBlogArticlePage,
  createBlogHubPage,
  parseBlogCatalog,
  parseBlogPost,
} from "./blogData";
import type { BlogPost } from "./blogTypes";
import type {
  ResolvedBlogArticlePage,
  ResolvedBlogHubPage,
} from "./types";

const catalog = parseBlogCatalog(catalogArtifact);
const postArtifacts = import.meta.glob("../../.generated/blog/posts/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

function postArtifactForSlug(slug: string): BlogPost | undefined {
  const artifact = Object.entries(postArtifacts).find(([path]) =>
    path.endsWith(`/posts/${slug}.json`),
  )?.[1];
  return artifact === undefined ? undefined : parseBlogPost(artifact, slug);
}

export function resolveServerBlogPage(
  pathname: string,
): ResolvedBlogHubPage | ResolvedBlogArticlePage | undefined {
  if (pathname === "/blog") return createBlogHubPage(catalog);

  const slug = blogSlugFromPath(pathname);
  if (!slug || !catalog.posts.some((entry) => entry.slug === slug)) return undefined;
  const post = postArtifactForSlug(slug);
  return post ? createBlogArticlePage(catalog, post) : undefined;
}
