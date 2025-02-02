import { useCallback, useEffect, useRef, useState } from 'react';

import { getResizeObserver } from '@patternfly/react-core';

export function useChartDimensions() {
  const [chartWidth, setChartWidth] = useState<number>(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const updateChartWidth = useCallback(() => {
    if (chartContainerRef.current?.clientWidth) {
      setChartWidth(chartContainerRef.current.clientWidth);
    }
  }, []);

  useEffect(() => {
    const currentRef = chartContainerRef.current;
    if (!currentRef) {
      return;
    }

    const resizeObserver = getResizeObserver(currentRef, updateChartWidth);
    updateChartWidth();

    return () => {
      if (typeof resizeObserver === 'function') {
        resizeObserver();
      }
    };
  }, [updateChartWidth]);

  return { chartWidth, chartContainerRef };
}
