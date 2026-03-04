import { useCallback, useEffect, useRef, useState } from "react";

interface ElementSize {
  width: number;
  height: number;
}

export function useElementSize<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Measure immediately on mount so the initial width is never 0
    measure();

    const observer = new ResizeObserver(() => measure());
    observer.observe(element);

    return () => observer.disconnect();
  }, [measure]);

  return { ref, size, measure };
}
