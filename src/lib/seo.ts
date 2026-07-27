import { siteConfig } from "../config";
import { guideArticles } from "./guides";
import { faqEntries } from "./faqs";
import { REPOSITORY_URL } from "./release";
import { pageMeta } from "./pageMeta";
import type { PageName } from "./types";

export type ResolvedPageSeo = {
  path: string;
  page: PageName;
  title: string;
  description: string;
  canonicalUrl?: string;
  noindex: boolean;
  openGraph: {
    title: string;
    description: string;
    type: "website";
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

function structuredData(page: PageName, pageUrl: string): unknown[] {
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
        softwareRequirements: "Windows and an ASIO driver",
        offers: softwareOffers(),
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
        mainEntity: faqEntries.map((entry) => ({
          "@type": "Question",
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

export function resolvePageSeo(page: PageName, path: string): ResolvedPageSeo {
  const meta = pageMeta[page];
  const canonicalUrl = meta.canonicalPath ? absoluteUrl(meta.canonicalPath) : undefined;
  const pageUrl = canonicalUrl ?? absoluteUrl(path);
  const imageUrl = absoluteUrl(meta.openGraphImage.path);

  return {
    path,
    page,
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
    structuredDataJson: structuredData(page, pageUrl).map(serializeJsonLd),
  };
}
