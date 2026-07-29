import {
  useEffect,
  useRef,
  useState,
} from "react";

const MINIMUM_CHART_WIDTH = 320;

function useChartWidth() {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const [chartWidth, setChartWidth] =
    useState(0);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    function updateWidth() {
      const measuredWidth =
        container.getBoundingClientRect().width;

      const safeWidth =
        Number.isFinite(measuredWidth) &&
        measuredWidth >= MINIMUM_CHART_WIDTH
          ? Math.floor(measuredWidth)
          : 0;

      setChartWidth((currentWidth) =>
        currentWidth === safeWidth
          ? currentWidth
          : safeWidth
      );
    }

    updateWidth();

    const resizeObserver = new ResizeObserver(
      updateWidth
    );

    resizeObserver.observe(container);

    window.addEventListener(
      "resize",
      updateWidth
    );

    return () => {
      resizeObserver.disconnect();

      window.removeEventListener(
        "resize",
        updateWidth
      );
    };
  }, []);

  return {
    containerRef,
    chartWidth,
    hasValidChartWidth:
      chartWidth >= MINIMUM_CHART_WIDTH,
  };
}

export default useChartWidth;