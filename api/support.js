/**
 * Relays the /support contact form to the support inbox through Resend.
 *
 * Plain JavaScript for the same reason as `api/release.js`: Vercel compiles
 * `api/*.ts` with the project's own `typescript`, and TypeScript 7 dropped the
 * compiler API that step calls.
 *
 * Security model — the parts that are not optional:
 *
 * - `to` is read from the environment and never from the request. If a caller
 *   could influence the recipient, this endpoint would be an open relay and the
 *   domain's sending reputation would belong to whoever found it.
 * - The message is sent as `text`, never HTML, so nothing a stranger types can
 *   render as markup in the inbox that reads it.
 * - Turnstile is verified server-side. A token is single-use, so a solved
 *   challenge cannot be replayed across submissions.
 * - Checks run cheapest-first: shape and size (free), then the rate limiter,
 *   then Turnstile, then Resend. A flood is rejected before it costs anything.
 */
import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const MAX_BODY_BYTES = 8 * 1024;
const MAX_MESSAGE_CHARS = 5000;
const MIN_MESSAGE_CHARS = 20;
const MAX_EMAIL_CHARS = 254;

const TOPICS = new Set([
  "license not received",
  "lost key or recovery",
  "activation or device limit",
  "billing, refund, or dispute",
  "download or install",
  "security or privacy",
  "something else",
]);

/**
 * Shapes like `A1B2C-3D4E5-F6G7H-8J9K0` — four or more dashed alphanumeric
 * groups containing at least one digit. Deliberately narrow: "voicemeeter-asio-
 * insert" is three groups and must not trip it.
 */
const KEY_SHAPED = /\b[A-Z0-9]{4,6}(?:-[A-Z0-9]{4,6}){3,}\b/i;

/** Conservative address check. Real validation is whether the reply lands. */
const EMAIL_SHAPE = /^[^\s@,;:<>"]+@[^\s@,;:<>"]+\.[a-z]{2,}$/i;

const ratelimit = hasUpstash()
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      // Three an hour is generous for a human with a problem and useless to
      // anyone trying to use the inbox as a delivery mechanism.
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "patchtray:support",
      analytics: false,
    })
  : null;

function hasUpstash() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Vercel's edge sets `x-vercel-forwarded-for` from the real connection, so it is
 * preferred over the client-supplied `x-forwarded-for` chain.
 */
function clientIp(request) {
  const header =
    request.headers["x-vercel-forwarded-for"] ||
    request.headers["x-real-ip"] ||
    request.headers["x-forwarded-for"] ||
    "";
  const value = Array.isArray(header) ? header[0] : header;
  return value.split(",")[0].trim() || "unknown";
}

/**
 * The rate limiter needs a stable key per sender, not an address it can be read
 * back out of. Hashing keeps the stored counter consistent with how the
 * licensing service already treats caller IPs.
 *
 * `SUPPORT_RATELIMIT_PEPPER` is optional but worth setting: IPv4 is small enough
 * to enumerate against an unpeppered hash. It must not be either of the
 * licensing service's peppers — this codebase is not allowed to hold those.
 */
function rateLimitKey(ip) {
  return createHash("sha256")
    .update(`${process.env.SUPPORT_RATELIMIT_PEPPER ?? ""}:${ip}`)
    .digest("base64url")
    .slice(0, 24);
}

function send(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

async function verifyTurnstile(token, ip) {
  const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: token });
  if (ip !== "unknown") body.set("remoteip", ip);

  const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(8000),
  });
  if (!result.ok) return false;

  const outcome = await result.json();
  return outcome.success === true;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return send(response, 405, { error: "method not allowed" });
  }

  const required = ["RESEND_API_KEY", "SUPPORT_TO_EMAIL", "SUPPORT_FROM_EMAIL", "TURNSTILE_SECRET_KEY"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    // Configuration gaps are an operator problem; the visitor just needs a way
    // to reach support that still works.
    console.error(`[support] not configured: missing ${missing.join(", ")}`);
    return send(response, 503, { error: "unconfigured" });
  }

  const body = request.body ?? {};
  if (JSON.stringify(body).length > MAX_BODY_BYTES) {
    return send(response, 413, { error: "too large" });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";

  if (!EMAIL_SHAPE.test(email) || email.length > MAX_EMAIL_CHARS) {
    return send(response, 400, { error: "invalid email" });
  }
  if (!TOPICS.has(topic)) {
    return send(response, 400, { error: "invalid topic" });
  }
  if (message.length < MIN_MESSAGE_CHARS || message.length > MAX_MESSAGE_CHARS) {
    return send(response, 400, { error: "invalid message" });
  }
  if (!token) {
    return send(response, 400, { error: "verification missing" });
  }
  if (KEY_SHAPED.test(message)) {
    // Refusing this is the point of the warning on the page: a key that reaches
    // an inbox has to be treated as compromised.
    return send(response, 422, { error: "key material" });
  }

  const ip = clientIp(request);

  if (ratelimit) {
    const { success, reset } = await ratelimit.limit(rateLimitKey(ip));
    if (!success) {
      response.setHeader("Retry-After", Math.max(1, Math.ceil((reset - Date.now()) / 1000)));
      return send(response, 429, { error: "rate limited" });
    }
  } else {
    console.error("[support] rate limiter disabled: Upstash environment variables are not set");
  }

  if (!(await verifyTurnstile(token, ip))) {
    return send(response, 403, { error: "verification failed" });
  }

  const text = [
    `topic: ${topic}`,
    `from:  ${email}`,
    "",
    message,
  ].join("\n");

  try {
    const sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.SUPPORT_FROM_EMAIL,
        to: process.env.SUPPORT_TO_EMAIL,
        reply_to: email,
        subject: `[support] ${topic}`,
        text,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!sent.ok) {
      const detail = await sent.text();
      throw new Error(`resend responded ${sent.status}: ${detail.slice(0, 300)}`);
    }

    return send(response, 202, { ok: true });
  } catch (error) {
    // The reason belongs in the logs, not in a response a stranger can read.
    console.error(`[support] delivery failed: ${error instanceof Error ? error.message : String(error)}`);
    return send(response, 502, { error: "delivery failed" });
  }
}
