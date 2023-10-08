import { FC, useCallback, useEffect, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useQueries } from '@tanstack/react-query';

import { isPrometheusActive } from '@config/config';
import EmptyData from '@core/components/EmptyData';

import RequestCharts from './RequestCharts';
import ResponseCharts from './ResponseCharts';
import { MetricsLabels } from '../Metrics.enum';
import { SelectedMetricFilters, QueriesMetrics } from '../Metrics.interfaces';
import MetricsController from '../services';

interface RequestProps {
  selectedFilters: SelectedMetricFilters;
  openSections?: boolean;
  forceUpdate?: number;
  refetchInterval?: number;
}

const Request: FC<RequestProps> = function ({ selectedFilters, forceUpdate, openSections = false, refetchInterval }) {
  const [isExpanded, setIsExpanded] = useState(openSections);

  const [{ data: request, refetch: refetchRequest }, { data: response, refetch: refetchResponse }] = useQueries({
    queries: [
      {
        queryKey: [QueriesMetrics.GetRequest, selectedFilters],
        queryFn: () => MetricsController.getRequest(selectedFilters),
        enabled: isPrometheusActive,
        refetchInterval,
        keepPreviousData: true
      },
      {
        queryKey: [QueriesMetrics.GetResponse, selectedFilters],
        queryFn: () => MetricsController.getResponse(selectedFilters),
        enabled: isPrometheusActive,
        refetchInterval,
        keepPreviousData: true
      }
    ]
  });

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  //Filters: refetch manually the prometheus API
  const handleRefetchMetrics = useCallback(() => {
    if (isPrometheusActive) {
      refetchRequest();
      refetchResponse();
    }
  }, [refetchRequest, refetchResponse]);

  useEffect(() => {
    if (forceUpdate) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics]);

  return (
    <Card isExpanded={isExpanded}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{MetricsLabels.RequestsTitle}</CardTitle>
      </CardHeader>
      <CardExpandableContent>
        <CardBody>
          {request?.requestRateData?.length ? (
            <RequestCharts requestRateData={request.requestRateData} requestPerf={request.requestPerf} />
          ) : (
            <EmptyData
              message={MetricsLabels.NoMetricFoundTitleMessage}
              description={MetricsLabels.NoMetricFoundDescriptionMessage}
              icon={SearchIcon}
            />
          )}
        </CardBody>

        <CardBody>
          <CardTitle>{MetricsLabels.HttpStatus}</CardTitle>
          {response?.responseData ? (
            <ResponseCharts responseData={response.responseData} responseRateData={response.responseRateData} />
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

export default Request;
