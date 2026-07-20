import { useEffect, useRef, useState } from "react";
import { SectionRule } from "./SectionRule";

/**
 * Product proof — a static breather between the pinned demos.
 * The schematic sections abstract the app; this one shows it.
 */
export function ProductProof() {
  const [arrived, setArrived] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      setArrived(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setArrived(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`product-statement content-width${arrived ? " is-arrived" : ""}`}
      ref={sectionRef}
      aria-labelledby="product-proof-title"
    >
      <SectionRule>the actual app</SectionRule>
      <div className="product-statement__grid">
        <div className="product-statement__copy">
          <h2 id="product-proof-title">No mockups. This is PatchTray.</h2>
          <p>
            One window holds your master levels, your scanned VST3 plugins, and the canvas where the route is
            built. What you see here is what runs on your machine.
          </p>
          <p>
            Every schematic on this page is drawn from this interface — the nodes, the cables, the meters are
            the real thing.
          </p>
        </div>
        <figure className="app-capture app-capture--canvas">
          <img
            src="/assets/patchtray-canvas.png"
            alt="PatchTray main window: master input and output meters, a scanned VST3 plugin list, and the canvas routing an ASIO input through a VST3 plugin node into an ASIO output over Voicemeeter insert ASIO."
            loading="lazy"
          />
          <figcaption>
            <span>patchtray / main window</span>
            <strong>actual capture — live route over voicemeeter insert asio</strong>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
