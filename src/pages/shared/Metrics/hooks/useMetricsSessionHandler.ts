import { useCallback } from 'react';

import { getDataFromSession, storeDataToSession } from '../../../../core/utils/persistData';
import { ExpandedMetricSections, QueryMetricsParams } from '../../../../types/Metrics.interfaces';

const PREFIX_METRIC_FILTERS_KEY = 'metric-filters';
const PREFIX_VISIBLE_METRICS_KEY = `metric-sections`;

export const useMetricSessionHandlers = (id?: string, defaultMetricFilterValues?: QueryMetricsParams) => {
  const setSelectedFilters = useCallback(
    (filters: QueryMetricsParams) =>
      storeDataToSession<QueryMetricsParams>(`${PREFIX_METRIC_FILTERS_KEY}-${id}`, filters),
    [id]
  );

  const setOpenSections = useCallback(
    (sections: ExpandedMetricSections) => {
      const storedOpenSections =
        getDataFromSession<ExpandedMetricSections>(`${PREFIX_VISIBLE_METRICS_KEY}-${id}`) || undefined;
      storeDataToSession<ExpandedMetricSections>(`${PREFIX_VISIBLE_METRICS_KEY}-${id}`, {
        ...storedOpenSections,
        ...sections
      });
    },
    [id]
  );

  const selectedFilters = getDataFromSession<QueryMetricsParams>(`${PREFIX_METRIC_FILTERS_KEY}-${id}`);
  const openSections = getDataFromSession<ExpandedMetricSections>(`${PREFIX_VISIBLE_METRICS_KEY}-${id}`) || undefined;

  return {
    setSelectedFilters,
    setOpenSections,
    selectedFilters: { ...defaultMetricFilterValues, ...selectedFilters },
    openSections
  };
};
