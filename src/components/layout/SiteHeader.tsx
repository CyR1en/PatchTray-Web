import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { siteConfig } from "../../config";
import type { PageName } from "../../lib/types";
import { analyticsEvents } from "../../lib/analytics";
import { ArrowMark, Mark, MenuMark, WindowsMark } from "../marks";

export function SiteHeader({ current }: { current: PageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const nav = [
    ["home", "/"],
    ["download", "/download"],
    ["pricing", "/pricing"],
    ["guides", "/guides"],
    ...(__BLOG_ENABLED__ ? ([["blog", "/blog"]] as const) : []),
    ["faq", "/faq"],
  ] as const;

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

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
          <a
            className="header-download"
            href="/download"
            data-analytics-event={analyticsEvents.downloadPage}
            data-analytics-detail="site_header"
          >
            <WindowsMark /> <span>[ download ]</span>
          </a>
          <button
            ref={toggleRef}
            className="nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuMark open={menuOpen} />
          </button>
        </div>
      </div>
      <nav
        id="mobile-menu"
        className={`mobile-nav ${menuOpen ? "is-open" : ""}`}
        aria-label="Mobile navigation"
        inert={!menuOpen}
      >
        <div className="mobile-nav__inner">
          <div className="mobile-nav__meta" style={{ "--i": "0" } as CSSProperties}>
            <span className="mobile-nav__title">menu</span>
            <span className="beta-flag">
              <span className="state-square state-square--orange" aria-hidden="true" />
              {siteConfig.releaseState}
            </span>
          </div>
          {nav.map(([label, href], index) => (
            <a
              key={label}
              href={href}
              aria-current={current === label ? "page" : undefined}
              className="mobile-nav__link"
              style={{ "--i": String(index + 1) } as CSSProperties}
            >
              <span className="mobile-nav__index">{String(index + 1).padStart(2, "0")}</span>
              <span className="mobile-nav__label">{label}</span>
              <ArrowMark />
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
