import type { Point } from "./types";

export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function phaseAmount(progress: number, start: number, end: number) {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

export function bezierPath(from: Point, to: Point, vertical: boolean): string {
  if (vertical) {
    const dy = Math.abs(to.y - from.y) * 0.5;
    return `M ${from.x},${from.y} C ${from.x},${from.y + dy} ${to.x},${to.y - dy} ${to.x},${to.y}`;
  }
  const dx = Math.abs(to.x - from.x) * 0.5;
  return `M ${from.x},${from.y} C ${from.x + dx},${from.y} ${to.x - dx},${to.y} ${to.x},${to.y}`;
}
