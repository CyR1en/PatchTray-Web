import { useEffect, useState } from "react";
import { siteConfig } from "../config";
import { ArrowMark, WindowsMark } from "../components/marks";
import { CanvasStatement } from "../components/CanvasStatement";
import { ClosingCta } from "../components/ClosingCta";
import { HostStatement } from "../components/HostStatement";
import { ProductProof } from "../components/ProductProof";
import { UseCaseStrip } from "../components/UseCaseStrip";
import { LicenseComparisonStrip } from "../components/LicenseComparisonStrip";
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
              windows / asio / vst3 host / {siteConfig.releaseState}
            </p>
            <h1>
              <span className="hero-line">
                <span className="hero-line__inner">process live audio</span>
              </span>
              <span className="hero-line">
                <span className="hero-line__inner hero__word">with your VST3 plugins.</span>
              </span>
            </h1>
            <p className="hero-lead">
              PatchTray connects an ASIO input, your VST3 processing, and an ASIO output in one visible route.
              Build the chain on the canvas, then keep it running from the system tray.
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
              <div className="hero-aside__rows">
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
              </div>
              <p className="hero-aside__status" aria-label="Product summary">
                <strong>{siteConfig.releaseVersion}</strong>
                <span aria-hidden="true"> · </span>
                <span>system tray</span>
                <span aria-hidden="true"> · </span>
                <span>VST3</span>
              </p>
              <p className="hero-aside__note">
                built for live audio chains that need to stay visible, adjustable, and close at hand.
              </p>
              <div className="hero-meter" aria-hidden="true">
                <div className="hero-meter__bars">
                  {Array.from({ length: 14 }, (_, i) => (
                    <i key={i} />
                  ))}
                </div>
                <span className="hero-meter__label">
                  <i className="state-square state-square--green" />
                  signal live
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="content-width hero-demo-wrap">
        <RoutingDemo />
      </div>

      <ProductProof />

      <HostStatement />

      <CanvasStatement />

      <UseCaseStrip />

      <TrayPresence />

      <LicenseComparisonStrip />

      <ClosingCta />
    </PageFrame>
  );
}
