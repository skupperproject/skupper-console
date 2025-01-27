import { FC, useCallback, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import ResponseCharts from './ResponseCharts';
import { Labels } from '../../../../config/labels';
import SKEmptyData from '../../../../core/components/SkEmptyData';
import SkIsLoading from '../../../../core/components/SkIsLoading';
import { QueryMetricsParams, QueriesMetrics } from '../../../../types/Metrics.interfaces';
import { MetricsController } from '../services';

interface ResponseProps {
  selectedFilters: QueryMetricsParams;
  refetchInterval?: number;
  onIsLoaded?: Function;
}

const minChartHeight = 450;

const Response: FC<ResponseProps> = function ({ selectedFilters, refetchInterval }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // This filter collect promehetus query results from a response of a request for this  source site/process
  const selectedFiltersReverse = {
    ...selectedFilters,
    sourceSite: selectedFilters.destSite,
    destSite: selectedFilters.sourceSite,
    sourceProcess: selectedFilters.destProcess,
    destProcess: selectedFilters.sourceProcess
  };

  const {
    data: response,
    isRefetching: isRefetchingResponse,
    isLoading
  } = useQuery({
    queryKey: [QueriesMetrics.GetResponse, selectedFilters],
    queryFn: () => MetricsController.getResponses(selectedFilters),
    placeholderData: keepPreviousData,
    refetchInterval,
    enabled: isExpanded
  });

  const {
    data: responseReverse,
    isRefetching: isRefetchingResponseReverse,
    isLoading: isLoadingReverse
  } = useQuery({
    queryKey: [QueriesMetrics.GetResponse, selectedFiltersReverse],
    queryFn: () => MetricsController.getResponses(selectedFiltersReverse),
    placeholderData: keepPreviousData,
    refetchInterval,
    enabled: isExpanded
  });

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const responseData = responseReverse?.responseData
    ? { ...response?.responseData, ...responseReverse.responseData }
    : response?.responseData || null;

  const responseRateData = responseReverse?.responseRateData
    ? { ...response?.responseRateData, ...responseReverse.responseRateData }
    : response?.responseRateData || null;

  return (
    <Card isExpanded={isExpanded} aria-label={Labels.Responses}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{Labels.Responses}</CardTitle>
      </CardHeader>
      <CardExpandableContent>
        {/*display grid center the child SKEmptyData */}
        <CardBody style={{ minHeight: minChartHeight, display: 'grid' }}>
          {(isLoading || isLoadingReverse) && <SkIsLoading />}

          {!isLoading && !isLoadingReverse && responseData && (
            <>
              {(isRefetchingResponse || isRefetchingResponseReverse) && <SkIsLoading />}
              <ResponseCharts responseData={responseData} responseRateData={responseRateData} />
            </>
          )}

          {!isLoading && !isLoadingReverse && !responseData && (
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

export default Response;
