import { useRef, type CSSProperties } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useScrollPinProgress } from "../hooks/useScrollPinProgress";
import { UNPINNED_STAGE_QUERY } from "../lib/layout";
import { clamp01, phaseAmount } from "../lib/math";
import { DemoKnob } from "./routing/DemoKnob";
import { DEMO_PARAMS } from "./routing/constants";
import { SectionRule } from "./SectionRule";

function revealStyle(amount: number, rise = 8): CSSProperties {
  const a = clamp01(amount);
  return {
    opacity: a,
    transform: `translateY(${(1 - a) * rise}px)`,
  };
}

/** Same node and numbers as the plugin node in the hero demo — one set, not two. */
const PARAMS = DEMO_PARAMS.slice(0, 4);
const PLUGIN_NAME = "spectral comp";

/**
 * The plugin node as the app draws it: header (led · name · actions), a knob
 * grid, and the footer with page, cfg, and a plugin-type marker. Same parts as
 * `PluginNode` in the hero demo — this one just sits in a card instead of on
 * the graph, so it carries no jacks or cables.
 */
function ControlNode({ knobsAmount, guiActive }: { knobsAmount: number; guiActive: boolean }) {
  const live = knobsAmount >= 1;

  return (
    <div className={`control-node ${live ? "is-live" : ""}`}>
      <div className="signal-node__head">
        <span>
          <i className="node-led node-led--plugin" aria-hidden="true" />
          <span className="control-node__name">{PLUGIN_NAME}</span>
        </span>
        <span className="plugin-actions" aria-label="Plugin controls">
          <span>[ on ]</span>
          <span className={guiActive ? "is-active" : ""}>[ gui ]</span>
          <span>[ × ]</span>
        </span>
      </div>

      <div className="control-node__body">
        <div className="plugin-parameter-grid" aria-label="VST3 parameter controls on the node">
          {PARAMS.map((param, index) => {
            // Knobs land one after the next; their readings never move, so the
            // needle and the value always agree.
            const start = index * 0.18;
            return (
              <div key={param.label} style={revealStyle(phaseAmount(knobsAmount, start, start + 0.46), 8)}>
                <DemoKnob label={param.label} value={param.value} amount={param.amount} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="plugin-node__foot">
        <span className="plugin-node__page" aria-label="Parameter page 1 of 2">
          <i aria-hidden="true">◀</i>
          <strong>1</strong>
          <em>/2</em>
          <i aria-hidden="true">▶</i>
        </span>
        <span className="plugin-node__cfg">[ cfg ]</span>
        <span className="plugin-node__meta">audio fx</span>
      </div>
    </div>
  );
}

function ControlModes({ progress }: { progress: number }) {
  // Both cards share one frame: revealing them separately would leave the grid's
  // rule background filling the empty cell. The staging happens inside instead.
  const frameAmount = phaseAmount(progress, 0.18, 0.32);
  const knobsAmount = phaseAmount(progress, 0.26, 0.5);
  const windowAmount = phaseAmount(progress, 0.56, 0.74);
  const captionAmount = phaseAmount(progress, 0.6, 0.72);
  const live = progress >= 0.82;

  return (
    <div className="control-modes" aria-label="Plugin control modes">
      <div className="control-modes__grid" style={revealStyle(frameAmount, 10)}>
        <article className="path-mode">
          <header>
            <span>on the node</span>
            <strong>parameter controls</strong>
          </header>
          <ControlNode knobsAmount={knobsAmount} guiActive={windowAmount > 0} />
          <p>stay in the route when that is enough</p>
        </article>

        <article className="path-mode path-mode--native">
          <header>
            <span>in its own window</span>
            <strong>native editor</strong>
          </header>
          <div
            className="path-mode__window"
            aria-hidden="true"
            style={{ ["--open" as string]: String(clamp01(windowAmount)) }}
          >
            <div className="path-mode__window-bar">
              <span>plugin gui</span>
              <span className={windowAmount >= 0.5 ? "is-open" : ""}>[ open ]</span>
            </div>
            <div className="path-mode__window-body" />
          </div>
          <p>full plugin window without leaving the canvas model</p>
        </article>
      </div>

      <p className={`control-modes__caption ${live ? "is-live" : ""}`} style={revealStyle(captionAmount, 6)}>
        <i className="state-square" aria-hidden="true" />
        {live ? "two ways into the same plugin" : "control stays on the path"}
      </p>
    </div>
  );
}

export function CanvasStatement() {
  const reducedMotion = usePrefersReducedMotion();
  const unpinned = useMediaQuery(UNPINNED_STAGE_QUERY);
  const staticStage = reducedMotion || unpinned;
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
                  <SectionRule>control the plugin</SectionRule>
                </div>
                <h2 id="canvas-statement-title" style={revealStyle(headAmount, 12)}>
                  Tune it in place.
                  <br />
                  Open the editor.
                </h2>
                <p style={revealStyle(bodyAmount, 8)}>
                  Each VST3 node exposes its parameters on the canvas when the plugin provides them, so small
                  changes stay in the route. When you need the full interface, open the plugin’s native editor
                  window from the node itself.
                </p>
              </div>

              <ControlModes progress={progress} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
