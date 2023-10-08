import { FC, useCallback, useEffect, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';

import { isPrometheusActive } from '@config/config';
import EmptyData from '@core/components/EmptyData';

import TrafficCharts from './TrafficCharts';
import { MetricsLabels } from '../Metrics.enum';
import { QueriesMetrics, SelectedMetricFilters } from '../Metrics.interfaces';
import MetricsController from '../services';

interface TrafficProps {
  selectedFilters: SelectedMetricFilters;
  openSections?: boolean;
  forceUpdate?: number;
  refetchInterval?: number;
}

const Traffic: FC<TrafficProps> = function ({ selectedFilters, forceUpdate, refetchInterval, openSections = true }) {
  const [isExpanded, setIsExpanded] = useState(openSections);

  const { data, refetch } = useQuery(
    [QueriesMetrics.GetTraffic, selectedFilters],
    () => MetricsController.getTraffic(selectedFilters),
    {
      enabled: isPrometheusActive,
      refetchInterval,
      keepPreviousData: true
    }
  );

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleRefetchMetrics = useCallback(() => {
    isPrometheusActive && refetch();
  }, [refetch]);

  useEffect(() => {
    if (forceUpdate) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics]);

  return (
    <Card isExpanded={isExpanded}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{MetricsLabels.DataTransferTitle}</CardTitle>
      </CardHeader>

      <CardExpandableContent>
        <CardBody>
          {data?.txTimeSerie || data?.rxTimeSerie ? (
            <TrafficCharts byteRateData={data} />
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

export default Traffic;
