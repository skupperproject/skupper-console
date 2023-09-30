import { FC, useCallback, useEffect, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { isPrometheusActive } from '@config/config';

import LatencyCharts from './LatencyCharts';
import { MetricsLabels } from '../Metrics.enum';
import { SelectedFilters, QueriesMetrics } from '../Metrics.interfaces';
import MetricsController from '../services';

export interface LatencyProps {
  selectedFilters: SelectedFilters;
  openSections?: boolean;
  forceUpdate?: number;
  refetchInterval?: number;
}

const Latency: FC<LatencyProps> = function ({ selectedFilters, forceUpdate, openSections, refetchInterval }) {
  const [isExpanded, setIsExpanded] = useState(openSections || false);
  const { data, refetch } = useQuery(
    [QueriesMetrics.GetLatency, selectedFilters],
    () => MetricsController.getLatency(selectedFilters),
    {
      enabled: isPrometheusActive,
      refetchInterval,
      keepPreviousData: true
    }
  );

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  //Filters: refetch manually the prometheus API
  const handleRefetchMetrics = useCallback(() => {
    isPrometheusActive && refetch();
  }, [refetch]);

  useEffect(() => {
    if (forceUpdate) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics]);

  const isSectionActive = !!data?.length;

  return (
    <Card isExpanded={isSectionActive && isExpanded} className={!isSectionActive ? 'metric-disabled' : undefined}>
      <CardHeader onExpand={isSectionActive ? handleExpand : () => null}>
        <CardTitle>{MetricsLabels.LatencyTitle}</CardTitle>
      </CardHeader>

      <CardExpandableContent>
        {!!isSectionActive && (
          <CardBody>
            <LatencyCharts latenciesData={data} />
          </CardBody>
        )}
      </CardExpandableContent>
    </Card>
  );
};

export default Latency;
