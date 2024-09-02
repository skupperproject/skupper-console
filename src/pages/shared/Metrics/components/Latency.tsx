import { FC, useCallback, useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Icon,
  Tooltip
} from '@patternfly/react-core';
import { QuestionCircleIcon, SearchIcon } from '@patternfly/react-icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import SKEmptyData from '@core/components/SkEmptyData';
import SkIsLoading from '@core/components/SkIsLoading';
import { QueryMetricsParams, QueriesMetrics } from '@sk-types/Metrics.interfaces';

import LatencyCharts from './LatencyCharts';
import { MetricsLabels } from '../Metrics.enum';
import { MetricsController } from '../services';

interface LatencyProps {
  title?: string;
  description?: string;
  selectedFilters: QueryMetricsParams;
  openSections?: boolean;
  forceUpdate?: number;
  refetchInterval?: number;
  onGetIsSectionExpanded?: Function;
}

const minChartHeight = 680;

const Latency: FC<LatencyProps> = function ({
  title = '',
  description = '',
  selectedFilters,
  forceUpdate,
  openSections = false,
  refetchInterval,
  onGetIsSectionExpanded
}) {
  const [isExpanded, setIsExpanded] = useState(openSections);

  const { data, refetch, isRefetching, isLoading } = useQuery({
    queryKey: [QueriesMetrics.GetLatency, selectedFilters],
    queryFn: () => MetricsController.getLatencyPercentiles(selectedFilters),
    refetchInterval,
    placeholderData: keepPreviousData,
    enabled: isExpanded
  });

  const {
    data: bucketsData,
    refetch: refetchBuckets,
    isRefetching: isRefetchingBuckets,
    isLoading: isLoadingBuckets
  } = useQuery({
    queryKey: [QueriesMetrics.GetLatencyBuckets, selectedFilters],
    queryFn: () => MetricsController.getLatencyBuckets(selectedFilters),
    refetchInterval,
    placeholderData: keepPreviousData,
    enabled: isExpanded
  });

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);

    if (onGetIsSectionExpanded) {
      onGetIsSectionExpanded({ latency: !isExpanded });
    }
  }, [isExpanded, onGetIsSectionExpanded]);

  //Filters: refetch manually the prometheus API
  const handleRefetchMetrics = useCallback(() => {
    refetch();
    refetchBuckets();
  }, [refetch, refetchBuckets]);

  useEffect(() => {
    if (forceUpdate && isExpanded) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics, isExpanded]);

  return (
    <Card isExpanded={isExpanded}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>
          {title}{' '}
          <Tooltip content={description}>
            <Button variant="plain">
              <Icon status="info">
                <QuestionCircleIcon />
              </Icon>
            </Button>
          </Tooltip>
        </CardTitle>
      </CardHeader>

      <CardExpandableContent>
        <CardBody style={{ minHeight: minChartHeight }}>
          {(isLoading || isLoadingBuckets) && <SkIsLoading />}

          {!isLoading && !isLoadingBuckets && data?.length && bucketsData && (
            <>
              {!isLoading && !isLoadingBuckets && isRefetching && isRefetchingBuckets && <SkIsLoading />}
              <LatencyCharts
                latenciesData={data}
                bucketsData={bucketsData.distribution}
                summary={bucketsData.summary}
              />
            </>
          )}

          {!isLoading && !isLoadingBuckets && (!data?.length || !bucketsData) && (
            <SKEmptyData
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
