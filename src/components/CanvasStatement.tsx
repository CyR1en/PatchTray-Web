import { useRef, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useScrollPinProgress } from "../hooks/useScrollPinProgress";
import { clamp01, phaseAmount } from "../lib/math";
import { SectionRule } from "./SectionRule";

function revealStyle(amount: number, rise = 8): CSSProperties {
  const a = clamp01(amount);
  return {
    opacity: a,
    transform: `translateY(${(1 - a) * rise}px)`,
  };
}

const PLACES = [
  { id: "01", title: "asio input", detail: "mic enters here" },
  { id: "02", title: "vst3 instance", detail: "processing stays on the path" },
  { id: "03", title: "asio output", detail: "to mixer / stream" },
] as const;

const PARAMS = [
  { label: "threshold", value: "-18.0 dB", amount: 0.42 },
  { label: "ratio", value: "4.0 : 1", amount: 0.55 },
  { label: "attack", value: "12 ms", amount: 0.28 },
  { label: "mix", value: "100 %", amount: 1 },
] as const;

function PathLedger({ progress }: { progress: number }) {
  const placesAmount = phaseAmount(progress, 0.18, 0.52);
  const linkAmount = phaseAmount(progress, 0.42, 0.68);
  const modesAmount = phaseAmount(progress, 0.58, 0.88);
  const live = progress >= 0.88;

  return (
    <div className="path-ledger" aria-label="Canvas places, path, and control modes">
      <ol
        className="path-ledger__places"
        style={{ ["--places-line" as string]: String(placesAmount) }}
      >
        {PLACES.map((place, index) => {
          const start = index * 0.22;
          const amount = phaseAmount(placesAmount, start, start + 0.35);
          return (
            <li key={place.id} className="path-ledger__place" style={revealStyle(amount, 10)}>
              <span className="path-ledger__index">{place.id}</span>
              <div className="path-ledger__place-copy">
                <strong>{place.title}</strong>
                <span>{place.detail}</span>
              </div>
            </li>
          );
        })}
      </ol>

      <p className={`path-ledger__status ${live ? "is-live" : ""}`} style={revealStyle(linkAmount, 6)}>
        <i className="state-square" aria-hidden="true" />
        {live ? "path known before live" : "path becoming visible"}
      </p>

      <div className="path-ledger__modes" style={revealStyle(modesAmount, 10)}>
        <article className="path-mode">
          <header>
            <span>on the graph</span>
            <strong>parameter controls</strong>
          </header>
          <ul>
            {PARAMS.map((param) => (
              <li key={param.label}>
                <span>{param.label}</span>
                <span
                  className="path-mode__bar"
                  style={{ ["--amount" as string]: String(param.amount) }}
                  aria-hidden="true"
                />
                <em>{param.value}</em>
              </li>
            ))}
          </ul>
          <p>stay in the route when that is enough</p>
        </article>

        <article className="path-mode path-mode--native">
          <header>
            <span>when needed</span>
            <strong>native editor</strong>
          </header>
          <div className="path-mode__window" aria-hidden="true">
            <div className="path-mode__window-bar">
              <span>plugin gui</span>
              <span>[ open ]</span>
            </div>
            <div className="path-mode__window-body" />
          </div>
          <p>full plugin window without leaving the canvas model</p>
        </article>
      </div>
    </div>
  );
}


export function CanvasStatement() {
  const reducedMotion = usePrefersReducedMotion();
  const staticStage = reducedMotion;
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const progress = useScrollPinProgress(trackRef, stickyRef, {
    active: !staticStage,
    forceProgress: staticStage ? 1 : undefined,
  });

  const ruleAmount = phaseAmount(progress, 0.0, 0.12);
  const headAmount = phaseAmount(progress, 0.06, 0.22);
  const bodyAmount = phaseAmount(progress, 0.14, 0.32);

  return (
    <section
      className={`canvas-statement ${staticStage ? "canvas-statement--static" : ""}`}
      aria-labelledby="canvas-statement-title"
    >
      <div className="canvas-statement__scroll-track" ref={trackRef}>
        <div className="canvas-statement__sticky" ref={stickyRef}>
          <div className="canvas-statement__frame content-width">
            <div className="canvas-statement__grid">
              <div className="canvas-statement__copy">
                <div style={revealStyle(Math.max(ruleAmount, 0.001), 8)}>
                  <SectionRule>the canvas is the setting</SectionRule>
                </div>
                <h2 id="canvas-statement-title" style={revealStyle(headAmount, 12)}>
                  See the path.
                  <br />
                  Change the path.
                </h2>
                <p style={revealStyle(bodyAmount, 8)}>
                  ASIO inputs, VST3 instances, and ASIO outputs each have a place on the canvas. See connections
                  before going live, then adjust parameters on the graph or open the native editor.
                </p>
              </div>

              <PathLedger progress={progress} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
