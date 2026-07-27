import { BlogResponsiveImage } from "../components/blog/BlogResponsiveImage";
import { PageFrame } from "../components/layout/PageFrame";
import { ArrowMark } from "../components/marks";
import { SectionRule } from "../components/SectionRule";
import { useHashScroll } from "../hooks/useHashScroll";
import { analyticsEvents } from "../lib/analytics";
import type { BlogCategory } from "../lib/blogTypes";
import type { PageComponentProps } from "../lib/types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
}

function nextAction(category: BlogCategory) {
  if (category === "workflow") {
    return {
      detail: "article_guide",
      href: "/guides",
      label: "continue with the workflow guides",
    };
  }
  if (category === "product" || category === "release") {
    return {
      detail: "article_download",
      href: "/download",
      label: "download PatchTray",
    };
  }
  return undefined;
}

export function BlogArticlePage({ resolvedPage }: PageComponentProps) {
  useHashScroll();
  if (resolvedPage.kind !== "blogArticle") return null;

  const { post, relatedPosts } = resolvedPage;
  const previewing = post.preview === true;
  const action = nextAction(post.category);
  const materiallyUpdated = post.updatedAt !== post.publishedAt;

  return (
    <PageFrame current="blog">
      {previewing ? (
        <div className="blog-preview-notice content-width" role="status">
          <span className="state-square state-square--orange" aria-hidden="true" />
          Local draft preview. This article is not published.
        </div>
      ) : null}
      <article className="blog-article">
        <header className="blog-article__hero content-width">
          <nav className="article-breadcrumbs" aria-label="Breadcrumb">
            <a href="/">patchtray</a>
            <span aria-hidden="true">/</span>
            <a href="/blog">blog</a>
            <span aria-hidden="true">/</span>
            <span>{post.category}</span>
          </nav>
          <p className="terminal-label">
            {previewing ? "draft preview / " : ""}
            {post.category} / transmission {post.slug}
          </p>
          <h1>{post.title}</h1>
          <p className="blog-article__summary">{post.summary}</p>
          <dl className="blog-article__meta" aria-label="Article details">
            <div>
              <dt>author</dt>
              <dd>
                <a href={post.author.url}>{post.author.name}</a>
              </dd>
            </div>
            {previewing ? (
              <div>
                <dt>state</dt>
                <dd>local draft</dd>
              </div>
            ) : (
              <div>
                <dt>published</dt>
                <dd>
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                </dd>
              </div>
            )}
            {!previewing && materiallyUpdated ? (
              <div>
                <dt>updated</dt>
                <dd>
                  <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                </dd>
              </div>
            ) : null}
            <div>
              <dt>read</dt>
              <dd>{post.readingTime}</dd>
            </div>
          </dl>
        </header>

        <figure className="blog-article__lead content-width">
          <BlogResponsiveImage
            image={post.image}
            priority
            sizes="(max-width: 900px) calc(100vw - 48px), 1080px"
          />
          <figcaption>
            <span>{post.category}</span>
            <strong>[ {post.image.alt} ]</strong>
          </figcaption>
        </figure>

        <div className="blog-article__layout content-width">
          <aside className="blog-article__rail">
            <a className="blog-article__back" href="/blog">
              ← all articles
            </a>
            {post.tableOfContents.length > 0 ? (
              <nav aria-label="On this page">
                <p>on this page</p>
                {post.tableOfContents.map((heading) => (
                  <a key={heading.id} href={`#${heading.id}`}>
                    {heading.text}
                  </a>
                ))}
              </nav>
            ) : null}
            <div className="blog-article__rail-status">
              <span
                className={`state-square state-square--${previewing ? "orange" : "green"}`}
                aria-hidden="true"
              />
              {previewing ? "local / draft" : "static / reviewed"}
            </div>
          </aside>

          <div className="blog-article__main">
            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            <footer className="blog-article__footer">
              <div>
                <span>corrections</span>
                <p>
                  Found a product detail or source that changed?{" "}
                  <a
                    href="/support"
                    data-analytics-event={analyticsEvents.blogConversion}
                    data-analytics-detail="article_support"
                  >
                    Send the affected section through support.
                  </a>
                </p>
              </div>
              {action ? (
                <a
                  className="button button--line"
                  href={action.href}
                  data-analytics-event={analyticsEvents.blogConversion}
                  data-analytics-detail={action.detail}
                >
                  [ {action.label} ] <ArrowMark />
                </a>
              ) : null}
            </footer>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 ? (
        <section className="blog-related content-width" aria-labelledby="blog-related-title">
          <SectionRule>related signals</SectionRule>
          <h2 id="blog-related-title">Continue through the same topic.</h2>
          <div className="blog-related__grid">
            {relatedPosts.map((article, index) => (
              <article key={article.slug}>
                <span>{String(index + 1).padStart(2, "0")} / {article.category}</span>
                <h3>
                  <a
                    href={article.path}
                    data-analytics-event={analyticsEvents.blogArticleOpen}
                    data-analytics-detail={article.slug}
                  >
                    {article.title}
                  </a>
                </h3>
                <p>{article.summary}</p>
                <a
                  className="blog-read-link"
                  href={article.path}
                  data-analytics-event={analyticsEvents.blogArticleOpen}
                  data-analytics-detail={article.slug}
                >
                  read article <ArrowMark />
                </a>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </PageFrame>
  );
}
