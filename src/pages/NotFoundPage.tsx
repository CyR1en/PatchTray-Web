import { PageFrame } from "../components/layout/PageFrame";
import { ArrowMark } from "../components/marks";

const KNOWN_ROUTES = [
  { path: "/", name: "home — the overview" },
  { path: "/download", name: "download — get the beta" },
  { path: "/guide", name: "guide — get oriented" },
] as const;

function UnpatchedStage() {
  return (
    <div className="not-found__panel">
      <header>
        <span>patchbay / status</span>
        <em>[ 404 ]</em>
      </header>
      <svg viewBox="0 0 480 240">
        <rect className="nf-node" x="24" y="76" width="128" height="88" />
        <text className="nf-text" x="40" y="103">asio input</text>
        <text className="nf-sub" x="40" y="122">source · idle</text>
        <text className="nf-sub" x="40" y="140">output</text>
        <rect className="nf-jack" x="146" y="114" width="12" height="12" />
        <rect className="nf-jack-dot" x="150" y="118" width="4" height="4" />

        <path className="nf-cable" d="M 158 120 C 208 120 218 166 284 170" />
        <path className="nf-x" d="M 280 162 l 16 16 M 296 162 l -16 16" />

        <rect className="nf-ghost" x="336" y="76" width="128" height="88" />
        <rect className="nf-ghost-jack" x="330" y="114" width="12" height="12" />
        <text className="nf-text nf-text--ghost" x="352" y="103">???</text>
        <text className="nf-sub" x="352" y="122">route not found</text>
      </svg>
      <footer>
        <span>
          <i className="state-square state-square--orange" aria-hidden="true" />
          cable ends mid-air — no destination patched
        </span>
      </footer>
    </div>
  );
}

export function NotFoundPage() {
  const requestedPath = typeof window === "undefined" ? "/" : window.location.pathname;

  return (
    <PageFrame current="home">
      <section className="not-found content-width" aria-labelledby="not-found-title">
        <p className="terminal-label">error / 404 — route not found</p>
        <div className="not-found__grid">
          <div className="not-found__copy">
            <h1 id="not-found-title">nothing is patched here.</h1>
            <p className="not-found__lead">
              The address you followed doesn&rsquo;t resolve to a route on this patchbay. The cable is fine —
              there&rsquo;s just no node at the other end.
            </p>
            <p className="not-found__request">
              <span>requested</span>
              <code>{requestedPath}</code>
              <span>status</span>
              <em>[ unpatched ]</em>
            </p>
            <div className="not-found__actions">
              <a className="button button--primary" href="/">
                [ return home ]
              </a>
            </div>
            <nav className="not-found__routes" aria-label="Known routes">
              <p>known routes</p>
              {KNOWN_ROUTES.map((route) => (
                <a key={route.path} href={route.path}>
                  <span className="not-found__route-path">{route.path}</span>
                  <span className="not-found__route-name">{route.name}</span>
                  <ArrowMark />
                </a>
              ))}
            </nav>
          </div>

          <div className="not-found__stage" aria-hidden="true">
            <UnpatchedStage />
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
