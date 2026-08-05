import { siteConfig } from "../config";
import { guideArticles } from "./guides";
import { faqEntries, faqReview } from "./faqs";
import { REPOSITORY_URL } from "./release";
import { pageMeta } from "./pageMeta";
import type {
  BlogAuthor,
  BlogCatalogEntry,
  BlogImage,
} from "./blogTypes";
import type { PageName, ResolvedPage } from "./types";

export type AlternateFeed = {
  href: string;
  title: string;
  type: "application/atom+xml";
};

export type ArticleOpenGraph = {
  author: string;
  modifiedTime: string;
  publishedTime: string;
  tags: string[];
};

export type ResolvedPageSeo = {
  alternateFeeds: AlternateFeed[];
  path: string;
  page: PageName;
  title: string;
  description: string;
  canonicalUrl?: string;
  noindex: boolean;
  openGraph: {
    title: string;
    description: string;
    type: "website" | "article";
    url: string;
    siteName: "PatchTray";
    locale: "en_US";
    image: {
      url: string;
      alt: string;
      width: number;
      height: number;
      type: string;
    };
    article?: ArticleOpenGraph;
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    image: string;
    imageAlt: string;
  };
  structuredDataJson: string[];
};

function absoluteUrl(path: string): string {
  return `${siteConfig.siteOrigin}${path === "/" ? "/" : path}`;
}

function blogAuthor(author: BlogAuthor) {
  return {
    "@type": author.type,
    name: author.name,
    url: author.url,
  };
}

function blogSocialImage(image: BlogImage) {
  const variants = image.variants.filter(
    (variant) => variant.format === image.fallbackFormat,
  );
  if (variants.length === 0) {
    throw new Error(`[seo] blog image ${image.source} has no fallback variant`);
  }
  const variant = variants.reduce((largest, candidate) =>
    candidate.width > largest.width ? candidate : largest,
  );
  const type = variant.format === "jpeg" ? "image/jpeg" : "image/png";
  return {
    url: absoluteUrl(variant.url),
    alt: image.alt,
    width: variant.width,
    height: variant.height,
    type,
  };
}

function blogPostingReference(post: BlogCatalogEntry) {
  return {
    "@type": "BlogPosting",
    "@id": `${post.canonicalUrl}#article`,
    url: post.canonicalUrl,
    headline: post.title,
    description: post.summary,
    image: blogSocialImage(post.image).url,
    author: blogAuthor(post.author),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
  };
}

const guideFeed: AlternateFeed = {
  href: absoluteUrl("/guides/feed.xml"),
  title: "PatchTray guides",
  type: "application/atom+xml",
};

const blogFeed: AlternateFeed = {
  href: absoluteUrl("/blog/feed.xml"),
  title: "PatchTray blog",
  type: "application/atom+xml",
};

function fixedAlternateFeeds(page: PageName): AlternateFeed[] {
  return page === "guides" || guideArticles.some((article) => article.page === page)
    ? [guideFeed]
    : [];
}

function priceAmount(label: string): string | undefined {
  return label.replaceAll(",", "").match(/\d+(?:\.\d+)?/)?.[0];
}

function softwareOffers() {
  const offers: Array<Record<string, unknown>> = [
    {
      "@type": "Offer",
      name: "PatchTray Free",
      price: "0",
      priceCurrency: siteConfig.proPriceCurrency,
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/download"),
    },
  ];

  const monthly = priceAmount(siteConfig.proMonthlyPrice);
  if (monthly) {
    offers.push({
      "@type": "Offer",
      name: "PatchTray Pro monthly",
      price: monthly,
      priceCurrency: siteConfig.proPriceCurrency,
      availability: "https://schema.org/InStock",
      url: siteConfig.proMonthlyCheckoutUrl,
      description: "Monthly PatchTray Pro subscription with unlimited VST3 nodes and presets.",
    });
  }

  const lifetime = priceAmount(siteConfig.proLifetimePrice);
  if (lifetime) {
    offers.push({
      "@type": "Offer",
      name: "PatchTray Pro lifetime",
      price: lifetime,
      priceCurrency: siteConfig.proPriceCurrency,
      availability: "https://schema.org/InStock",
      url: siteConfig.proLifetimeCheckoutUrl,
      description: "One-time PatchTray Pro purchase with unlimited VST3 nodes and presets.",
    });
  }

  return offers;
}

const organizationId = `${siteConfig.siteOrigin}/#organization`;

function organizationReference() {
  return {
    "@type": "Organization",
    "@id": organizationId,
    name: "PatchTray",
    url: absoluteUrl("/"),
  };
}

