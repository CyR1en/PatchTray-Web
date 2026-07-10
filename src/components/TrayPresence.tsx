import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowMark } from "./marks";
import { SectionRule } from "./SectionRule";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useScrollPinProgress } from "../hooks/useScrollPinProgress";
import { useShortViewportStatic } from "../hooks/useShortViewportStatic";
import { clamp01, phaseAmount } from "../lib/math";

function revealStyle(amount: number, rise = 8): CSSProperties {
  const a = clamp01(amount);
  return {
    opacity: a,
    transform: `translateY(${(1 - a) * rise}px)`,
  };
}

/** Schematic tray menu labels — match product language, not a pixel-perfect shell. */
const MENU_ITEMS = [
  { id: "show", label: "show main window" },
  { id: "hide", label: "hide to tray" },
  { id: "settings", label: "settings", rule: true },
  { id: "exit", label: "exit", danger: true },
] as const;

function TrayStage({ progress, compact }: { progress: number; compact: boolean }) {
  // Hold the window readable for most of the first half of the pin,
  // then minimize → tray icon → menu.
  // On phone the stage sits under the copy, so the minimize must finish
  // earlier or the window still reads as a large ghost while the menu is up.
  const stageIn = phaseAmount(progress, 0.04, 0.16);
  const minimize = phaseAmount(
    progress,
    compact ? 0.36 : 0.48,
    compact ? 0.58 : 0.76,
  );
  const trayPulse = phaseAmount(
    progress,
    compact ? 0.48 : 0.62,
    compact ? 0.68 : 0.82,
  );
  const menuIn = phaseAmount(
    progress,
    compact ? 0.58 : 0.76,
    compact ? 0.78 : 0.92,
  );
  const live = progress >= (compact ? 0.78 : 0.9);

  // Phone: shrink harder and fade out sooner so no large residual remains.
  // Prefer scale (origin bottom-right) over large % translates — those expand
  // the scrollable overflow width on narrow viewports.
  const shrink = compact ? 0.96 : 0.92;
  const fade = compact ? 1.45 : 1.15;
  const windowScale = 1 - minimize * shrink;
  const windowX = minimize * (compact ? 8 : 52);
  const windowY = minimize * (compact ? 18 : 48);
  const windowOpacity = 1 - Math.min(1, minimize * fade);

  return (
    <div
      className="tray-stage"
      style={{
        opacity: Math.max(stageIn, 0.001),
        transform: `translateY(${(1 - stageIn) * 12}px)`,
      }}
      aria-hidden="true"
    >
      <div className="tray-stage__field">
        <div
          className="tray-window"
          style={{
            opacity: Math.max(windowOpacity, 0),
            transform: `translate(${windowX}%, ${windowY}%) scale(${windowScale})`,
            visibility: windowOpacity <= 0.02 ? "hidden" : "visible",
          }}
        >
          <div className="tray-window__bar">
            <span>patchtray</span>
            <em className={minimize > 0.12 ? "is-active" : ""}>[ to tray ]</em>
          </div>
          <div className="tray-window__body">
            <div className="tray-window__grid" />
            <div className="tray-window__blocks">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="tray-window__foot">
            <span className={live ? "is-live" : ""}>
              <i className="state-square" />
              {live ? "[ engine continues ]" : "[ route active ]"}
            </span>
          </div>
        </div>

        <div className="tray-dock">
          <div
            className={`tray-icon ${trayPulse > 0.45 ? "is-lit" : ""} ${live ? "is-live" : ""}`}
            style={{
              opacity: 0.4 + trayPulse * 0.6,
              transform: `scale(${0.88 + trayPulse * 0.12})`,
            }}
          >
            <img src="/assets/patchtray-mark.svg" alt="" />
          </div>

          <div
            className="tray-menu"
            style={{
              opacity: menuIn,
              transform: `translateY(${(1 - menuIn) * 10}px)`,
            }}
          >
            <header>patchtray</header>
            <ul>
              {MENU_ITEMS.map((item) => (
                <li
                  key={item.id}
                  className={[
                    "rule" in item && item.rule ? "has-rule" : "",
                    "danger" in item && item.danger ? "is-danger" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className={`tray-stage__caption ${live ? "is-live" : ""}`}>
        <i className="state-square" aria-hidden="true" />
        {live ? "audio keeps running from the system tray" : "window steps down into the tray"}
      </p>
    </div>
  );
}

export function TrayPresence() {
  const reducedMotion = usePrefersReducedMotion();
  const shortViewport = useShortViewportStatic();
  const staticStage = reducedMotion || shortViewport;
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const progress = useScrollPinProgress(trackRef, stickyRef, {
    active: !staticStage,
    forceProgress: staticStage ? 1 : undefined,
  });
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 600px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const ruleAmount = phaseAmount(progress, 0.0, 0.1);
  const headAmount = phaseAmount(progress, 0.04, 0.16);
  const bodyAmount = phaseAmount(progress, 0.1, 0.24);
  const ctaAmount = phaseAmount(progress, 0.18, 0.32);

  return (
    <section
      className={`tray-presence ${staticStage ? "tray-presence--static" : ""}`}
      aria-labelledby="tray-presence-title"
    >
      <div className="tray-presence__scroll-track" ref={trackRef}>
        <div className="tray-presence__sticky" ref={stickyRef}>
          <div className="tray-presence__frame content-width">
            <div className="tray-presence__grid">
              <TrayStage progress={progress} compact={compact} />

              <div className="tray-presence__copy">
                <div style={revealStyle(Math.max(ruleAmount, 0.001), 8)}>
                  <SectionRule>the details stay in reach</SectionRule>
                </div>
                <h2 id="tray-presence-title" style={revealStyle(headAmount, 12)}>
                  available when
                  <br />
                  the window is not.
                </h2>
                <p style={revealStyle(bodyAmount, 8)}>
                  PatchTray is designed to minimize to the system tray while the audio work continues. When you
                  come back, there are presets for the routes you return to and real-time telemetry for the state
                  you need to read.
                </p>
                <div style={revealStyle(ctaAmount, 6)}>
                  <a href="/guide" className="button button--text">
                    [ get oriented ] <ArrowMark />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
