import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowMark } from "./marks";
import { SectionRule } from "./SectionRule";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useScrollPinProgress } from "../hooks/useScrollPinProgress";
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
  const fieldRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [minimizeTarget, setMinimizeTarget] = useState({ x: 0, y: 0, endScale: 1 });

  // The stage changes width at each breakpoint, while the window has a capped
  // width. Measure its lower-right transform origin against the icon centre so
  // the collapse lands on the tray rather than a guessed percentage nearby.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    const windowEl = windowRef.current;
    const icon = iconRef.current;
    if (!field || !windowEl || !icon) return;

    const measure = () => {
      const iconBounds = icon.getBoundingClientRect();
      const fieldBounds = field.getBoundingClientRect();
      const windowWidth = windowEl.offsetWidth;
      const windowHeight = windowEl.offsetHeight;
      const iconWidth = icon.offsetWidth;
      const iconHeight = icon.offsetHeight;
      if (!windowWidth || !windowHeight || !iconWidth || !iconHeight) return;

      const targetX = iconBounds.left - fieldBounds.left + iconBounds.width / 2;
      const targetY = iconBounds.top - fieldBounds.top + iconBounds.height / 2;
      const endScale = Math.min(iconWidth / windowWidth, iconHeight / windowHeight);
      const next = {
        // The transform origin is the window's lower-right corner. Offset by
        // half the scaled window so its final visual centre meets the icon.
        x: targetX - windowEl.offsetLeft - windowWidth + (windowWidth * endScale) / 2,
        y: targetY - windowEl.offsetTop - windowHeight + (windowHeight * endScale) / 2,
        endScale,
      };

      setMinimizeTarget((current) =>
        Math.abs(current.x - next.x) < 0.5 &&
        Math.abs(current.y - next.y) < 0.5 &&
        Math.abs(current.endScale - next.endScale) < 0.001
          ? current
          : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(field);
    observer.observe(windowEl);
    observer.observe(icon);
    return () => observer.disconnect();
  }, []);

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

  // Collapse toward the measured icon centre at every stage size. Keep the
  // window visible through most of the travel so the final convergence reads.
  const windowScale = 1 + (minimizeTarget.endScale - 1) * minimize;
  const windowX = minimizeTarget.x * minimize;
  const windowY = minimizeTarget.y * minimize;
  const windowOpacity = 1 - phaseAmount(minimize, 0.82, 1);

  return (
    <div
      className="tray-stage"
      style={{
        opacity: Math.max(stageIn, 0.001),
        transform: `translateY(${(1 - stageIn) * 12}px)`,
      }}
      aria-hidden="true"
    >
      <div className="tray-stage__field" ref={fieldRef}>
        <div
          className="tray-window"
          ref={windowRef}
          style={{
            opacity: Math.max(windowOpacity, 0),
            transform: `translate(${windowX}px, ${windowY}px) scale(${windowScale})`,
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
            ref={iconRef}
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
  const staticStage = reducedMotion;
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
                  <SectionRule>keep it running</SectionRule>
                </div>
                <h2 id="tray-presence-title" style={revealStyle(headAmount, 12)}>
                  Close the window.
                  <br />
                  Keep the chain.
                </h2>
                <p style={revealStyle(bodyAmount, 8)}>
                  Minimize PatchTray to the system tray and your audio processing continues. Reopen it when you
                  want to adjust the route, load a preset, or check real-time telemetry.
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
