import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { clamp01 } from "../lib/math";

const PROGRESS_EPSILON = 0.0005;

type Subscriber = {
  trackRef: RefObject<HTMLElement | null>;
  stickyRef: RefObject<HTMLElement | null>;
  publish: (progress: number) => void;
  stickyTop: number;
  scrollRange: number;
  visible: boolean;
  observer?: IntersectionObserver;
};

const subscribers = new Set<Subscriber>();
let frame = 0;
let needsMeasure = false;

function measure(subscriber: Subscriber) {
  const track = subscriber.trackRef.current;
  const sticky = subscriber.stickyRef.current;
  if (!track || !sticky) return false;

  subscriber.stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
  subscriber.scrollRange = Math.max(track.offsetHeight - sticky.offsetHeight, 1);
  return true;
}

function updateProgress(subscriber: Subscriber) {
  const track = subscriber.trackRef.current;
  if (!track) return;

  const trackRect = track.getBoundingClientRect();
  subscriber.publish(clamp01((subscriber.stickyTop - trackRect.top) / subscriber.scrollRange));
}

function runFrame() {
  frame = 0;
  const shouldMeasure = needsMeasure;
  needsMeasure = false;

  subscribers.forEach((subscriber) => {
    if (!subscriber.visible) return;
    if (shouldMeasure && !measure(subscriber)) return;
    updateProgress(subscriber);
  });
}

function scheduleFrame() {
  if (!frame) frame = window.requestAnimationFrame(runFrame);
}

function onScroll() {
  scheduleFrame();
}

function onResize() {
  needsMeasure = true;
  scheduleFrame();
}

function subscribe(subscriber: Subscriber) {
  const wasEmpty = subscribers.size === 0;
  subscribers.add(subscriber);
  if (wasEmpty) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
  }

  if (measure(subscriber)) updateProgress(subscriber);

  const track = subscriber.trackRef.current;
  if (track && "IntersectionObserver" in window) {
    subscriber.observer = new IntersectionObserver(
      ([entry]) => {
        subscriber.visible = entry.isIntersecting;
        if (!subscriber.visible) return;

        needsMeasure = true;
        scheduleFrame();
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    subscriber.observer.observe(track);
  }

  return () => {
    subscriber.observer?.disconnect();
    subscribers.delete(subscriber);
    if (subscribers.size) return;

    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    needsMeasure = false;
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

export function useScrollPinProgress(
  trackRef: RefObject<HTMLElement | null>,
  stickyRef: RefObject<HTMLElement | null>,
  options: { active?: boolean; forceProgress?: number } = {},
) {
  const { active = true, forceProgress } = options;
  const initialProgress = clamp01(forceProgress ?? 0);
  const [progress, setProgress] = useState(initialProgress);
  const progressRef = useRef(initialProgress);

  const publish = useCallback((nextProgress: number) => {
    if (Math.abs(nextProgress - progressRef.current) < PROGRESS_EPSILON) return;
    progressRef.current = nextProgress;
    setProgress(nextProgress);
  }, []);

  useEffect(() => {
    if (forceProgress !== undefined) {
      publish(clamp01(forceProgress));
      return;
    }
    if (!active) return;

    return subscribe({
      trackRef,
      stickyRef,
      publish,
      stickyTop: 0,
      scrollRange: 1,
      visible: true,
    });
  }, [active, forceProgress, publish, stickyRef, trackRef]);

  return progress;
}
