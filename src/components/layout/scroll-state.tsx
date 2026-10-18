"use client";

import { useEffect } from "react";

/**
 * Sets `data-scrolled` on <html> once the page is scrolled, so the sticky
 * header can gain its border via CSS. Renders nothing.
 */
export function ScrollState() {
  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;
    const update = () => {
      ticking = false;
      root.toggleAttribute("data-scrolled", window.scrollY > 8);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}
