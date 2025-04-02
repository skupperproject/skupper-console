import { useState, useCallback } from 'react';

import { QueryMetricsParams } from '../../../../types/Metrics.interfaces';

interface UseMetricFiltersStateProps {
  defaultMetricFilterValues: QueryMetricsParams;
  onSelectFilters?: (params: QueryMetricsParams) => void;
}

const useMetricFiltersState = ({ defaultMetricFilterValues, onSelectFilters }: UseMetricFiltersStateProps) => {
  const [selectedFilters, setSelectedFilters] = useState<QueryMetricsParams>(defaultMetricFilterValues);

  const handleSelect = useCallback(
    (selections: Record<string, string | undefined>) => {
      setSelectedFilters((prev) => ({ ...prev, ...selections }));

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilters, ...selections });
      }
    },
    [onSelectFilters, selectedFilters]
  );

  const handleSelectSourceSite = useCallback(
    (selection: string | number | undefined) => {
      handleSelect({ sourceSite: selection as string, sourceProcess: undefined });
    },
    [handleSelect]
  );

  const handleSelectDestSite = useCallback(
    (selection: string | number | undefined) => {
      handleSelect({ destSite: selection as string, destProcess: undefined });
    },
    [handleSelect]
  );

  const handleSelectSourceProcess = useCallback(
    (selection: string | number | undefined) => {
      handleSelect({ sourceProcess: selection as string });
    },
    [handleSelect]
  );

  const handleSelectDestProcess = useCallback(
    (selection: string | number | undefined) => {
      handleSelect({ destProcess: selection as string });
    },
    [handleSelect]
  );

  const handleSelectTimeInterval = useCallback(
    (selection: string | number | undefined) => {
      const duration = selection as number;

      setSelectedFilters((prev) => ({ ...prev, duration }));

      if (onSelectFilters) {
        onSelectFilters({ ...selectedFilters, duration });
      }
    },
    [onSelectFilters, selectedFilters]
  );

  return {
    selectedFilters,
    handleSelectSourceSite,
    handleSelectDestSite,
    handleSelectSourceProcess,
    handleSelectDestProcess,
    handleSelectTimeInterval
  };
};

export default useMetricFiltersState;
