import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  // Keep the server and hydration snapshots identical; the effect below updates
  // the preference before any user interaction depends on it.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
