import type { ReactNode } from "react";
import { useHashScroll } from "../../hooks/useHashScroll";
import type { GuideArticleDefinition } from "../../lib/guides";
import { ArrowMark } from "../marks";
import { SectionRule } from "../SectionRule";
import { PageFrame } from "./PageFrame";
import { analyticsEvents } from "../../lib/analytics";

export type GuideArticleSection = {
  id: string;
  nav: string;
  title: string;
  body: ReactNode;
};

export type GuideSource = {
  href: string;
  label: string;
  note: string;
};

export function GuideArticleLayout({
  article,
  lead,
  sections,
  sources,
  next,
}: {
  article: GuideArticleDefinition;
  lead: string;
  sections: readonly GuideArticleSection[];
  sources: readonly GuideSource[];
  next: { href: string; label: string };
}) {
  useHashScroll();

  return (
    <PageFrame current="guide">
      <article className="guide-article">
        <header className="article-hero content-width">
          <nav className="article-breadcrumbs" aria-label="Breadcrumb">
            <a href="/">patchtray</a>
            <span aria-hidden="true">/</span>
            <a href="/guides">guides</a>
            <span aria-hidden="true">/</span>
            <span>{article.category}</span>
          </nav>
          <p className="terminal-label">{article.category} / windows live audio</p>
          <h1>{article.title}</h1>
          <p className="page-lead">{lead}</p>
          <div className="article-meta" aria-label="Guide details">
            <span>PatchTray documentation</span>
            <span>{article.readingTime}</span>
            <span>
              reviewed <time dateTime={article.reviewed}>{formatDate(article.reviewed)}</time>
            </span>
          </div>
        </header>

        <div className="article-layout content-width">
          <aside className="article-rail">
            <a className="article-rail__back" href="/guides">
              ← all guides
            </a>
            <nav aria-label="On this page">
              <p>on this page</p>
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  [ {section.nav} ]
                </a>
              ))}
            </nav>
          </aside>

          <div className="article-content">
            {sections.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
                <SectionRule>{section.nav}</SectionRule>
                <h2 id={`${section.id}-title`}>{section.title}</h2>
                {section.body}
              </section>
            ))}

            <section className="article-sources" aria-labelledby="article-sources-title">
              <SectionRule>references</SectionRule>
              <h2 id="article-sources-title">Sources and product boundaries</h2>
              <ul>
                {sources.map((source) => (
                  <li key={source.href}>
                    <a href={source.href} target="_blank" rel="noreferrer">
                      {source.label}
                    </a>
                    <span>{source.note}</span>
                  </li>
                ))}
              </ul>
              <p className="article-trademark">
                VST is a registered trademark of Steinberg Media Technologies GmbH. Voicemeeter is a
                VB-Audio product. PatchTray is not affiliated with either company.
              </p>
            </section>

            <footer className="article-next">
              <div>
                <span>continue the route</span>
                <a href={next.href}>
                  {next.label} <ArrowMark />
                </a>
              </div>
              <a
                className="button button--text"
                href="/download"
                data-analytics-event={analyticsEvents.guideConversion}
                data-analytics-detail="article_download"
              >
                [ download PatchTray ]
              </a>
            </footer>
          </div>
        </div>
      </article>
    </PageFrame>
  );
}

export function SignalFlow({ label, nodes }: { label: string; nodes: readonly string[] }) {
  return (
    <div className="article-flow" role="img" aria-label={label}>
      {nodes.map((node, index) => (
        <div className="article-flow__step" key={node}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{node}</strong>
          {index < nodes.length - 1 ? <i aria-hidden="true">→</i> : null}
        </div>
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
