import type { ReactNode } from "react";
import type { PageName } from "../../lib/types";
import { useHashScroll } from "../../hooks/useHashScroll";
import { PageFrame } from "./PageFrame";
import { SectionRule } from "../SectionRule";

export type DocSection = {
  /** Anchor target; also the key for the table of contents. */
  id: string;
  /** Short label for the sticky table of contents and the section rule. */
  nav: string;
  title: string;
  body: ReactNode;
};

/**
 * Shared shell for the long-form legal and support pages. They differ only in
 * their sections, so the hero, sticky table of contents, and section rhythm
 * live here rather than being repeated four times.
 */
export function DocPage({
  page,
  label,
  heading,
  lead,
  effective,
  sections,
}: {
  page: PageName;
  label: string;
  heading: ReactNode;
  lead: string;
  /** ISO date the current text took effect. Omitted on pages with no legal effect. */
  effective?: string;
  sections: readonly DocSection[];
}) {
  useHashScroll();

  return (
    <PageFrame current={page}>
      <section className="page-hero content-width page-hero--doc">
        <p className="terminal-label">{label}</p>
        <h1>{heading}</h1>
        <p className="page-lead">{lead}</p>
        {effective ? (
          <p className="legal-meta">
            <span>effective</span>
            <time dateTime={effective}>{formatDate(effective)}</time>
          </p>
        ) : null}
      </section>

      <div className="content-width legal-layout">
        <nav className="legal-toc" aria-label="On this page">
          <p>on this page</p>
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              [ {section.nav} ]
            </a>
          ))}
        </nav>
        <div className="legal-content">
          {sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
              <SectionRule>{section.nav}</SectionRule>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.body}
            </section>
          ))}
        </div>
      </div>
    </PageFrame>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * An unresolved item in otherwise finished copy — a legal entity name, a
 * jurisdiction, anything that needs a real answer before publication.
 *
 * It reuses the footer's `[ pending ]` idiom deliberately: an unfinished legal
 * page should look unfinished. Any page still rendering one of these must not be
 * linked from the footer or handed to a customer.
 */
export function Pending({ children }: { children: ReactNode }) {
  return <span className="legal-pending">[ {children} — pending ]</span>;
}
