import { FC, useCallback, useState } from 'react';

import { Card, CardBody, CardExpandableContent, CardHeader, CardTitle } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { keepPreviousData, useQueries } from '@tanstack/react-query';

import LatencyCharts from './LatencyCharts';
import { Direction } from '../../../../API/REST.enum';
import { Labels } from '../../../../config/labels';
import SKEmptyData from '../../../../core/components/SkEmptyData';
import SkIsLoading from '../../../../core/components/SkIsLoading';
import { QueryMetricsParams, QueriesMetrics } from '../../../../types/Metrics.interfaces';
import { MetricsController } from '../services';

interface LatencyProps {
  title?: string;
  selectedFilters: QueryMetricsParams;
  refetchInterval?: number;
}

const minChartHeight = 350;

const Latency: FC<LatencyProps> = function ({ title = '', selectedFilters, refetchInterval }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const [dataIn, dataOut] = useQueries({
    queries: [
      {
        queryKey: [QueriesMetrics.GetLatency, { ...selectedFilters, direction: Direction.Incoming }],
        queryFn: () => MetricsController.getLatencyPercentiles({ ...selectedFilters, direction: Direction.Incoming }),
        refetchInterval,
        placeholderData: keepPreviousData,
        enabled: isExpanded
      },
      {
        queryKey: ['QueriesMetrics.GetLatency', { ...selectedFilters, direction: Direction.Outgoing }],
        queryFn: () => MetricsController.getLatencyPercentiles({ ...selectedFilters, direction: Direction.Outgoing }),
        refetchInterval,
        placeholderData: keepPreviousData,
        enabled: isExpanded
      }
    ]
  });

  const handleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <Card isExpanded={isExpanded} aria-label={title}>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardExpandableContent>
        <CardBody style={{ minHeight: minChartHeight, display: 'grid' }}>
          {dataIn.isLoading && dataOut.isLoading && <SkIsLoading />}

          <LatencyCharts
            inboundData={dataIn.data}
            outboundData={dataOut.data}
            isInboundLoading={dataIn.isLoading}
            isOutboundLoading={dataOut.isLoading}
            isInboundRefetching={dataIn.isRefetching}
            isOutboundRefetching={dataOut.isRefetching}
          />
          {!dataIn.isLoading && !dataOut.isLoading && !dataIn.data?.length && !dataOut.data?.length && (
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

export default Latency;
