import { useState } from "react";
import { siteConfig } from "../../config";
import type { PageName } from "../../lib/types";
import { Mark, MenuMark, WindowsMark } from "../marks";

export function SiteHeader({ current }: { current: PageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = [
    ["home", "/"],
    ["download", "/download"],
    ["guide", "/guide"],
  ] as const;

  return (
    <header className="site-header">
      <div className="site-header__main content-width">
        <a className="brand" href="/" aria-label="PatchTray home">
          <Mark className="brand__mark" />
          <span>patchtray</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(([label, href]) => (
            <a
              key={label}
              href={href}
              aria-current={current === label ? "page" : undefined}
              className={current === label ? "is-current" : ""}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <span className="beta-flag">
            <span className="state-square state-square--orange" aria-hidden="true" />
            {siteConfig.releaseState}
          </span>
          <a className="header-download" href="/download">
            <WindowsMark /> <span>[ download ]</span>
          </a>
          <button
            className="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuMark open={menuOpen} />
          </button>
        </div>
      </div>
      <nav id="mobile-menu" className={`mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label="Mobile navigation">
        {nav.map(([label, href]) => (
          <a key={label} href={href} aria-current={current === label ? "page" : undefined}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
