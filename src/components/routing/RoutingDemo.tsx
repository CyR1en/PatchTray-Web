import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { clamp01, phaseAmount } from "../../lib/math";
import type { Point } from "../../lib/types";
import { AsioNode } from "./AsioNode";
import { GraphCables } from "./GraphCables";
import { Meter } from "./Meter";
import { PluginNode } from "./PluginNode";

export function RoutingDemo({ compact = false }: { compact?: boolean }) {
  const reducedMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const inputJackRef = useRef<HTMLSpanElement>(null);
  const pluginInJackRef = useRef<HTMLSpanElement>(null);
  const pluginOutJackRef = useRef<HTMLSpanElement>(null);
  const outputJackRef = useRef<HTMLSpanElement>(null);

  const [progress, setProgress] = useState(reducedMotion ? 1 : 0);
  const [paused, setPaused] = useState(false);
  const [vertical, setVertical] = useState(false);
  const [points, setPoints] = useState<{
    input: Point;
    pluginIn: Point;
    pluginOut: Point;
    output: Point;
  } | null>(null);
  const frozenProgress = useRef(0);

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

    setPoints({ input, pluginIn, pluginOut, output });
  }, []);

  useLayoutEffect(() => {
    measureJacks();
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new ResizeObserver(() => {
      setVertical(window.matchMedia("(max-width: 600px)").matches);
      measureJacks();
    });
    observer.observe(stage);
    setVertical(window.matchMedia("(max-width: 600px)").matches);
    return () => observer.disconnect();
  }, [measureJacks, compact]);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      return;
    }

    const track = trackRef.current;
    const sticky = stickyRef.current;
    if (!track || !sticky) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (paused) {
        setProgress(frozenProgress.current);
        return;
      }

      const trackRect = track.getBoundingClientRect();
      const stickyHeight = sticky.offsetHeight;
      // Distance the sticky unit can travel inside the track.
      const scrollRange = Math.max(track.offsetHeight - stickyHeight, 1);
      // 0 when sticky first pins under the header; 1 when track is exhausted.
      const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
      const scrolled = clamp01((stickyTop - trackRect.top) / scrollRange);
      frozenProgress.current = scrolled;
      setProgress(scrolled);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [paused, reducedMotion, compact]);

  useEffect(() => {
    // Re-measure after visibility / transform transitions settle.
    const id = window.setTimeout(measureJacks, 50);
    return () => window.clearTimeout(id);
  }, [progress, measureJacks, vertical]);

  const showInput = phaseAmount(progress, 0.02, 0.18) > 0.02;
  const showPlugin = phaseAmount(progress, 0.16, 0.34) > 0.02;
  const showOutput = phaseAmount(progress, 0.32, 0.48) > 0.02;
  const orangeProgress = phaseAmount(progress, 0.48, 0.7);
  const greenProgress = phaseAmount(progress, 0.68, 0.9);
  const live = progress >= 0.9 && !paused;
  const nodesActive = orangeProgress > 0.5;

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
    if (reducedMotion) {
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
    setProgress(reducedMotion ? 1 : 0);
    const track = trackRef.current;
    if (track && !reducedMotion) {
      const top = window.scrollY + track.getBoundingClientRect().top - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section
      className={`routing-demo ${compact ? "routing-demo--compact" : ""} ${reducedMotion ? "routing-demo--static" : ""}`}
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
                  flowing={live}
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
