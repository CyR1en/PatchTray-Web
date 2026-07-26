/**
 * Every page the site can render. Used for nav highlighting (`PageFrame`),
 * metadata lookup (`pageMeta`), and the route table (`routes`).
 */
export type PageName =
  | "home"
  | "download"
  | "guide"
  | "privacy"
  | "terms"
  | "refunds"
  | "support"
  | "checkoutSuccess"
  | "concepts"
  | "notFound";

export type Point = { x: number; y: number };
