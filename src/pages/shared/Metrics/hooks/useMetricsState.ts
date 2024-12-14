import { useCallback, useRef, useState, startTransition } from 'react';

import { ExpandedMetricSections, QueryMetricsParams } from '../../../../types/Metrics.interfaces';

interface UseMetricsProps {
  selectedFilters: QueryMetricsParams;
  openSections?: ExpandedMetricSections;
  setSelectedFilters: Function;
  setOpenSections?: Function;
}

export const useMetricsState = ({
  selectedFilters,
  openSections,
  setSelectedFilters,
  setOpenSections
}: UseMetricsProps) => {
  const { ...filters } = selectedFilters;
  const [queryParams, setQueryParams] = useState<QueryMetricsParams>(filters);
  const [shouldUpdateData, setShouldUpdateData] = useState(0);
  const expandedSectionsConfigRef = useRef(openSections);

  const triggerMetricUpdate = () => {
    setShouldUpdateData(new Date().getTime());
  };

  const handleFilterChange = useCallback(
    (updatedFilters: QueryMetricsParams) => {
      startTransition(() => {
        setQueryParams(updatedFilters);
        setSelectedFilters(updatedFilters);
      });
    },
    [setSelectedFilters]
  );

  const handleSectionToggle = useCallback(
    (section: Record<string, boolean>) => {
      if (setOpenSections) {
        const config = { ...expandedSectionsConfigRef.current, ...section };
        setOpenSections(config);
        expandedSectionsConfigRef.current = config;
      }
    },
    [setOpenSections]
  );

  return {
    queryParams,
    shouldUpdateData,
    triggerMetricUpdate,
    handleFilterChange,
    handleSectionToggle
  };
};
