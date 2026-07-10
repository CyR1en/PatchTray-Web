import type { CSSProperties } from "react";
import { bezierPath } from "../../lib/math";
import type { Point } from "../../lib/types";

export function GraphCables({
  points,
  orangeProgress,
  greenProgress,
  flowing,
  vertical,
}: {
  points: { input: Point; pluginIn: Point; pluginOut: Point; output: Point } | null;
  orangeProgress: number;
  greenProgress: number;
  flowing: boolean;
  vertical: boolean;
}) {
  if (!points) return null;

  const orangeD = bezierPath(points.input, points.pluginIn, vertical);
  const greenD = bezierPath(points.pluginOut, points.output, vertical);

  // Approximate bezier length for draw-on (React Flow uses real path length; this is close enough).
  const approxLen = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y) * 1.2;

  const cableStyle = (from: Point, to: Point, amount: number): CSSProperties => {
    if (amount <= 0) return { opacity: 0 };
    const len = Math.max(approxLen(from, to), 1);
    // Fully on + live: dashed flow (CSS animation). While drawing: solid reveal.
    if (amount >= 1 && flowing) {
      return { opacity: 1, strokeDasharray: "6 4", strokeDashoffset: 0 };
    }
    if (amount >= 1) {
      return { opacity: 1, strokeDasharray: "6 4", strokeDashoffset: 0 };
    }
    return {
      opacity: 1,
      strokeDasharray: `${len * amount} ${len}`,
      strokeDashoffset: 0,
    };
  };

  return (
    <svg className="graph-cables" aria-hidden="true">
      {orangeProgress > 0 && <path className="graph-cable graph-cable--idle" d={orangeD} />}
      {greenProgress > 0 && <path className="graph-cable graph-cable--idle" d={greenD} />}
      <path
        className={`graph-cable graph-cable--orange ${flowing && orangeProgress >= 1 ? "is-flowing" : ""}`}
        d={orangeD}
        style={cableStyle(points.input, points.pluginIn, orangeProgress)}
      />
      <path
        className={`graph-cable graph-cable--green ${flowing && greenProgress >= 1 ? "is-flowing" : ""}`}
        d={greenD}
        style={cableStyle(points.pluginOut, points.output, greenProgress)}
      />
    </svg>
  );
}
