import { useCallback, useRef, useState, startTransition } from 'react';

import { ExpandedMetricSections, QueryMetricsParams } from '../../../../types/Metrics.interfaces';

interface UseMetricsProps {
  defaultMetricFilterValues: QueryMetricsParams;
  defaultOpenSections?: ExpandedMetricSections;
  onGetMetricFiltersConfig?: Function;
  onGetExpandedSectionsConfig?: Function;
}

export const useMetricsState = ({
  defaultMetricFilterValues,
  defaultOpenSections,
  onGetMetricFiltersConfig,
  onGetExpandedSectionsConfig
}: UseMetricsProps) => {
  const { ...filters } = defaultMetricFilterValues;
  const [queryParams, setQueryParams] = useState<QueryMetricsParams>(filters);
  const [shouldUpdateData, setShouldUpdateData] = useState(0);
  const expandedSectionsConfigRef = useRef(defaultOpenSections);

  const triggerMetricUpdate = () => {
    setShouldUpdateData(new Date().getTime());
  };

  const handleFilterChange = useCallback(
    (updatedFilters: QueryMetricsParams) => {
      startTransition(() => {
        setQueryParams(updatedFilters);
      });

      if (onGetMetricFiltersConfig) {
        onGetMetricFiltersConfig({ ...updatedFilters });
      }
    },
    [onGetMetricFiltersConfig]
  );

  const handleSectionToggle = useCallback(
    (section: Record<string, boolean>) => {
      if (onGetExpandedSectionsConfig) {
        const config = { ...expandedSectionsConfigRef.current, ...section };
        onGetExpandedSectionsConfig(config);
        expandedSectionsConfigRef.current = config;
      }
    },
    [onGetExpandedSectionsConfig]
  );

  return {
    queryParams,
    shouldUpdateData,
    triggerMetricUpdate,
    handleFilterChange,
    handleSectionToggle
  };
};
