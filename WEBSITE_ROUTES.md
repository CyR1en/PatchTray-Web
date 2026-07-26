# Website routes for the PatchTray Pro launch

Status: planned from the licensing-service implementation and rollout notes as of 2026-07-25.

This document covers browser pages on `https://patchtray.io`. It does not turn
the licensing API on `https://license.patchtray.io` into website pages.

## Current routes

| Route | Purpose | Status |
| --- | --- | --- |
| `/` | Product overview and Pro comparison | Existing |
| `/download` | Installer, requirements, and Pro checkout actions | Existing |
| `/guide` | First-use guide | Existing |
| `/concepts` | Unlinked design-review page | Existing; not a public navigation item |
| `/privacy` | Privacy policy | Added and linked; copy awaits review |
| `/terms` | Product, license, and sale terms | Added and linked; two `<Pending>` items still block a final publish |
| `/refunds` | Refund and dispute policy | Added and linked; copy awaits review |
| `/support` | Support hub, contact form, and mailto | Added and linked; form needs its server env set |
| `/checkout/success` | Stripe Payment Link return page | Added; `noindex`, unlisted, not in navigation. Payment Link redirects still need configuring |

All five routes from the section below are now implemented, listed where they
should be, and wired into the footer. What remains before public paid traffic is
content review and deployment configuration, not website code:

1. Resolve the two `<Pending>` markers in `/terms` — seller legal name and
   registered address, and governing law and venue.
2. Have the privacy, terms, and refund copy reviewed for the jurisdictions where
   PatchTray will be sold.
3. Set the `/support` form's server environment (see the README) so the endpoint
   can verify Turnstile, rate-limit, and send through Resend.
4. Point both live Stripe Payment Links at `https://patchtray.io/checkout/success`.
5. Set the real Payment Link URLs in Vercel, then run the private production
   purchase test before enabling checkout for the public.

## Routes to add before public paid traffic

### `/checkout/success`

The return page for both live Stripe Payment Links.

Required content and behavior:

- Say that the payment was submitted and that the license will arrive by
  email. Do not promise that fulfillment is complete merely because this page
  loaded; the signed Stripe webhook is authoritative and some payment methods
  settle asynchronously.
- Tell the customer to check spam/junk and verify that they used the intended
  email address at checkout.
- Link to `/download`, `/guide`, and `/support`.
- Do not display, accept, or persist a license key.
- Do not call `/webhooks/stripe`, `/v1/licenses/*`, or an admin endpoint.
- Treat every query parameter as untrusted display input. The page must never
  grant Pro, claim a purchase, or disclose order information based on a session
  ID in the URL.
- Mark the page `noindex` because it is transactional rather than search
  content.

After this route is deployed, configure the monthly and lifetime Stripe
Payment Links to redirect to:

```text
https://patchtray.io/checkout/success
```

### `/privacy`

The public privacy policy. The footer already has a privacy destination, and
the licensing rollout requires this policy before production customer data is
accepted.

At minimum, the final reviewed copy needs to explain:

- purchaser email storage;
- Stripe customer, Checkout Session, payment, subscription, refund, and dispute
  identifiers used for fulfillment and support;
- pseudonymous device identifiers, activation metadata, and IP-derived hashes;
- operational audit records;
- Cloudflare, Stripe, and Resend as service providers;
- why each category is processed, how long it is retained, and how a customer
  can make a privacy request;
- the public privacy contact address.

The retention period is still an unresolved launch decision in the licensing
plan. Do not invent one just to publish the page. Decide it, record it in the
service documentation, and have the final policy reviewed for the jurisdictions
where PatchTray will be sold.

Once this page exists, make `/privacy` the default
`VITE_PRIVACY_URL`/footer destination instead of leaving the link pending.

### `/terms`

The public product, license, and sale terms. The footer already has a terms
destination.

The final reviewed copy should cover:

- the PatchTray Free and Pro entitlements;
- monthly billing at the published recurring price and the lifetime one-time
  purchase;
- the two-device monthly limit and three-device lifetime limit;
- subscription renewal and cancellation terms;
- the seven-day monthly and 30-day lifetime offline lease periods without
  promising service beyond the purchased entitlement;
- license-key safeguarding and acceptable use;
- what happens after a refund, lost dispute, ended subscription, or material
  abuse;
- warranty, liability, governing-law, and contact provisions appropriate to
  the seller.

Do not copy operational shorthand directly into legal text. Prices and product
behavior must match the deployed Stripe prices and Worker policy, and the final
terms should receive legal review.

Once this page exists, make `/terms` the default `VITE_TERMS_URL`/footer
destination.

### `/refunds`

A plain-language refund and dispute policy linked from `/terms`, `/support`,
and the checkout area.

The policy decision must be made before writing definitive eligibility or time
limits. The page should eventually state:

- the policy for monthly charges and lifetime purchases;
- how to request a refund and what information support needs;
- expected response timing without promising an unverified service level;
- that approved refunds revoke the corresponding Pro license;
- that disputes may suspend access while they are open and a lost dispute
  revokes the license;
