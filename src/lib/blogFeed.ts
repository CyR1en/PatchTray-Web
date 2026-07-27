import type { BlogCatalog } from "./blogTypes";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function createBlogFeed(
  catalog: BlogCatalog,
  siteOrigin: string,
): string | undefined {
  const posts = catalog.posts.slice(0, 20);
  if (posts.length === 0) return undefined;

  const origin = siteOrigin.replace(/\/+$/, "");
  if (!origin) throw new Error("[blog:feed] site origin must not be empty");

  const feedUrl = `${origin}/blog/feed.xml`;
  const blogUrl = `${origin}/blog`;
  const updated = posts.reduce(
    (latest, post) =>
      Date.parse(post.updatedAt) > Date.parse(latest) ? post.updatedAt : latest,
    posts[0].updatedAt,
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    "  <title>PatchTray blog</title>",
    `  <subtitle>${escapeXml("Product explanations, live audio workflows, engineering notes, release stories, and company updates from PatchTray.")}</subtitle>`,
    `  <link href="${escapeXml(blogUrl)}" rel="alternate" />`,
    `  <link href="${escapeXml(feedUrl)}" rel="self" type="application/atom+xml" />`,
    `  <id>${escapeXml(blogUrl)}</id>`,
    `  <updated>${escapeXml(updated)}</updated>`,
    ...posts.flatMap((post) => [
      "  <entry>",
      `    <title>${escapeXml(post.title)}</title>`,
      `    <link href="${escapeXml(post.canonicalUrl)}" rel="alternate" />`,
      `    <id>${escapeXml(post.canonicalUrl)}</id>`,
      `    <published>${escapeXml(post.publishedAt)}</published>`,
      `    <updated>${escapeXml(post.updatedAt)}</updated>`,
      "    <author>",
      `      <name>${escapeXml(post.author.name)}</name>`,
      `      <uri>${escapeXml(post.author.url)}</uri>`,
      "    </author>",
      `    <summary type="text">${escapeXml(post.summary)}</summary>`,
      ...post.tags.map((tag) => `    <category term="${escapeXml(tag)}" />`),
      "  </entry>",
    ]),
    "</feed>",
    "",
  ].join("\n");
}
