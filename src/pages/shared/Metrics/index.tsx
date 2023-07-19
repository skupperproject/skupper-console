import { FC, useCallback, useEffect, useState } from 'react';

import {
  Bullseye,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Grid,
  GridItem,
  Spinner
} from '@patternfly/react-core';
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

import './Metrics.css';

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
  const [isExpandedLatency, setIsExpandedLatency] = useState(false);
  const [isExpandedRequests, setIsExpandedRequests] = useState(false);
  const [isExpandedResponses, setIsExpandedResponses] = useState(false);

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

  const handleExpandLatency = useCallback(() => {
    setIsExpandedLatency(!isExpandedLatency);
  }, [isExpandedLatency]);

  const handleExpandRequests = useCallback(() => {
    setIsExpandedRequests(!isExpandedRequests);
  }, [isExpandedRequests]);

  const handleExpandResponses = useCallback(() => {
    setIsExpandedResponses(!isExpandedResponses);
  }, [isExpandedResponses]);

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
    <Grid hasGutter>
      <GridItem>
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
      </GridItem>

      {!byteRateData && (
        <GridItem>
          <Card isFullHeight>
            <CardBody>
              <EmptyData message={MetricsLabels.NoMetricFoundMessage} />
            </CardBody>
          </Card>
        </GridItem>
      )}

      {byteRateData && bytesData && (
        <GridItem>
          <TrafficCharts bytesData={bytesData} byteRateData={byteRateData} />
        </GridItem>
      )}

      {prometheusQueryParams.protocol !== AvailableProtocols.Tcp && (
        <>
          <GridItem>
            <Card
              isExpanded={!!latenciesData?.length && isExpandedLatency}
              className={!latenciesData?.length ? 'metric-disabled' : undefined}
            >
              <CardHeader onExpand={handleExpandLatency}>
                <CardTitle>{MetricsLabels.LatencyTitle}</CardTitle>
              </CardHeader>

              <CardExpandableContent>
                {!!latenciesData?.length && (
                  <CardBody>
                    <LatencyCharts latenciesData={latenciesData} />
                  </CardBody>
                )}
              </CardExpandableContent>
            </Card>
          </GridItem>

          <GridItem>
            <Card
              isExpanded={!!requestRateData?.length && isExpandedRequests}
              className={!requestRateData?.length ? 'metric-disabled' : undefined}
            >
              <CardHeader onExpand={handleExpandRequests}>
                <CardTitle>{MetricsLabels.RequestsTitle}</CardTitle>
              </CardHeader>
              <CardExpandableContent>
                {!!requestRateData?.length && (
                  <CardBody>
                    <RequestCharts
                      requestRateData={requestRateData}
                      totalRequestsInterval={totalRequestsInterval}
                      avgRequestRateInterval={avgRequestRateInterval}
                    />
                  </CardBody>
                )}
              </CardExpandableContent>
            </Card>
          </GridItem>

          <GridItem>
            <Card
              isExpanded={!!responseData && isExpandedResponses}
              className={!responseData ? 'metric-disabled' : undefined}
            >
              <CardHeader onExpand={handleExpandResponses}>
                <CardTitle>{MetricsLabels.HttpStatus}</CardTitle>
              </CardHeader>
              <CardExpandableContent>
                {!!responseData && responseRateData && (
                  <CardBody>
                    <ResponseCharts responseData={responseData} responseRateData={responseRateData} />
                  </CardBody>
                )}
              </CardExpandableContent>
            </Card>
          </GridItem>
        </>
      )}
    </Grid>
  );
};

export default Metrics;
