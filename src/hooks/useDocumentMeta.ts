import { useEffect } from "react";
import { resolvePageSeo } from "../lib/seo";
import type { PageName } from "../lib/types";

/**
 * Applies the current page's title, description, canonical URL, robots
 * directive, social metadata, and structured data to the document.
 *
 * Production routes are pre-rendered with these values. This hook keeps the
 * browser document in sync during development, hydration, and any future
 * client-side navigation. Each branch still removes as well as sets tags so a
 * noindex page cannot inherit a canonical (or vice versa).
 *
 * `noindex` here is the in-document half of the signal. The authoritative half
 * is the `X-Robots-Tag` header in `vercel.json`, which does not depend on a
 * crawler executing JavaScript.
 */
function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.append(tag);
  }
  tag.content = content;
}

function setCanonical(href: string | undefined) {
  let tag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = "canonical";
    document.head.append(tag);
  }
  tag.href = href;
}

function setStructuredData(items: string[]) {
  document.querySelectorAll('script[data-patchtray-structured-data="true"]').forEach((tag) => tag.remove());
  for (const json of items) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.patchtrayStructuredData = "true";
    script.text = json;
    document.head.append(script);
  }
}

export function useDocumentMeta(page: PageName, path: string) {
  useEffect(() => {
    const seo = resolvePageSeo(page, path);
    const { openGraph, twitter } = seo;

    document.title = seo.title;
    upsertMeta("name", "description", seo.description);
    setCanonical(seo.canonicalUrl);

    if (seo.noindex) {
      upsertMeta("name", "robots", "noindex, follow");
    } else {
      document.querySelector('meta[name="robots"]')?.remove();
    }

    upsertMeta("property", "og:title", openGraph.title);
    upsertMeta("property", "og:description", openGraph.description);
    upsertMeta("property", "og:type", openGraph.type);
    upsertMeta("property", "og:url", openGraph.url);
    upsertMeta("property", "og:site_name", openGraph.siteName);
    upsertMeta("property", "og:locale", openGraph.locale);
    upsertMeta("property", "og:image", openGraph.image.url);
    upsertMeta("property", "og:image:alt", openGraph.image.alt);
    upsertMeta("property", "og:image:width", String(openGraph.image.width));
    upsertMeta("property", "og:image:height", String(openGraph.image.height));
    upsertMeta("property", "og:image:type", openGraph.image.type);

    upsertMeta("name", "twitter:card", twitter.card);
    upsertMeta("name", "twitter:title", twitter.title);
    upsertMeta("name", "twitter:description", twitter.description);
    upsertMeta("name", "twitter:image", twitter.image);
    upsertMeta("name", "twitter:image:alt", twitter.imageAlt);
    setStructuredData(seo.structuredDataJson);
  }, [page, path]);
}
