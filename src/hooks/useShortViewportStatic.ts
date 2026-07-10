import { useEffect, useState } from "react";

// Keep in sync with styles.css short-viewport static media query.
export const SHORT_VIEWPORT_STATIC_QUERY = "(max-width: 600px) and (max-height: 850px)";

export function useShortViewportStatic(): boolean {
  const [shortViewport, setShortViewport] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(SHORT_VIEWPORT_STATIC_QUERY).matches
      : false,
  );

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(SHORT_VIEWPORT_STATIC_QUERY);
    const onChange = (event: MediaQueryListEvent) => setShortViewport(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return shortViewport;
}
