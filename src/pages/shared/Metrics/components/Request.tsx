import { FC, useCallback, useEffect, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle, Title } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import RequestCharts from './RequestCharts';
import { Labels } from '../../../../config/labels';
import SKEmptyData from '../../../../core/components/SkEmptyData';
import SkIsLoading from '../../../../core/components/SkIsLoading';
import { QueryMetricsParams, QueriesMetrics } from '../../../../types/Metrics.interfaces';
import { MetricsController } from '../services';

interface RequestProps {
  selectedFilters: QueryMetricsParams;
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
    <Card isExpanded={isExpanded} aria-label={Labels.Requests}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{Labels.Requests}</CardTitle>
      </CardHeader>
      <CardExpandableContent>
        {/*display grid center the child SKEmptyData */}
        <CardBody style={{ minHeight: minChartHeight, display: 'grid' }}>
          {isLoading && <SkIsLoading />}

          {!isLoading && request?.requestRateData?.length && (
            <>
              {isRefetching && <SkIsLoading />}
              <Title headingLevel="h4">{Labels.RequestRate} </Title>
              <RequestCharts requestRateData={request.requestRateData} requestPerf={request.requestPerf} />
            </>
          )}

          {!isLoading && !request?.requestRateData?.length && (
            <SKEmptyData
              message={Labels.NoMetricFound}
              description={Labels.NoMetricFoundDescription}
              icon={SearchIcon}
            />
          )}
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};

export default Request;
