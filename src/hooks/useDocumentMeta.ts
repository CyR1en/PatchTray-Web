import { useEffect } from "react";
import { siteConfig } from "../config";
import { pageMeta } from "../lib/pageMeta";
import type { PageName } from "../lib/types";

/**
 * Applies the current page's title, description, canonical URL, and robots
 * directive to the document.
 *
 * The site serves one `index.html` for every route, so its baseline tags belong
 * to the home page. Each branch below therefore has to remove the tag as well as
 * set it: a page with no canonical must not inherit the home canonical, and an
 * indexable page must not inherit a `noindex` left in the markup.
 *
 * `noindex` here is the in-document half of the signal. The authoritative half
 * is the `X-Robots-Tag` header in `vercel.json`, which does not depend on a
 * crawler executing JavaScript.
 */
function upsertMeta(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
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

export function useDocumentMeta(page: PageName) {
  useEffect(() => {
    const meta = pageMeta[page];

    document.title = meta.title;
    upsertMeta("description", meta.description);
    setCanonical(meta.canonicalPath ? `${siteConfig.siteOrigin}${meta.canonicalPath}` : undefined);

    if (meta.noindex) {
      upsertMeta("robots", "noindex, follow");
    } else {
      document.querySelector('meta[name="robots"]')?.remove();
    }
  }, [page]);
}
