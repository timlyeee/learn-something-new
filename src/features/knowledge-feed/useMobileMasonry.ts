import { useLayoutEffect, useRef } from "react";

const MOBILE_QUERY = "(max-width: 850px)";

export function useMobileMasonry(itemCount: number) {
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const media = window.matchMedia(MOBILE_QUERY);
    const cards = Array.from(
      grid.querySelectorAll<HTMLElement>(".knowledge-feed-card"),
    );

    const layout = () => {
      const styles = window.getComputedStyle(grid);
      const rowHeight = Number.parseFloat(styles.gridAutoRows) || 1;
      const rowGap = Number.parseFloat(styles.rowGap) || 0;

      cards.forEach((card) => {
        card.style.removeProperty("grid-row-end");
        if (!media.matches) return;

        const height = card.getBoundingClientRect().height;
        const span = Math.ceil((height + rowGap) / (rowHeight + rowGap));
        card.style.gridRowEnd = `span ${span}`;
      });
    };

    const frame = window.requestAnimationFrame(layout);
    const observer = new ResizeObserver(layout);
    cards.forEach((card) => observer.observe(card));
    media.addEventListener("change", layout);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener("change", layout);
      cards.forEach((card) => card.style.removeProperty("grid-row-end"));
    };
  }, [itemCount]);

  return gridRef;
}
