import { DocPage, Pending, type DocSection } from "../components/layout/DocPage";
import { siteConfig } from "../config";

/** Update whenever the substance of these terms changes. */
const EFFECTIVE = "2026-07-25";

const sections: readonly DocSection[] = [
  {
    id: "agreement",
    nav: "the agreement",
    title: "these terms apply when you install or buy PatchTray.",
    body: (
      <>
        <p>
          PatchTray is sold by CyR1en (Ethan Bacurio). Installing PatchTray or
          purchasing a Pro license means you accept these terms. If you do not accept them, do not install or
          purchase the software.
        </p>
        <p>
          You must be able to form a binding contract where you live. If you are buying on behalf of an
          organization, you confirm you are authorized to accept these terms for it.
        </p>
      </>
    ),
  },
  {
    id: "license",
    nav: "what you get",
    title: "a license to use the software, not ownership of it.",
    body: (
      <>
        <p>
          PatchTray grants you a personal, non-exclusive, non-transferable license to install and use the software
          on the number of devices your plan allows. PatchTray and its underlying code remain the property of the
          seller.
        </p>
        <ul className="legal-rows">
          <li>
            <strong>free</strong>
            <span>Up to 4 VST3 nodes and 1 saved preset. No purchase, no license key.</span>
          </li>
          <li>
            <strong>pro</strong>
            <span>Unlimited VST3 nodes and unlimited saved presets, unlocked by a license key.</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "pricing",
    nav: "price and billing",
    title: "two ways to buy Pro.",
    body: (
      <>
        <ul className="legal-rows">
          <li>
            <strong>monthly</strong>
            <span>
              {siteConfig.proMonthlyPrice} per month, charged automatically each period until you cancel.
            </span>
          </li>
          <li>
            <strong>lifetime</strong>
            <span>{siteConfig.proLifetimePrice} once, for the life of the product.</span>
          </li>
        </ul>
        <p>
          Prices are shown at checkout in the currency Stripe presents to you and may exclude taxes that Stripe
          calculates and adds. &ldquo;Lifetime&rdquo; means the lifetime of PatchTray as a product — it is a
          one-time purchase with no recurring charge, not a guarantee that the software will be published or
          supported indefinitely.
        </p>
        <p>Prices may change for new purchases. A price change never re-charges an existing lifetime license.</p>
      </>
    ),
  },
  {
    id: "devices",
    nav: "device limits",
    title: "a license covers a fixed number of devices at a time.",
    body: (
      <>
        <ul className="legal-rows">
          <li>
            <strong>monthly</strong>
            <span>Up to 2 activated devices at any one time.</span>
          </li>
          <li>
            <strong>lifetime</strong>
            <span>Up to 3 activated devices at any one time.</span>
          </li>
        </ul>
        <p>
          Deactivate a device inside PatchTray to free its slot for another machine. If you lose access to a
          device, key recovery is available from within PatchTray: it issues a new key, signs every device out, and
          activates the device that requested it. Recovery is deliberately not offered through this website.
        </p>
      </>
    ),
  },
  {
    id: "offline",
    nav: "offline use",
    title: "PatchTray keeps working without a connection, for a set period.",
    body: (
      <>
        <p>
          Activation issues an offline lease so PatchTray runs when the licensing service is unreachable — seven
          days on monthly, thirty days on lifetime. The lease renews whenever the software validates successfully.
        </p>
        <p>
          A lease is a convenience within the entitlement you bought, not a separate promise of service. When a
          lease expires without a successful validation, Pro features stop until the software can validate again.
        </p>
      </>
    ),
  },
  {
    id: "keys",
    nav: "keys and acceptable use",
    title: "your key is yours to protect.",
    body: (
      <>
        <p>
          Treat a license key like a password. You are responsible for activity under your key, and sharing it is
          the fastest way to lose it to someone else.
        </p>
        <p>You agree not to:</p>
        <ul>
          <li>share, publish, resell, rent, or sublicense a license key;</li>
          <li>
            circumvent, disable, or tamper with licensing, activation, device limits, or the offline lease
            mechanism;
          </li>
          <li>automate or script the licensing endpoints, or attempt to exhaust or overload them;</li>
          <li>reverse engineer the software except where that right cannot lawfully be excluded;</li>
          <li>use PatchTray in violation of applicable law, or to infringe someone else&rsquo;s rights.</li>
        </ul>
        <p>
          PatchTray hosts third-party VST3 plugins that you choose and install. Their licenses are between you and
          their authors.
        </p>
      </>
    ),
  },
  {
    id: "cancellation",
    nav: "renewal and cancellation",
    title: "a monthly plan renews until you stop it.",
    body: (
      <>
        <p>
          A monthly subscription renews automatically at the end of each billing period. Cancel at any time to stop
          future renewals; your Pro entitlement continues through the period you have already paid for, unless that
          payment is refunded or reversed.
        </p>
        <p>
          A lifetime purchase does not renew and cannot be cancelled — it is a single charge. Refunds for either
          plan are covered by the <a href="/refunds">refund policy</a>.
        </p>
      </>
    ),
  },
  {
    id: "suspension",
    nav: "suspension and revocation",
    title: "what ends a license.",
    body: (
      <>
        <ul className="legal-rows">
          <li>
            <strong>refund</strong>
            <span>An approved refund revokes the license it paid for. PatchTray returns to Free.</span>
          </li>
          <li>
            <strong>open dispute</strong>
            <span>A payment dispute may suspend the license while the dispute is open.</span>
          </li>
          <li>
            <strong>lost dispute</strong>
            <span>A dispute resolved against the purchase revokes the license.</span>
          </li>
          <li>
            <strong>ended subscription</strong>
            <span>Pro features end when the paid period ends.</span>
          </li>
          <li>
            <strong>material abuse</strong>
            <span>
              Key sharing, circumvention, or attacks on the licensing service may suspend or revoke the license.
            </span>
          </li>
        </ul>
        <p>
          Losing Pro does not remove PatchTray from your computer or delete your presets. The software returns to
          the Free limits: 4 VST3 nodes and 1 preset.
        </p>
      </>
    ),
  },
  {
    id: "warranty",
    nav: "warranty",
    title: "the software is provided as it is.",
    body: (
      <>
        <p>
          PatchTray is provided &ldquo;as is,&rdquo; without warranties of any kind, whether express or implied,
          including any implied warranty of merchantability, fitness for a particular purpose, or
          non-infringement. The seller does not warrant that PatchTray will be uninterrupted, error-free, or
          compatible with any particular audio interface, ASIO driver, mixer, or plugin.
        </p>
        <p>
          Some jurisdictions do not allow the exclusion of implied warranties or of statutory consumer rights.
          Where that is the case, those rights apply and nothing here limits them.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    nav: "liability",
    title: "the limit is what you paid.",
    body: (
      <>
        <p>
          To the fullest extent permitted by law, the seller is not liable for indirect, incidental, special,
          consequential, or punitive damages, or for lost profits, lost recordings, lost audio work, or business
          interruption arising from your use of PatchTray.
        </p>
        <p>
          Total liability for any claim relating to PatchTray is limited to the amount you paid for the license in
          the twelve months before the claim arose.
        </p>
        <div className="legal-note">
          <p>
            PatchTray processes live audio. Do not rely on it as the only safeguard in a broadcast, performance,
            or recording where failure would be costly. Keep a fallback path in your signal chain.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "law",
    nav: "governing law",
    title: "which law applies.",
    body: (
      <>
        <p>
          These Terms shall be governed, construed, and enforced in accordance with the laws of the State of Colorado, 
          without giving effect to any principles of conflicts of law. Any legal suit, action, or proceeding arising out 
          of or related to these Terms shall be instituted exclusively in the state or federal courts located in the 
          City and County of Denver, Colorado, and each party irrevocably submits to the personal jurisdiction and 
          venue of such courts.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    nav: "changes and contact",
    title: "changes carry a new effective date.",
    body: (
      <>
        <p>
          These terms may change. The effective date at the top of the page changes with them, and continuing to
          use PatchTray after that date means the updated terms apply. If a provision is held unenforceable, the
          rest stays in force.
        </p>
        <div className="legal-contact">
          <p>
            contact · <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
          </p>
          <p>
            privacy · <a href="/privacy">how data is handled</a>
          </p>
          <p>
            refunds · <a href="/refunds">refund and dispute policy</a>
          </p>
        </div>
      </>
    ),
  },
];

export function TermsPage() {
  return (
    <DocPage
      page="terms"
      label="patchtray / terms"
      heading={
        <>
          the terms
          <br />
          stated plainly.
        </>
      }
      lead="What a PatchTray license covers, what it costs, how many devices it runs on, and what happens when a subscription ends, a refund is approved, or a payment is disputed."
      effective={EFFECTIVE}
      sections={sections}
    />
  );
}
