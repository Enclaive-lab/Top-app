"use client";

import { ChevronUp } from "lucide-react";
import { useScrollY } from "@/hooks/useScrollY";
import styles from "./BackToTop.module.css";

export function BackToTop() {
  const scrollY = useScrollY();
  const isVisible = scrollY > 500;

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.getElementById("main-content")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
  };

  return (
    <button
      type="button"
      className={styles.button}
      data-visible={isVisible}
      disabled={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      aria-label="Наверх"
      onClick={scrollToTop}
    >
      <ChevronUp size={24} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