- that customers should contact support before opening a payment dispute when
  practical.

The backend behavior is already fixed: a recoverable dispute state suspends a
license, while a refund or lost dispute revokes it. The public policy must not
contradict that behavior.

### `/support`

The customer-facing support hub. Use `support@patchtray.io` as the primary
contact unless the configured address changes.

Include concise paths for:

- paid but no license email;
- lost key or key recovery;
- activation/deactivation and device-limit issues;
- subscription, renewal, cancellation, refund, and dispute questions;
- download/install problems;
- security and privacy contact details.

Tell customers never to send a full license key, recovery code, password, or
payment-card details. The purchase email and a short description are enough to
start a support lookup. Recovery should be initiated inside PatchTray; support
must not ask the customer to post key material into a web form.

Make the existing footer `support` item link to `/support`. The page can expose
a `mailto:support@patchtray.io` action without making the footer itself a bare
email link.

## Routes deliberately not being added now

These omissions are part of the architecture, not missing pages.

| Proposed route | Decision | Reason |
| --- | --- | --- |
| `/pricing` | Do not add | Pricing and both checkout actions already exist on `/` and `/download`; another page would duplicate a source of truth. |
| `/checkout/cancel` | Do not add for Payment Links | Send customers back to `/download#license-options` if a checkout return/cancel destination is needed. Add a dedicated page only if a future server-created Checkout flow needs one. |
| `/licenses/recover` | Do not add yet | Recovery currently runs inside PatchTray through its Rust backend. Confirmation requires a real device ID, rotates the key, signs every device out, activates the requesting device, and returns a signed lease. |
| `/licenses/recover/confirm` | Do not add yet | Same boundary as above. The licensing API intentionally has no browser CORS middleware, and the rollout plan says no browser claim page is currently part of the service. |
| `/account` or `/billing` | Do not add yet | There is no customer authentication, account model, or safe endpoint for creating a Stripe billing-portal session. Link customers to support or Stripe-hosted destinations until that backend exists. |
| `/status` | Do not add yet | The Worker `/health` endpoint is an operational probe, not a customer status product. A public status page would need monitoring, incident ownership, and an independent host. |

If browser recovery is added later, design it as a separate feature first. It
will need a browser-safe service contract or same-origin server proxy, abuse
protection such as Turnstile, strict rate limiting, enumeration-resistant
responses, and a decision about whether a browser is allowed to rotate a key
without activating a PatchTray device. Do not solve this by adding permissive
CORS to the existing license API.

## Backend routes that must never become website routes

The following belong only to `license.patchtray.io`:

```text
GET  /health
POST /webhooks/stripe
POST /v1/licenses/activate
POST /v1/licenses/validate
POST /v1/licenses/deactivate
POST /v1/licenses/recover
POST /v1/licenses/recover/confirm
GET  /v1/admin/*
POST /v1/admin/*
```

In particular, never proxy the webhook or `/v1/admin/*` through Vercel. The
website must not contain the admin bearer token, Stripe secret key, webhook
secret, license signing key, or either hashing pepper.

## Shared implementation requirements

When the routes above are implemented:

1. Add each public page to `src/App.tsx`, `src/lib/types.ts`, and
   `src/lib/pageMeta.ts`.
2. Add the public routes to the helpful route list on the 404 page.
3. Keep legal and support pages in the footer. The checkout success page should
   not be in primary navigation.
4. Keep `/concepts` unlinked and exclude it from the public route list.
5. Give `/privacy`, `/terms`, `/refunds`, and `/support` canonical metadata;
   give `/checkout/success` `noindex` metadata.
6. Preserve the current Vercel SPA rewrite so direct loads and browser refreshes
   work for every route.
7. Test every route with and without a trailing slash, at mobile and desktop
   widths, with keyboard navigation, and from a direct URL load.
8. Verify that unknown routes still render the 404 page rather than silently
   becoming the home page.

## Recommended implementation order

1. Decide privacy retention and public refund terms.
2. Write and review `/privacy`, `/terms`, and `/refunds`.
3. Add `/support` and wire all four footer destinations.
4. Add `/checkout/success` and deploy it.
5. Configure both live Stripe Payment Links to use the deployed success URL.
6. Set the real monthly and lifetime Payment Link URLs in Vercel.
7. Run the private production purchase test before enabling checkout for the
   public.

## Sources of truth

- `PatchTray-License-Service/docs/cloudflare-licensing-plan.mdx` for
  architecture, fulfillment, recovery, privacy, and rollout decisions.
- `PatchTray-License-Service/CLAUDE.md` for current production state and hard
  security invariants.
- `PatchTray-License-Service/src/routes/recover.ts` for the implemented
  device-bound recovery contract.
- This repository's `src/App.tsx`, `src/config.ts`, and `README.md` for current
  website routes and deployment-owned destinations.

If these sources disagree, the deployed service behavior and its hard security
invariants win; update this document rather than creating a second behavior in
the website.
