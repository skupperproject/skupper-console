import { FC, useCallback, useEffect, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle, Title } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import SKEmptyData from '@core/components/SkEmptyData';
import SkIsLoading from '@core/components/SkIsLoading';

import TrafficCharts from './TrafficCharts';
import { MetricsLabels } from '../Metrics.enum';
import { QueriesMetrics, QueryMetricsParams } from '../Metrics.interfaces';
import MetricsController from '../services';

interface TrafficProps {
  selectedFilters: QueryMetricsParams;
  openSections?: boolean;
  forceUpdate?: number;
  refetchInterval?: number;
  onGetIsSectionExpanded?: Function;
}

const minChartHeight = 450;

const Traffic: FC<TrafficProps> = function ({
  selectedFilters,
  forceUpdate,
  refetchInterval,
  openSections = true,
  onGetIsSectionExpanded
}) {
  const [isExpanded, setIsExpanded] = useState(openSections);

  const { data, refetch, isRefetching, isLoading } = useQuery({
    queryKey: [QueriesMetrics.GetTraffic, selectedFilters],
    queryFn: () => MetricsController.getDataTraffic(selectedFilters),
    refetchInterval,
    placeholderData: keepPreviousData,
    enabled: isExpanded
  });

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);

    if (onGetIsSectionExpanded) {
      onGetIsSectionExpanded({ byterate: !isExpanded });
    }
  }, [isExpanded, onGetIsSectionExpanded]);

  const handleRefetchMetrics = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (forceUpdate && isExpanded) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics, isExpanded]);

  return (
    <Card isExpanded={isExpanded}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{MetricsLabels.DataTransferTitle}</CardTitle>
      </CardHeader>

      <CardExpandableContent>
        <CardBody style={{ minHeight: minChartHeight }}>
          {isLoading && <SkIsLoading />}

          {(data?.txTimeSerie || data?.rxTimeSerie) && (
            <>
              {!isLoading && isRefetching && <SkIsLoading />}
              <Title headingLevel="h4">{MetricsLabels.ByteRateTitle} </Title>
              <TrafficCharts byteRateData={data} />
            </>
          )}

          {!isLoading && !data?.txTimeSerie && !data?.rxTimeSerie && (
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

export default Traffic;
