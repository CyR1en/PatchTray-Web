import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useScrollPinProgress } from "../../hooks/useScrollPinProgress";
import { useShortViewportStatic } from "../../hooks/useShortViewportStatic";
import { phaseAmount } from "../../lib/math";
import type { Point } from "../../lib/types";
import { AsioNode } from "./AsioNode";
import { GraphCables } from "./GraphCables";
import { Meter } from "./Meter";
import { PluginNode } from "./PluginNode";

export function RoutingDemo({ compact = false }: { compact?: boolean }) {
  const reducedMotion = usePrefersReducedMotion();
  const shortViewport = useShortViewportStatic();
  const staticStage = reducedMotion || shortViewport;
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const inputJackRef = useRef<HTMLSpanElement>(null);
  const pluginInJackRef = useRef<HTMLSpanElement>(null);
  const pluginOutJackRef = useRef<HTMLSpanElement>(null);
  const outputJackRef = useRef<HTMLSpanElement>(null);

  const [paused, setPaused] = useState(false);
  const [stageInView, setStageInView] = useState(true);
  const progress = useScrollPinProgress(trackRef, stickyRef, {
    active: !staticStage && !paused,
    forceProgress: staticStage ? 1 : undefined,
  });
  const [vertical, setVertical] = useState(false);
  const [points, setPoints] = useState<{
    input: Point;
    pluginIn: Point;
    pluginOut: Point;
    output: Point;
  } | null>(null);
  const frozenProgress = useRef(0);
  const layoutStateRef = useRef<{
    showInput: boolean;
    showPlugin: boolean;
    showOutput: boolean;
    vertical: boolean;
  } | null>(null);

  const measureJacks = useCallback(() => {
    // Measure in graph-stage space — same coordinate system as the SVG overlay.
    const stage = stageRef.current;
    if (!stage) return;
    const stageBox = stage.getBoundingClientRect();
    const read = (el: HTMLSpanElement | null): Point | null => {
      if (!el) return null;
      const box = el.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) return null;
      return {
        x: box.left + box.width / 2 - stageBox.left,
        y: box.top + box.height / 2 - stageBox.top,
      };
    };

    const input = read(inputJackRef.current);
    const pluginIn = read(pluginInJackRef.current);
    const pluginOut = read(pluginOutJackRef.current);
    const output = read(outputJackRef.current);
    if (!input || !pluginIn || !pluginOut || !output) return;

    const nextPoints = { input, pluginIn, pluginOut, output };
    const matches = (a: Point, b: Point) => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5;
    setPoints((current) => {
      if (
        current &&
        matches(current.input, nextPoints.input) &&
        matches(current.pluginIn, nextPoints.pluginIn) &&
        matches(current.pluginOut, nextPoints.pluginOut) &&
        matches(current.output, nextPoints.output)
      ) {
        return current;
      }
      return nextPoints;
    });
  }, []);

  useLayoutEffect(() => {
    measureJacks();
    const stage = stageRef.current;
    if (!stage) return;

    let measureFrame = 0;
    const observer = new ResizeObserver(() => {
      if (measureFrame) return;
      measureFrame = requestAnimationFrame(() => {
        measureFrame = 0;
        setVertical(window.matchMedia("(max-width: 600px)").matches);
        measureJacks();
      });
    });
    observer.observe(stage);
    setVertical(window.matchMedia("(max-width: 600px)").matches);
    return () => {
      if (measureFrame) cancelAnimationFrame(measureFrame);
      observer.disconnect();
    };
  }, [measureJacks, compact]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => setStageInView(entry.isIntersecting));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const showInput = phaseAmount(progress, 0.02, 0.18) > 0.02;
  const showPlugin = phaseAmount(progress, 0.16, 0.34) > 0.02;
  const showOutput = phaseAmount(progress, 0.32, 0.48) > 0.02;
  const orangeProgress = phaseAmount(progress, 0.48, 0.7);
  const greenProgress = phaseAmount(progress, 0.68, 0.9);
  const live = progress >= 0.9 && !paused;
  const nodesActive = orangeProgress > 0.5;

  useEffect(() => {
    const nextLayoutState = { showInput, showPlugin, showOutput, vertical };
    const previousLayoutState = layoutStateRef.current;
    layoutStateRef.current = nextLayoutState;
    if (!previousLayoutState) return;
    if (
      previousLayoutState.showInput === showInput &&
      previousLayoutState.showPlugin === showPlugin &&
      previousLayoutState.showOutput === showOutput &&
      previousLayoutState.vertical === vertical
    ) {
      return;
    }

    // Re-measure only after a node visibility or layout-mode transition settles.
    const id = window.setTimeout(measureJacks, 50);
    return () => window.clearTimeout(id);
  }, [showInput, showPlugin, showOutput, measureJacks, vertical]);

  const stateLabel = paused
    ? "[ route paused ]"
    : live
      ? "[ route active ]"
      : progress < 0.02
        ? "[ waiting ]"
        : "[ assembling ]";

  const statusText = paused
    ? "[ demonstration paused ]"
    : live
      ? "[ connection displayed ]"
      : "[ scroll to patch the route ]";

  const onTogglePause = () => {
    if (staticStage) {
      setPaused((value) => !value);
      return;
    }
    if (!paused) {
      frozenProgress.current = progress;
      setPaused(true);
      return;
    }
    setPaused(false);
  };

  const onReplay = () => {
    frozenProgress.current = 0;
    setPaused(false);
    const track = trackRef.current;
    if (track && !staticStage) {
      const top = window.scrollY + track.getBoundingClientRect().top - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section
      className={`routing-demo ${compact ? "routing-demo--compact" : ""} ${staticStage ? "routing-demo--static" : ""}`}
      aria-labelledby="routing-demo-title"
    >
      <div className="routing-demo__scroll-track" ref={trackRef}>
        <div className="routing-demo__sticky" ref={stickyRef}>
          <div className="routing-demo__frame">
            <div className="routing-demo__topline">
              <h2 id="routing-demo-title">
                routing view <span>— graph demo</span>
              </h2>
              <span className={live ? "demo-state demo-state--live" : "demo-state"}>
                <i className="state-square" aria-hidden="true" />
                {stateLabel}
              </span>
            </div>

            <div className="routing-demo__canvas">
              <div className="canvas-corner canvas-corner--top">patchtray / graph</div>
              <div className="graph-stage" ref={stageRef}>
                <GraphCables
                  points={points}
                  orangeProgress={orangeProgress}
                  greenProgress={greenProgress}
                  flowing={live && stageInView}
                  vertical={vertical}
                />
                <AsioNode type="input" active={nodesActive} visible={showInput} jackRef={inputJackRef} />
                <PluginNode
                  active={nodesActive && greenProgress > 0.2}
                  visible={showPlugin}
                  inJackRef={pluginInJackRef}
                  outJackRef={pluginOutJackRef}
                />
                <AsioNode type="output" active={greenProgress > 0.5} visible={showOutput} jackRef={outputJackRef} />
              </div>
              <div className="canvas-corner canvas-corner--bottom">signal path: mic → VST3 → stream</div>
            </div>

            <div className="routing-demo__footer">
              <div>
                <span>input</span>
                <Meter active={live ? 6 : nodesActive ? 3 : 0} />
              </div>
              <div className="routing-demo__controls">
                <button
                  type="button"
                  className="button button--line"
                  onClick={onTogglePause}
                  aria-pressed={paused}
                >
                  {paused ? "[ resume demonstration ]" : "[ pause demonstration ]"}
                </button>
                <button type="button" className="button button--text" onClick={onReplay}>
                  [ replay ]
                </button>
              </div>
              <p role="status" aria-live="polite">
                {statusText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
