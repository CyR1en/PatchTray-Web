import { PageFrame } from "../components/layout/PageFrame";

export function NotFoundPage() {
  return (
    <PageFrame current="home">
      <section className="not-found content-width">
        <p className="terminal-label">route not found</p>
        <h1>nothing is patched here.</h1>
        <a className="button button--primary" href="/">
          [ return home ]
        </a>
      </section>
    </PageFrame>
  );
}
