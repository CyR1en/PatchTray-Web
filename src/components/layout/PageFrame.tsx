import type { ReactNode } from "react";
import type { PageName } from "../../lib/types";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PageFrame({ current, children }: { current: PageName; children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        skip to content
      </a>
      <SiteHeader current={current} />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}
