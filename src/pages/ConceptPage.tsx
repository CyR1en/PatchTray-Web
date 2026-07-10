import { useState } from "react";
import { Mark } from "../components/marks";
import { RoutingDemo } from "../components/routing/RoutingDemo";

export function ConceptPage() {
  const [mode, setMode] = useState<"wide" | "compact">("wide");
  return (
    <>
      <a className="skip-link" href="#concept-main">
        skip to concepts
      </a>
      <header className="concept-header">
        <a className="brand" href="/">
          <Mark className="brand__mark" />
          <span>patchtray</span>
        </a>
        <span>design review / not in main navigation</span>
        <a href="/">[ return home ]</a>
      </header>
      <main id="concept-main" className="concept-main content-width">
        <section className="concept-intro">
          <p className="terminal-label">review route / responsive composition</p>
          <h1>
            routing stays
            <br />
            the center.
          </h1>
          <p>
            This review route compares the production routing story at two densities. It is intentionally not
            linked from the public navigation.
          </p>
          <div className="segmented" role="group" aria-label="Choose review composition">
            <button
              className={mode === "wide" ? "is-active" : ""}
              onClick={() => setMode("wide")}
              aria-pressed={mode === "wide"}
            >
              [ wide canvas ]
            </button>
            <button
              className={mode === "compact" ? "is-active" : ""}
              onClick={() => setMode("compact")}
              aria-pressed={mode === "compact"}
            >
              [ compact lane ]
            </button>
          </div>
        </section>
        <section className={`concept-stage concept-stage--${mode}`}>
          <div className="concept-stage__note">
            <span>review note</span>
            <p>
              {mode === "wide"
                ? "Generous landscape composition lets the cables read as a single signal path."
                : "Compact composition stacks the signal path without shrinking controls below a usable size."}
            </p>
          </div>
          <RoutingDemo compact={mode === "compact"} />
        </section>
        <section className="concept-notes">
          <p>
            <strong>kept:</strong> canvas, hairlines, status language, rare accents.
          </p>
          <p>
            <strong>avoided:</strong> decorative motion, mystery controls, faux hardware, sales-dashboard grids.
          </p>
        </section>
      </main>
    </>
  );
}
