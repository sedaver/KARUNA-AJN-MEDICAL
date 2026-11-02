"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const motionGroups = [
  "main > section",
  "main > .container.section > .page-header",
  "main > .container.section > section",
  ".hero-copy > *",
  ".values-grid > *",
  ".approach-journey > article",
  ".care-photo-grid > article",
  ".three-grid > *",
  ".community-banner > *",
  ".privacy-section > *",
  ".about-impact > *",
  ".login-layout > *",
  ".footer-grid > *",
];

export function PremiumMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const main = document.querySelector("main");

    document.documentElement.classList.add("motion-ready");
    main?.classList.remove("page-enter");
    void main?.getBoundingClientRect();
    main?.classList.add("page-enter");

    const elements = new Set<HTMLElement>();

    motionGroups.forEach((selector) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
        element.classList.add("motion-target");
        element.style.setProperty("--motion-delay", `${Math.min(index, 5) * 80}ms`);
        elements.add(element);
      });
    });

    document
      .querySelectorAll<HTMLElement>(
        ".hero-photo, .care-photo-frame, .journey-line, .privacy-seal",
      )
      .forEach((element) => {
        element.classList.add("motion-target", "motion-scale");
        elements.add(element);
      });

    if (reduceMotion) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    let frame = 0;
    const revealVisible = () => {
      elements.forEach((element) => {
        if (element.classList.contains("is-visible")) return;
        const bounds = element.getBoundingClientRect();
        if (bounds.top <= window.innerHeight * 0.92) {
          element.classList.add("is-visible");
        }
      });
    };
    const requestReveal = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(revealVisible);
    };

    requestReveal();
    window.addEventListener("scroll", requestReveal, { passive: true });
    window.addEventListener("resize", requestReveal, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestReveal);
      window.removeEventListener("resize", requestReveal);
    };
  }, [pathname]);

  return null;
}
