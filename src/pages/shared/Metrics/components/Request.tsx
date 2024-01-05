import { FC, useCallback, useEffect, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle, Title } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import EmptyData from '@core/components/EmptyData';
import SkIsLoading from '@core/components/SkIsLoading';

import RequestCharts from './RequestCharts';
import { MetricsLabels } from '../Metrics.enum';
import { SelectedMetricFilters, QueriesMetrics } from '../Metrics.interfaces';
import MetricsController from '../services';

interface RequestProps {
  selectedFilters: SelectedMetricFilters;
  openSections?: boolean;
  forceUpdate?: number;
  refetchInterval?: number;
  onGetIsSectionExpanded?: Function;
  onIsLoaded?: Function;
}

const minChartHeight = 350;

const Request: FC<RequestProps> = function ({
  selectedFilters,
  forceUpdate,
  openSections = false,
  refetchInterval,
  onGetIsSectionExpanded
}) {
  const [isExpanded, setIsExpanded] = useState(openSections);

  const {
    data: request,
    refetch: refetchRequest,
    isRefetching,
    isLoading
  } = useQuery({
    queryKey: [QueriesMetrics.GetRequest, selectedFilters],
    queryFn: () => MetricsController.getRequests(selectedFilters),
    refetchInterval,
    placeholderData: keepPreviousData,
    enabled: isExpanded
  });

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);

    if (onGetIsSectionExpanded) {
      onGetIsSectionExpanded({ request: !isExpanded });
    }
  }, [isExpanded, onGetIsSectionExpanded]);

  //Filters: refetch manually the prometheus API
  const handleRefetchMetrics = useCallback(() => {
    refetchRequest();
  }, [refetchRequest]);

  useEffect(() => {
    if (forceUpdate && isExpanded) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics, isExpanded]);

  return (
    <Card isExpanded={isExpanded}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{MetricsLabels.RequestsTitle}</CardTitle>
      </CardHeader>
      <CardExpandableContent>
        <CardBody style={{ minHeight: minChartHeight }}>
          {isLoading && <SkIsLoading />}

          {!isLoading && request?.requestRateData?.length && (
            <>
              {isRefetching && <SkIsLoading />}
              <Title headingLevel="h4">{MetricsLabels.RequestRateTitle} </Title>
              <RequestCharts requestRateData={request.requestRateData} requestPerf={request.requestPerf} />
            </>
          )}

          {!isLoading && !request?.requestRateData?.length && (
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
