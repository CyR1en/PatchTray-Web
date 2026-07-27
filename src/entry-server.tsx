import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App";
import { siteConfig } from "./config";
import { guideArticles } from "./lib/guides";
import { pageComponents } from "./lib/pageComponents";
import { publicRoutes, routes } from "./lib/routes";
import { resolveRoute } from "./lib/routes";
import { resolvePageSeo, type ResolvedPageSeo } from "./lib/seo";

export function getStaticPages(): ResolvedPageSeo[] {
  return routes.map((route) => resolvePageSeo(route.page, route.path));
}

export function getSitemapUrls(): string[] {
  return publicRoutes.map((route) => `${siteConfig.siteOrigin}${route.path}`);
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
    `  <subtitle>${escapeXml("Practical guides for live VST3 audio, ASIO routing, and PatchTray workflows on Windows.")}</subtitle>`,
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

export function getNotFoundPage(): ResolvedPageSeo {
  return resolvePageSeo("notFound", "/404");
}

export function render(pathname: string): string {
  const page = resolveRoute(pathname)?.page ?? "notFound";
  const PageComponent = pageComponents[page];
  return renderToString(
    <StrictMode>
      <App pathname={pathname} PageComponent={PageComponent} />
    </StrictMode>,
  );
}
