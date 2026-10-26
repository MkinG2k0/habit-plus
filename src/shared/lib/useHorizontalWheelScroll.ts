import { useCallback, useEffect, useRef, type RefCallback } from "react";

/**
 * На десктопе колёсико крутит вертикально — перенаправляем в горизонтальный
 * scrollLeft, чтобы полосы с overflow-x реально листались мышью.
 */
export function useHorizontalWheelScroll<
  T extends HTMLElement,
>(): RefCallback<T> {
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback((node: T | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      if (node.scrollWidth <= node.clientWidth + 1) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.deltaY === 0) return;

      const maxScroll = node.scrollWidth - node.clientWidth;
      const next = Math.min(
        maxScroll,
        Math.max(0, node.scrollLeft + event.deltaY),
      );
      if (next === node.scrollLeft) return;

      event.preventDefault();
      node.scrollLeft = next;
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    cleanupRef.current = () => {
      node.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return ref;
}
