import { useEffect, useRef, useState, type CSSProperties } from "react";
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

/** Schematic setup comparison — product language, not a pixel-perfect DAW. */
const DAW_CHORES = [
  "create a project",
  "configure the mixer",
  "arm an input track",
  "watch the timeline",
  "bounce to hear it",
] as const;

const HOST_STEPS = [
  { id: "01", title: "pick your asio input", detail: "the live sound you already have" },
  { id: "02", title: "drop in your vst3 plugins", detail: "the processors you already own" },
  { id: "03", title: "route to your asio output", detail: "processed audio, immediately" },
] as const;

function HostStage({ progress, compact }: { progress: number; compact: boolean }) {
  // Chore list assembles → each line strikes through → the panel settles back
  // → the three-step host path takes over. On phone the stage sits under the
  // copy, so the whole story runs on earlier phase timings (same as tray).
  const stageIn = phaseAmount(progress, 0.04, compact ? 0.12 : 0.16);
  const choresIn = phaseAmount(progress, 0.1, compact ? 0.24 : 0.3);
  const strikes = phaseAmount(progress, compact ? 0.3 : 0.38, compact ? 0.56 : 0.68);
  const dawSettled = phaseAmount(progress, compact ? 0.56 : 0.66, compact ? 0.68 : 0.8);
  const stepsIn = phaseAmount(progress, compact ? 0.62 : 0.72, compact ? 0.86 : 0.94);
  const live = progress >= (compact ? 0.86 : 0.94);

  return (
    <div
      className="host-stage"
      style={{
        opacity: Math.max(stageIn, 0.001),
        transform: `translateY(${(1 - stageIn) * 12}px)`,
      }}
      aria-hidden="true"
    >
      <section
        className="host-stage__daw"
        style={{
          opacity: 1 - dawSettled * 0.55,
          transform: `translateY(${dawSettled * -6}px)`,
        }}
      >
        <header>
          <span>the daw way</span>
          <em>[ session setup ]</em>
        </header>
        <ul className="host-chores">
          {DAW_CHORES.map((chore, index) => {
            const itemIn = phaseAmount(choresIn, index * 0.16, index * 0.16 + 0.3);
            const strike = phaseAmount(strikes, index * 0.16, index * 0.16 + 0.3);
            return (
              <li
                key={chore}
                className="host-chore"
                style={{
                  opacity: Math.max(itemIn, 0.001) * (1 - strike * 0.55),
                  transform: `translateY(${(1 - itemIn) * 8}px)`,
                }}
              >
                <span>{chore}</span>
                <i className="host-chore__strike" style={{ transform: `scaleX(${strike})` }} />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="host-stage__steps">
        <header>
          <span>the patchtray way</span>
          <em className={live ? "is-live" : ""}>[ plug and play ]</em>
        </header>
        <ol className="host-steps">
          {HOST_STEPS.map((step, index) => {
            const stepIn = phaseAmount(stepsIn, index * 0.24, index * 0.24 + 0.34);
            return (
              <li key={step.id} className="host-step" style={revealStyle(stepIn, 10)}>
                <span className="host-step__index">{step.id}</span>
                <div className="host-step__copy">
                  <strong>{step.title}</strong>
                  <span>{step.detail}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <p className={`host-stage__caption ${live ? "is-live" : ""}`}>
        <i className="state-square" aria-hidden="true" />
        {live ? "no project. no timeline. just your plugins, live." : "setup chores leave the path"}
      </p>
    </div>
  );
}

export function HostStatement() {
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

  return (
    <section
      className={`host-statement ${staticStage ? "host-statement--static" : ""}`}
      aria-labelledby="host-statement-title"
    >
      <div className="host-statement__scroll-track" ref={trackRef}>
        <div className="host-statement__sticky" ref={stickyRef}>
          <div className="host-statement__frame content-width">
            <div className="host-statement__grid">
              <HostStage progress={progress} compact={compact} />

              <div className="host-statement__copy">
                <div style={revealStyle(Math.max(ruleAmount, 0.001), 8)}>
                  <SectionRule>not a daw</SectionRule>
                </div>
                <h2 id="host-statement-title" style={revealStyle(headAmount, 12)}>
                  Not a DAW.
                  <br />
                  A VST3 host.
                </h2>
                <p style={revealStyle(bodyAmount, 8)}>
                  A DAW is built for sessions: projects, mixers, timelines, bounces. PatchTray skips the session.
                  Open it, place your plugins on the path, and your live input is already processed — nothing to
                  arm, record, or render.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
