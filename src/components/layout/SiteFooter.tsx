import type { ReactNode } from "react";
import { hasValue, siteConfig } from "../../config";
import { Mark } from "../marks";

function FooterLink({ url, children }: { url: string; children: ReactNode }) {
  if (!hasValue(url)) {
    return (
      <span className="footer-link footer-link--pending" aria-disabled="true">
        {children} <small>[ pending ]</small>
      </span>
    );
  }
  return (
    <a className="footer-link" href={url} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="content-width footer-grid">
        <div className="footer-brand">
          <Mark className="footer-mark" />
          <p>
            patchtray <span>— visible audio routing for windows.</span>
          </p>
        </div>
        <div className="footer-links" aria-label="External links">
          <FooterLink url={siteConfig.repositoryUrl}>repository</FooterLink>
          <FooterLink url={siteConfig.communityUrl}>community</FooterLink>
          <FooterLink url={siteConfig.supportEmail ? `mailto:${siteConfig.supportEmail}` : ""}>support</FooterLink>
          <FooterLink url={siteConfig.privacyUrl}>privacy</FooterLink>
          <FooterLink url={siteConfig.termsUrl}>terms</FooterLink>
        </div>
        <p className="footer-status">
          <span className="state-square state-square--green" aria-hidden="true" />
          {siteConfig.releaseVersion} / {siteConfig.releaseState}
        </p>
      </div>
    </footer>
  );
}
