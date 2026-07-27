export type BlogCategory =
  | "product"
  | "workflow"
  | "engineering"
  | "release"
  | "company";

export type BlogAuthor = {
  name: string;
  type: "Person" | "Organization";
  url: string;
};

export type BlogImageVariant = {
  format: "avif" | "webp" | "jpeg" | "png";
  height: number;
  url: string;
  width: number;
};

export type BlogMedia = {
  fallbackFormat: "jpeg" | "png";
  height: number;
  source: string;
  variants: BlogImageVariant[];
  width: number;
};

export type BlogImage = BlogMedia & {
  alt: string;
};

export type BlogCatalogEntry = {
  author: BlogAuthor;
  canonicalUrl: string;
  category: BlogCategory;
  featured: boolean;
  image: BlogImage;
  path: string;
  /** Present only in the localhost draft-preview artifact. */
  preview?: true;
  publishedAt: string;
  readingTime: string;
  readingTimeMinutes: number;
  slug: string;
  summary: string;
  tags: string[];
  title: string;
  updatedAt: string;
};

export type BlogCatalog = {
  schemaVersion: 1;
  featuredSlug: string | null;
  posts: BlogCatalogEntry[];
};

export type BlogHeading = {
  depth: 2 | 3 | 4;
  id: string;
  text: string;
};

export type BlogTableOfContentsEntry = {
  id: string;
  text: string;
};

export type BlogPost = BlogCatalogEntry & {
  schemaVersion: 1;
  headings: BlogHeading[];
  html: string;
  media: BlogMedia[];
  relatedSlugs: string[];
  tableOfContents: BlogTableOfContentsEntry[];
};
