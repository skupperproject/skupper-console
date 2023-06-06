import { FC, useCallback, useEffect, useState } from 'react';

import { Bullseye, Card, CardBody, Grid, GridItem, Spinner } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { AvailableProtocols } from '@API/REST.enum';
import EmptyData from '@core/components/EmptyData';

import MetricFilters from './Filters';
import LatencyCharts from './LatencyCharts';
import { displayIntervalMap } from './Metrics.constant';
import { MetricsLabels } from './Metrics.enum';
import { MetricsProps, SelectedFilters } from './Metrics.interfaces';
import RequestCharts from './RequestCharts';
import ResponseCharts from './ResponseCharts';
import MetricsController from './services';
import { QueriesMetrics, QueryMetricsParams } from './services/services.interfaces';
import TrafficCharts from './TrafficCharts';

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

  if (isLoadingMetrics) {
    return (
      <Card isFullHeight style={{ height: '500px' }}>
        <Bullseye>
          <Spinner />
        </Bullseye>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  const {
    bytesData,
    byteRateData,
    latenciesData,
    requestRateData,
    totalRequestsInterval,
    avgRequestRateInterval,
    responseData,
    responseRateData
  } = metrics;

  return (
    <>
      <Card isRounded style={{ position: 'sticky', top: 0, zIndex: 1 }}>
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

      <Grid hasGutter>
        {!metrics.byteRateData && (
          <GridItem>
            <Card isFullHeight>
              <CardBody>
                <EmptyData message={MetricsLabels.NoMetricFoundMessage} />
              </CardBody>
            </Card>
          </GridItem>
        )}

        <GridItem>
          {!!bytesData && !!byteRateData && <TrafficCharts bytesData={bytesData} byteRateData={byteRateData} />}
        </GridItem>

        <GridItem>
          {!!latenciesData?.length && prometheusQueryParams.protocol !== AvailableProtocols.Tcp && (
            <LatencyCharts latenciesData={latenciesData} />
          )}
        </GridItem>

        <GridItem>
          {!!requestRateData?.length && prometheusQueryParams.protocol !== AvailableProtocols.Tcp && (
            <RequestCharts
              requestRateData={requestRateData}
              totalRequestsInterval={totalRequestsInterval}
              avgRequestRateInterval={avgRequestRateInterval}
            />
          )}
        </GridItem>

        <GridItem>
          {!!responseData && responseRateData && prometheusQueryParams.protocol !== AvailableProtocols.Tcp && (
            <ResponseCharts responseData={responseData} responseRateData={responseRateData} />
          )}
        </GridItem>
      </Grid>
    </>
  );
};

export default Metrics;