function organizationEntity() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: "PatchTray",
    url: absoluteUrl("/"),
    description: pageMeta.home.description,
    logo: absoluteUrl("/assets/patchtray-mark.svg"),
    email: `mailto:${siteConfig.supportEmail}`,
    sameAs: ["https://github.com/PatchTray", REPOSITORY_URL],
  };
}

function fixedStructuredData(page: PageName, pageUrl: string): unknown[] {
  if (page === "home") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${siteConfig.siteOrigin}/#website`,
        url: absoluteUrl("/"),
        name: "PatchTray",
        description: pageMeta.home.description,
        inLanguage: "en-US",
        publisher: organizationReference(),
      },
      organizationEntity(),
    ];
  }

  if (page === "download") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${siteConfig.siteOrigin}/#software`,
        name: "PatchTray",
        description: pageMeta.home.description,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        image: absoluteUrl(pageMeta.download.openGraphImage.path),
        sameAs: REPOSITORY_URL,
        publisher: organizationReference(),
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Windows",
        softwareRequirements:
          "Windows and one compatible logical duplex device using ASIO, DirectSound, or Windows Audio in Shared, Exclusive, or Low Latency mode",
        offers: softwareOffers(),
      },
    ];
  }

  if (page === "pricing") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: pageMeta.pricing.title,
        description: pageMeta.pricing.description,
        inLanguage: "en-US",
        publisher: organizationReference(),
        // The same software entity described on /download, referenced by its
        // `@id` so the offers consolidate onto one product rather than
        // declaring a second, competing PatchTray.
        mainEntity: {
          "@type": "SoftwareApplication",
          "@id": `${siteConfig.siteOrigin}/#software`,
          name: "PatchTray",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Windows",
          offers: softwareOffers(),
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PatchTray", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Pricing", item: pageUrl },
        ],
      },
    ];
  }

  if (page === "guides") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection`,
        url: pageUrl,
        name: pageMeta.guides.title,
        description: pageMeta.guides.description,
        inLanguage: "en-US",
        hasPart: guideArticles.map((article) => ({
          "@type": "TechArticle",
          name: article.title,
          url: absoluteUrl(article.path),
        })),
      },
    ];
  }

  if (page === "faq") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        url: pageUrl,
        name: pageMeta.faq.title,
        description: pageMeta.faq.description,
        inLanguage: "en-US",
        lastReviewed: faqReview.date,
        reviewedBy: organizationReference(),
        publisher: organizationReference(),
        mainEntity: faqEntries.map((entry) => ({
          "@type": "Question",
          "@id": `${pageUrl}#${entry.id}`,
          url: `${pageUrl}#${entry.id}`,
          name: entry.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: entry.answer,
          },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PatchTray", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "FAQ", item: pageUrl },
        ],
      },
    ];
  }

  const article = guideArticles.find((candidate) => candidate.page === page);
  if (article) {
    return [
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        headline: article.title,
        description: article.description,
        image: absoluteUrl(pageMeta[page].openGraphImage.path),
        author: {
          ...organizationReference(),
        },
        publisher: {
          ...organizationReference(),
        },
        datePublished: article.published,
        dateModified: article.reviewed,
        inLanguage: "en-US",
        about: article.topics,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "PatchTray", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
          { "@type": "ListItem", position: 3, name: article.cardTitle, item: pageUrl },
        ],
      },
    ];
  }

  return [];
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

function fixedPageSeo(resolvedPage: ResolvedPage): ResolvedPageSeo {
  const meta = pageMeta[resolvedPage.page];
  const canonicalUrl = meta.canonicalPath ? absoluteUrl(meta.canonicalPath) : undefined;
  const pageUrl = canonicalUrl ?? absoluteUrl(resolvedPage.path);
  const imageUrl = absoluteUrl(meta.openGraphImage.path);

  return {
    alternateFeeds: fixedAlternateFeeds(resolvedPage.page),
    path: resolvedPage.path,
    page: resolvedPage.page,
    title: meta.title,
    description: meta.description,
    canonicalUrl,
    noindex: meta.noindex === true,
    openGraph: {
      title: meta.openGraphTitle,
      description: meta.openGraphDescription,
      type: meta.openGraphType,
      url: pageUrl,
      siteName: "PatchTray",
      locale: "en_US",
      image: {
        url: imageUrl,
        alt: meta.openGraphImage.alt,
        width: meta.openGraphImage.width,
        height: meta.openGraphImage.height,
        type: meta.openGraphImage.type,
      },
    },
    twitter: {
      card: "summary_large_image",
      title: meta.openGraphTitle,
      description: meta.openGraphDescription,
      image: imageUrl,
      imageAlt: meta.openGraphImage.alt,
    },
    structuredDataJson: fixedStructuredData(resolvedPage.page, pageUrl).map(serializeJsonLd),
  };
}

