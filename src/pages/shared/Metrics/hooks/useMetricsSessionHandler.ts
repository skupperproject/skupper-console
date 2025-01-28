import { useCallback } from 'react';

import { getDataFromSession, storeDataToSession } from '../../../../core/utils/persistData';
import { QueryMetricsParams } from '../../../../types/Metrics.interfaces';

const PREFIX_METRIC_FILTERS_KEY = 'metric-filters';

export const useMetricSessionHandlers = (id?: string, defaultMetricFilterValues?: QueryMetricsParams) => {
  const setSelectedFilters = useCallback(
    (filters: QueryMetricsParams) =>
      storeDataToSession<QueryMetricsParams>(`${PREFIX_METRIC_FILTERS_KEY}-${id}`, filters),
    [id]
  );

  const selectedFilters = getDataFromSession<QueryMetricsParams>(`${PREFIX_METRIC_FILTERS_KEY}-${id}`);

  return {
    setSelectedFilters,
    selectedFilters: { ...defaultMetricFilterValues, ...selectedFilters }
  };
};
