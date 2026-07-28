import { useEffect } from "react";
import { PageFrame } from "../components/layout/PageFrame";
import { SectionRule } from "../components/SectionRule";
import { WindowsMark } from "../components/marks";
import { analyticsEvents } from "../lib/analytics";

/**
 * The return destination for both Stripe Payment Links.
 *
 * This page never reads `window.location.search`. Stripe appends a session id to
 * the return URL, and the only safe handling of an identifier supplied by the
 * browser is not to read it at all — nothing here may grant Pro, confirm a
 * purchase, or disclose anything about an order based on a value in the URL. The
 * signed Stripe webhook is the sole authority on fulfillment.
 *
 * For the same reason there are no network calls: not to the webhook, not to
 * `/v1/licenses/*`, not to an admin endpoint. The page is static reassurance and
 * nothing else.
 *
 * If a future change needs order details here, that is a server-side lookup
 * behind its own authentication — not a query parameter this page trusts.
 */
export function CheckoutSuccessPage() {
  useEffect(() => {
    // Drop the query string so the session id leaves the address bar, the
    // history entry, and the referrer of anything the customer clicks next.
    window.history.replaceState(null, "", "/checkout/success");
  }, []);

  return (
    <PageFrame current="checkoutSuccess">
      <section className="page-hero content-width page-hero--checkout">
        <p className="terminal-label">patchtray / checkout</p>
        <h1>
          payment
          <br />
          submitted.
        </h1>
        <p className="page-lead">
          Your PatchTray Pro license key is on its way to the email address you used at checkout.
        </p>
      </section>

      <section className="checkout-next content-width" aria-labelledby="checkout-next-title">
        <SectionRule>what happens next</SectionRule>
        <h2 id="checkout-next-title">the key arrives by email.</h2>
        <ol className="checkout-steps">
          <li>
            <strong>the payment settles</strong>
            <span>
              Most methods confirm straight away and some take longer. The license is issued when the payment is
              confirmed, not when this page loads.
            </span>
          </li>
          <li>
            <strong>the key is emailed</strong>
            <span>It goes to the address you entered at checkout. Nothing else is needed from you.</span>
          </li>
          <li>
            <strong>you activate PatchTray</strong>
            <span>Enter the key in PatchTray and the Free limits lift on that device.</span>
          </li>
        </ol>

        <div className="checkout-actions">
          <a
            className="button button--primary"
            href="/download"
            data-analytics-event={analyticsEvents.downloadPage}
            data-analytics-detail="checkout_success"
          >
            <WindowsMark /> [ download patchtray ]
          </a>
          <a className="button button--line" href="/guides/build-your-first-vst3-chain">
            [ read the quick-start ]
          </a>
        </div>
      </section>

      <section className="checkout-help content-width" aria-labelledby="checkout-help-title">
        <SectionRule>if it has not arrived</SectionRule>
        <h2 id="checkout-help-title">check two things first.</h2>
        <ol className="checkout-steps checkout-steps--plain">
          <li>
            <strong>spam and junk</strong>
            <span>Transactional mail lands there more often than anyone expects.</span>
          </li>
          <li>
            <strong>the address you typed</strong>
            <span>A typo at checkout sends the license somewhere you cannot read.</span>
          </li>
        </ol>
        <p className="checkout-help__lead">
          Still nothing after a few hours? <a href="/support">Support</a> can find the order from the address you
          meant to use — the purchase email and a short description are enough.
        </p>
        <div className="checkout-warning">
          <p>
            PatchTray will never email you asking for your license key, a recovery code, a password, or card
            details. A message that does is not from us.
          </p>
        </div>
      </section>
    </PageFrame>
  );
}
