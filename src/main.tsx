import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { App } from "./App";
import "./styles.css";

/**
 * Analytics never needs a query string, and `/checkout/success` is reached with a
 * Stripe session id attached. The page strips it from the address bar on mount,
 * but the first pageview can fire before that — so drop it here too, for every
 * route, rather than relying on the ordering.
 */
function stripQuery(url: string): string {
  const cut = url.indexOf("?");
  return cut === -1 ? url : url.slice(0, cut);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Analytics beforeSend={(event) => ({ ...event, url: stripQuery(event.url) })} />
    <SpeedInsights beforeSend={(event) => ({ ...event, url: stripQuery(event.url) })} />
  </StrictMode>,
);
