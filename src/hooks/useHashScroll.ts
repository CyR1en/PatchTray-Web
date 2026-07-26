import { useEffect } from "react";

/**
 * Scrolls to the `#fragment` in the URL after the page has rendered.
 *
 * The browser resolves a fragment as soon as the document loads, which for this
 * SPA is before React has put any sections in the DOM — so a deep link such as
 * `/refunds#disputes` would otherwise land at the top of the page. Same-page
 * clicks on the table of contents are unaffected either way.
 */
export function useHashScroll() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    // getElementById, not querySelector: a fragment is arbitrary user input and
    // need not be a valid CSS selector.
    const target = document.getElementById(decodeURIComponent(id));
    if (!target) return;

    let landedAt = 0;
    const scroll = () => {
      // `instant` overrides the document's smooth scrolling — on first paint the
      // reader should already be where they asked to be, not watching a scroll.
      target.scrollIntoView({ behavior: "instant" });
      landedAt = window.scrollY;
    };

    scroll();

    // Web fonts swap in after first paint and reflow the text above the target,
    // which leaves the section short of where it belongs. Correct once they have
    // settled — but not if the reader has already scrolled somewhere themselves.
    void document.fonts?.ready.then(() => {
      if (Math.abs(window.scrollY - landedAt) < 2) scroll();
    });
  }, []);
}
