import type { ComponentType } from "react";
import type {
  BlogCatalog,
  BlogCatalogEntry,
  BlogPost,
} from "./blogTypes";

/**
 * Every page the site can render. Used for nav highlighting (`PageFrame`),
 * metadata lookup (`pageMeta`), component loading, and resolved page models.
 */
export type PageName =
  | "home"
  | "download"
  | "pricing"
  | "firstVst3ChainGuide"
  | "guides"
  | "faq"
  | "voicemeeterVst3Guide"
  | "vst3WithoutDawGuide"
  | "privacy"
  | "terms"
  | "refunds"
  | "support"
  | "checkoutSuccess"
  | "concepts"
  | "blog"
  | "blogArticle"
  | "notFound";

export type FixedPageName = Exclude<PageName, "blog" | "blogArticle" | "notFound">;

export type ResolvedBlogHubPage = {
  kind: "blogHub";
  page: "blog";
  path: "/blog";
  catalog: BlogCatalog;
};

export type ResolvedBlogArticlePage = {
  kind: "blogArticle";
  page: "blogArticle";
  path: string;
  post: BlogPost;
  relatedPosts: BlogCatalogEntry[];
};

/**
 * The router resolves data before selecting a component. Blog hub and article
 * variants carry generated content without returning to a PageName-only
 * routing contract.
 */
export type ResolvedPage =
  | {
      kind: "fixed";
      page: FixedPageName;
      path: string;
    }
  | {
      kind: "notFound";
      page: "notFound";
      path: "/404";
      requestedPath: string;
    }
  | ResolvedBlogHubPage
  | ResolvedBlogArticlePage;

export type PageComponentProps = {
  resolvedPage: ResolvedPage;
};

export type PageComponent = ComponentType<PageComponentProps>;

export type Point = { x: number; y: number };
