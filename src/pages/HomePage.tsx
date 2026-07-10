import { useEffect, useState } from "react";
import { siteConfig } from "../config";
import { ArrowMark, WindowsMark } from "../components/marks";
import { CanvasStatement } from "../components/CanvasStatement";
import { ProPriceNote } from "../components/ProPriceNote";
import { SectionRule } from "../components/SectionRule";
import { TrayPresence } from "../components/TrayPresence";
import { PageFrame } from "../components/layout/PageFrame";
import { HeroPlugMark } from "../components/routing/HeroPlugMark";
import { RoutingDemo } from "../components/routing/RoutingDemo";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export function HomePage() {
  const reducedMotion = usePrefersReducedMotion();
  const [heroPlay, setHeroPlay] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setHeroPlay(true);
      return;
    }
    let cancelled = false;
    let outer = 0;
    let inner = 0;
    outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        if (!cancelled) setHeroPlay(true);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [reducedMotion]);

  return (
    <PageFrame current="home">
      <section
        className={`hero-stage${heroPlay ? " is-playing" : ""}${reducedMotion ? " is-reduced" : ""}`}
        aria-label="PatchTray introduction"
      >
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-bg__grill" />
        </div>

        <div className="hero content-width">
          <div className="hero-copy">
            <p className="terminal-label hero-label">
              patchtray / windows / {siteConfig.releaseState}
            </p>
            <h1>
              <span className="hero-line">
                <span className="hero-line__inner">stop fighting</span>
              </span>
              <span className="hero-line">
                <span className="hero-line__inner hero__word">the signal path.</span>
              </span>
            </h1>
            <p className="hero-lead">
              PatchTray turns your mic chain into a visible canvas: ASIO input, VST3 processing, and ASIO
              output in one clear path — built for Voicemeeter and any mixer that can take an ASIO insert.
            </p>
            <div className="hero-actions">
              <a className="button button--primary" href="/download">
                <WindowsMark /> [ download for windows ]
              </a>
              <a className="button button--text" href="/guide">
                [ read the guide ] <ArrowMark />
              </a>
            </div>
          </div>
          <aside className="hero-aside" aria-label="PatchTray product summary">
            <div className="hero-mark-slot">
              <div className="hero-mark">
                <HeroPlugMark />
              </div>
            </div>
            <div className="hero-aside__meta">
              <div className="hero-aside__row">
                <span>release</span>
                <strong>{siteConfig.releaseVersion}</strong>
              </div>
              <div className="hero-aside__row">
                <span>place</span>
                <strong>system tray</strong>
              </div>
              <div className="hero-aside__row">
                <span>format</span>
                <strong>VST3</strong>
              </div>
              <p>built for real-time mic chains before a stream, during a fix, and between takes.</p>
            </div>
          </aside>
        </div>
      </section>

      <div className="content-width hero-demo-wrap">
        <RoutingDemo />
      </div>

      <CanvasStatement />

      <TrayPresence />

      <section className="license-band content-width">
        <SectionRule>start where you are</SectionRule>
        <div className="license-band__head">
          <h2>
            free to route.
            <br />
            pro to keep building.
          </h2>
          <p>
            Public beta begins with a useful Free tier: 2 VST3 nodes and 1 preset. Pro unlocks unlimited nodes
            and presets — monthly or lifetime.
          </p>
        </div>
        <div className="license-table" role="table" aria-label="PatchTray Free and Pro features">
          <div className="license-row license-row--head" role="row">
            <span role="columnheader">license</span>
            <span role="columnheader">VST3 nodes</span>
            <span role="columnheader">presets</span>
            <span role="columnheader">price</span>
          </div>
          <div className="license-row" role="row">
            <strong role="cell">free</strong>
            <span role="cell">up to 2</span>
            <span role="cell">1</span>
            <span role="cell">included</span>
          </div>
          <div className="license-row license-row--pro" role="row">
            <strong role="cell">pro</strong>
            <span role="cell">unlimited</span>
            <span role="cell">unlimited</span>
            <span role="cell">
              <ProPriceNote />
            </span>
          </div>
        </div>
        <a href="/download" className="button button--line">
          [ view beta download ] <ArrowMark />
        </a>
      </section>
    </PageFrame>
  );
}
