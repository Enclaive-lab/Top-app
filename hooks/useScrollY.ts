import { useEffect, useState } from "react";

export const useScrollY = (): number => {
  const [scrollY, setScrollY] = useState<number>(0);

  useEffect(() => {
    let frame: number | null = null;

    const updatePosition = () => {
      frame = null;
      setScrollY(window.scrollY);
    };
    const handleScroll = () => {
      if (frame === null) {
        frame = window.requestAnimationFrame(updatePosition);
      }
    };

    // Account for a restored scroll position when opening the page.
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);
  return scrollY;
};
