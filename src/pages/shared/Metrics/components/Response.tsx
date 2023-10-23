import { FC, useCallback, useEffect, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useQueries } from '@tanstack/react-query';

import { isPrometheusActive } from '@config/config';
import EmptyData from '@core/components/EmptyData';
import SkIsLoading from '@core/components/SkIsLoading';

import ResponseCharts from './ResponseCharts';
import { MetricsLabels } from '../Metrics.enum';
import { SelectedMetricFilters, QueriesMetrics } from '../Metrics.interfaces';
import MetricsController from '../services';

interface ResponseProps {
  selectedFilters: SelectedMetricFilters;
  openSections?: boolean;
  forceUpdate?: number;
  refetchInterval?: number;
  onGetIsSectionExpanded?: Function;
}

const Response: FC<ResponseProps> = function ({
  selectedFilters,
  forceUpdate,
  openSections = false,
  refetchInterval,
  onGetIsSectionExpanded
}) {
  const [isExpanded, setIsExpanded] = useState(openSections);

  // This filter collect promehetus query results from a response of a request for this  source site/process
  const selectedFiltersReverse = {
    ...selectedFilters,
    sourceSite: selectedFilters.destSite,
    destSite: selectedFilters.sourceSite,
    sourceProcess: selectedFilters.destProcess,
    destProcess: selectedFilters.sourceProcess
  };

  const [
    { data: response, refetch: refetchResponse, isRefetching: isRefetchingResponse },
    { data: responseReverse, refetch: refetchResponseReverse, isRefetching: isRefetchingResponseReverse }
  ] = useQueries({
    queries: [
      {
        queryKey: [QueriesMetrics.GetResponse, selectedFilters],
        queryFn: () => MetricsController.getResponses(selectedFilters),
        enabled: isPrometheusActive,
        refetchInterval,
        keepPreviousData: true
      },
      {
        queryKey: [QueriesMetrics.GetResponse, selectedFiltersReverse],
        queryFn: () => MetricsController.getResponses(selectedFiltersReverse),
        enabled: isPrometheusActive,
        refetchInterval,
        keepPreviousData: true
      }
    ]
  });

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);

    if (onGetIsSectionExpanded) {
      onGetIsSectionExpanded({ response: !isExpanded });
    }
  }, [isExpanded, onGetIsSectionExpanded]);

  //Filters: refetch manually the prometheus API
  const handleRefetchMetrics = useCallback(() => {
    if (isPrometheusActive) {
      refetchResponse();
      refetchResponseReverse();
    }
  }, [refetchResponse, refetchResponseReverse]);

  useEffect(() => {
    if (forceUpdate) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics]);

  if (!response?.responseData && !responseReverse?.responseData) {
    return null;
  }

  const responseData = responseReverse?.responseData
    ? { ...response?.responseData, ...responseReverse.responseData }
    : response?.responseData || null;

  const responseRateData = responseReverse?.responseRateData
    ? { ...response?.responseRateData, ...responseReverse.responseRateData }
    : response?.responseRateData || null;

  return (
    <Card isExpanded={isExpanded}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{MetricsLabels.ResposeTitle}</CardTitle>
      </CardHeader>
      <CardExpandableContent>
        <CardBody>
          {(isRefetchingResponse || isRefetchingResponseReverse) && <SkIsLoading />}

          {responseData && <ResponseCharts responseData={responseData} responseRateData={responseRateData} />}

          {!responseData && !(isRefetchingResponse || isRefetchingResponseReverse) && (
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

export default Response;