function blogHubSeo(
  resolvedPage: Extract<ResolvedPage, { kind: "blogHub" }>,
): ResolvedPageSeo {
  const meta = pageMeta.blog;
  const previewing = resolvedPage.catalog.posts.some(
    (post) => post.preview === true,
  );
  const canonicalUrl = absoluteUrl(resolvedPage.path);
  const featured =
    resolvedPage.catalog.posts.find(
      (post) => post.slug === resolvedPage.catalog.featuredSlug,
    ) ?? resolvedPage.catalog.posts[0];
  const image = blogSocialImage(featured.image);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonicalUrl}#collection`,
    url: canonicalUrl,
    name: meta.title,
    description: meta.description,
    inLanguage: "en-US",
    publisher: organizationReference(),
    hasPart: resolvedPage.catalog.posts.map(blogPostingReference),
  };

  return {
    alternateFeeds: previewing ? [] : [blogFeed],
    path: resolvedPage.path,
    page: resolvedPage.page,
    title: previewing ? `[draft preview] ${meta.title}` : meta.title,
    description: meta.description,
    canonicalUrl: previewing ? undefined : canonicalUrl,
    noindex: previewing,
    openGraph: {
      title: previewing
        ? `[draft preview] ${meta.openGraphTitle}`
        : meta.openGraphTitle,
      description: meta.openGraphDescription,
      type: "website",
      url: canonicalUrl,
      siteName: "PatchTray",
      locale: "en_US",
      image,
    },
    twitter: {
      card: "summary_large_image",
      title: previewing
        ? `[draft preview] ${meta.openGraphTitle}`
        : meta.openGraphTitle,
      description: meta.openGraphDescription,
      image: image.url,
      imageAlt: image.alt,
    },
    structuredDataJson: previewing ? [] : [serializeJsonLd(structuredData)],
  };
}

function blogArticleSeo(
  resolvedPage: Extract<ResolvedPage, { kind: "blogArticle" }>,
): ResolvedPageSeo {
  const { post } = resolvedPage;
  const previewing = post.preview === true;
  const canonicalUrl = absoluteUrl(resolvedPage.path);
  if (post.canonicalUrl !== canonicalUrl) {
    throw new Error(
      `[seo] article ${post.slug} canonical ${post.canonicalUrl} does not match ${canonicalUrl}`,
    );
  }

  const title = `${previewing ? "[draft preview] " : ""}${post.title} — PatchTray`;
  const image = blogSocialImage(post.image);
  const article = {
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    author: post.author.url,
    tags: post.tags,
  };
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#article`,
      url: canonicalUrl,
      mainEntityOfPage: canonicalUrl,
      headline: post.title,
      description: post.summary,
      image: {
        "@type": "ImageObject",
        url: image.url,
        width: image.width,
        height: image.height,
        caption: image.alt,
      },
      author: blogAuthor(post.author),
      publisher: organizationReference(),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      inLanguage: "en-US",
      articleSection: post.category,
      about: post.tags,
      keywords: post.tags.join(", "),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "PatchTray",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: absoluteUrl("/blog"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: canonicalUrl,
        },
      ],
    },
  ];

  return {
    alternateFeeds: previewing ? [] : [blogFeed],
    path: resolvedPage.path,
    page: resolvedPage.page,
    title,
    description: post.summary,
    canonicalUrl: previewing ? undefined : canonicalUrl,
    noindex: previewing,
    openGraph: {
      title,
      description: post.summary,
      type: previewing ? "website" : "article",
      url: canonicalUrl,
      siteName: "PatchTray",
      locale: "en_US",
      image,
      article: previewing ? undefined : article,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.summary,
      image: image.url,
      imageAlt: image.alt,
    },
    structuredDataJson: previewing
      ? []
      : structuredData.map(serializeJsonLd),
  };
}

export function resolvePageSeo(resolvedPage: ResolvedPage): ResolvedPageSeo {
  if (resolvedPage.kind === "blogHub") return blogHubSeo(resolvedPage);
  if (resolvedPage.kind === "blogArticle") return blogArticleSeo(resolvedPage);
  return fixedPageSeo(resolvedPage);
}
