import { FC, useCallback, useEffect, useState } from 'react';

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
  openSections?: boolean;
  forceUpdate?: number;
  refetchInterval?: number;
  onGetIsSectionExpanded?: Function;
}

const Latency: FC<LatencyProps> = function ({
  title = '',
  selectedFilters,
  forceUpdate,
  openSections = false,
  refetchInterval,
  onGetIsSectionExpanded
}) {
  const [isExpanded, setIsExpanded] = useState(openSections);

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

    if (onGetIsSectionExpanded) {
      onGetIsSectionExpanded({ [title]: !isExpanded });
    }
  }, [isExpanded, onGetIsSectionExpanded, title]);

  //Filters: refetch manually the prometheus API
  const handleRefetchMetrics = useCallback(() => {
    dataIn.refetch();
    dataOut.refetch();
  }, [dataIn.refetch, dataOut.refetch]);

  useEffect(() => {
    if (forceUpdate && isExpanded) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics, isExpanded]);

  return (
    <Card isExpanded={isExpanded} aria-label={title} isFullHeight>
      <CardHeader onExpand={handleExpand}>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardExpandableContent>
        {/*display grid center the child SKEmptyData */}
        <CardBody>
          {dataIn.isLoading && dataOut.isLoading && <SkIsLoading />}

          {!dataIn.isLoading && dataIn.data?.length && (
            <>
              {!dataIn.isLoading && dataIn.isRefetching && <SkIsLoading />}
              <LatencyCharts latenciesData={dataIn.data} title={Labels.PercentileOverTimeOut} />
            </>
          )}

          {!dataOut.isLoading && dataOut.data?.length && (
            <>
              {!dataOut.isLoading && dataOut.isRefetching && <SkIsLoading />}
              <LatencyCharts latenciesData={dataOut.data} title={Labels.PercentileOverTimeIn} />
            </>
          )}

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
