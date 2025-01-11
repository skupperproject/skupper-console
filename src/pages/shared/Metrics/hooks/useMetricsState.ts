import { useCallback, useState, startTransition } from 'react';

import { useMetricSessionHandlers } from './useMetricsSessionHandler';
import { QueryMetricsParams } from '../../../../types/Metrics.interfaces';

interface UseMetricsProps {
  sessionKey?: string;
  defaultMetricFilterValues: QueryMetricsParams;
}

export const useMetricsState = ({ sessionKey, defaultMetricFilterValues }: UseMetricsProps) => {
  const {
    selectedFilters: storedFilters,
    openSections,
    setSelectedFilters: setStoredFilters,
    setOpenSections
  } = useMetricSessionHandlers(sessionKey, defaultMetricFilterValues);

  const [shouldUpdateData, setShouldUpdateData] = useState(0);

  const [selectedFilters, setSelectedFilters] = useState<QueryMetricsParams>(storedFilters);

  const triggerMetricUpdate = () => {
    setShouldUpdateData(new Date().getTime());
  };

  const handleFilterChange = useCallback(
    (updatedFilters: QueryMetricsParams) => {
      startTransition(() => {
        // let to override undefined values with default values if they exists
        const filters = { ...defaultMetricFilterValues, ...JSON.parse(JSON.stringify({ ...updatedFilters })) };

        setStoredFilters(filters);
        setSelectedFilters(filters);
      });
    },
    [defaultMetricFilterValues, setStoredFilters]
  );

  const handleSectionToggle = useCallback(
    (section: Record<string, boolean>) => {
      setOpenSections(section);
    },
    [setOpenSections]
  );

  return {
    selectedFilters,
    openSections,
    shouldUpdateData,
    triggerMetricUpdate,
    handleFilterChange,
    handleSectionToggle
  };
};
