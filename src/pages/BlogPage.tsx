import type { ReactNode } from "react";
import { BlogResponsiveImage } from "../components/blog/BlogResponsiveImage";
import { PageFrame } from "../components/layout/PageFrame";
import { ArrowMark } from "../components/marks";
import { SectionRule } from "../components/SectionRule";
import { analyticsEvents } from "../lib/analytics";
import type { BlogCatalogEntry } from "../lib/blogTypes";
import type { PageComponentProps } from "../lib/types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
}

function ArticleLink({
  article,
  children,
  className,
}: {
  article: BlogCatalogEntry;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={article.path}
      data-analytics-event={analyticsEvents.blogArticleOpen}
      data-analytics-detail={article.slug}
    >
      {children}
    </a>
  );
}

function ArticleDate({ article }: { article: BlogCatalogEntry }) {
  return article.preview ? (
    <span>draft preview</span>
  ) : (
    <time dateTime={article.publishedAt}>
      {formatDate(article.publishedAt)}
    </time>
  );
}

export function BlogPage({ resolvedPage }: PageComponentProps) {
  if (resolvedPage.kind !== "blogHub") return null;

  const { catalog } = resolvedPage;
  const previewing = catalog.posts.some((article) => article.preview === true);
  const featured =
    catalog.posts.find((article) => article.slug === catalog.featuredSlug) ??
    catalog.posts[0];

  return (
    <PageFrame current="blog">
      {previewing ? (
        <div className="blog-preview-notice content-width" role="status">
          <span className="state-square state-square--orange" aria-hidden="true" />
          Local draft preview. Nothing marked as a draft on this page is
          published.
        </div>
      ) : null}
      <section className="blog-hero content-width" aria-labelledby="blog-title">
        <div className="blog-hero__copy">
          <p className="terminal-label">patchtray / transmission log</p>
          <h1 id="blog-title">notes from the live signal path.</h1>
          <p className="page-lead">
            Product explanations, engineering notes, release stories, and practical context from
            the people building PatchTray.
          </p>
        </div>
        <aside className="blog-hero__index" aria-label="Blog collection summary">
          <span>register</span>
          <strong>{String(catalog.posts.length).padStart(2, "0")} entries</strong>
          <span>scope</span>
          <strong>product / audio / build</strong>
          {previewing ? (
            <span>local preview</span>
          ) : (
            <a href="/blog/feed.xml">
              atom feed <ArrowMark />
            </a>
          )}
        </aside>
      </section>

      <section className="blog-feature content-width" aria-labelledby="blog-feature-title">
        <SectionRule>featured transmission</SectionRule>
        <article className="blog-feature__grid">
          <div className="blog-feature__copy">
            <div className="blog-entry-meta">
              <span>{featured.category}</span>
              <ArticleDate article={featured} />
              <span>{featured.readingTime}</span>
            </div>
            <h2 id="blog-feature-title">
              <ArticleLink article={featured}>{featured.title}</ArticleLink>
            </h2>
            <p>{featured.summary}</p>
            <ArticleLink className="blog-read-link" article={featured}>
              read article <ArrowMark />
            </ArticleLink>
          </div>
          <ArticleLink className="blog-feature__media" article={featured}>
            <BlogResponsiveImage
              image={featured.image}
              priority
              sizes="(max-width: 900px) calc(100vw - 48px), 48vw"
            />
            <span aria-hidden="true">
              featured / {featured.category}
            </span>
          </ArticleLink>
        </article>
      </section>

      <section className="blog-register content-width" aria-labelledby="blog-register-title">
        <SectionRule>article register</SectionRule>
        <div className="blog-register__heading">
          <h2 id="blog-register-title">
            {previewing
              ? "Published notes and local drafts."
              : "Every published note, newest first."}
          </h2>
          <span>
            {String(catalog.posts.length).padStart(2, "0")} /{" "}
            {previewing ? "preview" : "live"}
          </span>
        </div>
        <div className="blog-register__rows">
          {catalog.posts.map((article, index) => (
            <article key={article.slug}>
              <span className="blog-register__number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="blog-register__body">
                <div className="blog-entry-meta">
                  <span>{article.category}</span>
                  <ArticleDate article={article} />
                  <span>{article.readingTime}</span>
                </div>
                <h3>
                  <ArticleLink article={article}>{article.title}</ArticleLink>
                </h3>
                <p>{article.summary}</p>
              </div>
              <div className="blog-register__tags" aria-label="Article topics">
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <ArticleLink
                className="blog-register__open"
                article={article}
              >
                open <ArrowMark />
              </ArticleLink>
            </article>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}
