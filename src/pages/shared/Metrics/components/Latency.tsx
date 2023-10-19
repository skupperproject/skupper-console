import { FC, useCallback, useEffect, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useQueries } from '@tanstack/react-query';

import { isPrometheusActive } from '@config/config';
import EmptyData from '@core/components/EmptyData';
import SkIsLoading from '@core/components/SkIsLoading';

import LatencyCharts from './LatencyCharts';
import { MetricsLabels } from '../Metrics.enum';
import { SelectedMetricFilters, QueriesMetrics } from '../Metrics.interfaces';
import MetricsController from '../services';

interface LatencyProps {
  selectedFilters: SelectedMetricFilters;
  openSections?: boolean;
  forceUpdate?: number;
  refetchInterval?: number;
  onGetIsSectionExpanded?: Function;
}

const Latency: FC<LatencyProps> = function ({
  selectedFilters,
  forceUpdate,
  openSections = false,
  refetchInterval,
  onGetIsSectionExpanded
}) {
  const [isExpanded, setIsExpanded] = useState(openSections);

  const [
    { data, refetch, isRefetching },
    { data: bucketsData, refetch: refetchBuckets, isRefetching: isRefetchingBuckets }
  ] = useQueries({
    queries: [
      {
        queryKey: [QueriesMetrics.GetLatency, selectedFilters],
        queryFn: () => MetricsController.getLatencyPercentiles(selectedFilters),
        refetchInterval,
        keepPreviousData: true
      },
      {
        queryKey: [QueriesMetrics.GetLatencyBuckets, selectedFilters],
        queryFn: () => MetricsController.getLatencyBuckets(selectedFilters),
        refetchInterval,
        keepPreviousData: true
      }
    ]
  });

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);

    if (onGetIsSectionExpanded) {
      onGetIsSectionExpanded({ latency: !isExpanded });
    }
  }, [isExpanded, onGetIsSectionExpanded]);

  //Filters: refetch manually the prometheus API
  const handleRefetchMetrics = useCallback(() => {
    isPrometheusActive && refetch();
    isPrometheusActive && refetchBuckets();
  }, [refetch, refetchBuckets]);

  useEffect(() => {
    if (forceUpdate) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics]);

  return (
    <Card isExpanded={isExpanded}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{MetricsLabels.LatencyTitle}</CardTitle>
      </CardHeader>

      <CardExpandableContent>
        <CardBody>
          {data?.length && bucketsData ? (
            <>
              {isRefetching && isRefetchingBuckets && <SkIsLoading />}
              <LatencyCharts
                latenciesData={data}
                bucketsData={bucketsData.distribution}
                summary={bucketsData.summary}
              />
            </>
          ) : (
            <EmptyData
              message={MetricsLabels.NoMetricFoundTitleMessage}
              description={MetricsLabels.NoMetricFoundDescriptionMessage}
              icon={SearchIcon}
            />
          )}
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};

export default Latency;
