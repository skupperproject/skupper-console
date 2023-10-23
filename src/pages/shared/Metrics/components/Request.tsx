import { FC, useCallback, useEffect, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle, Title } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useQueries } from '@tanstack/react-query';

import { isPrometheusActive } from '@config/config';
import EmptyData from '@core/components/EmptyData';
import SkIsLoading from '@core/components/SkIsLoading';

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
  onGetIsSectionExpanded?: Function;
}

const Request: FC<RequestProps> = function ({
  selectedFilters,
  forceUpdate,
  openSections = false,
  refetchInterval,
  onGetIsSectionExpanded
}) {
  const [isExpanded, setIsExpanded] = useState(openSections);

  const [
    { data: request, refetch: refetchRequest, isRefetching: isRefetchingRequest },
    { data: response, refetch: refetchResponse, isRefetching: isRefetchingResponse }
  ] = useQueries({
    queries: [
      {
        queryKey: [QueriesMetrics.GetRequest, selectedFilters],
        queryFn: () => MetricsController.getRequests(selectedFilters),
        enabled: isPrometheusActive,
        refetchInterval,
        keepPreviousData: true
      },
      {
        queryKey: [QueriesMetrics.GetResponse, selectedFilters],
        queryFn: () => MetricsController.getResponses(selectedFilters),
        enabled: isPrometheusActive,
        refetchInterval,
        keepPreviousData: true
      }
    ]
  });

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);

    if (onGetIsSectionExpanded) {
      onGetIsSectionExpanded({ request: !isExpanded });
    }
  }, [isExpanded, onGetIsSectionExpanded]);

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

  if (!response?.responseRateData && !request?.requestRateData?.length) {
    return null;
  }

  return (
    <Card isExpanded={isExpanded}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{MetricsLabels.RequestsTitle}</CardTitle>
      </CardHeader>
      <CardExpandableContent>
        <CardBody>
          <Title headingLevel="h4">{MetricsLabels.RequestRateTitle} </Title>
          {request?.requestRateData?.length ? (
            <>
              {isRefetchingRequest && <SkIsLoading />}
              <RequestCharts requestRateData={request.requestRateData} requestPerf={request.requestPerf} />
            </>
          ) : (
            <EmptyData
              message={MetricsLabels.NoMetricFoundTitleMessage}
              description={MetricsLabels.NoMetricFoundDescriptionMessage}
              icon={SearchIcon}
            />
          )}
        </CardBody>

        <CardBody>
          <Title headingLevel="h4">{MetricsLabels.HttpStatus} </Title>
          {response?.responseData && response?.responseRateData ? (
            <>
              {isRefetchingResponse && <SkIsLoading />}
              <ResponseCharts responseData={response.responseData} responseRateData={response.responseRateData} />
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

export default Request;
