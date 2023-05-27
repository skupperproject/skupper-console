import { FC, useCallback, useEffect, useState } from 'react';

import { Bullseye, Card, CardBody, Grid, GridItem, Spinner } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import EmptyData from '@core/components/EmptyData';

import Charts from './Charts';
import MetricFilters from './Filters';
import { displayIntervalMap } from './Metrics.constant';
import { MetricsLabels } from './Metrics.enum';
import { MetricsProps, SelectedFilters } from './Metrics.interfaces';
import MetricsController from './services';
import { QueriesMetrics, QueryMetricsParams } from './services/services.interfaces';

function getDisplayIntervalValue(value: string | undefined) {
  return displayIntervalMap.find(({ key }) => key === value)?.value || 0;
}

const Metrics: FC<MetricsProps> = function ({
  selectedFilters,
  startTime,
  sourceProcesses,
  processesConnected,
  filterOptions,
  forceUpdate,
  onGetMetricFilters
}) {
  const { displayInterval, ...queryInit } = selectedFilters;

  const [refetchInterval, setRefetchInterval] = useState(getDisplayIntervalValue(displayInterval));
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

  // Filters: Set the prometheus query params with the filter values
  const handleFilters = useCallback(
    (updatedFilters: SelectedFilters) => {
      const { displayInterval: displayIntervalSelected, ...prometheusParams } = updatedFilters;

      const filters: QueryMetricsParams = {
        ...prometheusParams,
        processIdSource: updatedFilters.processIdSource || selectedFilters.processIdSource
      };

      setPrometheusQueryParams(filters);
      setRefetchInterval(getDisplayIntervalValue(displayIntervalSelected));

      if (onGetMetricFilters) {
        onGetMetricFilters({ ...filters, displayInterval: displayIntervalSelected });
      }
    },
    [onGetMetricFilters, selectedFilters.processIdSource]
  );

  useEffect(() => {
    if (forceUpdate) {
      handleRefetchMetrics();
    }
  }, [forceUpdate, handleRefetchMetrics]);

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
                initialFilters={{
                  ...selectedFilters,
                  // if idSource have more ids set default (undefined)
                  processIdSource:
                    selectedFilters.processIdSource.split('|').length > 1 ? undefined : selectedFilters.processIdSource
                }}
                customFilterOptions={filterOptions}
                startTime={startTime}
                isRefetching={isRefetching}
                onRefetch={handleRefetchMetrics}
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
