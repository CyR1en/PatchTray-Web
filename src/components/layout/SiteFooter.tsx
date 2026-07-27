import type { ReactNode } from "react";
import { siteConfig } from "../../config";
import { useLatestRelease } from "../../hooks/useLatestRelease";
import { REPOSITORY_URL } from "../../lib/release";
import { Mark } from "../marks";

/** Own routes stay in place; only real external links get a new tab. */
function isExternal(url: string) {
  return !url.startsWith("/") && !url.startsWith("mailto:");
}

function FooterLink({ url, children }: { url: string; children: ReactNode }) {
  if (isExternal(url)) {
    return (
      <a className="footer-link" href={url} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <a className="footer-link" href={url}>
      {children}
    </a>
  );
}

export function SiteFooter() {
  const release = useLatestRelease();

  return (
    <footer className="site-footer">
      <div className="content-width footer-grid">
        <div className="footer-brand">
          <Mark className="footer-mark" />
          <p>
            patchtray <span>— visible audio routing for windows.</span>
          </p>
        </div>
        <nav className="footer-links" aria-label="Support and legal">
          <FooterLink url={REPOSITORY_URL}>repository</FooterLink>
          <FooterLink url="/guides">guides</FooterLink>
          <FooterLink url="/support">support</FooterLink>
          <FooterLink url="/refunds">refunds</FooterLink>
          <FooterLink url="/privacy">privacy</FooterLink>
          <FooterLink url="/terms">terms</FooterLink>
        </nav>
        <p className="footer-status">
          <span className="state-square state-square--green" aria-hidden="true" />
          {release.version} / {siteConfig.releaseState}
        </p>
      </div>
    </footer>
  );
}
