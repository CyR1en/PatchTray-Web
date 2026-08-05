import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App";
import { siteConfig } from "./config";
import { createBlogFeed } from "./lib/blogFeed";
import { resolveServerBlogPage } from "./lib/blogServer";
import { contentDate } from "./lib/contentDates";
import { guideArticles } from "./lib/guides";
import { pageComponents } from "./lib/pageComponents";
import { publicRoutes, routes } from "./lib/routes";
import { notFoundPage, resolveFixedPage } from "./lib/routes";
import { resolvePageSeo, type ResolvedPageSeo } from "./lib/seo";
import type {
  ResolvedBlogArticlePage,
  ResolvedBlogHubPage,
  ResolvedPage,
} from "./lib/types";

export type SitemapEntry = {
  lastmod?: string;
  url: string;
};

function fixedPage(path: string): ResolvedPage {
  const page = resolveFixedPage(path);
  if (!page) throw new Error(`[entry-server] fixed route ${path} did not resolve`);
  return page;
}

function getBlogPages(): Array<ResolvedBlogHubPage | ResolvedBlogArticlePage> {
  const hub = resolveServerBlogPage("/blog");
  if (!hub || hub.kind !== "blogHub") return [];

  const articles = hub.catalog.posts.map((entry) => {
    const page = resolveServerBlogPage(entry.path);
    if (!page || page.kind !== "blogArticle") {
      throw new Error(`[entry-server] published article ${entry.path} did not resolve`);
    }
    return page;
  });
  return [hub, ...articles];
}

export function getStaticPages(): ResolvedPageSeo[] {
  const resolvedPages = [
    ...routes.map((route) => fixedPage(route.path)),
    ...getBlogPages(),
  ];
  return resolvedPages.map(resolvePageSeo);
}

export function getSitemapEntries(): SitemapEntry[] {
  const fixedEntries = publicRoutes.map((route) => ({
    url: `${siteConfig.siteOrigin}${route.path}`,
    lastmod: contentDate(route.page),
  }));
  const blogPages = getBlogPages();
  const hub = blogPages[0];
  if (!hub || hub.kind !== "blogHub") return fixedEntries;

  const hubLastmod = hub.catalog.posts.reduce(
    (latest, post) =>
      Date.parse(post.updatedAt) > Date.parse(latest) ? post.updatedAt : latest,
    hub.catalog.posts[0].updatedAt,
  );
  return [
    ...fixedEntries,
    {
      url: `${siteConfig.siteOrigin}${hub.path}`,
      lastmod: hubLastmod,
    },
    ...blogPages
      .filter((page): page is ResolvedBlogArticlePage => page.kind === "blogArticle")
      .map((page) => ({
        url: page.post.canonicalUrl,
        lastmod: page.post.updatedAt,
      })),
  ];
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function feedTimestamp(date: string): string {
  return `${date}T00:00:00Z`;
}

export function getGuideFeed(): string {
  const feedUrl = `${siteConfig.siteOrigin}/guides/feed.xml`;
  const guidesUrl = `${siteConfig.siteOrigin}/guides`;
  const updated = guideArticles.reduce(
    (latest, article) => (article.reviewed > latest ? article.reviewed : latest),
    guideArticles[0].reviewed,
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    "  <title>PatchTray guides</title>",
    `  <subtitle>${escapeXml("Practical guides for live VST3 audio, supported audio devices, and PatchTray workflows on Windows.")}</subtitle>`,
    `  <link href="${escapeXml(guidesUrl)}" />`,
    `  <link href="${escapeXml(feedUrl)}" rel="self" type="application/atom+xml" />`,
    `  <id>${escapeXml(guidesUrl)}</id>`,
    `  <updated>${feedTimestamp(updated)}</updated>`,
    "  <author>",
    "    <name>PatchTray</name>",
    `    <uri>${escapeXml(siteConfig.siteOrigin)}</uri>`,
    "  </author>",
    ...guideArticles.flatMap((article) => {
      const url = `${siteConfig.siteOrigin}${article.path}`;
      return [
        "  <entry>",
        `    <title>${escapeXml(article.title)}</title>`,
        `    <link href="${escapeXml(url)}" />`,
        `    <id>${escapeXml(url)}</id>`,
        `    <published>${feedTimestamp(article.published)}</published>`,
        `    <updated>${feedTimestamp(article.reviewed)}</updated>`,
        `    <summary>${escapeXml(article.description)}</summary>`,
        ...article.topics.map((topic) => `    <category term="${escapeXml(topic)}" />`),
        "  </entry>",
      ];
    }),
    "</feed>",
    "",
  ].join("\n");
}

export function getBlogFeed(): string | undefined {
  const hub = getBlogPages()[0];
  if (!hub || hub.kind !== "blogHub") return undefined;
  return createBlogFeed(hub.catalog, siteConfig.siteOrigin);
}

export function getNotFoundPage(): ResolvedPageSeo {
  return resolvePageSeo(notFoundPage("/404"));
}

export function render(pathname: string): string {
  const resolvedPage =
    resolveFixedPage(pathname) ??
    resolveServerBlogPage(pathname) ??
    notFoundPage(pathname);
  const PageComponent = pageComponents[resolvedPage.page];
  return renderToString(
    <StrictMode>
      <App resolvedPage={resolvedPage} PageComponent={PageComponent} />
    </StrictMode>,
  );
}
