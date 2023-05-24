import { FC, useCallback, useState } from 'react';

import { Bullseye, Card, CardBody, Grid, GridItem, Spinner } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { defaultTimeInterval, timeIntervalMap } from '@API/Prometheus.queries';
import EmptyData from '@core/components/EmptyData';

import Charts from './Charts';
import MetricFilters from './Filters';
import { MetricsLabels } from './Metrics.enum';
import { MetricsProps } from './Metrics.interfaces';
import MetricsController from './services';
import { QueriesMetrics, QueryMetricsParams } from './services/services.interfaces';

const Metrics: FC<MetricsProps> = function ({
  selectedFilters,
  startTime,
  sourceProcesses,
  processesConnected,
  filterOptions
}) {
  const queryInit = {
    processIdSource: selectedFilters.processIdSource,
    protocol: selectedFilters.protocol,
    timeInterval: timeIntervalMap[defaultTimeInterval.key],
    processIdDest: selectedFilters.processIdDest
  };

  const initialFilters = {
    ...queryInit,
    processIdSource: queryInit.processIdSource.split('|').length > 1 ? undefined : queryInit.processIdSource
  };

  const [refetchInterval, setRefetchInterval] = useState(0);
  const [prometheusQueryParams, setPrometheusQueryParams] = useState<QueryMetricsParams>(queryInit);

  const {
    data: metrics,
    isLoading: isLoadingMetrics,
    isRefetching,
    refetch
  } = useQuery(
    [QueriesMetrics.GetMetrics, prometheusQueryParams],
    () => MetricsController.getMetrics(prometheusQueryParams),
    {
      refetchInterval,
      keepPreviousData: true
    }
  );
  //Filters: refetch manually the prometheus API
  const handleRefetchMetrics = useCallback(() => {
    refetch();
  }, [refetch]);

  // Filters: Set the interval to automatically refetch prometheus API
  const handleRefetchIntervalMetrics = useCallback((interval: number) => {
    setRefetchInterval(interval);
  }, []);

  // Filters: Set the prometheus query params with the filter values
  const handleFilters = useCallback(
    (updatedFilters: QueryMetricsParams) => {
      setPrometheusQueryParams({
        ...updatedFilters,
        processIdSource: updatedFilters.processIdSource || queryInit.processIdSource
      });
    },
    [queryInit.processIdSource]
  );

  return (
    <>
      {isLoadingMetrics && (
        <Card isFullHeight style={{ height: '500px' }}>
          <Bullseye>
            <Spinner />
          </Bullseye>
        </Card>
      )}

      {!isLoadingMetrics && (
        <Grid hasGutter>
          <GridItem style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <Card isRounded>
              <MetricFilters
                sourceProcesses={sourceProcesses}
                processesConnected={processesConnected}
                initialFilters={initialFilters}
                customFilterOptions={filterOptions}
                startTime={startTime}
                isRefetching={isRefetching}
                onRefetch={handleRefetchMetrics}
                onRefetchInterval={handleRefetchIntervalMetrics}
                onSelectFilters={handleFilters}
              />
            </Card>
          </GridItem>

          {!metrics && (
            <GridItem>
              <Card isFullHeight>
                <CardBody>
                  <EmptyData message={MetricsLabels.NoMetricFoundMessage} />
                </CardBody>
              </Card>
            </GridItem>
          )}

          {!!metrics && <Charts metrics={metrics} protocol={prometheusQueryParams.protocol} />}
        </Grid>
      )}
    </>
  );
};

export default Metrics;
