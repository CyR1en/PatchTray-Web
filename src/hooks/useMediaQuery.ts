import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  // The server and first browser render must agree for hydration. Read the real
  // media state in the effect immediately after the static markup is attached.
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
