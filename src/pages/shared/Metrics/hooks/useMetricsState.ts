import { useCallback, useState, startTransition } from 'react';

import { useMetricSessionHandlers } from './useMetricsSessionHandler';
import { QueryMetricsParams } from '../../../../types/Metrics.interfaces';

interface UseMetricsProps {
  sessionKey?: string;
  defaultMetricFilterValues: QueryMetricsParams;
}

export const useMetricsState = ({ sessionKey, defaultMetricFilterValues }: UseMetricsProps) => {
  const { selectedFilters: storedFilters, setSelectedFilters: setStoredFilters } = useMetricSessionHandlers(
    sessionKey,
    defaultMetricFilterValues
  );

  const [selectedFilters, setSelectedFilters] = useState<QueryMetricsParams>(storedFilters);

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

  return {
    selectedFilters,
    handleFilterChange
  };
};
